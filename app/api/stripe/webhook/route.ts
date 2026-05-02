import crypto from 'node:crypto'
import { NextResponse } from 'next/server'
import { ConvexHttpClient } from 'convex/browser'
import { internal } from '@/convex/_generated/api'

export const runtime = 'nodejs'

const STRIPE_TIMESTAMP_TOLERANCE_SECONDS = 300

function verifyStripeSignature(payload: string, signatureHeader: string, secret: string) {
  const entries = Object.fromEntries(
    signatureHeader.split(',').map((part) => {
      const [key, value] = part.split('=')
      return [key, value]
    }),
  )

  const timestamp = entries.t
  const signature = entries.v1
  if (!timestamp || !signature) {
    return false
  }

  // Replay-attack protection: reject webhooks older than 5 minutes
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - Number(timestamp)) > STRIPE_TIMESTAMP_TOLERANCE_SECONDS) {
    return false
  }

  const signedPayload = `${timestamp}.${payload}`
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'utf8'),
    Buffer.from(expectedSignature, 'utf8'),
  )
}

function normalizePlan(priceId?: string) {
  if (!priceId) return 'free'
  return priceId === process.env.STRIPE_PRICE_ID_PRO ? 'pro' : 'free'
}

export async function POST(request: Request) {
  const payload = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET || !process.env.NEXT_PUBLIC_CONVEX_URL) {
    return NextResponse.json({ error: 'Webhook is not configured' }, { status: 500 })
  }

  if (!verifyStripeSignature(payload, signature, process.env.STRIPE_WEBHOOK_SECRET)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(payload)
  const object = event.data?.object

  if (event.type.startsWith('customer.subscription.') && object) {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL)
    await convex.mutation(internal.billing.syncFromWebhook, {
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
    })
  }

  return NextResponse.json({ received: true })
}
