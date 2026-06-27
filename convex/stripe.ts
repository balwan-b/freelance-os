import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

function getBaseUrl(origin?: string) {
  return process.env.NEXT_PUBLIC_APP_URL ?? origin ?? "http://localhost:3000";
}

async function postStripeForm(
  path: string,
  body: URLSearchParams,
) {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe is not configured yet");
  }

  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = (await response.json()) as {
    url?: string;
    error?: { message?: string };
  };

  if (!response.ok || !data.url) {
    throw new Error(data.error?.message ?? "Stripe request failed");
  }

  return data.url;
}

export const createCheckoutSession = action({
  args: { origin: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    if (!process.env.STRIPE_PRICE_ID_PRO) {
      throw new Error("Stripe is not configured yet");
    }

    const baseUrl = getBaseUrl(args.origin);
    const checkoutUrl = await postStripeForm(
      "checkout/sessions",
      new URLSearchParams({
        mode: "subscription",
        "line_items[0][price]": process.env.STRIPE_PRICE_ID_PRO,
        "line_items[0][quantity]": "1",
        customer_email: identity.email ?? "",
        client_reference_id: identity.subject,
        success_url: `${baseUrl}/settings?billing=success`,
        cancel_url: `${baseUrl}/settings?billing=cancelled`,
        allow_promotion_codes: "true",
        "subscription_data[metadata][clerkUserId]": identity.subject,
      }),
    );

    return { url: checkoutUrl };
  },
});

export const createPortalSession = action({
  args: { origin: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.runQuery(internal.users.getByTokenIdentifierInternal, {
      tokenIdentifier: identity.tokenIdentifier,
    });
    if (!user) {
      throw new Error("User profile not initialized");
    }

    const subscription = await ctx.runQuery(
      internal.billing.getSubscriptionByUserIdInternal,
      { userId: user._id },
    );
    if (!subscription?.stripeCustomerId) {
      throw new Error("No Stripe customer found for this account");
    }

    const portalUrl = await postStripeForm(
      "billing_portal/sessions",
      new URLSearchParams({
        customer: subscription.stripeCustomerId,
        return_url: `${getBaseUrl(args.origin)}/settings`,
      }),
    );

    return { url: portalUrl };
  },
});
