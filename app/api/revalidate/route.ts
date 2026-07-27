import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function handleRevalidation(request: NextRequest) {
  try {
    let handle: string | null = null;
    let collections: string[] = [];
    let secret: string | null = null;

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
      } catch (e) {
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

    // 4. 해당 상품 상세 페이지 캐시 갱신
    if (handle) {
      revalidatePath(`/product/${handle}`, "page");
      console.log(`[Revalidate] Product page purged: /product/${handle}`);
    }

    // 5. 해당 상품이 속한 카테고리(컬렉션) 페이지 캐시 갱신
    if (collections && Array.isArray(collections)) {
      collections.forEach((col) => {
        revalidatePath(`/collections/${col}`, "page");
        console.log(`[Revalidate] Collection page purged: /collections/${col}`);
      });
    }

    // 6. 전체 상품 리스트 페이지 및 홈 화면 캐시 갱신
    revalidatePath("/collections", "page");
    revalidatePath("/", "page");
    console.log(`[Revalidate] Collections & Home page purged`);

    return NextResponse.json({ success: true, message: "Revalidation triggered successfully" });
  } catch (error: any) {
    console.error("[Revalidate API Route Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return handleRevalidation(request);
}

export async function GET(request: NextRequest) {
  return handleRevalidation(request);
}
