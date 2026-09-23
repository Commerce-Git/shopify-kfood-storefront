export interface VerifiedOrderUser {
  email?: string | null;
  email_confirmed_at?: string | null;
}

export type VerifiedOrderEmailResult =
  | { ok: true; email: string }
  | { ok: false; status: 401 | 403; error: string };

export function verifyOrderLookupEmail(
  user: VerifiedOrderUser | null | undefined,
  requestedEmail: unknown,
): VerifiedOrderEmailResult {
  if (!user?.email || !user.email_confirmed_at) {
    return { ok: false, status: 401, error: "Sign in with your verified email to track orders." };
  }

  const requested = typeof requestedEmail === "string" ? requestedEmail.trim().toLowerCase() : "";
  const verified = user.email.trim().toLowerCase();
  if (requested !== verified) {
    return { ok: false, status: 403, error: "Order lookup must use your verified account email." };
  }

  return { ok: true, email: verified };
}
