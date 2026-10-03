'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from './AuthProvider';
import SupportFaqIntro, { InquiryPrivacyNotice } from './SupportFaqIntro';
import { createInquiryRequestKey, mergeInquiryMessages } from '../../lib/inquiries/clientDelivery';
import { useInquirySignals } from '../../lib/inquiries/useInquirySignals';
import { createInquiryPoller } from '../../lib/inquiries/polling';
import { takePendingSupportRequest, type SupportRequest } from '../../lib/inquiries/openSupport';

interface InquiryMessage {
  id: string;
  thread_id: string;
  sender_type: 'CUSTOMER' | 'ADMIN';
  body_original: string;
  body_translated: string | null;
  attachment_url?: string | null;
  created_at: string;
  is_read?: boolean;
}

interface InquiryThread {
  id: string;
  status: 'ACTIVE' | 'RESOLVED' | 'SPAM';
  customer_name: string;
  customer_email: string;
  product_title?: string | null;
  product_handle?: string | null;
  product_image_url?: string | null;
}

export interface ProductContext {
  type?: 'product' | 'artist' | 'order';
  orderNumber?: string;
  title: string;
  handle?: string;
  imageUrl?: string;
  artist?: string;
  artistSlug?: string;
  variantTitle?: string;
  selectedOptions?: Record<string, string>;
  price?: string;
  currency?: string;
}

const STORAGE_TOKEN_KEY = 'blank_seoul_inquiry_token';
const STORAGE_GUEST_NAME = 'blank_guest_name';
const STORAGE_GUEST_EMAIL = 'blank_guest_email';

export default function ConciergeChat() {
  const searchParams = useSearchParams();
  const { user, customer, isLoggedIn } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [mobileViewport, setMobileViewport] = useState<{ height: number; bottom: number } | null>(null);

  // Mobile keyboards resize the visual viewport, which may differ from the layout viewport.
  useEffect(() => {
    if (!isOpen) { setExpanded(false); return; }
    const viewport = window.visualViewport;
    const update = () => {
      if (!viewport || !window.matchMedia?.('(max-width: 767px)').matches || viewport.scale !== 1) {
        setMobileViewport(null);
        return;
      }
      setMobileViewport({ height: viewport.height, bottom: Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop) });
    };
    update();
    viewport?.addEventListener('resize', update);
    viewport?.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => {
      viewport?.removeEventListener('resize', update);
      viewport?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [isOpen]);
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [activeThread, setActiveThread] = useState<InquiryThread | null>(null);
  const [messages, setMessages] = useState<InquiryMessage[]>([]);
  const requestKey = useRef(createInquiryRequestKey());
  const sendingRef = useRef(false);
  const versionRef = useRef<string | null>(null);
  const loadedAtRef = useRef(0);
  const tokenRef = useRef(activeToken);
  tokenRef.current = activeToken;
  const [sendError, setSendError] = useState('');
  const [olderCursor, setOlderCursor] = useState<{ at: string; id: string } | null>(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // 입력 필드 상태
  const [inputMessage, setInputMessage] = useState('');
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [faqQuestion, setFaqQuestion] = useState<string | null>(null);
  const [faqSession, setFaqSession] = useState(0);
  const inquiryInputRef = useRef<HTMLTextAreaElement>(null);
  const guestNameRef = useRef<HTMLInputElement>(null);
  const faqPrefix = faqQuestion ? `FAQ topic: ${faqQuestion}\n\n` : '';
  const inquiryLimit = 5000 - faqPrefix.length;
  const [isSending, setIsSending] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [renderedAt, setRenderedAt] = useState<number>(Date.now());

  // PDP / 작가 컨텍스트
  const [productContext, setProductContext] = useState<ProductContext | null>(null);
  const [pendingContext, setPendingContext] = useState<{ product: ProductContext | null } | null>(null);
  const [composingNew, setComposingNew] = useState(false);
  const existingDraftRef = useRef('');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const olderPositionRef = useRef<{ height: number; top: number } | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);
  const lastMessageRef = useRef<string | undefined>(undefined);
  const [hasNewReplies, setHasNewReplies] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pollerRef = useRef<ReturnType<typeof createInquiryPoller> | null>(null);
  const openRef = useRef(isOpen);

  // 1. 초기 토큰 복원 및 URL 딥링크 (?inquiry_token=... / ?inquire=true / ?chat=open)
  useEffect(() => {
    setRenderedAt(Date.now());

    // 비회원 입력값 복원
    const savedName = localStorage.getItem(STORAGE_GUEST_NAME) || '';
    const savedEmail = localStorage.getItem(STORAGE_GUEST_EMAIL) || '';
    if (savedName) setGuestName(savedName);
    if (savedEmail) setGuestEmail(savedEmail);

    const queryToken = searchParams.get('inquiry_token');
    const queryInquire = searchParams.get('inquire') || searchParams.get('chat');

    if (queryToken) {
      tokenRef.current = queryToken;
      setActiveToken(queryToken);
      localStorage.setItem(STORAGE_TOKEN_KEY, queryToken);
      setIsOpen(true);
    } else {
      const savedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
      tokenRef.current = savedToken;
      if (savedToken) setActiveToken(savedToken);
      if (queryInquire === 'true' || queryInquire === 'open') {
        setIsOpen(true);
      }
    }
  }, [searchParams]);

  // 3. 글로벌 이벤트 브릿지 ('open-concierge') 리스너
  useEffect(() => {
    const handleOpenEvent = (e: Event) => {
      const customEvent = e as CustomEvent<SupportRequest>;
      takePendingSupportRequest();
      const detail = customEvent.detail;
      if (sendingRef.current) { setIsOpen(true); return; }
      const requested = detail?.product || null;
      if (detail?.intent === 'general') {
        setExpanded(false);
        // A general inquiry is a separate draft, never a relabeled product thread.
        if (tokenRef.current && !composingNew) {
          existingDraftRef.current = inputMessage;
          setInputMessage('');
        }
        setComposingNew(Boolean(tokenRef.current));
        setPendingContext(null);
        setProductContext(null);
        setFaqQuestion(null);
        setFaqSession(value => value + 1);
        setContactFormOpen(false);
        setSendError('');
      }
      else if (tokenRef.current && requested) setPendingContext({ product: requested });
      else if (tokenRef.current) {
        if (composingNew) setInputMessage(existingDraftRef.current);
        setPendingContext(null); setComposingNew(false);
      }
      else if (requested) {
        setProductContext(requested);
        setFaqQuestion(null);
        setFaqSession(value => value + 1);
      }
      setIsOpen(true);
    };

    window.addEventListener('open-concierge', handleOpenEvent);
    const pending = takePendingSupportRequest();
    if (pending) handleOpenEvent(new CustomEvent('open-concierge', { detail: pending }));
    return () => window.removeEventListener('open-concierge', handleOpenEvent);
  }, [composingNew, inputMessage]);

  // Read receipts acknowledge only messages returned to this visible conversation.
  const markDisplayed = useCallback(async (token: string, rows: InquiryMessage[], signal: AbortSignal) => {
    if (!openRef.current || !nearBottomRef.current || document.visibilityState !== 'visible') return;
    const messageIds = rows.filter(row => row.sender_type === 'ADMIN' && !row.is_read).map(row => row.id);
    if (!messageIds.length) return;
    const res = await fetch(`/api/inquiries/${token}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageIds }), signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]),
    });
    if (!res.ok) throw new Error('Read acknowledgment failed');
    if (!signal.aborted && tokenRef.current === token) {
      const data = await res.json();
      setUnreadCount(data.unreadCount);
      setMessages(prev => prev.map(row => messageIds.includes(row.id) ? { ...row, is_read: true } : row));
    }
  }, []);

  const fetchThreadAndMessages = useCallback(async (token: string, silent: boolean, signal: AbortSignal) => {
    try {
      const query = new URLSearchParams();
      const opened = openRef.current;
      if (!opened) query.set('summary', '1');
      // Signed attachment links are refreshed before their one-hour expiry.
      else if (versionRef.current && Date.now() - loadedAtRef.current < 45 * 60_000) query.set('known', versionRef.current);
      const res = await fetch(`/api/inquiries/${token}?${query}`, {
        signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]), cache: 'no-store',
      });
      if (signal.aborted || tokenRef.current !== token) return false;
      if (res.status === 410 || res.status === 404) {
        localStorage.removeItem(STORAGE_TOKEN_KEY);
        setActiveToken(null); setActiveThread(null); setMessages([]); setUnreadCount(0);
        if (!silent) setSendError('This conversation is unavailable. Please start a new inquiry.');
        return true;
      }
      if (!res.ok) return false;
      const data = await res.json();
      if (signal.aborted || tokenRef.current !== token || !data.ok) return false;
      setActiveThread(data.thread);
      setUnreadCount(data.thread.unread_customer_count || 0);
      if (Array.isArray(data.messages)) {
        setMessages(prev => mergeInquiryMessages(prev, data.messages));
        // A changed recent window may hide a gap after a long disconnect; permit paging it again.
        setOlderCursor(data.nextCursor);
        loadedAtRef.current = Date.now();
        await markDisplayed(token, data.messages, signal);
        if (!signal.aborted) versionRef.current = data.version;
      }
      return true;
    } catch { return false; }
  }, [markDisplayed]);

  const loadOlder = async () => {
    if (!activeToken || !olderCursor || loadingOlder) return;
    const token = activeToken;
    setLoadingOlder(true);
    try {
      const res = await fetch(`/api/inquiries/${token}?before=${encodeURIComponent(JSON.stringify(olderCursor))}`, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw Error();
      const data = await res.json();
      if (tokenRef.current !== token) return;
      const feed = feedRef.current;
      if (feed) olderPositionRef.current = { height: feed.scrollHeight, top: feed.scrollTop };
      setMessages(prev => mergeInquiryMessages(prev, data.messages || []));
      setOlderCursor(data.nextCursor);
      await markDisplayed(token, data.messages || [], new AbortController().signal);
    } catch { setSendError('Earlier messages could not be loaded. Please try again.'); }
    finally { setLoadingOlder(false); }
  };

  useEffect(() => {
    openRef.current = isOpen && !composingNew;
    if (openRef.current) versionRef.current = null;
    pollerRef.current?.setOpen(openRef.current);
  }, [isOpen, composingNew]);

  useEffect(() => {
    versionRef.current = null;
    setMessages([]);
    setActiveThread(null);
    loadedAtRef.current = 0;
    nearBottomRef.current = true;
    lastMessageRef.current = undefined;
    setHasNewReplies(false);
    setOlderCursor(null);
    if (!activeToken) return;
    let firstRead = true;
    const poller = createInquiryPoller({
      read: (signal) => {
        const silent = !firstRead;
        firstRead = false;
        return fetchThreadAndMessages(activeToken, silent, signal);
      },
      isVisible: () => document.visibilityState === 'visible',
      isOnline: () => navigator.onLine,
      initialOpen: openRef.current,
    });
    pollerRef.current = poller;
    const resume = () => { versionRef.current = null; poller.refresh(); };
    const visibility = () => {
      if (document.visibilityState === 'visible') resume();
      else poller.pause();
    };
    const offline = () => poller.pause();
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('online', resume);
    window.addEventListener('offline', offline);
    poller.start();
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('online', resume);
      window.removeEventListener('offline', offline);
      poller.stop();
      if (pollerRef.current === poller) pollerRef.current = null;
    };
  }, [activeToken, fetchThreadAndMessages]);

  const realtimeReady = useInquirySignals(activeToken && isOpen && !composingNew ? `/api/inquiries/${activeToken}/realtime` : null, () => pollerRef.current?.refresh());
  useEffect(() => { pollerRef.current?.setRealtimeReady(realtimeReady); }, [realtimeReady, activeToken]);

  // Only scroll the conversation, never the page behind the modeless panel.
  useEffect(() => {
    const feed = feedRef.current;
    if (!feed || !isOpen || composingNew) return;
    const last = messages.at(-1)?.id;
    const newReply = last !== lastMessageRef.current;
    lastMessageRef.current = last;
    if (olderPositionRef.current) {
      const previous = olderPositionRef.current;
      feed.scrollTop = previous.top + feed.scrollHeight - previous.height;
      olderPositionRef.current = null;
    } else if (nearBottomRef.current) {
      feed.scrollTo({ top: feed.scrollHeight, behavior: 'auto' });
    } else if (newReply) {
      setHasNewReplies(true);
    }
  }, [messages, isOpen, composingNew]);

  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus({ preventScroll: true });
    return () => { if (opener?.isConnected) opener.focus({ preventScroll: true }); };
  }, [isOpen]);

  useEffect(() => {
    const feed = feedRef.current;
    if (!feed || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      if (openRef.current && nearBottomRef.current) feed.scrollTo({ top: feed.scrollHeight, behavior: 'auto' });
    });
    observer.observe(feed);
    return () => observer.disconnect();
  }, []);

  const acknowledgeBottom = () => {
    const wasNearBottom = nearBottomRef.current;
    nearBottomRef.current = true;
    setHasNewReplies(false);
    if (!wasNearBottom) {
      versionRef.current = null;
      pollerRef.current?.refresh();
    }
  };
  const jumpToLatest = () => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'auto' });
    acknowledgeBottom();
  };

  // 창 열 때 읽음 처리
  const handleToggleOpen = () => {
    const next = !isOpen;
    setIsOpen(next);

  };

  // 신규 문의 시작 (회원 또는 비회원)
  const handleStartInquiry = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim() || sendingRef.current || pendingContext) return;

    if (!isLoggedIn && !contactFormOpen) { setContactFormOpen(true); return; }
    sendingRef.current = true;
    setIsSending(true);
    setSendError('');

    if (faqPrefix.length + inputMessage.trim().length > 5000) {
      setSendError(`Please shorten your message to ${inquiryLimit} characters.`);
      sendingRef.current = false;
      setIsSending(false);
      return;
    }

    const effectiveName = isLoggedIn
      ? customer?.first_name || user?.user_metadata?.full_name || 'Valued Collector'
      : guestName.trim() || activeThread?.customer_name || '';

    const effectiveEmail = isLoggedIn
      ? user?.email || ''
      : guestEmail.trim().toLowerCase() || activeThread?.customer_email || '';

    if (!effectiveName || !effectiveEmail) {
      setSendError('Please provide your name and email address.');
      sendingRef.current = false;
      setIsSending(false);
      return;
    }

    // 비회원 정보 로컬 저장 (다음 방문 시 자동완성)
    if (!isLoggedIn) {
      localStorage.setItem(STORAGE_GUEST_NAME, effectiveName);
      localStorage.setItem(STORAGE_GUEST_EMAIL, effectiveEmail);
    }

    // 상품/작가 컨텍스트를 스레드 제목으로 정밀 구성
    let enrichedTitle = productContext?.title || null;
    if (productContext) {
      if (productContext.type === 'artist') {
        enrichedTitle = `Maker / Brand: ${productContext.title}`;
      } else {
        const parts: string[] = [productContext.title];
        const options = Object.entries(productContext.selectedOptions || {}).map(([name, value]) => `${name}: ${value}`).join(', ');
        const variant = productContext.variantTitle || options;
        if (variant) parts.push(`(${variant})`);
        if (productContext.artist) {
          parts.push(`by ${productContext.artist}`);
        }
        if (productContext.price) {
          parts.push(`· ${productContext.currency || 'USD'} ${productContext.price}`);
        }
        enrichedTitle = parts.join(' ');
      }
    }

    const effectiveHandle =
      productContext?.handle ||
      (productContext?.type === 'artist' && productContext?.artistSlug ? `artists/${productContext.artistSlug}` : null);

    const payload = {
          customerName: effectiveName,
          customerEmail: effectiveEmail,
          message: faqPrefix + inputMessage.trim(),
          productTitle: enrichedTitle,
          productHandle: effectiveHandle,
          productImageUrl: productContext?.imageUrl || null,
          artistName: productContext?.artist || (productContext?.type === 'artist' ? productContext.title : null),
          orderNumber: productContext?.orderNumber || null,
          inquiryCategory: productContext?.type === 'order' ? 'SHIPPING' : 'GENERAL',

    };
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, honeypot, renderedAt, requestId: requestKey.current.get(['create', payload]) }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to start inquiry');
      }

      requestKey.current.clear();
      tokenRef.current = data.token;
      versionRef.current = null;
      setActiveToken(data.token);
      setActiveThread(null);
      setOlderCursor(null);
      setUnreadCount(0);
      setComposingNew(false);
      setContactFormOpen(false);
      setFaqQuestion(null);
      setPendingContext(null);
      localStorage.setItem(STORAGE_TOKEN_KEY, data.token);
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete('inquiry_token');
      window.history.replaceState(window.history.state, '', currentUrl.toString());
      setInputMessage('');
      if (data.message) {
        setMessages([data.message]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error occurred. Please try again.';
      setSendError(errorMsg);
    } finally {
      sendingRef.current = false;
      setIsSending(false);
    }
  };

  // 추가 메시지 전송
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sendingRef.current || pendingContext) return;

    // Follow-ups keep the same conversation; the server reopens resolved inquiries.
    if (!activeToken) {
      await handleStartInquiry();
      return;
    }

    const text = inputMessage.trim();
    const token = activeToken;
    sendingRef.current = true;
    setIsSending(true); setSendError('');
    try {
      const res = await fetch(`/api/inquiries/${token}/messages`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: requestKey.current.get([token, text]), senderType: 'CUSTOMER', body: text }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json();
      if (!res.ok || !data.ok || !data.message) throw Error(data.error || 'Message could not be saved.');
      requestKey.current.clear();
      if (tokenRef.current === token) {
        setMessages(prev => mergeInquiryMessages(prev, [data.message]));
        setInputMessage(prev => prev.trim() === text ? '' : prev);
        pollerRef.current?.refresh();
      }
    } catch {
      setSendError('We could not confirm delivery. Your message is kept here; press Send to retry safely.');
    } finally { sendingRef.current = false; setIsSending(false); }
  };

  const continueExistingInquiry = () => {
    if (sendingRef.current) return;
    if (composingNew) setInputMessage(existingDraftRef.current);
    setPendingContext(null);
    setComposingNew(false);
    setSendError('');
  };

  const startSeparateInquiry = () => {
    if (!pendingContext || sendingRef.current) return;
    if (!composingNew) {
      existingDraftRef.current = inputMessage;
      setInputMessage('');
    }
    setContactFormOpen(false);
    setFaqQuestion(null);
    setExpanded(false);
    setProductContext(pendingContext.product);
    setFaqSession(value => value + 1);
    setGuestName(value => value || activeThread?.customer_name || '');
    setGuestEmail(value => value || activeThread?.customer_email || '');
    setComposingNew(true);
    setPendingContext(null);
    setSendError('');
  };

  useEffect(() => {
    if (!contactFormOpen || (activeToken && !composingNew)) return;
    const field = isLoggedIn ? inquiryInputRef.current : guestNameRef.current;
    field?.focus({ preventScroll: true });
  }, [contactFormOpen, activeToken, composingNew, isLoggedIn]);

  const displayContext: ProductContext | null = activeToken && !composingNew
    ? (activeThread?.product_title ? {
      title: activeThread.product_title,
      imageUrl: activeThread.product_image_url || undefined,
      handle: activeThread.product_handle || undefined,
    } : null)
    : productContext;
  const contextHandle = displayContext?.handle;
  const contextHref = contextHandle?.startsWith('orders/') ? '/order-lookup'
    : contextHandle?.startsWith('artists/') ? `/artists/${encodeURIComponent(contextHandle.slice(8))}`
    : contextHandle ? `/product/${encodeURIComponent(contextHandle)}`
    : displayContext?.artistSlug ? `/artists/${encodeURIComponent(displayContext.artistSlug)}` : null;
  // Only catalog images; stored client-provided URLs must not become tracking pixels.
  const contextImage = (() => {
    try {
      if (!displayContext?.imageUrl) return null;
      const url = new URL(displayContext.imageUrl, 'https://blankseoul.com');
      return url.protocol === 'https:' && (url.hostname === 'cdn.shopify.com' || url.hostname === 'blankseoul.com') ? url.href : null;
    } catch { return null; }
  })();
  const newInquiry = !activeToken || composingNew;
  const panelExpanded = expanded || !newInquiry || contactFormOpen || Boolean(pendingContext);
  const panelStyle = {
    '--support-height': `${panelExpanded ? 640 : displayContext ? 520 : 460}px`,
    ...(mobileViewport ? {
      '--support-viewport-height': `${mobileViewport.height}px`,
      '--support-viewport-bottom': `${mobileViewport.bottom}px`,
    } : {}),
  } as React.CSSProperties;
  const selectFaq = (question: string | null) => {
    setFaqQuestion(question);
    if (question) setExpanded(true);
  };

  return (
    <>
      {/* Resume an existing conversation; browsing alone never shows a launcher. */}
      {activeToken && <button
        hidden={isOpen}
        onClick={handleToggleOpen}
        aria-label="Open Blank Seoul Concierge"
        aria-expanded={isOpen}
        aria-controls="customer-support-panel"
        className={`${isOpen ? 'hidden' : 'flex'} fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 items-center gap-2 px-4 py-2.5 md:px-5 md:py-3 rounded-full bg-[#18181B] text-white shadow-2xl hover:bg-[#27272A] hover:scale-105 active:scale-95 transition-all duration-200 border border-white/10 select-none group`}
      >
        <span className="text-sm md:text-base group-hover:rotate-12 transition-transform duration-200">💬</span>
        <span className="text-xs md:text-[13.5px] font-semibold tracking-wide font-heading">Messages</span>
        {unreadCount > 0 && (
          <span className="px-2 py-0.5 text-[10px] md:text-[11px] font-bold bg-rose-500 text-white rounded-full animate-pulse motion-reduce:animate-none">
            {unreadCount}
          </span>
        )}
      </button>}

      {/* 2. 컨시어지 메신저: 데스크톱 플로팅 카드 + 모바일 키보드에 맞추는 바텀 시트 */}
      <div
        id="customer-support-panel"
        style={panelStyle}
        role="dialog"
        aria-labelledby="customer-support-title"
        aria-hidden={!isOpen}
        inert={!isOpen}
        onKeyDown={e => { if (e.key === 'Escape' && !e.nativeEvent.isComposing) { e.stopPropagation(); setIsOpen(false); } }}
        className={`fixed z-50 motion-reduce:transition-none transition-[transform,opacity] duration-300 ease-out flex flex-col bg-white shadow-2xl border border-black/10 overflow-hidden
          max-md:inset-x-0 max-md:bottom-[var(--support-viewport-bottom,0px)] max-md:h-[min(var(--support-height),calc(var(--support-viewport-height,100dvh)-12px))] max-md:rounded-t-3xl max-md:rounded-b-none
          md:bottom-6 md:right-6 md:w-[400px] md:h-[min(var(--support-height),calc(100dvh-48px))] md:rounded-2xl
          ${
            isOpen
              ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 scale-95 translate-y-6 md:translate-y-4 pointer-events-none'
          }`}
      >
        {/* 모바일 스와이프 핸들 바 */}
        <div className="md:hidden pt-2.5 pb-1 flex justify-center bg-[#18181B]">
          <div className="w-10 h-1 rounded-full bg-white/30" />
        </div>

        {/* 헤더 */}
        <div className="shrink-0 bg-[#18181B] text-white px-4 py-3 sm:py-3.5 flex items-center justify-between border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <h3 id="customer-support-title" className="font-heading font-bold text-[14.5px] sm:text-[15px] tracking-tight">Blank Seoul Customer Support</h3>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-zinc-400">
              <span>Leave a message · Replies appear here</span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            ref={closeRef}
            aria-label="Close Concierge"
            className="text-zinc-300 hover:text-white min-w-11 min-h-11 rounded-md transition-colors text-lg focus-visible:outline-2"
          >
            ✕
          </button>
        </div>

        {sendError && (!activeToken || composingNew) && <p role="alert" className="px-4 py-2 text-xs text-red-700">{sendError}</p>}
        {activeToken && !composingNew && olderCursor && <button onClick={loadOlder} disabled={loadingOlder} className="py-2 text-xs underline">{loadingOlder ? 'Loading…' : 'Load earlier messages'}</button>}
        {pendingContext && (
          <div role="region" aria-label="Choose conversation" className="p-4 bg-amber-50 border-b text-sm">
            <p className="mb-2">You already have a conversation. Continue it or start a separate inquiry{pendingContext.product ? ` about ${pendingContext.product.title}` : ''}?</p>
            <div className="flex flex-wrap gap-3">
              <button className="underline" onClick={continueExistingInquiry}>Continue existing inquiry</button>
              <button className="font-semibold underline" onClick={startSeparateInquiry}>Start separate inquiry</button>
            </div>
          </div>
        )}
        {composingNew && activeToken && <button disabled={isSending} className="px-4 py-2 text-xs underline" onClick={continueExistingInquiry}>Back to existing conversation</button>}
        {activeToken && !composingNew && !pendingContext && <button disabled={isSending} className="px-4 py-2 text-xs underline" onClick={() => setPendingContext({ product: null })}>Start a different inquiry</button>}
        {displayContext && (
          <div aria-label="Inquiry context" className="shrink-0 flex items-center gap-3 border-b border-zinc-200 bg-[#F8F7F4] px-4 py-2">
            {contextImage && !failedImages[contextImage] ? <img src={contextImage} alt="" referrerPolicy="no-referrer"
              onError={() => setFailedImages(prev => ({ ...prev, [contextImage]: true }))}
              className="h-12 w-12 shrink-0 rounded-lg border border-zinc-200 object-cover" />
              : <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-200 text-zinc-600">◇</span>}
            <div className="min-w-0 flex-1 text-xs">
              <span className="text-zinc-500">Inquiry about</span>
              {contextHref ? <a href={contextHref} target="_blank" rel="noopener noreferrer" className="mt-0.5 line-clamp-2 font-semibold text-zinc-900 underline underline-offset-2">{displayContext.title}<span className="sr-only"> (opens in a new tab)</span></a>
                : <p className="mt-0.5 line-clamp-2 font-semibold">{displayContext.title}</p>}
              {newInquiry && displayContext.variantTitle && <p className="truncate text-zinc-600">{displayContext.variantTitle}</p>}
            </div>
          </div>
        )}

        {/* 본문 피드 */}
        <div ref={feedRef}
          role={activeToken && !composingNew ? 'log' : undefined}
          aria-label={activeToken && !composingNew ? 'Conversation with Blank Seoul support' : 'New inquiry'}
          aria-live={isOpen && !composingNew ? 'polite' : 'off'}
          aria-relevant="additions"
          tabIndex={0}
          onScroll={() => {
            const feed = feedRef.current;
            if (!feed) return;
            if (feed.scrollHeight - feed.scrollTop - feed.clientHeight < 64) acknowledgeBottom();
            else nearBottomRef.current = false;
          }}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-[#FAF9F7] flex flex-col p-4 gap-3">
          {newInquiry ? (
            <SupportFaqIntro key={faqSession}
              contextType={productContext?.type} onContact={selectFaq} />
          ) : messages.length === 0 ? (
            <div className="text-center py-10 text-xs text-zinc-400">Loading conversation history...</div>
          ) : (
            /* 활성 대화 말풍선 피드 */
            messages.map((msg) => {
              const isCustomer = msg.sender_type === 'CUSTOMER';
              const rawBody = isCustomer
                ? msg.body_original
                : msg.body_translated || msg.body_original;

              // 이미지 URL 감지 (attachment_url 또는 본문 내 이미지 URL)
              const detectedImageUrl = msg.attachment_url || (
                rawBody.match(/https?:\/\/[^\s\)]+\.(?:jpg|jpeg|png|webp|gif)/i)?.[0]
              );
              const cleanText = rawBody.replace(/https?:\/\/[^\s\)]+\.(?:jpg|jpeg|png|webp|gif)/ig, '').trim();

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-1 max-w-[85%] ${
                    isCustomer ? 'self-end items-end' : 'self-start items-start'
                  }`}
                >
                  <span className="text-[10.5px] text-zinc-400 px-1 font-medium">
                    {isCustomer ? 'You' : 'Blank Seoul Customer Support'}
                  </span>
                  <div
                    className={`p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm break-words ${
                      isCustomer
                        ? 'bg-[#18181B] text-white rounded-br-sm'
                        : 'bg-white text-zinc-800 border border-zinc-200 rounded-bl-sm'
                    }`}
                  >
                    {detectedImageUrl && (
                      <div className="mb-2">
                        {failedImages[detectedImageUrl] ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-100 border border-dashed border-zinc-300 text-[11px] text-zinc-500">
                            <span>📁</span>
                            <span>Photo unavailable. Please ask our team to resend it.</span>
                          </div>
                        ) : (
                          <a
                            href={detectedImageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block overflow-hidden rounded-lg group"
                          >
                            <img
                              src={detectedImageUrl}
                              alt="Studio Sample"
                              onError={() => setFailedImages((prev) => ({ ...prev, [detectedImageUrl]: true }))}
                              className="max-w-[220px] max-h-[180px] rounded-lg object-cover border border-zinc-200 group-hover:opacity-90 transition-opacity"
                            />
                            <span className="text-[10px] text-zinc-400 mt-1 block group-hover:underline">
                              🔍 View full photo
                            </span>
                          </a>
                        )}
                      </div>
                    )}
                    {cleanText && <div className="whitespace-pre-wrap">{cleanText}</div>}
                  </div>
                  <span className="text-[9.5px] text-zinc-400 px-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          {!composingNew && activeThread?.status === 'RESOLVED' && (
            <div className="my-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center select-none">
              <div className="text-[12px] font-semibold text-emerald-800 flex items-center justify-center gap-1.5">
                <span>✨</span>
                <span>This consultation has been resolved.</span>
              </div>
              <div className="text-[10.5px] text-emerald-600 mt-0.5">
                Reply below to follow up on the same issue, or start a different inquiry.
              </div>
            </div>
          )}
        </div>
        {hasNewReplies && !composingNew && <button type="button" onClick={jumpToLatest} className="min-h-11 py-2 text-sm font-semibold bg-blue-50 text-blue-800 border-t border-blue-100">New replies ↓</button>}

        {newInquiry && <form onSubmit={handleStartInquiry} className="min-h-0 max-h-[75%] overflow-y-auto border-t border-zinc-200 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] space-y-2">
          <input type="text" name="website_url" value={honeypot} onChange={e => setHoneypot(e.target.value)} hidden tabIndex={-1} autoComplete="off" />
          {!isLoggedIn && contactFormOpen && <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-zinc-600">Your name *<input id="support-guest-name" ref={guestNameRef} required autoComplete="name" maxLength={200} value={guestName} onChange={e => setGuestName(e.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-zinc-300 px-2 text-base md:text-sm" /></label>
            <label className="text-xs text-zinc-600">Your email *<input id="support-guest-email" type="email" required autoComplete="email" maxLength={254} value={guestEmail} onChange={e => setGuestEmail(e.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-zinc-300 px-2 text-base md:text-sm" /></label>
          </div>}
          <div className="flex items-end gap-2 rounded-2xl border border-zinc-300 bg-white p-2 focus-within:border-zinc-800 focus-within:ring-1 focus-within:ring-zinc-800">
            <label htmlFor="support-new-message" className="sr-only">Your message</label>
            <textarea id="support-new-message" ref={inquiryInputRef} required disabled={isSending} rows={2} maxLength={inquiryLimit}
              value={inputMessage} onChange={e => setInputMessage(e.target.value)} placeholder="Message support…"
              aria-describedby={inputMessage.length >= inquiryLimit - 500 ? 'support-new-limit' : undefined}
              className="block min-w-0 flex-1 resize-none bg-transparent px-1 py-1 text-base md:text-sm focus:outline-none" />
            <button type="submit" disabled={isSending || !!pendingContext || !inputMessage.trim() || inputMessage.trim().length > inquiryLimit}
              className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-900 px-3 text-sm font-semibold text-white disabled:bg-zinc-100 disabled:text-zinc-400 focus-visible:outline-2 focus-visible:outline-offset-2">
              {!isLoggedIn && !contactFormOpen && !isSending ? 'Continue' : <>
                <span className="sr-only">{isSending ? 'Sending…' : 'Send to support'}</span>
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={isSending ? 'animate-pulse motion-reduce:animate-none' : ''}><path d="M12 19V5m-6 6 6-6 6 6" /></svg>
              </>}
            </button>
          </div>
          {inputMessage.length >= inquiryLimit - 500 && <p id="support-new-limit" className="text-right text-xs text-zinc-500">{inputMessage.length}/{inquiryLimit}</p>}
          <InquiryPrivacyNotice />
        </form>}
        {/* 하단 메시지 입력창 (활성 대화 스레드가 있는 경우) */}
        {activeToken && !composingNew && (
          <div className="min-h-0 max-h-[65%] overflow-y-auto p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white border-t border-zinc-200 flex flex-col gap-1.5">
            {sendError && <p role="alert" className="text-sm text-red-700">{sendError}</p>}
            <div className="flex items-end gap-2 rounded-2xl border border-zinc-300 bg-white p-2 focus-within:border-zinc-800 focus-within:ring-1 focus-within:ring-zinc-800">
              <textarea
                rows={2}
                aria-label="Message to Blank Seoul support"
                maxLength={5000}
                    value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.nativeEvent.isComposing || e.keyCode === 229) return;
                  if (e.key === 'Enter' && !e.shiftKey && !window.matchMedia?.('(pointer: coarse)').matches) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  activeThread?.status === 'RESOLVED'
                    ? 'Follow up on this issue...'
                    : 'Type your reply in English...'
                }
                className="flex-1 min-w-0 resize-none bg-transparent px-1 py-1 text-base md:text-sm focus:outline-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={isSending || !!pendingContext || !inputMessage.trim()}
                className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white disabled:bg-zinc-100 disabled:text-zinc-400 focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <span className="sr-only">{isSending ? 'Sending…' : 'Send'}</span>
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5m-6 6 6-6 6 6" /></svg>
              </button>
            </div>
            {inputMessage.length >= 4500 && <p className="text-right text-xs text-zinc-500">{inputMessage.length}/5000</p>}
            <InquiryPrivacyNotice />
          </div>
        )}
      </div>
    </>
  );
}
