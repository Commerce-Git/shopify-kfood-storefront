import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Only run middleware on /account and its subroutes.
     * All public marketing/catalog pages (/, /product/*, /collections/*, /artists/*, etc.)
     * completely bypass Edge middleware execution, achieving Zero-Invocation & 0ms latency.
     */
    "/account/:path*",
  ],
};
