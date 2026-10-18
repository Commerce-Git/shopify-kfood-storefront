import { createHash } from 'node:crypto';
import { adminGraphQL } from '@/lib/shopify/admin';
import { COUPON_CONFIG } from '@/lib/coupon-config';

export function reviewCouponCode(token: string): string {
  return `${COUPON_CONFIG.codePrefix}-${createHash('sha256').update(`review:${token}`).digest('hex').slice(0, 20).toUpperCase()}`;
}

// ---- Shopify 쿠폰 생성 ----

async function createShopifyDiscount(
  couponCode: string,
  expiresAt: Date
) {
  const startsAt = new Date().toISOString();
  const endsAt = expiresAt.toISOString();

  // Build discount value input based on config
  const customerGetsValue =
    COUPON_CONFIG.discountType === "percentage"
      ? { percentage: COUPON_CONFIG.discountValue / 100 }
      : { discountAmount: { amount: String(COUPON_CONFIG.discountValue), appliesOnEachItem: false } };

  // Build variables object — all dynamic values passed safely via GraphQL variables
  const variables: Record<string, unknown> = {
    title: `Review Reward - ${couponCode}`,
    code: couponCode,
    startsAt,
    endsAt,
    usageLimit: COUPON_CONFIG.usageLimit,
    customerGetsValue,
  };

  // Add minimum requirement if configured
  const minimumRequirementFragment = COUPON_CONFIG.minimumOrderAmount != null
    ? `minimumRequirement: { subtotal: { greaterThanOrEqualToSubtotal: $minimumSubtotal } }`
    : "";

  if (COUPON_CONFIG.minimumOrderAmount != null) {
    variables.minimumSubtotal = String(COUPON_CONFIG.minimumOrderAmount);
  }

  const minimumSubtotalParam = COUPON_CONFIG.minimumOrderAmount != null
    ? "$minimumSubtotal: Decimal!"
    : "";

  const mutation = `
    mutation CreateDiscount(
      $title: String!
      $code: String!
      $startsAt: DateTime!
      $endsAt: DateTime!
      $usageLimit: Int!
      $customerGetsValue: DiscountCustomerGetsValueInput!
      ${minimumSubtotalParam}
    ) {
      discountCodeBasicCreate(basicCodeDiscount: {
        title: $title
        code: $code
        startsAt: $startsAt
        endsAt: $endsAt
        usageLimit: $usageLimit
        customerGets: {
          value: $customerGetsValue
          items: { all: true }
        }
        customerSelection: { all: true }
        ${minimumRequirementFragment}
      }) {
        codeDiscountNode {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const result = await adminGraphQL(mutation, variables);
  const errors = result.data?.discountCodeBasicCreate?.userErrors;
  if (errors?.length > 0) {
    throw new Error(`Shopify discount error: ${JSON.stringify(errors)}`);
  }
  if (!result.data?.discountCodeBasicCreate?.codeDiscountNode?.id) throw new Error("Discount creation was not confirmed.");
  return result;
}


async function existingExpiry(code: string): Promise<Date | null> {
  const result = await adminGraphQL(`query ReviewDiscount($code: String!) {
    codeDiscountNodeByCode(code: $code) { codeDiscount { ... on DiscountCodeBasic { title endsAt } } }
  }`, { code });
  const discount = result.data?.codeDiscountNodeByCode?.codeDiscount;
  if (!discount) return null;
  if (discount.title !== `Review Reward - ${code}` || !discount.endsAt || !Number.isFinite(Date.parse(discount.endsAt))) {
    throw new Error('Existing review discount could not be verified.');
  }
  return new Date(discount.endsAt);
}

export async function ensureReviewDiscount(code: string, expiry: Date): Promise<Date> {
  const existing = await existingExpiry(code);
  if (existing) return existing;
  try { await createShopifyDiscount(code, expiry); return expiry; }
  catch (error) {
    // Another request or a prior timed-out mutation may already have created this exact code.
    const created = await existingExpiry(code);
    if (created) return created;
    throw error;
  }
}
