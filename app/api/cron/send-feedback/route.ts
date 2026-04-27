import { NextResponse } from "next/server";
import { Resend } from "resend";
import { FeedbackEmail } from "@/emails/FeedbackEmail";

/**
 * Vercel Cron Job — 매일 오후 8시(EST)에 실행
 *
 * 1. Shopify Admin API로 21일 이상 전에 배송 완료된 주문을 조회
 * 2. 'feedback_sent' 태그가 없는 주문만 필터링
 * 3. Resend로 피드백 요청 이메일 발송
 * 4. 발송 완료된 주문에 'feedback_sent' 태그 추가 (중복 방지)
 */

const resend = new Resend(process.env.RESEND_API_KEY);

const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID!;
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET!;

// ---- Shopify Admin API 헬퍼 함수 ----

async function getShopifyAccessToken(): Promise<string> {
  const res = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/oauth/access_token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: SHOPIFY_CLIENT_ID,
        client_secret: SHOPIFY_CLIENT_SECRET,
        grant_type: "client_credentials",
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Shopify token request failed: ${res.status}`);
  }

  const data = await res.json();
  return data.access_token;
}

async function shopifyGraphQL(
  token: string,
  query: string,
  variables?: Record<string, unknown>
) {
  const res = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2025-10/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  if (!res.ok) {
    throw new Error(`Shopify GraphQL request failed: ${res.status}`);
  }

  return res.json();
}

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
    // 1. Shopify Access Token 발급
    const token = await getShopifyAccessToken();

    // 2. 배송 완료 + feedback_sent 태그 없는 주문 조회
    const ordersQuery = `
      {
        orders(first: 50, query: "fulfillment_status:fulfilled -tag:feedback_sent") {
          edges {
            node {
              id
              name
              email
              customer {
                firstName
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

    const { data } = await shopifyGraphQL(token, ordersQuery);
    const orders = data?.orders?.edges || [];

    // 3. 21일 이상 전에 배송된 주문만 필터링
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 21);

    interface OrderNode {
      id: string;
      name: string;
      email: string | null;
      customer: { firstName: string } | null;
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
        message: "No pending feedback emails today.",
      });
    }

    // 4. 이메일 발송 + 태그 추가
    const results = [];

    for (const edge of eligibleOrders) {
      const order: OrderNode = edge.node;
      if (!order.email) continue;

      try {
        // Resend로 이메일 발송
        await resend.emails.send({
          from: "Seoul Snack Box <onboarding@resend.dev>", // 도메인 인증 후 변경
          to: [order.email],
          subject: "How was your Seoul Snack Box? 🎁",
          react: FeedbackEmail({
            customerName: order.customer?.firstName || "Customer",
            customerEmail: order.email,
          }) as React.ReactElement,
        });

        // Shopify 주문에 'feedback_sent' 태그 추가 (중복 발송 방지)
        await shopifyGraphQL(token, TAG_MUTATION, {
          id: order.id,
          tags: ["feedback_sent"],
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
