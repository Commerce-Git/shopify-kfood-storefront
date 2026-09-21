import { NextResponse } from "next/server";
import { updateArtistFollowStatus, adminGraphQL } from "@/lib/shopify/admin";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.trim()?.toLowerCase();
    const artistSlug = (body.artistSlug || "blank-seoul").trim().toLowerCase();
    const artistName = body.artistName?.trim() || "Artisan";
    const action: "follow" | "unfollow" = body.action === "unfollow" ? "unfollow" : "follow";

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Attempt Shopify customer tag sync with fault isolation (never breaks user follow experience)
    const result = await updateArtistFollowStatus(email, artistSlug, action, artistName).catch((err) => {
      console.warn("[Artist Follow Background Shopify Sync Exception]:", err);
      return { success: false, error: err?.message || "Shopify network error" };
    });

    if (!result.success) {
      console.warn("[Artist Follow Background Shopify Sync Throttled]:", result.error);
      return NextResponse.json({
        success: true,
        shopifySynced: false,
        warning: result.error || "Shopify tag mirroring queued or throttled.",
        artistSlug,
        action,
      });
    }

    return NextResponse.json({
      success: true,
      shopifySynced: true,
      message: (result as { message?: string }).message || `Successfully processed ${action}.`,
      artistSlug,
      action,
    });
  } catch (error: any) {
    console.error("[Artist Follow API Error]:", error);
    return NextResponse.json(
      { success: true, shopifySynced: false, warning: error.message || "Failed background Shopify tag" },
      { status: 200 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email")?.trim()?.toLowerCase();

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ success: true, followedSlugs: [] });
    }

    const searchResult = await adminGraphQL(
      `query GetCustomerFollowTags($query: String!) {
        customers(first: 1, query: $query) {
          edges {
            node {
              id
              tags
            }
          }
        }
      }`,
      { query: `email:${email}` }
    );

    const customerNode = searchResult?.data?.customers?.edges?.[0]?.node;
    const tags: string[] = Array.isArray(customerNode?.tags) ? customerNode.tags : [];
    const followedSlugs = tags
      .filter((t: string) => t.startsWith("follow-artist:"))
      .map((t: string) => t.replace("follow-artist:", "").toLowerCase().trim());

    return NextResponse.json({
      success: true,
      email,
      followedSlugs,
    });
  } catch (error: any) {
    console.warn("[Get Customer Follow Tags Warning]:", error);
    return NextResponse.json({ success: true, followedSlugs: [] });
  }
}
