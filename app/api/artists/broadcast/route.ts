import { NextResponse } from "next/server";
import { getResendClient } from "@/emails/client";
import { generateUnsubscribeUrl, generateOneClickUnsubscribeApiUrl } from "@/lib/unsubscribe";
import { adminGraphQL } from "@/lib/shopify/admin";
import { getArtistBySlug } from "@/lib/artists";
import { ArtistDropEmail } from "@/emails/templates/ArtistDropEmail";
import { render } from "@react-email/components";

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

    // 1. Query Shopify Admin GraphQL for followers of this artist
    let followers: ShopifyCustomerNode[] = [];
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
      followers = edges
        .map((e: { node: ShopifyCustomerNode }) => e.node)
        .filter((c: ShopifyCustomerNode) => c?.email && c.email.includes("@"));
    } catch (queryErr) {
      console.warn("[Broadcast] Shopify customer query error:", queryErr);
    }

    // 2. Dry Run Mode: Return preview and counts without sending emails
    if (dryRun) {
      const sampleEmail = followers[0]?.email || "collector-preview@blankseoul.com";
      const unsubscribeArtistUrl = generateUnsubscribeUrl(sampleEmail, normalizedSlug);
      const unsubscribeAllUrl = generateUnsubscribeUrl(sampleEmail);
      const oneClickApiUrl = generateOneClickUnsubscribeApiUrl(sampleEmail, normalizedSlug);

      const previewHtml = await render(
        ArtistDropEmail({
          customerName: followers[0]?.firstName || "Valued Collector",
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
        totalFollowersFound: followers.length,
        recipientSample: followers.slice(0, 5).map((f) => ({
          email: f.email,
          name: f.firstName || f.displayName,
        })),
        previewHeaders: {
          "List-Unsubscribe": `<${oneClickApiUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
        htmlPreviewSnippet: previewHtml.slice(0, 500) + "...",
      });
    }

    // 3. Live Batch Dispatch using Resend
    if (followers.length === 0) {
      return NextResponse.json({
        success: true,
        message: `No active followers found with tag ${targetTag}.`,
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
            customerName: recipient.firstName || recipient.displayName || "Valued Collector",
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
      } catch (batchErr: any) {
        errors.push(batchErr.message || "Batch send failure");
      }

      // Micro-sleep pacing (50ms) between batches to prevent API burst limit issues on large follower lists (up to 10K CCU)
      if (i + CHUNK_SIZE < followers.length) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      totalFollowers: followers.length,
      totalSent,
      batches: Math.ceil(followers.length / CHUNK_SIZE),
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("[Broadcast API Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to broadcast studio drop." },
      { status: 500 }
    );
  }
}
