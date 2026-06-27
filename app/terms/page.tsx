import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <div className="mb-8">
        <Link href="/" className="text-sm text-slate-600 hover:text-slate-950">
          Back to Freelance OS
        </Link>
      </div>
      <div className="space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Terms of Use
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            Terms for preview and evaluation
          </h1>
          <p className="text-lg text-slate-600">
            This project is presented as a product demo and engineering portfolio
            sample. It is not sold as a live hosted SaaS from this repository.
          </p>
        </header>

        <section className="space-y-3 text-slate-700">
          <h2 className="text-xl font-semibold text-slate-950">Allowed use</h2>
          <p>
            You may review, run, and evaluate the project for hiring, client,
            or technical due-diligence purposes. Do not use this demo to store
            sensitive production customer data without your own compliance,
            infrastructure, and legal review.
          </p>
        </section>

        <section className="space-y-3 text-slate-700">
          <h2 className="text-xl font-semibold text-slate-950">No warranty</h2>
          <p>
            The repository is shared for demonstration and discussion. It is
            provided as-is, without uptime guarantees, support obligations, or
            implied fitness for a regulated production environment.
          </p>
        </section>

        <section className="space-y-3 text-slate-700">
          <h2 className="text-xl font-semibold text-slate-950">Third-party services</h2>
          <p>
            Running the app may require accounts with Clerk, Convex, and Stripe.
            Their terms and pricing apply independently of this codebase.
          </p>
        </section>
      </div>
    </main>
  );
}
