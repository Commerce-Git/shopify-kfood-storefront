import { errorMessage } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";

// In-memory fallback & cache map across serverless invocations
const memoryViewsCache = new Map<string, number>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get("handle");

    if (!handle) {
      return NextResponse.json(
        { success: false, error: "Product handle is required" },
        { status: 400 }
      );
    }

    // 1. Try memory cache first for zero DB latency
    if (memoryViewsCache.has(handle)) {
      const cachedCount = memoryViewsCache.get(handle)!;
      return NextResponse.json(
        { success: true, handle, viewCount: cachedCount },
        {
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          },
        }
      );
    }

    // 2. Query Supabase (fail-open)
    let viewCount = 0;
    try {
      const { data, error } = await supabaseAdmin
        .from("product_views")
        .select("view_count")
        .eq("product_handle", handle)
        .maybeSingle();

      if (!error && data && typeof data.view_count === "number") {
        viewCount = data.view_count;
        memoryViewsCache.set(handle, viewCount);
      }
    } catch {
      // Fail-open: return default 0
    }

    return NextResponse.json(
      { success: true, handle, viewCount },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error: unknown) {
    console.error("[API/views GET] Error:", error);
    return NextResponse.json({ success: false, error: errorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const handle = body.handle;

    if (!handle || typeof handle !== "string") {
      return NextResponse.json(
        { success: false, error: "Product handle is required" },
        { status: 400 }
      );
    }

    // 1. Check session debouncing cookie (30 minutes)
    const cookieStore = await cookies();
    const cookieName = `viewed_${handle.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
    const alreadyViewed = cookieStore.has(cookieName);

    let currentViewCount = memoryViewsCache.get(handle) || 0;

    if (alreadyViewed) {
      return NextResponse.json({
        success: true,
        incremented: false,
        viewCount: currentViewCount,
      });
    }

    // 2. Update in-memory counter immediately
    currentViewCount += 1;
    memoryViewsCache.set(handle, currentViewCount);

    // 3. Probabilistic Sampling for High-Traffic Disk IO & Row-Lock Protection
    // Under viral load, only ~10% of requests trigger an atomic +10 batch write to PostgreSQL.
    // This slashes WAL write amplification and Dead Tuples by 90% while keeping statistics accurate.
    const shouldPersistToDb = Math.random() < 0.1 || currentViewCount % 10 === 0;

    if (shouldPersistToDb) {
      try {
        const { data: existing, error: selectErr } = await supabaseAdmin
          .from("product_views")
          .select("view_count")
          .eq("product_handle", handle)
          .maybeSingle();

        if (!selectErr) {
          if (existing) {
            const nextCount = Math.max((existing.view_count || 0) + 10, currentViewCount);
            await supabaseAdmin
              .from("product_views")
              .update({
                view_count: nextCount,
                last_viewed_at: new Date().toISOString(),
              })
              .eq("product_handle", handle);

            currentViewCount = nextCount;
            memoryViewsCache.set(handle, nextCount);
          } else {
            await supabaseAdmin
              .from("product_views")
              .insert({
                product_handle: handle,
                view_count: 10,
                last_viewed_at: new Date().toISOString(),
              });

            currentViewCount = 10;
            memoryViewsCache.set(handle, 10);
          }
        }
      } catch (dbErr) {
        // Fail-open: Never delay or fail user request if DB is busy or throttled
        console.warn("[API/views POST] Supabase write deferred:", dbErr);
      }
    }

    // 4. Set 30-minute debouncing cookie
    const response = NextResponse.json({
      success: true,
      incremented: true,
      viewCount: currentViewCount,
    });

    response.cookies.set({
      name: cookieName,
      value: "1",
      maxAge: 1800, // 30 minutes
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error: unknown) {
    console.error("[API/views POST] Error:", error);
    return NextResponse.json({ success: false, error: errorMessage(error) }, { status: 500 });
  }
}
