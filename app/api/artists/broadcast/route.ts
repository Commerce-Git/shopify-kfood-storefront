import { errorMessage } from "@/lib/errors";
import { NextResponse } from "next/server";
import { getResendClient } from "@/emails/client";
import { generateUnsubscribeUrl, generateOneClickUnsubscribeApiUrl } from "@/lib/unsubscribe";
import { adminGraphQL } from "@/lib/shopify/admin";
import { getArtistBySlug } from "@/lib/artists";
import { ArtistDropEmail } from "@/emails/templates/ArtistDropEmail";
import { render } from "@react-email/components";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { ActiveArtistDropSubscriber } from "@/lib/supabase/types";

interface BroadcastBody {
  artistSlug: string;
  artistName?: string;
  productTitle: string;
  productHandle: string;
  productImageUrl?: string;
  productPrice?: string;
  storyHeading?: string;
  storyBody?: string;
  dryRun?: boolean;
}

interface ShopifyCustomerNode {
  id: string;
  email: string;
  displayName: string;
  firstName: string | null;
  tags: string[];
}

interface MergedFollower {
  email: string;
  name: string;
  source: "supabase" | "shopify" | "both";
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const cronSecret = process.env.CRON_SECRET;
    const isProduction = process.env.NODE_ENV === "production";

    // Fail-closed security in production: CRON_SECRET is mandatory
    if (isProduction && (!cronSecret || authHeader !== `Bearer ${cronSecret}`)) {
      return NextResponse.json(
        { error: "Unauthorized dispatch request: Missing or invalid secret." },
        { status: 401 }
      );
    }

    const body: BroadcastBody = await request.json();
    const {
      artistSlug,
      productTitle,
      productHandle,
      productImageUrl,
      productPrice,
      storyHeading,
      storyBody,
      dryRun = false,
    } = body;

    if (!artistSlug || !productTitle || !productHandle) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: artistSlug, productTitle, and productHandle are mandatory.",
        },
        { status: 400 }
      );
    }

    const normalizedSlug = artistSlug.trim().toLowerCase();
    const targetTag = `follow-artist:${normalizedSlug}`;
    const artistName =
      body.artistName?.trim() ||
      getArtistBySlug(normalizedSlug).name ||
      "Artisan Studio";

    // ========================================================
    // 1. Supabase First-Party SSOT Query (Primary Source)
    // Query active_artist_drop_subscribers view
    // (guarantees status = 'active' AND notify_drops = true AND marketing_consent = true)
    // ========================================================
    let supabaseSubscribers: ActiveArtistDropSubscriber[] = [];
    try {
      const { data, error } = await supabaseAdmin
        .from("active_artist_drop_subscribers")
        .select("artist_slug, artist_name, email, first_name, last_name, user_id, followed_at")
        .eq("artist_slug", normalizedSlug);

      if (error) {
        console.warn("[Broadcast] Supabase active subscribers view query notice:", errorMessage(error));
      } else if (data) {
        supabaseSubscribers = data;
      }
    } catch (sbErr) {
      console.warn("[Broadcast] Supabase query exception:", sbErr);
    }

    // ========================================================
    // 2. Shopify Admin GraphQL Query (Secondary / Legacy Source)
    // ========================================================
    let shopifyFollowers: ShopifyCustomerNode[] = [];
    try {
      const searchResult = await adminGraphQL(
        `query GetArtistFollowers($query: String!) {
          customers(first: 250, query: $query) {
            edges {
              node {
                id
                email
                displayName
                firstName
                tags
              }
            }
          }
        }`,
        {
          query: `tag:${targetTag} AND email_marketing_consent:subscribed`,
        }
      );

      const edges = searchResult?.data?.customers?.edges || [];
      shopifyFollowers = edges
        .map((e: { node: ShopifyCustomerNode }) => e.node)
        .filter((c: ShopifyCustomerNode) => c?.email && c.email.includes("@"));
    } catch (queryErr) {
      console.warn("[Broadcast] Shopify customer query error:", queryErr);
    }

    // ========================================================
    // 3. Lossless Omni-SSOT Merge & Deduplication
    // Keyed by normalized lowercase email
    // ========================================================
    const followersMap = new Map<string, MergedFollower>();

    // 3.1. Insert Supabase subscribers first
    for (const sub of supabaseSubscribers) {
      if (!sub.email || !sub.email.includes("@")) continue;
      const cleanEmail = sub.email.trim().toLowerCase();
      const fullName = [sub.first_name, sub.last_name].filter(Boolean).join(" ");
      followersMap.set(cleanEmail, {
        email: cleanEmail,
        name: sub.first_name?.trim() || fullName.trim() || "Valued Collector",
        source: "supabase",
      });
    }

    // 3.2. Merge Shopify customers
    for (const sc of shopifyFollowers) {
      if (!sc.email || !sc.email.includes("@")) continue;
      const cleanEmail = sc.email.trim().toLowerCase();
      const existing = followersMap.get(cleanEmail);
      if (existing) {
        existing.source = "both";
        if (existing.name === "Valued Collector" && (sc.firstName || sc.displayName)) {
          existing.name = sc.firstName?.trim() || sc.displayName?.trim() || "Valued Collector";
        }
      } else {
        followersMap.set(cleanEmail, {
          email: cleanEmail,
          name: sc.firstName?.trim() || sc.displayName?.trim() || "Valued Collector",
          source: "shopify",
        });
      }
    }

    const followers = Array.from(followersMap.values());

    // ========================================================
    // 4. Dry Run Mode: Return preview and counts without sending
    // ========================================================
    if (dryRun) {
      const sampleEmail = followers[0]?.email || "collector-preview@blankseoul.com";
      const sampleName = followers[0]?.name || "Valued Collector";
      const unsubscribeArtistUrl = generateUnsubscribeUrl(sampleEmail, normalizedSlug);
      const unsubscribeAllUrl = generateUnsubscribeUrl(sampleEmail);
      const oneClickApiUrl = generateOneClickUnsubscribeApiUrl(sampleEmail, normalizedSlug);

      const previewHtml = await render(
        ArtistDropEmail({
          customerName: sampleName,
          artistName,
          artistSlug: normalizedSlug,
          productTitle,
          productHandle,
          productImageUrl,
          productPrice,
          storyHeading,
          storyBody,
          unsubscribeArtistUrl,
          unsubscribeAllUrl,
        })
      );

      return NextResponse.json({
        success: true,
        dryRun: true,
        artistSlug: normalizedSlug,
        artistName,
        metrics: {
          supabaseSubscribersCount: supabaseSubscribers.length,
          shopifySubscribersCount: shopifyFollowers.length,
          totalUniqueRecipients: followers.length,
        },
        recipientSample: followers.slice(0, 5),
        previewHeaders: {
          "List-Unsubscribe": `<${oneClickApiUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
        htmlPreviewSnippet: previewHtml.slice(0, 500) + "...",
      });
    }

    // ========================================================
    // 5. Live Batch Dispatch using Resend Batch API
    // ========================================================
    if (followers.length === 0) {
      return NextResponse.json({
        success: true,
        message: `No active subscribers found in Supabase or Shopify for artist ${normalizedSlug}.`,
        dispatchedCount: 0,
      });
    }

    const resend = getResendClient();
    if (!resend) {
      return NextResponse.json({
        success: false,
        error: "Resend API key is not configured on the server.",
        dispatchedCount: 0,
      });
    }

    // Slice into chunks of 100 (Resend batch API limit)
    const CHUNK_SIZE = 100;
    let totalSent = 0;
    const errors: string[] = [];

    for (let i = 0; i < followers.length; i += CHUNK_SIZE) {
      const chunk = followers.slice(i, i + CHUNK_SIZE);
      const batchItems = chunk.map((recipient) => {
        const unsubscribeArtistUrl = generateUnsubscribeUrl(
          recipient.email,
          normalizedSlug
        );
        const unsubscribeAllUrl = generateUnsubscribeUrl(recipient.email);
        const oneClickApiUrl = generateOneClickUnsubscribeApiUrl(
          recipient.email,
          normalizedSlug
        );

        return {
          from: "Blank Seoul Atelier <atelier@blankseoul.com>",
          to: recipient.email,
          subject: `New Studio Release: ${productTitle} by ${artistName}`,
          react: ArtistDropEmail({
            customerName: recipient.name,
            artistName,
            artistSlug: normalizedSlug,
            productTitle,
            productHandle,
            productImageUrl,
            productPrice,
            storyHeading,
            storyBody,
            unsubscribeArtistUrl,
            unsubscribeAllUrl,
          }),
          headers: {
            "List-Unsubscribe": `<${oneClickApiUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        };
      });

      try {
        const batchResponse = await resend.batch.send(batchItems);
        if (batchResponse.error) {
          errors.push(batchResponse.error.message);
        } else {
          totalSent += chunk.length;
        }
      } catch (batchErr: unknown) {
        errors.push(errorMessage(batchErr, "Batch send failure"));
      }

      // Micro-sleep pacing (50ms) between batches to prevent API burst limit issues on large follower lists (up to 10K CCU)
      if (i + CHUNK_SIZE < followers.length) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      metrics: {
        supabaseSubscribersCount: supabaseSubscribers.length,
        shopifySubscribersCount: shopifyFollowers.length,
        totalUniqueRecipients: followers.length,
      },
      totalSent,
      batches: Math.ceil(followers.length / CHUNK_SIZE),
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: unknown) {
    console.error("[Broadcast API Error]:", error);
    return NextResponse.json(
      { success: false, error: errorMessage(error, "Failed to broadcast studio drop.") },
      { status: 500 }
    );
  }
}
