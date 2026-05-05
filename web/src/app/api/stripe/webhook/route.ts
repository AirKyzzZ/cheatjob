import { NextResponse } from "next/server";
import { stripe } from "@/lib/billing/stripe";
import { handleWebhookEvent } from "@/lib/billing/webhook-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "webhook secret not configured" },
      { status: 500 },
    );
  }

  const rawBody = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const result = await handleWebhookEvent(event);
  return NextResponse.json(result, {
    status: result.status === "error" ? 500 : 200,
  });
}
