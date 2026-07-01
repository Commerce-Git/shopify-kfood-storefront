/**
 * 리뷰 요청 이메일 테스트 발송 스크립트
 * 실행: npx tsx scripts/test-review-email.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import { Resend } from "resend";
import { ReviewRequestEmail } from "../emails/ReviewRequestEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  const testEmail = "support@blankseoul.com"; // 관리자님 이메일

  console.log(`📧 Sending test feedback email to ${testEmail}...`);

  const { data, error } = await resend.emails.send({
    from: "Blank Seoul <support@blankseoul.com>",
    to: [testEmail],
    subject: "How was your Seoul Box? 🎁 (TEST)",
    react: ReviewRequestEmail({
      customerName: "Junseo",
      reviewToken: "test-token-12345",
      unsubscribeUrl: "https://blank-seoul-storefront.vercel.app/unsubscribe?email=test&token=test",
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
