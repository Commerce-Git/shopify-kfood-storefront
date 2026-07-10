import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const { handle, collections, secret } = await request.json();

    // 1. 보안 검증: 허가된 대시보드 서버의 요청만 수용
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!handle) {
      return NextResponse.json({ error: "Handle is required" }, { status: 400 });
    }

    // 2. 상품 상세페이지 캐시 즉시 갱신
    revalidatePath(`/product/${handle}`);
    
    // 3. 홈 화면 캐시 즉시 갱신
    revalidatePath("/");

    // 4. 상품이 속한 카테고리(Collection) 목록 캐시 일괄 즉시 갱신
    if (collections && Array.isArray(collections)) {
      collections.forEach((colHandle) => {
        if (colHandle) {
          revalidatePath(`/collections/${colHandle}`);
        }
      });
    }

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
