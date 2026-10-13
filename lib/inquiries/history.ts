// Browser-held access links only; never an email-based or account-wide lookup.
export interface InquiryHistoryEntry {
  token: string;
  title: string;
  updatedAt: string;
  status?: 'ACTIVE' | 'RESOLVED' | 'SPAM';
  unreadCount?: number;
}
export const INQUIRY_HISTORY_KEY = 'blank_seoul_inquiry_history';
export function readInquiryHistory(): InquiryHistoryEntry[] {
  try {
    const rows: unknown = JSON.parse(localStorage.getItem(INQUIRY_HISTORY_KEY) || '[]');
    if (!Array.isArray(rows)) return [];
    return rows.filter((row): row is InquiryHistoryEntry =>
      row && typeof row.token === 'string' && /^inq_[a-f0-9]{32}$/.test(row.token)
      && typeof row.title === 'string' && typeof row.updatedAt === 'string'
      && Number.isFinite(Date.parse(row.updatedAt)));
  } catch { return []; }
}
export function saveInquiryHistory(rows: InquiryHistoryEntry[]): void {
  try { localStorage.setItem(INQUIRY_HISTORY_KEY, JSON.stringify(rows)); }
  catch { /* The current session remains usable when storage is unavailable. */ }
}
export function upsertInquiryHistory(rows: InquiryHistoryEntry[], entry: InquiryHistoryEntry): InquiryHistoryEntry[] {
  return [entry, ...rows.filter(row => row.token !== entry.token)].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
