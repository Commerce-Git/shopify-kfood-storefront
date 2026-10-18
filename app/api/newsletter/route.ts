import { NextResponse } from "next/server";
import { adminGraphQL } from "@/lib/shopify/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";

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
        `mutation SubscribeNewsletter($input: CustomerInput!, $id: ID!, $tags: [String!]!) {
          customerUpdate(input: $input) {
            customer { id emailMarketingConsent { marketingState } }
            userErrors { field message }
          }
          tagsAdd(id: $id, tags: $tags) { node { id } userErrors { field message } }
        }`,
        {
          id: existingCustomer.id,
          tags: ["newsletter"],
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

      // Sync marketing_consent to Supabase storefront_customers
      try {
        await supabaseAdmin
          .from("storefront_customers")
          .update({
            marketing_consent: true,
            updated_at: new Date().toISOString(),
          })
          .eq("email", email);
      } catch (dbErr) {
        console.warn("[Newsletter] Supabase marketing_consent sync notice:", dbErr);
      }

      return NextResponse.json({
        success: true,
        message: "You are already subscribed to the Collector Circle.",
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


      return NextResponse.json(
        { success: false, error: userErrors[0].message },
        { status: 400 }
      );
    }

    if (!createResult?.data?.customerCreate?.customer?.id) {
      return NextResponse.json({ success: false, error: "Could not save your subscription. Please try again." }, { status: 502 });
    }

    // Sync marketing_consent to Supabase storefront_customers
    try {
      await supabaseAdmin
        .from("storefront_customers")
        .update({
          marketing_consent: true,
          updated_at: new Date().toISOString(),
        })
        .eq("email", email);
    } catch (dbErr) {
      console.warn("[Newsletter] Supabase marketing_consent sync notice:", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: "Welcome to the Collector Circle. You will receive private studio alerts.",
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
