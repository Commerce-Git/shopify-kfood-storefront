import { NextResponse } from "next/server";
import { adminGraphQL } from "@/lib/shopify/admin";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.trim()?.toLowerCase();
    const artistSlug = (body.artistSlug || "blank-seoul").trim().toLowerCase();
    const artistName = body.artistName?.trim() || "Artisan";

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const followTag = `follow-artist:${artistSlug}`;
    const subscriberTag = "artist-drop-subscriber";

    // 1. Check if customer already exists in Shopify Admin
    let customerId: string | null = null;
    let existingTags: string[] = [];

    try {
      const searchResult = await adminGraphQL(
        `query FindCustomerForFollow($query: String!) {
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
      if (customerNode) {
        customerId = customerNode.id;
        existingTags = Array.isArray(customerNode.tags) ? customerNode.tags : [];
      }
    } catch (searchErr) {
      console.warn("[Artist Follow] Customer search error:", searchErr);
    }

    if (customerId) {
      // Customer exists — add followTag & subscriberTag if missing
      const tagsToAdd: string[] = [];
      if (!existingTags.includes(followTag)) tagsToAdd.push(followTag);
      if (!existingTags.includes(subscriberTag)) tagsToAdd.push(subscriberTag);

      if (tagsToAdd.length > 0) {
        try {
          await adminGraphQL(
            `mutation AddFollowArtistTags($input: CustomerInput!) {
              customerUpdate(input: $input) {
                customer { id tags }
                userErrors { field message }
              }
            }`,
            {
              input: {
                id: customerId,
                tags: Array.from(new Set([...existingTags, ...tagsToAdd])),
              },
            }
          );
        } catch (updateErr) {
          console.warn("[Artist Follow] Customer update error:", updateErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: `You are now on the VIP priority list for ${artistName}'s upcoming studio releases.`,
        artistSlug,
      });
    }

    // 2. Customer does not exist — create new customer with marketing consent & tags
    try {
      await adminGraphQL(
        `mutation CreateFollowCustomer($input: CustomerInput!) {
          customerCreate(input: $input) {
            customer { id tags }
            userErrors { field message }
          }
        }`,
        {
          input: {
            email,
            tags: [followTag, subscriberTag],
            emailMarketingConsent: {
              marketingState: "SUBSCRIBED",
              marketingOptInLevel: "SINGLE_OPT_IN",
            },
          },
        }
      );
    } catch (createErr) {
      console.warn("[Artist Follow] Customer create error:", createErr);
    }

    return NextResponse.json({
      success: true,
      message: `You are now on the VIP priority list for ${artistName}'s upcoming studio releases.`,
      artistSlug,
    });
  } catch (error: any) {
    console.error("[Artist Follow API Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to follow artist" },
      { status: 500 }
    );
  }
}
