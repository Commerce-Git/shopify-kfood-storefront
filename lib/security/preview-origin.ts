/** A configured origin, never a substring or a suffix match. */
export function configuredPreviewOrigin(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (url.protocol !== "https:" && !(url.protocol === "http:" && local)) return null;
    if (url.username || url.password || url.search || url.hash || url.pathname !== "/") return null;
    return url.origin;
  } catch { return null; }
}

export function isTrustedPreviewMessage(
  event: Pick<MessageEvent, "origin" | "source">,
  expectedOrigin: string | null,
  parent: MessageEventSource | null,
  opener: MessageEventSource | null,
): boolean {
  return !!expectedOrigin && event.origin === expectedOrigin && event.source !== null
    && (event.source === parent || event.source === opener);
}
