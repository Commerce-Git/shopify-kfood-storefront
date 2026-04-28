/**
 * 피드백 이메일 테스트 발송 스크립트
 * 실행: npx tsx scripts/test-feedback-email.ts
 */

import { Resend } from "resend";
import { ReviewRequestEmail } from "../emails/ReviewRequestEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  const testEmail = "thec9rqwer@gmail.com"; // 관리자님 이메일

  console.log(`📧 Sending test feedback email to ${testEmail}...`);

  const { data, error } = await resend.emails.send({
    from: "Seoul Snack Box <onboarding@resend.dev>",
    to: [testEmail],
    subject: "How was your Seoul Snack Box? 🎁 (TEST)",
    react: ReviewRequestEmail({
      customerName: "Junseo",
      reviewToken: "test-token-12345",
    }) as React.ReactElement,
  });

  if (error) {
    console.error("❌ Failed:", error);
    process.exit(1);
  }

  console.log("✅ Email sent successfully!");
  console.log("   ID:", data?.id);
}

main();
