import { NextResponse } from "next/server";

// Maintenance operations must not be exposed on the public storefront.
export async function GET() {
  return NextResponse.json({ error: "This maintenance endpoint has been retired." }, { status: 410 });
}
