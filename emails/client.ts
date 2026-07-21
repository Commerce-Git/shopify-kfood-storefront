import { Resend } from "resend";

let resendInstance: Resend | null = null;

export function getResendClient(): Resend | null {
  if (resendInstance) return resendInstance;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ RESEND_API_KEY가 설정되지 않았습니다. 이메일 발송을 건너뜁니다.");
    return null;
  }

  resendInstance = new Resend(apiKey);
  return resendInstance;
}
