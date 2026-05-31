"use server";

import { stripe } from "@/lib/billing/stripe";
import { packPriceId, isPackKey } from "@/lib/billing/packs";
import { isLocale } from "@/lib/i18n/config";
import { getServerClient } from "@/lib/supabase/server";

const SITE_URL = (process.env.SITE_URL ?? "https://www.cheatjob.com").replace(/\/$/, "");

export async function createCheckout(pack: string, locale: string): Promise<{ url: string }> {
  if (!isPackKey(pack)) throw new Error(`Unknown pack: ${pack}`);
  if (!isLocale(locale)) throw new Error(`Unknown locale: ${locale}`);

  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{ price: packPriceId(pack), quantity: 1 }],
    client_reference_id: user.id,
    metadata: { user_id: user.id, pack },
    customer_email: user.email ?? undefined,
    success_url: `${SITE_URL}/${locale}/dashboard?upgrade=success&pack=${pack}`,
    cancel_url: `${SITE_URL}/${locale}/dashboard/upgrade`,
  });

  if (!session.url) throw new Error("Stripe Checkout session has no URL");
  return { url: session.url };
}
