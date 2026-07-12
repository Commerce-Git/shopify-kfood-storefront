import { NextRequest, NextResponse as NextRes } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const { handle, collections, secret } = await request.json();

    // 1. 보안 검증: 허가된 대시보드 서버의 요청만 수용
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextRes.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!handle) {
      return NextRes.json({ error: "Handle is required" }, { status: 400 });
    }

    console.log(`⚡ Storefront clearing data cache tags for handle: "${handle}", collections:`, collections);

    // 2. 상품 상세 데이터 캐시 즉시 비우기 (Data Cache)
    revalidateTag(`product-${handle}`, 'max');

    // 3. 카테고리 상품 목록 데이터 캐시 즉시 비우기 (Data Cache)
    if (collections && Array.isArray(collections)) {
      collections.forEach((colHandle) => {
        if (colHandle) {
          revalidateTag(`collection-${colHandle}`, 'max');
        }
      });
    }

    // 4. 전체 상품 및 홈 화면 컬렉션 데이터 캐시 일괄 즉시 비우기 (Data Cache)
    revalidateTag("products", 'max');
    revalidateTag("collections", 'max');
    revalidateTag("collection-frontpage", 'max');
    revalidateTag("collection-featured", 'max');

    // 5. 최종 화면 HTML 레이아웃 갱신 (Full Route Cache)
    revalidatePath(`/product/${handle}`);
    revalidatePath("/");
    if (collections && Array.isArray(collections)) {
      collections.forEach((colHandle) => {
        if (colHandle) {
          revalidatePath(`/collections/${colHandle}`);
        }
      });
    }

    return NextRes.json({ revalidated: true, now: Date.now() });
  } catch (err: any) {
    return NextRes.json({ error: err.message }, { status: 500 });
  }
}
