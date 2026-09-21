import { NextResponse } from "next/server";
import { adminGraphQL } from "@/lib/shopify/admin";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface WaitlistItem {
  title: string;
  variantTitle?: string;
  price?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.trim()?.toLowerCase();
    const items: WaitlistItem[] = Array.isArray(body.items) ? body.items : [];

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const itemsSummary = items.length > 0
      ? `Launch Waitlist Items: ${items.map((i) => i.title + (i.variantTitle && i.variantTitle !== "Default Title" ? ` (${i.variantTitle})` : "")).join(", ")}`
      : "General Launch Waitlist Subscription";

    // 1. Search if customer already exists in Shopify
    const searchResult = await adminGraphQL(
      `query FindCustomer($query: String!) {
        customers(first: 1, query: $query) {
          edges {
            node {
              id
              tags
              note
            }
          }
        }
      }`,
      { query: `email:${email}` }
    );

    const existingCustomer = searchResult?.data?.customers?.edges?.[0]?.node;

    if (existingCustomer) {
      const currentTags: string[] = existingCustomer.tags || [];
      const newTags = Array.from(new Set([...currentTags, "launch_waitlist", "newsletter"]));
      const existingNote = existingCustomer.note || "";
      const updatedNote = existingNote ? `${existingNote} | ${itemsSummary}` : itemsSummary;

      await adminGraphQL(
        `mutation UpdateWaitlistCustomer($input: CustomerInput!) {
          customerUpdate(input: $input) {
            customer { id tags note }
            userErrors { field message }
          }
        }`,
        {
          input: {
            id: existingCustomer.id,
            tags: newTags,
            note: updatedNote.slice(0, 5000), // Shopify note length safety
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: "You're already on our priority list! We've updated your curated selection.",
        existing: true,
      });
    }

    // 2. Create brand-new customer in Shopify with marketing consent & tags
    const createResult = await adminGraphQL(
      `mutation CreateWaitlistCustomer($input: CustomerInput!) {
        customerCreate(input: $input) {
          customer { id email }
          userErrors { field message }
        }
      }`,
      {
        input: {
          email,
          tags: ["launch_waitlist", "newsletter"],
          note: itemsSummary,
          emailMarketingConsent: {
            marketingState: "SUBSCRIBED",
            consentUpdatedAt: new Date().toISOString(),
            marketingOptInLevel: "SINGLE_OPT_IN",
          },
        },
      }
    );

    if (createResult?.errors?.length > 0) {
      console.error("[Launch Waitlist] GraphQL errors:", createResult.errors);
      return NextResponse.json(
        { success: false, error: "Service temporarily unavailable. Please try again shortly." },
        { status: 500 }
      );
    }

    const userErrors = createResult?.data?.customerCreate?.userErrors;
    if (userErrors?.length > 0) {
      // If email taken edge-case
      if (userErrors.some((e: { message: string }) => e.message?.toLowerCase().includes("taken") || e.message?.toLowerCase().includes("exists"))) {
        return NextResponse.json({
          success: true,
          message: "You're already registered! We will notify you the moment orders open.",
          existing: true,
        });
      }

      console.error("[Launch Waitlist] User errors:", userErrors);
      return NextResponse.json(
        { success: false, error: userErrors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "You're on the priority list! We will notify you the moment official international dispatch opens.",
      existing: false,
    });
  } catch (error) {
    console.error("[Launch Waitlist] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email")?.trim()?.toLowerCase();

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ registered: false }, { status: 400 });
    }

    const searchResult = await adminGraphQL(
      `query CheckCustomerWaitlist($query: String!) {
        customers(first: 1, query: $query) {
          edges {
            node {
              id
              tags
              emailMarketingConsent {
                marketingState
              }
            }
          }
        }
      }`,
      { query: `email:${email}` }
    );

    const customer = searchResult?.data?.customers?.edges?.[0]?.node;
    if (customer) {
      const tags: string[] = customer.tags || [];
      const hasWaitlistTag = tags.includes("launch_waitlist");
      const hasNewsletterTag = tags.includes("newsletter");
      const isSubscribed = customer.emailMarketingConsent?.marketingState === "SUBSCRIBED";

      if (hasWaitlistTag || hasNewsletterTag || isSubscribed) {
        return NextResponse.json({
          registered: true,
          email,
          hasWaitlistTag,
          hasNewsletterTag,
          isSubscribed,
        });
      }
    }

    return NextResponse.json({ registered: false, email });
  } catch (error) {
    console.error("[Launch Waitlist Check] Unexpected error:", error);
    return NextResponse.json({ registered: false });
  }
}

