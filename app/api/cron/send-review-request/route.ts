import { NextResponse } from "next/server";
import { Resend } from "resend";
import { adminGraphQL } from "@/lib/shopify/admin";
import { ReviewRequestEmail } from "@/emails/ReviewRequestEmail";
import { COUPON_CONFIG } from "@/lib/coupon-config";
import { generateUnsubscribeUrl } from "@/lib/unsubscribe";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Vercel Cron Job — 매일 01:00 UTC 실행
 *
 * 1. Shopify Admin API로 21일 이상 전에 배송 완료된 주문을 조회
 * 2. 'review_requested' 태그가 없는 주문만 필터링
 * 3. Supabase에 리뷰 토큰(빈 껍데기) 생성
 * 4. Resend로 리뷰 요청 이메일 발송 (쿠폰 코드는 숨김)
 * 5. 발송 완료된 주문에 'review_requested' 태그 추가 (중복 방지)
 */

const resend = new Resend(process.env.RESEND_API_KEY);

// ---- Cron Job 핸들러 ----

export async function GET(request: Request) {
  // 보안: Vercel Cron 스케줄러의 정상 요청인지 확인
  const authHeader = request.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // 1. 배송 완료 + review_requested 태그 없는 주문 조회
    const ordersQuery = `
      {
        orders(first: 250, query: "fulfillment_status:fulfilled -tag:review_requested") {
          edges {
            node {
              id
              name
              email
              customer {
                firstName
                lastName
                emailMarketingConsent {
                  marketingState
                }
              }
              tags
              fulfillments(first: 1) {
                createdAt
              }
            }
          }
        }
      }
    `;

    const { data } = await adminGraphQL(ordersQuery);
    const orders = data?.orders?.edges || [];

    // 2. 21일 이상 전에 배송된 주문만 필터링
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 21);

    interface OrderNode {
      id: string;
      name: string;
      email: string | null;
      customer: {
        firstName: string;
        lastName: string;
        emailMarketingConsent: { marketingState: string } | null;
      } | null;
      tags: string[];
      fulfillments: { createdAt: string }[];
    }

    const eligibleOrders = orders.filter(
      (edge: { node: OrderNode }) => {
        const fulfillment = edge.node.fulfillments?.[0];
        if (!fulfillment) return false;
        return new Date(fulfillment.createdAt) <= cutoffDate;
      }
    );

    if (eligibleOrders.length === 0) {
      return NextResponse.json({
        message: "No pending review emails today.",
      });
    }

    // 3. 리뷰 토큰 생성 + 이메일 발송 + 태그 추가
    const results = [];

    for (const edge of eligibleOrders) {
      const order: OrderNode = edge.node;
      if (!order.email) continue;

      try {
        // Shopify 마케팅 동의 확인 (Single Source of Truth)
        const marketingState = order.customer?.emailMarketingConsent?.marketingState;
        if (marketingState !== "SUBSCRIBED") {
          results.push({ order: order.name, status: "skipped (not subscribed)" });
          continue;
        }

        // 리뷰 토큰 생성 (UUID)
        const reviewToken = crypto.randomUUID();
        const tokenExpiresAt = new Date();
        tokenExpiresAt.setDate(
          tokenExpiresAt.getDate() + COUPON_CONFIG.tokenExpiryDays
        );

        // 고객 표시 이름 생성 (예: "Sarah M.")
        const firstName = order.customer?.firstName || "Customer";
        const lastInitial = order.customer?.lastName
          ? ` ${order.customer.lastName.charAt(0)}.`
          : "";
        const displayName = `${firstName}${lastInitial}`;

        // Supabase에 빈 껍데기 리뷰 행 생성
        const { error: dbError } = await supabaseAdmin.from("reviews").insert({
          token: reviewToken,
          token_expires_at: tokenExpiresAt.toISOString(),
          order_id: order.id,
          order_name: order.name,
          customer_name: displayName,
          customer_email: order.email,
        });

        if (dbError) {
          console.error(`DB insert failed for ${order.name}:`, dbError);
          continue;
        }

        // Unsubscribe URL 생성
        const unsubscribeUrl = generateUnsubscribeUrl(order.email);

        // Resend로 이메일 발송
        await resend.emails.send({
          from: "Blank Seoul <support@blankseoul.com>",
          to: [order.email],
          subject: "How was your Seoul Box? Share & get 15% off 🎁",
          headers: {
            "List-Unsubscribe": `<${unsubscribeUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
          react: ReviewRequestEmail({
            customerName: firstName,
            reviewToken,
            unsubscribeUrl,
          }) as React.ReactElement,
        });

        // Shopify 주문에 'review_requested' 태그 추가 (중복 발송 방지)
        await adminGraphQL(TAG_MUTATION, {
          id: order.id,
          tags: ["review_requested"],
        });

        results.push({ order: order.name, status: "sent" });
      } catch (err) {
        console.error(`Failed for order ${order.name}:`, err);
        results.push({ order: order.name, status: "failed" });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      details: results,
    });
  } catch (error) {
    console.error("Cron Job Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ---- GraphQL Mutation ----

const TAG_MUTATION = `
  mutation tagsAdd($id: ID!, $tags: [String!]!) {
    tagsAdd(id: $id, tags: $tags) {
      userErrors {
        field
        message
      }
    }
  }
`;
