import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const payload = await request.text()

  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return NextResponse.json({ error: 'Webhook is not configured' }, { status: 500 })
  }

  const url = new URL('/stripe/webhook', process.env.NEXT_PUBLIC_CONVEX_URL)
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': request.headers.get('content-type') ?? 'application/json',
      'stripe-signature': request.headers.get('stripe-signature') ?? '',
    },
    body: payload,
  })

  const text = await response.text()
  return new NextResponse(text, {
    status: response.status,
    headers: { 'content-type': response.headers.get('content-type') ?? 'application/json' },
  })
}
