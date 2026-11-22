import { NextResponse } from 'next/server';
import { adminGraphQL } from '@/lib/shopify/admin';

const messages = {
  newsletter: {
    existing: 'You are already subscribed to the Collector Circle.',
    created: 'Welcome to the Collector Circle. You will receive private studio alerts.',
  },
  waitlist: {
    existing: 'You are already registered for early access.',
    created: 'Your notification is set. You will be notified first the moment new pieces arrive.',
  },
};

const findCustomer = `query FindCustomer($query: String!) {
  customers(first: 1, query: $query) { edges { node { id email } } }
}`;

const updateCustomer = `mutation SubscribeCustomer($input: CustomerInput!, $id: ID!, $tags: [String!]!) {
  customerUpdate(input: $input) {
    customer { id emailMarketingConsent { marketingState } }
    userErrors { field message }
  }
  tagsAdd(id: $id, tags: $tags) { node { id } userErrors { field message } }
}`;

const createCustomer = `mutation CreateSubscribedCustomer($input: CustomerInput!) {
  customerCreate(input: $input) { customer { id } userErrors { field message } }
}`;

function failure(status: number, error: string) {
  return NextResponse.json({ success: false, error }, { status });
}

export async function subscribeCustomer(
  request: Request,
  tag: keyof typeof messages,
  syncConsent?: (email: string) => Promise<void>,
) {
  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return failure(400, 'Please enter a valid email address.');
    }

    let edges;
    try {
      const result = await adminGraphQL(findCustomer, { query: `email:${JSON.stringify(email)}` });
      edges = result?.data?.customers?.edges;
    } catch {
      return failure(502, 'Could not verify your subscription. Please try again.');
    }
    // Only a successful, empty lookup permits customer creation.
    if (!Array.isArray(edges)) return failure(502, 'Could not verify your subscription. Please try again.');
    const existing = edges.length > 0;
    const emailMarketingConsent = {
      marketingState: 'SUBSCRIBED',
      consentUpdatedAt: new Date().toISOString(),
      marketingOptInLevel: 'SINGLE_OPT_IN',
    };

    if (existing) {
      const customer = edges[0]?.node;
      if (!customer?.id || customer.email?.trim().toLowerCase() !== email) {
        return NextResponse.json({ error: 'Customer identity could not be verified.' }, { status: 502 });
      }
      const { data } = await adminGraphQL(updateCustomer, {
        input: { id: customer.id, emailMarketingConsent }, id: customer.id, tags: [tag],
      });
      const consent = data?.customerUpdate;
      const tagged = data?.tagsAdd;
      if (consent?.userErrors?.length || tagged?.userErrors?.length ||
          consent?.customer?.emailMarketingConsent?.marketingState !== 'SUBSCRIBED' || tagged?.node?.id !== customer.id) {
        return failure(502, 'Could not save your subscription. Please try again.');
      }
    } else {
      const { data } = await adminGraphQL(createCustomer, { input: { email, tags: [tag], emailMarketingConsent } });
      const created = data?.customerCreate;
      if (created?.userErrors?.length) return failure(400, created.userErrors[0].message);
      if (!created?.customer?.id) return failure(502, 'Could not save your subscription. Please try again.');
    }

    if (syncConsent) {
      try {
        await syncConsent(email);
      } catch {
        console.warn('[Newsletter] Could not sync Shopify consent to Supabase.');
      }
    }
    const message = existing ? messages[tag].existing : messages[tag].created;
    return NextResponse.json({ success: true, message, existing });
  } catch {
    return failure(500, 'Something went wrong. Please try again.');
  }
}
