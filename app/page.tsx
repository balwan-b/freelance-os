import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { ArrowRight, CalendarCheck2, Layers3, Search, Sparkles, Users } from 'lucide-react'

const featureCards = [
  {
    title: 'Client inquiries, bookings, and work in one flow',
    description:
      'Move from new inquiry to confirmed work without stitching together separate tools for CRM, scheduling, and follow-up.',
    icon: Layers3,
  },
  {
    title: 'Built for solo freelancers and coaches',
    description:
      'Single-player focus means less setup, less dashboard noise, and a workspace that feels like it was made for one operator.',
    icon: Users,
  },
  {
    title: 'Run your day from one place',
    description:
      'Start with Today’s Work, track bookings, resolve tasks, and stay on top of client follow-ups without jumping between tabs.',
    icon: CalendarCheck2,
  },
]

const differentiators = [
  'Workflow-first instead of tool-first',
  'Zero-setup direction instead of blank-page setup',
  'Solo-operator focus instead of team complexity',
  'Daily work guidance instead of passive record keeping',
]

const marketplaceHighlights = [
  'Discover vetted freelancers, consultants, and coaches by workflow fit',
  'See who is best for design, development, strategy, fitness, and mentoring',
  'Eventually connect inquiries, bookings, and repeat work directly into the workspace',
]

export default async function RootPage() {
  const { userId } = await auth()
  const primaryHref = userId ? '/dashboard' : '/sign-up'
  const secondaryHref = userId ? '/clients' : '/marketplace'

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_32%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_48%,_#f8fafc_100%)] text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col px-6 py-6 lg:px-10">
        <header className="flex items-center justify-between py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            freelance-os
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <Link href="/marketplace">Marketplace</Link>
            <Link href="/sign-in">Sign in</Link>
          </nav>
        </header>

        <section className="grid gap-10 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-sky-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Freelancer OS
            </div>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
                Manage your clients, bookings, and work in one place — without juggling 5 tools.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Built for freelancers &amp; coaches who want to manage clients, bookings, and work — in one simple system.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={primaryHref}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                {userId ? 'Open dashboard' : 'Start free'}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={secondaryHref}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
              >
                {userId ? 'Open client workspace' : 'Explore marketplace'}
              </Link>
            </div>
            <div className="grid gap-4 pt-4 text-sm text-slate-600 sm:grid-cols-3">
              <div>
                <p className="text-2xl font-semibold text-slate-950">Workflow-first</p>
                <p className="mt-1">Guided client lifecycle instead of disconnected tools.</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-950">Zero-setup</p>
                <p className="mt-1">Designed to get solo operators productive fast.</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-950">Daily-use</p>
                <p className="mt-1">Built to become where you start and end your workday.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white/85 p-6 shadow-[0_40px_100px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
            <div className="grid gap-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Today&apos;s work</p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium">Follow up with Maya about branding package</p>
                    <p className="mt-1 text-xs text-slate-500">Overdue task tied to an upcoming booking</p>
                  </div>
                  <div className="rounded-xl bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium">2:00 PM coaching session with Alex</p>
                    <p className="mt-1 text-xs text-slate-500">Availability-checked and conflict-free</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-sky-100 bg-sky-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Marketplace</p>
                  <p className="mt-3 text-lg font-semibold">Discover solo operators by workflow fit</p>
                  <p className="mt-2 text-sm text-slate-600">Not a noisy freelancer directory. A curated next step for repeatable service work.</p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Positioning</p>
                  <p className="mt-3 text-lg font-semibold">Replace habit, not just tools</p>
                  <p className="mt-2 text-sm text-slate-600">Compete with complexity by making the day easier to run.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 py-8 lg:grid-cols-3">
          {featureCards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.title} className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-xl font-semibold">{card.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{card.description}</p>
              </div>
            )
          })}
        </section>

        <section className="grid gap-6 py-16 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-slate-200 bg-slate-950 p-8 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Why it wins</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">
              A guided operating system for solo freelancers that runs the client lifecycle from inquiry to repeat work.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Existing tools are powerful but fragmented, heavy, or too blank. The opportunity here is workflow + simplicity + daily use.
            </p>
          </div>
          <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white/90 p-8">
            {differentiators.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-500" />
                <p className="text-sm font-medium text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[36px] border border-slate-200 bg-white/90 p-8 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Marketplace</p>
              <h2 className="mt-3 text-3xl font-semibold">Start discovering freelancers with the same product lens</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                The marketplace is being shaped as an opinionated discovery layer for solo service providers, not a generic gig board.
              </p>
            </div>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400 hover:text-slate-950"
            >
              <Search className="h-4 w-4" />
              View marketplace
            </Link>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {marketplaceHighlights.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
