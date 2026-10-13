import { errorMessage } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { SHOPIFY_CATALOG_CACHE_TAG } from '@/lib/shopify/cache';
import { GET_PRODUCT_BY_HANDLE } from '@/lib/shopify/queries';

export const dynamic = "force-dynamic";

async function handleRevalidation(request: NextRequest) {
  try {
    let handle: string | null = null;
    let collections: string[] = [];
    let secret: string | null = null;
    let artists = false;
    let expectedPrice: { variantId: string; amountUsd: number } | null = null;

    if (request.method === "GET") {
      const searchParams = request.nextUrl.searchParams;
      handle = searchParams.get("handle");
      secret = searchParams.get("secret");
      const colParam = searchParams.get("collections");
      if (colParam) collections = colParam.split(",");
    } else {
      let body;
      try {
        body = await request.json();
        handle = body.handle || null;
        collections = body.collections || [];
        secret = body.secret || null;
        artists = body.artists === true;
        if (body.expectedPrice !== undefined) {
          const price = body.expectedPrice;
          if (!price || !/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(price.variantId) ||
            typeof price.amountUsd !== 'number' || !Number.isFinite(price.amountUsd) || price.amountUsd <= 0) {
            return NextResponse.json({ success: false, error: 'Invalid expected price' }, { status: 400 });
          }
          expectedPrice = price;
        }
      } catch {
        return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
      }
    }

    // 2. 서버 보안 비밀키 설정 유효성 검사
    const systemSecret = process.env.REVALIDATE_SECRET;
    if (!systemSecret || systemSecret.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Revalidation secret is not configured on the server" }, 
        { status: 500 }
      );
    }

    // 3. 보안 비밀키 검증
    if (secret !== systemSecret) {
      return NextResponse.json({ success: false, error: "Invalid secret key" }, { status: 401 });
    }

    if (expectedPrice) {
      if (typeof handle !== 'string' || !handle) {
        return NextResponse.json({ success: false, error: 'Product handle required for price confirmation' }, { status: 400 });
      }
      const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
      const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
      if (!domain || !token) throw new Error('Shopify Storefront configuration missing');
      const response = await fetch(`https://${domain}/api/2025-10/graphql.json`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
        // Use the same product query as the page: node(id) can update before the product index.
        body: JSON.stringify({ query: GET_PRODUCT_BY_HANDLE, variables: { handle } }),
        cache: 'no-store', signal: AbortSignal.timeout(4000),
      });
      if (!response.ok) throw new Error('Shopify price verification failed');
      const result = await response.json();
      if (result.errors?.length) throw new Error('Shopify price verification failed');
      const price = result.data?.product?.variants?.edges?.find(
        (edge: { node: { id: string } }) => edge.node.id === expectedPrice.variantId)?.node?.price;
      if (price?.currencyCode !== 'USD' || Number(price?.amount) !== expectedPrice.amountUsd) {
        return NextResponse.json({ success: false, code: 'SHOPIFY_PRICE_PENDING' },
          { status: 409, headers: { 'Cache-Control': 'no-store' } });
      }
    }

    // Expire the shared Shopify response too, so rebuilt pages use current prices.
    revalidateTag(SHOPIFY_CATALOG_CACHE_TAG, { expire: 0 });

    // Invalidate both the directory and old/new slugs after profile/rename updates.
    if (artists) {
      revalidatePath('/artists');
      revalidatePath('/artists/[slug]', 'page');
    }

    // 4. 해당 상품 상세 페이지 캐시 갱신
    if (handle) {
      revalidatePath(`/product/${handle}`);
      console.log(`[Revalidate] Product page purged: /product/${handle}`);
    }

    // 5. 해당 상품이 속한 카테고리(컬렉션) 페이지 캐시 갱신
    if (collections && Array.isArray(collections)) {
      collections.forEach((col) => {
        revalidatePath(`/collections/${col}`);
        console.log(`[Revalidate] Collection page purged: /collections/${col}`);
      });
    }

    // 6. 전체 상품 리스트 페이지 및 홈 화면 캐시 갱신
    revalidatePath("/collections");
    revalidatePath("/");
    console.log(`[Revalidate] Collections & Home page purged`);

    return NextResponse.json({ success: true, message: "Revalidation triggered successfully",
      ...(expectedPrice ? { priceConfirmed: true } : {}),
    });
  } catch (error: unknown) {
    console.error("[Revalidate API Route Error]:", error);
    return NextResponse.json({ success: false, error: errorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return handleRevalidation(request);
}

export async function GET(request: NextRequest) {
  return handleRevalidation(request);
}
