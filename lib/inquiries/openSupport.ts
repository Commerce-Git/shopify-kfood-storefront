import type { ProductContext } from '../../app/components/ConciergeChat';

export interface SupportRequest {
  intent?: 'general' | 'contextual';
  product?: ProductContext | null;
}

// Keep only the latest intent while the dynamically loaded chat is mounting.
// This is transient UI state: never persist it or include conversation credentials.
let pending: SupportRequest | undefined;

export function openSupport(detail: SupportRequest) {
  pending = detail;
  window.dispatchEvent(new CustomEvent<SupportRequest>('open-concierge', { detail }));
}

export function takePendingSupportRequest() {
  const request = pending;
  pending = undefined;
  return request;
}
