export function createInquiryRequestKey() {
  let previous = ''; let id = '';
  return { get(payload: unknown) { const next = JSON.stringify(payload); if (previous !== next || !id) { previous = next; id = crypto.randomUUID(); } return id; }, clear() { previous = ''; id = ''; } };
}
export function mergeInquiryMessages<T extends { id: string; created_at: string }>(previous: T[], incoming: T[]): T[] {
  const rows = new Map(previous.map(row => [row.id, row]));
  for (const row of incoming) rows.set(row.id, row);
  return [...rows.values()].sort((a,b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id));
}
