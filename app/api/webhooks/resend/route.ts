import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { updateMarketingConsent } from "@/lib/shopify/admin";

/**
 * Resend Svix Signature Verification
 * Ensures incoming webhooks genuinely originate from Resend.
 */
function verifySvixSignature(
  payload: string,
  headers: { id: string | null; timestamp: string | null; signature: string | null },
  secret: string
): boolean {
  if (!headers.id || !headers.timestamp || !headers.signature) {
    return false;
  }

  // Prevent replay attacks (5 minutes tolerance)
  const timestampSec = parseInt(headers.timestamp, 10);
  const currentSec = Math.floor(Date.now() / 1000);
  if (isNaN(timestampSec) || Math.abs(currentSec - timestampSec) > 300) {
    return false;
  }

  // Parse secret key (Svix secrets usually start with 'whsec_')
  const secretKey = secret.startsWith("whsec_")
    ? Buffer.from(secret.slice(6), "base64")
    : Buffer.from(secret, "utf-8");

  const signedContent = `${headers.id}.${headers.timestamp}.${payload}`;
  const computedSignature = createHmac("sha256", secretKey)
    .update(signedContent)
    .digest("base64");

  const expectedV1 = `v1,${computedSignature}`;
  const signatures = headers.signature.split(" ");

  for (const sig of signatures) {
    try {
      const sigBuf = Buffer.from(sig);
      const expectedBuf = Buffer.from(expectedV1);
      if (sigBuf.length === expectedBuf.length && timingSafeEqual(sigBuf, expectedBuf)) {
        return true;
      }
    } catch {
      continue;
    }
  }

  return false;
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return NextResponse.json({ error: 'Webhook secret is not configured.' }, { status: 503 });
    }
    // Signature verification is mandatory in every environment.
    if (webhookSecret) {
      const svixHeaders = {
        id: request.headers.get("svix-id"),
        timestamp: request.headers.get("svix-timestamp"),
        signature: request.headers.get("svix-signature"),
      };

      if (!verifySvixSignature(rawBody, svixHeaders, webhookSecret)) {
        console.warn("[Resend Webhook] Signature verification failed.");
        return NextResponse.json(
          { error: "Invalid webhook signature." },
          { status: 401 }
        );
      }
    }

    const payload = JSON.parse(rawBody);
    const eventType: string = payload?.type || "";
    const eventData = payload?.data || {};
    const recipients: string[] = Array.isArray(eventData.to)
      ? eventData.to
      : eventData.to
      ? [eventData.to]
      : [];

    console.log(`[Resend Webhook] Received event: ${eventType} for ${recipients.length} recipient(s)`);

    // ========================================================
    // 1. Hard Bounce Handling (email.bounced)
    // Automatically turn off marketing consent to prevent spam blacklisting
    // ========================================================
    if (eventType === "email.bounced") {
      for (const email of recipients) {
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail) continue;

        console.warn(`[Resend Webhook] Suppressing bounced email: ${cleanEmail}`);

        // Update Supabase storefront_customers
        await supabaseAdmin
          .from("storefront_customers")
          .update({
            marketing_consent: false,
            updated_at: new Date().toISOString(),
          })
          .eq("email", cleanEmail);

        // Mirror to Shopify
        await updateMarketingConsent(cleanEmail, "UNSUBSCRIBED").catch((err) => {
          console.warn("[Resend Webhook] Shopify consent sync error on bounce:", err);
        });
      }
    }

    // ========================================================
    // 2. Spam Complaint Handling (email.complained)
    // Instantly revoke consent and studio notifications to maintain <0.1% complaint rate
    // ========================================================
    else if (eventType === "email.complained") {
      for (const email of recipients) {
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail) continue;

        console.warn(`[Resend Webhook] Suppressing complained recipient: ${cleanEmail}`);

        // Find customer in Supabase
        const { data: customer } = await supabaseAdmin
          .from("storefront_customers")
          .select("id")
          .eq("email", cleanEmail)
          .single();

        // Turn off marketing consent
        await supabaseAdmin
          .from("storefront_customers")
          .update({
            marketing_consent: false,
            updated_at: new Date().toISOString(),
          })
          .eq("email", cleanEmail);

        // Turn off drop notifications & soft unsub in customer_followed_artists
        if (customer?.id) {
          await supabaseAdmin
            .from("customer_followed_artists")
            .update({
              notify_drops: false,
              status: "unsubscribed",
              unfollowed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", customer.id);
        }

        // Mirror to Shopify
        await updateMarketingConsent(cleanEmail, "UNSUBSCRIBED").catch((err) => {
          console.warn("[Resend Webhook] Shopify consent sync error on complaint:", err);
        });
      }
    }

    return NextResponse.json({
      received: true,
      type: eventType,
      processedRecipients: recipients.length,
    });
  } catch (error: any) {
    console.error("[Resend Webhook Exception]:", error);
    return NextResponse.json(
      { error: error?.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}
