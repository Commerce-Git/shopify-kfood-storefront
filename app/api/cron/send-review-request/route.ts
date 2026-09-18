import { NextResponse } from "next/server";
import { adminGraphQL } from "@/lib/shopify/admin";
import { sendReviewRequestEmail, IS_MARKETING_EMAIL_ENABLED } from "@/emails";
import { COUPON_CONFIG } from "@/lib/coupon-config";
import { generateUnsubscribeUrl } from "@/lib/unsubscribe";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Review Request Cron Job (cron-job.org / Vercel Cron)
 *
 * 1. 마케팅 메일 비활성화 상태 시 즉시 안전 조기 종료 (Zero-Cost Short-Circuit)
 * 2. 활성화 상태 시: Shopify 배송 21일 경과 주문 조회 → Supabase 리뷰 토큰 생성 → 메일 발송 → 태그 추가
 */

// ---- Cron Job 핸들러 ----

export async function GET(request: Request) {
  // 1. 보안 인증 (cron-job.org 헤더 및 ?key= 쿼리 파라미터 지원)
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret && process.env.NODE_ENV === "production") {
    return new Response("Server configuration error: CRON_SECRET is not configured.", { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  const { searchParams } = new URL(request.url);
  const queryKey = searchParams.get("key");
  const tokenFromHeader = authHeader ? authHeader.replace(/^Bearer\s+/i, "") : null;

  const isAuthorized =
    process.env.NODE_ENV !== "production" ||
    tokenFromHeader === cronSecret ||
    queryKey === cronSecret;

  if (!isAuthorized) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 2. [Zero-Cost Short-Circuit] 마케팅 메일 비활성화 시 Shopify API 쿼리 전 즉시 안전 탈출
  if (!IS_MARKETING_EMAIL_ENABLED) {
    return NextResponse.json({
      success: true,
      skipped: true,
      message: "Marketing email automation is currently suspended. Zero Shopify queries consumed.",
    });
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

        // Resend로 이메일 발송 (@/emails 단일 모듈 활용)
        await sendReviewRequestEmail({
          to: order.email,
          customerName: firstName,
          reviewToken,
          unsubscribeUrl,
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
