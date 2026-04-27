import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { FeedbackEmail } from "@/emails/FeedbackEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

// Define a secret key to prevent unauthorized triggers.
// In production, you would set this in .env and configure Shopify Flow to pass it.
const WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET || "my-super-secret-key-for-flow";

export async function POST(request: NextRequest) {
  // 1. Basic security check
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
    console.warn("Unauthorized webhook attempt blocked.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // The JSON payload sent by Shopify Flow
    // Example: { "email": "customer@example.com", "firstName": "John" }
    const { email, firstName } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 2. Send the email via Resend
    const data = await resend.emails.send({
      from: "Seoul Snack Box <onboarding@resend.dev>", // Change to your verified domain later
      to: [email],
      subject: "How was your Seoul Snack Box? 🎁",
      react: FeedbackEmail({
        customerName: firstName || "there",
        customerEmail: email,
      }) as React.ReactElement,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error sending feedback email via Resend:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
