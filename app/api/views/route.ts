import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";

// In-memory fallback map in case Supabase table is warming up or during temporary connection issues
const memoryViewsCache = new Map<string, number>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get("handle");

    if (!handle) {
      return NextResponse.json({ success: false, error: "Product handle is required" }, { status: 400 });
    }

    // 1. Try Supabase query
    try {
      const { data, error } = await supabaseAdmin
        .from("product_views")
        .select("view_count")
        .eq("product_handle", handle)
        .maybeSingle();

      if (!error && data) {
        memoryViewsCache.set(handle, data.view_count);
        return NextResponse.json({
          success: true,
          handle,
          viewCount: data.view_count,
        });
      }
    } catch {
      // Fall through to memory cache
    }

    // 2. Memory cache fallback
    const viewCount = memoryViewsCache.get(handle) || 0;
    return NextResponse.json({
      success: true,
      handle,
      viewCount,
    });
  } catch (error: any) {
    console.error("[API/views GET] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const handle = body.handle;

    if (!handle || typeof handle !== "string") {
      return NextResponse.json({ success: false, error: "Product handle is required" }, { status: 400 });
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

    // 2. Increment in Supabase
    let incrementSuccess = false;
    try {
      // Check if row exists
      const { data: existing, error: selectErr } = await supabaseAdmin
        .from("product_views")
        .select("view_count")
        .eq("product_handle", handle)
        .maybeSingle();

      if (!selectErr) {
        if (existing) {
          const nextCount = (existing.view_count || 0) + 1;
          const { error: updateErr } = await supabaseAdmin
            .from("product_views")
            .update({
              view_count: nextCount,
              last_viewed_at: new Date().toISOString(),
            })
            .eq("product_handle", handle);

          if (!updateErr) {
            currentViewCount = nextCount;
            incrementSuccess = true;
          }
        } else {
          const { error: insertErr } = await supabaseAdmin
            .from("product_views")
            .insert({
              product_handle: handle,
              view_count: 1,
              last_viewed_at: new Date().toISOString(),
            });

          if (!insertErr) {
            currentViewCount = 1;
            incrementSuccess = true;
          }
        }
      }
    } catch {
      // Supabase table not created yet or connection error
    }

    if (!incrementSuccess) {
      currentViewCount = (memoryViewsCache.get(handle) || 0) + 1;
    }

    memoryViewsCache.set(handle, currentViewCount);

    // 3. Set 30-minute debouncing cookie
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
  } catch (error: any) {
    console.error("[API/views POST] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
