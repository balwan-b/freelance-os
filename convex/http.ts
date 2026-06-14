import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();
const encoder = new TextEncoder();

function normalizePlan(priceId?: string) {
  if (!priceId) {
    return "free" as const;
  }

  return priceId === process.env.STRIPE_PRICE_ID_PRO ? "pro" : "free";
}

function timingSafeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left[index]! ^ right[index]!;
  }

  return mismatch === 0;
}

function hexToBytes(hex: string) {
  if (hex.length % 2 !== 0) {
    return null;
  }

  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < hex.length; index += 2) {
    const byte = Number.parseInt(hex.slice(index, index + 2), 16);
    if (Number.isNaN(byte)) {
      return null;
    }
    bytes[index / 2] = byte;
  }

  return bytes;
}

async function verifyStripeSignature(
  payload: string,
  signatureHeader: string,
  secret: string,
) {
  const parts = signatureHeader.split(",");
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2);
  const signatures = parts
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3))
    .filter(Boolean);

  if (!timestamp || signatures.length === 0) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(timestamp)) > 300) {
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const expected = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${payload}`)),
  );

  return signatures.some((signature) => {
    const actual = hexToBytes(signature);
    return actual ? timingSafeEqual(actual, expected) : false;
  });
}

http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ error: "Webhook is not configured" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    const isValid = await verifyStripeSignature(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
    if (!isValid) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const event = JSON.parse(payload) as {
      type?: string;
      data?: {
        object?: {
          id?: string;
          customer?: string;
          status?: "active" | "trialing" | "past_due" | "cancelled" | "incomplete";
          metadata?: { clerkUserId?: string };
          items?: { data?: Array<{ price?: { id?: string } }> };
          current_period_end?: number;
          cancel_at_period_end?: boolean;
        };
      };
    };
    const object = event.data?.object;

    if (event.type?.startsWith("customer.subscription.") && object?.status) {
      await ctx.runMutation(internal.billing.syncFromWebhookInternal, {
        clerkUserId: object.metadata?.clerkUserId,
        stripeCustomerId: object.customer,
        stripeSubscriptionId: object.id,
        stripePriceId: object.items?.data?.[0]?.price?.id,
        plan: normalizePlan(object.items?.data?.[0]?.price?.id),
        status: object.status,
        currentPeriodEnd: object.current_period_end
          ? new Date(object.current_period_end * 1000).toISOString()
          : undefined,
        cancelAtPeriodEnd: Boolean(object.cancel_at_period_end),
        paymentMethodBrand: undefined,
        paymentMethodLast4: undefined,
      });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }),
});

export default http;
