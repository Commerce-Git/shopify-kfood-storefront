'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { createClient } from '@/lib/supabase/client';

interface InquiryMessage {
  id: string;
  thread_id: string;
  sender_type: 'CUSTOMER' | 'ADMIN';
  body_original: string;
  body_translated: string | null;
  attachment_url?: string | null;
  created_at: string;
}

interface InquiryThread {
  id: string;
  token: string;
  status: 'ACTIVE' | 'RESOLVED' | 'SPAM';
  customer_name: string;
  customer_email: string;
  product_title?: string | null;
  product_handle?: string | null;
  product_image_url?: string | null;
}

export interface ProductContext {
  type?: 'product' | 'artist';
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

const PRODUCT_PROMPTS = [
  { label: '📐 Custom Sizing', text: 'Could you please advise if custom sizing or bespoke dimensions are possible for this piece?' },
  { label: '✈️ Insured Crating', text: 'Could you provide details on overseas insured crating and estimated dispatch to my address?' },
  { label: '🏺 Material & Care', text: 'I would love to learn more about the authentic craft material and recommended care standards.' },
];

const ARTIST_PROMPTS = [
  { label: '🎨 Bespoke Commission', text: 'I am interested in commissioning a bespoke custom artwork directly from the studio. How may we proceed?' },
  { label: '🏛️ Upcoming Drops', text: 'Could you share details on upcoming exhibitions or newly planned studio collections?' },
  { label: '📍 Atelier & Provenance', text: 'Could you provide information regarding the artist provenance and certificate of authenticity?' },
];

export default function ConciergeChat() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, customer, isLoggedIn } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [activeThread, setActiveThread] = useState<InquiryThread | null>(null);
  const [messages, setMessages] = useState<InquiryMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // 입력 필드 상태
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [renderedAt, setRenderedAt] = useState<number>(Date.now());

  // PDP / 작가 컨텍스트
  const [productContext, setProductContext] = useState<ProductContext | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [supabase] = useState(() => createClient());

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
      setActiveToken(queryToken);
      localStorage.setItem(STORAGE_TOKEN_KEY, queryToken);
      setIsOpen(true);
    } else {
      const savedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
      if (savedToken) setActiveToken(savedToken);
      if (queryInquire === 'true' || queryInquire === 'open') {
        setIsOpen(true);
      }
    }
  }, [searchParams]);

  // 2. 현재 경로 기반 기본 컨텍스트 자동 감지 (PDP or 작가페이지)
  useEffect(() => {
    if (pathname.startsWith('/product/')) {
      const handle = pathname.replace('/product/', '').split('/')[0];
      const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
      const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');

      setProductContext((prev) => {
        if (prev?.handle === handle) return prev;
        return {
          type: 'product',
          handle,
          title: ogTitle || document.title || 'Inquired Piece',
          imageUrl: ogImage || undefined,
        };
      });
    } else if (pathname.startsWith('/artists/')) {
      const slug = pathname.replace('/artists/', '').split('/')[0];
      setProductContext((prev) => {
        if (prev?.artistSlug === slug) return prev;
        return {
          type: 'artist',
          artistSlug: slug,
          title: document.title.split('—')[0]?.trim() || 'Korean Artisan Atelier',
        };
      });
    } else {
      setProductContext(null);
    }
  }, [pathname]);

  // 3. 글로벌 이벤트 브릿지 ('open-concierge') 리스너
  useEffect(() => {
    const handleOpenEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ product?: ProductContext }>;
      const detail = customEvent.detail;
      if (detail?.product) {
        setProductContext(detail.product);
      }
      setIsOpen(true);
    };

    window.addEventListener('open-concierge', handleOpenEvent);
    return () => window.removeEventListener('open-concierge', handleOpenEvent);
  }, []);

  // 4. 대화 내역 및 스레드 조회 (하트비트 동시 수행)
  const fetchThreadAndMessages = useCallback(async (token: string, silent = false) => {
    try {
      const res = await fetch(`/api/inquiries/${token}`);
      if (res.status === 410) {
        // 30일 만료된 세션
        localStorage.removeItem(STORAGE_TOKEN_KEY);
        setActiveToken(null);
        setActiveThread(null);
        setMessages([]);
        if (!silent) alert('This inquiry session has expired after 30 days.');
        return;
      }

      if (!res.ok) return;

      const data = await res.json();
      if (data.ok) {
        setActiveThread(data.thread);
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.warn('Failed to fetch concierge thread:', err);
    }
  }, []);

  useEffect(() => {
    if (activeToken) {
      fetchThreadAndMessages(activeToken);
    }
  }, [activeToken, fetchThreadAndMessages]);

  // 5. Supabase Realtime 웹소켓 직접 구독 (0.1초 실시간 반응)
  useEffect(() => {
    if (!activeThread?.id) return;

    const channel = supabase
      .channel(`concierge_${activeThread.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'inquiry_messages',
          filter: `thread_id=eq.${activeThread.id}`,
        },
        (payload) => {
          const newMsg = payload.new as InquiryMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          // 창이 닫혀있고 관리자 답변인 경우 뱃지 증가
          if (!isOpen && newMsg.sender_type === 'ADMIN') {
            setUnreadCount((c) => c + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeThread?.id, isOpen, supabase]);

  // 6. 연결 백업 폴링 (10초 간격)
  useEffect(() => {
    if (!activeToken || !isOpen) return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchThreadAndMessages(activeToken, true);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [activeToken, isOpen, fetchThreadAndMessages]);

  // 스크롤 최하단 이동
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // 창 열 때 읽음 처리
  const handleToggleOpen = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      setUnreadCount(0);
      if (activeToken) fetchThreadAndMessages(activeToken, true);
    }
  };

  // 신규 문의 시작 (회원 또는 비회원)
  const handleStartInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    setIsSending(true);

    const effectiveName = isLoggedIn
      ? customer?.first_name || user?.user_metadata?.full_name || 'Valued Collector'
      : guestName.trim();

    const effectiveEmail = isLoggedIn
      ? user?.email || ''
      : guestEmail.trim().toLowerCase();

    if (!effectiveName || !effectiveEmail) {
      alert('Please provide your name and email address.');
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
        enrichedTitle = `Atelier: ${productContext.title}`;
      } else {
        const parts: string[] = [productContext.title];
        if (productContext.variantTitle) {
          parts.push(`(${productContext.variantTitle})`);
        }
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
      (productContext?.artistSlug ? `artists/${productContext.artistSlug}` : null);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: effectiveName,
          customerEmail: effectiveEmail,
          message: inputMessage.trim(),
          productTitle: enrichedTitle,
          productHandle: effectiveHandle,
          productImageUrl: productContext?.imageUrl || null,
          artistName: productContext?.artist || (productContext?.type === 'artist' ? productContext.title : null),
          artistId: productContext?.artistSlug || null,
          honeypot,
          renderedAt,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to start inquiry');
      }

      setActiveToken(data.token);
      localStorage.setItem(STORAGE_TOKEN_KEY, data.token);
      setInputMessage('');
      if (data.message) {
        setMessages([data.message]);
      }
      fetchThreadAndMessages(data.token, true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error occurred. Please try again.';
      alert(errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  // 추가 메시지 전송
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !activeToken || isSending) return;
    const text = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);

    // 옵티미스틱 메시지 추가
    const optimisticId = `opt_${Date.now()}`;
    const optimisticMsg: InquiryMessage = {
      id: optimisticId,
      thread_id: activeThread?.id || '',
      sender_type: 'CUSTOMER',
      body_original: text,
      body_translated: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch(`/api/inquiries/${activeToken}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderType: 'CUSTOMER',
          body: text,
        }),
      });

      const data = await res.json();
      if (data.ok && data.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticId ? data.message : m))
        );
      }
    } catch (err) {
      console.error('Failed to send inquiry message:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* 1. 우측 하단 플로팅 런처 버튼 (모바일 바텀바와 충돌 방지: bottom-20 md:bottom-6) */}
      <button
        onClick={handleToggleOpen}
        aria-label="Open Blank Seoul Concierge"
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-3 rounded-full bg-[#18181B] text-white shadow-2xl hover:bg-[#27272A] hover:scale-105 active:scale-95 transition-all duration-200 border border-white/10 select-none group"
      >
        <span className="text-sm md:text-base group-hover:rotate-12 transition-transform duration-200">💬</span>
        <span className="text-xs md:text-[13.5px] font-semibold tracking-wide font-heading">Concierge</span>
        {unreadCount > 0 && (
          <span className="px-2 py-0.5 text-[10px] md:text-[11px] font-bold bg-rose-500 text-white rounded-full animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* 2. 컨시어지 메신저: 데스크톱 플로팅 카드 + 모바일 88dvh 바텀 시트 */}
      <div
        className={`fixed z-50 transition-all duration-300 ease-out flex flex-col bg-white shadow-2xl border border-black/10 overflow-hidden
          max-md:inset-x-0 max-md:bottom-0 max-md:h-[88dvh] max-md:max-h-[88dvh] max-md:rounded-t-3xl max-md:rounded-b-none
          md:bottom-20 md:right-6 md:w-[390px] md:h-[580px] md:max-h-[calc(100vh-120px)] md:rounded-2xl
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
        <div className="bg-[#18181B] text-white px-4 py-3 sm:py-3.5 flex items-center justify-between border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-[14.5px] sm:text-[15px] tracking-tight">Blank Seoul Concierge</h3>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Direct Line · Live Translation (Seoul)</span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close Concierge"
            className="text-zinc-400 hover:text-white p-1.5 rounded-md transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* 컨텍스트 배너 (상품 상세페이지 또는 작가 페이지 연동) */}
        {productContext && (
          <div className="bg-[#F8F7F4] border-b border-[#E8DFC8]/60 px-4 py-2.5 flex items-center gap-3">
            {productContext.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={productContext.imageUrl}
                alt={productContext.title}
                className={`w-11 h-11 object-cover border border-[#E8DFC8] shrink-0 bg-white ${
                  productContext.type === 'artist' ? 'rounded-full' : 'rounded-xl'
                }`}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-[9.5px] font-bold text-[#C25E38] uppercase tracking-wider">
                {productContext.type === 'artist' ? 'Inquiring with Atelier' : 'Inquiring About Piece'}
              </div>
              <div className="text-xs font-bold text-zinc-900 truncate">{productContext.title}</div>
              <div className="text-[10.5px] text-zinc-500 truncate flex items-center gap-1.5 mt-0.5">
                {productContext.variantTitle && (
                  <span className="font-medium text-zinc-700">{productContext.variantTitle}</span>
                )}
                {productContext.price && (
                  <span className="font-semibold text-zinc-800">
                    {productContext.currency || 'USD'} {productContext.price}
                  </span>
                )}
                {productContext.artist && productContext.type !== 'artist' && (
                  <span>· by {productContext.artist}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 본문 피드 */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#FAF9F7] flex flex-col gap-3">
          {!activeToken ? (
            /* 첫 문의 작성 카드 (회원 자동인식 / 비회원 폼) */
            <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
              <div className="font-heading font-bold text-sm text-zinc-900 mb-1">
                {productContext?.type === 'artist'
                  ? `Inquire with ${productContext.title}`
                  : isLoggedIn
                  ? `Welcome, ${customer?.first_name || 'Collector'}`
                  : 'Welcome to Blank Seoul'}
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed mb-3">
                {productContext?.type === 'artist'
                  ? `Direct consultation with the ${productContext.title} atelier. Inquire about bespoke commissions, exhibition schedules, or material details.`
                  : 'Chat directly with our Seoul curation studio. Ask any bespoke requests, custom dimensions, or worldwide insured shipping.'}
              </p>

              <form onSubmit={handleStartInquiry} className="space-y-3">
                {/* 봇 방지 허니팟 */}
                <input
                  type="text"
                  name="website_url"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                {/* 비회원인 경우에만 이름 및 이메일 입력창 노출 */}
                {!isLoggedIn && (
                  <>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                        Your Email * (For offline replies)
                      </label>
                      <input
                        type="email"
                        required
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="e.g. sarah@example.com"
                        className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-800"
                      />
                    </div>
                  </>
                )}

                {/* 원클릭 스마트 문의 칩 (Quick Prompts) */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Quick Prompts
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(productContext?.type === 'artist' ? ARTIST_PROMPTS : PRODUCT_PROMPTS).map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setInputMessage(prompt.text)}
                        className="text-[10.5px] font-medium px-2.5 py-1 rounded-full border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-400 text-zinc-700 transition-all text-left active:scale-95"
                      >
                        {prompt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Your Inquiry *</label>
                  <textarea
                    required
                    rows={3}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={
                      productContext?.type === 'artist'
                        ? `Ask ${productContext.title} about custom commissions, dimensions, or atelier visits...`
                        : 'Ask about custom crafting, material, or worldwide delivery...'
                    }
                    className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-800 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-2.5 bg-[#18181B] text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 disabled:opacity-50 transition-all font-heading"
                >
                  {isSending ? 'Connecting...' : 'Start Conversation ➔'}
                </button>
              </form>
            </div>
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
                    {isCustomer ? 'You' : 'Studio Artisan & Concierge'}
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
                            <span>Studio photo expired (90-day archive)</span>
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
                    {cleanText && <div>{cleanText}</div>}
                  </div>
                  <span className="text-[9.5px] text-zinc-400 px-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 하단 메시지 입력창 (활성 대화 스레드가 있는 경우) */}
        {activeToken && (
          <div className="p-3 bg-white border-t border-zinc-200 flex flex-col gap-1.5">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your reply in English..."
                className="flex-1 px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-800"
              />
              <button
                onClick={handleSendMessage}
                disabled={isSending || !inputMessage.trim()}
                className="px-4 py-2 bg-[#18181B] text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 disabled:opacity-50 transition-all font-heading"
              >
                Send
              </button>
            </div>
            <div className="text-[10px] text-zinc-400 text-center">
              We respond in real time. If you leave, replies will be emailed to you.
            </div>
          </div>
        )}
      </div>
    </>
  );
}
