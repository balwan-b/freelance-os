import Link from "next/link";

export default function PrivacyPage() {
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
            Privacy
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            Demo privacy statement
          </h1>
          <p className="text-lg text-slate-600">
            This repository is a showcase project. Any data entered into a local
            or personal deployment is controlled by the person running that deployment.
          </p>
        </header>

        <section className="space-y-3 text-slate-700">
          <h2 className="text-xl font-semibold text-slate-950">What the app stores</h2>
          <p>
            The app models freelancer workflow data such as leads, clients,
            bookings, notes, tasks, and subscription state. Authentication is
            handled through Clerk, data storage through Convex, and billing
            through Stripe.
          </p>
        </section>

        <section className="space-y-3 text-slate-700">
          <h2 className="text-xl font-semibold text-slate-950">How to use this safely</h2>
          <p>
            For portfolio review or internal demos, use test credentials and
            non-sensitive sample data. Do not enter real customer information
            into a public or shared demo deployment.
          </p>
        </section>

        <section className="space-y-3 text-slate-700">
          <h2 className="text-xl font-semibold text-slate-950">Data ownership</h2>
          <p>
            If you deploy this project yourself, you are responsible for your
            own retention, access control, and privacy compliance decisions.
          </p>
        </section>
      </div>
    </main>
  );
}
