import { NextResponse } from "next/server";
import { Resend } from "resend";
import { FeedbackEmail } from "@/emails/FeedbackEmail";
import { createClient } from "@supabase/supabase-js";

// Vercel Cron Job - 매일 실행되어 14일 전 배송된 주문을 찾아 이메일을 발송합니다.

const resend = new Resend(process.env.RESEND_API_KEY);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  // 보안 검증: Vercel Cron 스케줄러가 보낸 정상적인 요청인지 확인 (프로덕션 환경)
  const authHeader = request.headers.get('authorization');
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    console.warn("Unauthorized Cron Job attempt.");
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // 21일 전 날짜 계산 (배송 후 수령 및 시식 시간 고려)
    const targetDateObj = new Date();
    targetDateObj.setDate(targetDateObj.getDate() - 21);
    const targetDate = targetDateObj.toISOString();

    // Supabase 조회: 21일 이상 지났고(<=), 아직 피드백 요청을 안 보낸(false) 주문 50개 추출
    const { data: orders, error } = await supabase
      .from("fulfilled_orders")
      .select("*")
      .eq("feedback_requested", false)
      .lte("fulfilled_at", targetDate)
      .limit(50);

    if (error) throw error;
    
    if (!orders || orders.length === 0) {
      return NextResponse.json({ message: "No pending feedback emails to send today." });
    }

    const results = [];

    // 대상자들에게 순차적으로 이메일 발송
    for (const order of orders) {
      try {
        await resend.emails.send({
          from: "Seoul Snack Box <onboarding@resend.dev>", // 나중에 실제 도메인으로 변경
          to: [order.email],
          subject: "How was your Seoul Snack Box? 🎁",
          react: FeedbackEmail({
            customerName: order.first_name || "Customer",
            customerEmail: order.email,
          }) as React.ReactElement,
        });

        // 발송 성공 시 DB에 완료 처리 (True)
        await supabase
          .from("fulfilled_orders")
          .update({ feedback_requested: true })
          .eq("order_id", order.order_id);

        results.push({ order: order.order_id, status: "sent" });
      } catch (err) {
        console.error(`Failed to send email to ${order.email}`, err);
        results.push({ order: order.order_id, status: "failed" });
      }
    }

    return NextResponse.json({ success: true, processed: results.length, details: results });
  } catch (error) {
    console.error("Cron Job Execution Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
