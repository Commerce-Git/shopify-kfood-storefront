import { render } from "@react-email/components";
import * as React from "react";
import { ReviewRequestEmail } from "../emails/templates/ReviewRequestEmail";
import { CouponConfirmationEmail } from "../emails/templates/CouponConfirmationEmail";
import { CouponReminderEmail } from "../emails/templates/CouponReminderEmail";
import { OrderCancellationEmail } from "../emails/templates/OrderCancellationEmail";
import { PipelineStatusDashboard } from "../emails/templates/00_PipelineStatus";
import {
  EMAIL_PIPELINE_REGISTRY,
  getAllPipelineMetadata,
  getEmailPipelineMetadata,
  getPipelinesByEngine,
  type EmailPipelineId,
} from "../emails/pipeline-config";
import { IS_MARKETING_EMAIL_ENABLED } from "../emails/senders";

async function runPrecisionAudit() {
  console.log("==================================================================");
  console.log("🔍 OMNI-CHANNEL COMMUNICATIONS HUB PRECISION AUDIT & VERIFICATION");
  console.log("==================================================================");

  let passedTests = 0;
  let totalTests = 0;

  function assert(name: string, condition: boolean, detail?: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${name}${detail ? ` - ${detail}` : ""}`);
    }
  }

  // 1. SSOT Metadata Registry Integrity (10 Channels)
  console.log("\n--- 1. Testing 10-Channel Registry Integrity ---");
  const pipelines = getAllPipelineMetadata();
  assert("Registry contains exactly 10 channels", pipelines.length === 10, `Found: ${pipelines.length}`);

  const requiredIds: EmailPipelineId[] = [
    "customer_welcome_reset",
    "order_confirmation",
    "shipping_confirmation",
    "shipping_update",
    "order_cancellation",
    "order_refund",
    "review_request",
    "coupon_confirmation",
    "coupon_reminder",
    "customer_support_chat",
  ];

  for (const id of requiredIds) {
    const meta = getEmailPipelineMetadata(id);
    assert(
      `Channel '${id}' is registered with valid metadata`,
      Boolean(meta && meta.name && meta.statusBadge && meta.trigger && meta.engine && meta.channelMedia && meta.editLocation)
    );
  }

  const shopifyFlows = getPipelinesByEngine("SHOPIFY_NATIVE");
  assert("Shopify Native engine contains exactly 6 flows", shopifyFlows.length === 6, `Found: ${shopifyFlows.length}`);

  const resendFlows = getPipelinesByEngine("RESEND");
  assert("Resend Storefront engine contains exactly 3 flows", resendFlows.length === 3, `Found: ${resendFlows.length}`);

  const crispFlows = getPipelinesByEngine("CRISP");
  assert("Crisp Live Chat engine contains exactly 1 flow", crispFlows.length === 1, `Found: ${crispFlows.length}`);

  assert("Marketing switch reflects current state (false)", IS_MARKETING_EMAIL_ENABLED === false);

  // 2. Safe Fallback & Zero-Crash Rendering Test (Empty Props)
  console.log("\n--- 2. Testing Zero-Crash Default Rendering (No Props Passed) ---");
  try {
    const emptyReviewHtml = await render(React.createElement(ReviewRequestEmail, {}));
    assert("ReviewRequestEmail renders safely with empty props", emptyReviewHtml.includes("How was your"));

    const emptyCouponHtml = await render(React.createElement(CouponConfirmationEmail, {}));
    assert("CouponConfirmationEmail renders safely without throwing", emptyCouponHtml.includes("BLANK-10OFF-SAMPLE"));

    const emptyReminderHtml = await render(React.createElement(CouponReminderEmail, {}));
    assert("CouponReminderEmail renders safely without throwing", emptyReminderHtml.includes("Your coupon expires"));

    const emptyCancelHtml = await render(React.createElement(OrderCancellationEmail, {}));
    assert("OrderCancellationEmail renders safely without throwing", emptyCancelHtml.includes("Order Cancellation Confirmed"));
  } catch (err) {
    assert("All templates render with empty props without throwing", false, String(err));
  }

  // 3. Development Mode Inspector Ribbon Test
  console.log("\n--- 3. Testing Development Mode Inspector Ribbon (NODE_ENV = 'development') ---");
  (process.env as Record<string, string | undefined>).NODE_ENV = "development";

  const devReviewHtml = await render(React.createElement(ReviewRequestEmail, {}));
  assert(
    "Dev mode includes DEV INSPECTOR banner in ReviewRequestEmail",
    devReviewHtml.includes("DEV INSPECTOR • PORT 3003")
  );
  assert(
    "Dev mode includes PAUSED status pill",
    devReviewHtml.includes("PAUSED (Zero-Cost Guard)")
  );
  assert(
    "Dev mode includes media tag EMAIL",
    devReviewHtml.includes("EMAIL")
  );
  assert(
    "Dev mode includes trigger details",
    devReviewHtml.includes("cron-job.org ➔ /api/cron/send-review-request")
  );

  const devNativeHtml = await render(React.createElement(OrderCancellationEmail, {}));
  assert(
    "Dev mode includes SHOPIFY MANAGED status pill for OrderCancellation",
    devNativeHtml.includes("SHOPIFY MANAGED (Active)")
  );
  assert(
    "Dev mode includes direct Shopify Admin link in OrderCancellation",
    devNativeHtml.includes("https://admin.shopify.com/store/tv7r0x-zn/settings/notifications")
  );

  // 4. Zero-Production-Leak Audit (CRITICAL)
  console.log("\n--- 4. Testing Zero-Production-Leak (NODE_ENV = 'production') ---");
  (process.env as Record<string, string | undefined>).NODE_ENV = "production";

  const prodReviewHtml = await render(React.createElement(ReviewRequestEmail, {
    customerName: "Real Customer",
    reviewToken: "real-uuid-token",
    unsubscribeUrl: "https://blank-seoul-storefront.vercel.app/unsubscribe?token=real",
  }));

  assert(
    "Production ReviewRequestEmail contains NO 'DEV INSPECTOR'",
    !prodReviewHtml.includes("DEV INSPECTOR")
  );
  assert(
    "Production ReviewRequestEmail contains NO 'PORT 3003'",
    !prodReviewHtml.includes("PORT 3003")
  );
  assert(
    "Production ReviewRequestEmail contains NO 'PAUSED (Zero-Cost Guard)'",
    !prodReviewHtml.includes("PAUSED (Zero-Cost Guard)")
  );
  assert(
    "Production ReviewRequestEmail retains clean customer content",
    prodReviewHtml.includes("Real Customer") && prodReviewHtml.includes("How was your")
  );

  const prodCouponHtml = await render(React.createElement(CouponConfirmationEmail, {
    customerName: "Jane Doe",
    couponCode: "SAVE20",
    discountLabel: "20% OFF",
    expiresAt: "2026-10-01T00:00:00.000Z",
    reviewToken: "tok-123",
  }));
  assert("Production CouponConfirmationEmail contains NO 'DEV INSPECTOR'", !prodCouponHtml.includes("DEV INSPECTOR"));
  assert("Production CouponConfirmationEmail has customer coupon code", prodCouponHtml.includes("SAVE20"));

  const prodCancelHtml = await render(React.createElement(OrderCancellationEmail, {
    customerName: "Jane Doe",
    orderNumber: "1099",
    refundAmount: "120.00",
    unsubscribeUrl: "https://blank-seoul-storefront.vercel.app/unsubscribe",
  }));
  assert("Production OrderCancellationEmail contains NO 'DEV INSPECTOR'", !prodCancelHtml.includes("DEV INSPECTOR"));
  assert("Production OrderCancellationEmail has order number #1099", prodCancelHtml.includes("#1099"));

  // 5. 00_PipelineStatus Dashboard Integrity (Omni-Channel View)
  console.log("\n--- 5. Testing 00_PipelineStatus Omni-Channel Dashboard Rendering ---");
  const dashboardHtml = await render(React.createElement(PipelineStatusDashboard, {}));
  assert("Dashboard contains Blank Seoul Omni-Channel Hub title", dashboardHtml.includes("Blank Seoul Omni-Channel Hub"));
  assert("Dashboard displays Total Channels KPI (10)", dashboardHtml.includes("Total Channels") && dashboardHtml.includes("10"));
  assert("Dashboard displays Shopify Native KPI (6)", dashboardHtml.includes("Shopify Native") && dashboardHtml.includes("6"));
  assert("Dashboard displays Resend Storefront KPI (3)", dashboardHtml.includes("Resend Storefront") && dashboardHtml.includes("3"));
  assert("Dashboard displays Crisp Chat KPI (1)", dashboardHtml.includes("Crisp Chat") && dashboardHtml.includes("1"));
  assert("Dashboard displays Visual Customer Journey Timeline", dashboardHtml.includes("Visual Customer Journey Timeline"));
  assert("Dashboard displays 2026 Google & Yahoo Sender Authentication", dashboardHtml.includes("2026 Google &amp; Yahoo Sender Authentication") || dashboardHtml.includes("2026 Google & Yahoo Sender Authentication"));
  assert("Dashboard includes direct Shopify deeplink", dashboardHtml.includes("https://admin.shopify.com/store/tv7r0x-zn/settings/notifications"));
  assert("Dashboard includes Crisp console link", dashboardHtml.includes("https://app.crisp.chat/"));

  console.log("\n==================================================================");
  console.log(`📊 FINAL AUDIT SCORE: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log("==================================================================");
}

runPrecisionAudit().catch((e) => {
  console.error("Audit failed with error:", e);
  process.exit(1);
});
