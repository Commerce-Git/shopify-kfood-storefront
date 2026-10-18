import { NextResponse } from "next/server";
import { adminGraphQL } from "@/lib/shopify/admin";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

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
              email
              tags
            }
          }
        }
      }`,
      { query: `email:${JSON.stringify(email)}` }
    );

    const existingCustomer =
      searchResult?.data?.customers?.edges?.[0]?.node;

    if (existingCustomer && existingCustomer.email?.trim().toLowerCase() !== email) {
      return NextResponse.json({ error: "Customer identity could not be verified." }, { status: 502 });
    }
    if (existingCustomer) {
      // The form records a fresh opt-in; a tag alone is not marketing consent.
      const update = await adminGraphQL(
        `mutation SubscribeWaitlist($input: CustomerInput!, $id: ID!, $tags: [String!]!) {
          customerUpdate(input: $input) {
            customer { id emailMarketingConsent { marketingState } }
            userErrors { field message }
          }
          tagsAdd(id: $id, tags: $tags) { node { id } userErrors { field message } }
        }`,
        {
          id: existingCustomer.id,
          tags: ["waitlist"],
          input: {
            id: existingCustomer.id,
            emailMarketingConsent: {
              marketingState: "SUBSCRIBED",
              consentUpdatedAt: new Date().toISOString(),
              marketingOptInLevel: "SINGLE_OPT_IN",
            },
          },
        }
      );
      const consent = update?.data?.customerUpdate;
      const tagged = update?.data?.tagsAdd;
      if (consent?.userErrors?.length || tagged?.userErrors?.length ||
          consent?.customer?.emailMarketingConsent?.marketingState !== "SUBSCRIBED" || !tagged?.node?.id) {
        return NextResponse.json({ success: false, error: "Could not save your subscription. Please try again." }, { status: 502 });
      }

      return NextResponse.json({
        success: true,
        message: "You are already registered for early access.",
        existing: true,
      });
    }

    // 2. Create new customer with waitlist tag + marketing consent
    const createResult = await adminGraphQL(
      `mutation CreateWaitlistCustomer($input: CustomerInput!) {
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
          tags: ["waitlist"],
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
      console.error("[Waitlist] GraphQL errors:", createResult.errors);
      return NextResponse.json(
        { success: false, error: "Service temporarily unavailable. Please try again later." },
        { status: 500 }
      );
    }

    const userErrors =
      createResult?.data?.customerCreate?.userErrors;
    if (userErrors?.length > 0) {
      console.error("[Waitlist] Customer creation errors:", userErrors);


      return NextResponse.json(
        { success: false, error: userErrors[0].message },
        { status: 400 }
      );
    }

    if (!createResult?.data?.customerCreate?.customer?.id) {
      return NextResponse.json({ success: false, error: "Could not save your subscription. Please try again." }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      message: "Your notification is set. You will be notified first the moment new pieces arrive.",
      existing: false,
    });
  } catch (error) {
    console.error("[Waitlist] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
