/**
 * Supabase Admin Client (Service Role) — Singleton
 *
 * Bypasses Row Level Security (RLS) for server-side operations.
 * Used by: API routes, cron jobs, and server-side utilities.
 *
 * NEVER import this from client components or expose in the browser.
 */

import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);
