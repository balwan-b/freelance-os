import Link from 'next/link'
import { ArrowRight, BadgeCheck, BriefcaseBusiness, Code2, Dumbbell, Paintbrush2, Search, Sparkles } from 'lucide-react'

const categories = [
  { name: 'Designers', icon: Paintbrush2, summary: 'Brand, product, and content design for solo brands and small teams.' },
  { name: 'Developers', icon: Code2, summary: 'Frontend, backend, automation, and product setup specialists.' },
  { name: 'Coaches', icon: Dumbbell, summary: 'Career, business, and fitness coaches who sell sessions and programs.' },
  { name: 'Consultants', icon: BriefcaseBusiness, summary: 'Operators who package advice, audits, and ongoing strategy.' },
]

const freelancers = [
  {
    name: 'Maya Chen',
    title: 'Brand Designer for Coaches',
    fit: 'Best for coaches who need a clearer offer, booking flow, and visual identity.',
    strengths: ['Workflow-first onboarding', 'Fast solo execution', 'Repeat client packages'],
  },
  {
    name: 'Jordan Hale',
    title: 'Freelance Product Engineer',
    fit: 'Best for founders replacing five small tools with one focused internal workflow.',
    strengths: ['Client portals', 'Scheduling systems', 'Automation without bloat'],
  },
  {
    name: 'Rina Alvarez',
    title: 'Business Coach for Solo Operators',
    fit: 'Best for independent consultants who want a system for pricing, bookings, and follow-up.',
    strengths: ['Zero-setup operating models', 'Client lifecycle guidance', 'Revenue-focused workflows'],
  },
  {
    name: 'Dev Patel',
    title: 'Operations Consultant',
    fit: 'Best for service businesses that need an opinionated day-to-day process instead of another dashboard.',
    strengths: ['Process simplification', 'Retention workflows', 'Single-player systems'],
  },
]

const principles = [
  'Workflow-first vs tool-first',
  'Zero-setup experience',
  'Single-player focus',
  'Replace daily behavior, not just tools',
  'Built for revenue, not just management',
]

export default function MarketplacePage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#fff_42%,_#eff6ff_100%)] text-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <header className="flex items-center justify-between py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            freelance-os
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="text-sm text-slate-600 hover:text-slate-950">
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Start free
            </Link>
          </div>
        </header>

        <section className="grid gap-8 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-sky-700">
              <Sparkles className="h-3.5 w-3.5" />
              Marketplace Preview
            </div>
            <h1 className="max-w-4xl text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
              Discover freelancers using the same solo-operator logic that powers the product.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              This is not meant to become another noisy freelancer directory. It is being shaped as a curated discovery layer for freelancers, coaches, consultants, and solo service providers.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white"
              >
                Join as a freelancer
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700"
              >
                Back to homepage
              </Link>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.35)]">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Search className="h-4 w-4" />
                Discover by workflow fit
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Search by service type, availability style, client lifecycle maturity, and whether the freelancer is optimized for repeat work.
              </p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <div key={category.name} className="rounded-2xl border border-slate-100 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-3 font-medium">{category.name}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{category.summary}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="grid gap-6 py-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-slate-200 bg-slate-950 p-8 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">Marketplace principles</p>
            <h2 className="mt-4 text-3xl font-semibold">
              Differentiate with workflow + simplicity + daily use.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              The same competition logic applies here too: if this looks like a generic list of talent, it loses. The edge is curation around how solo operators actually run their business.
            </p>
          </div>
          <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white/90 p-8">
            {principles.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <BadgeCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
                <p className="text-sm font-medium text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-10">
          <div className="flex flex-col gap-3 pb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Featured freelancers</p>
            <h2 className="text-3xl font-semibold">Early discovery cards</h2>
            <p className="max-w-3xl text-sm leading-7 text-slate-600">
              This first pass focuses on positioning and discoverability. The next layer can connect these profiles to bookings, inquiries, and internal workflow handoff.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {freelancers.map((freelancer) => (
              <article key={freelancer.name} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xl font-semibold">{freelancer.name}</p>
                    <p className="mt-1 text-sm text-sky-700">{freelancer.title}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">Solo operator</span>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">{freelancer.fit}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {freelancer.strengths.map((strength) => (
                    <span key={strength} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                      {strength}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
