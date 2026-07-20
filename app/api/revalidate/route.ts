import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // 1. JSON Body 파싱 예외 처리
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }

    const { handle, collections, secret } = body;

    // 2. 서버 보안 비밀키 설정 유효성 검사 (보안 우회 차단)
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

    // 6. 홈 화면 캐시 갱신
    revalidatePath("/");
    console.log(`[Revalidate] Home page purged`);

    return NextResponse.json({ success: true, message: "Revalidation triggered successfully" });
  } catch (error: any) {
    console.error("[Revalidate API Route Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
