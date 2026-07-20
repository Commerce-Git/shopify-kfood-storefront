import { NextResponse } from "next/server";
import { adminGraphQL } from "@/lib/shopify/admin";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.trim()?.toLowerCase();

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // 1. Check if customer already exists
    const searchResult = await adminGraphQL(
      `query FindCustomer($query: String!) {
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

    const existingCustomer =
      searchResult?.data?.customers?.edges?.[0]?.node;

    if (existingCustomer) {
      // Customer exists — ensure "newsletter" tag is present
      const currentTags: string[] = existingCustomer.tags || [];
      if (!currentTags.includes("newsletter")) {
        await adminGraphQL(
          `mutation AddNewsletterTag($input: CustomerInput!) {
            customerUpdate(input: $input) {
              customer { id }
              userErrors { field message }
            }
          }`,
          {
            input: {
              id: existingCustomer.id,
              tags: [...currentTags, "newsletter"],
            },
          }
        );
      }

      return NextResponse.json({
        success: true,
        message: "You're already subscribed to our newsletter! 🎉",
        existing: true,
      });
    }

    // 2. Create new customer with newsletter tag + marketing consent
    const createResult = await adminGraphQL(
      `mutation CreateNewsletterCustomer($input: CustomerInput!) {
        customerCreate(input: $input) {
          customer {
            id
            email
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        input: {
          email,
          tags: ["newsletter"],
          emailMarketingConsent: {
            marketingState: "SUBSCRIBED",
            consentUpdatedAt: new Date().toISOString(),
            marketingOptInLevel: "SINGLE_OPT_IN",
          },
        },
      }
    );

    // Check for GraphQL-level errors (e.g. access denied)
    if (createResult?.errors?.length > 0) {
      console.error("[Newsletter] GraphQL errors:", createResult.errors);
      return NextResponse.json(
        { success: false, error: "Service temporarily unavailable. Please try again later." },
        { status: 500 }
      );
    }

    const userErrors =
      createResult?.data?.customerCreate?.userErrors;
    if (userErrors?.length > 0) {
      console.error("[Newsletter] Customer creation errors:", userErrors);

      // Handle "email taken" edge case (race condition)
      if (
        userErrors.some(
          (e: { message: string }) =>
            e.message?.toLowerCase().includes("taken") ||
            e.message?.toLowerCase().includes("exists")
        )
      ) {
        return NextResponse.json({
          success: true,
          message: "You're already subscribed to our newsletter! 🎉",
          existing: true,
        });
      }

      return NextResponse.json(
        { success: false, error: userErrors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Welcome! You've successfully subscribed to our newsletter. 🚀",
      existing: false,
    });
  } catch (error) {
    console.error("[Newsletter] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
