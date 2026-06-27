"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingPageProps {
  userId: string | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

export function LandingPage({ userId }: LandingPageProps) {
  const primaryHref = userId ? "/dashboard" : "/sign-up";

  return (
    <div className="relative min-h-screen overflow-hidden bg-white selection:bg-sky-100">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-sky-100/50 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] h-[30%] w-[30%] rounded-full bg-indigo-50/50 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[20%] h-[25%] w-[25%] rounded-full bg-emerald-50/30 blur-[80px]" />
      </div>

      {/* Navbar */}
      <header className="relative z-50 border-b border-slate-100/50 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-white transition-transform group-hover:scale-110">
              <Zap className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-950">
              Freelance OS
            </span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-6">
            {!userId && (
              <Link
                href="/sign-in"
                className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 px-3 py-2"
              >
                Sign in
              </Link>
            )}
            <Button
              asChild
              className="rounded-full bg-slate-950 hover:bg-slate-800 h-9 sm:h-10 px-4 sm:px-6"
            >
              <Link href={primaryHref}>
                {userId ? "Dashboard" : "Get Started"}
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10">
        <section className="flex flex-col items-center pt-24 pb-16 text-center lg:pt-32 lg:pb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl text-5xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-6xl"
          >
            From inquiry to payment.
            <br />
            <span className="text-sky-600">One clean workflow.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 max-w-xl text-lg text-slate-600 sm:text-xl"
          >
            Manage clients, bookings, and daily work in a single place—without juggling tools or losing track.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
          >
            <Button
              asChild
              size="lg"
              className="h-14 rounded-2xl bg-slate-950 px-8 text-base font-semibold"
            >
              <Link href={primaryHref}>
                {userId ? "Open Dashboard" : "Start Free"}
              </Link>
            </Button>

            {!userId && (
              <p className="text-sm text-slate-500">
                No credit card required
              </p>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="grid grid-cols-3 gap-4 text-left text-sm">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">1. Inquiry</p>
                <p className="text-slate-500 mt-1">New client request</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">2. Booking</p>
                <p className="text-slate-500 mt-1">Schedule & confirm</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">3. Payment</p>
                <p className="text-slate-500 mt-1">Get paid & track work</p>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-bold text-slate-950 sm:text-4xl">
              A simple workflow, start to finish
            </h2>
            <p className="mt-4 text-slate-600">
              Everything you need to move work forward—without switching tools.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 text-sky-600 font-bold">01</div>
              <h3 className="text-xl font-semibold text-slate-950">
                Capture inquiries
              </h3>
              <p className="mt-2 text-slate-600">
                Keep all incoming client requests organized in one place.
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 text-sky-600 font-bold">02</div>
              <h3 className="text-xl font-semibold text-slate-950">
                Convert to bookings
              </h3>
              <p className="mt-2 text-slate-600">
                Turn leads into scheduled, confirmed work without friction.
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 text-sky-600 font-bold">03</div>
              <h3 className="text-xl font-semibold text-slate-950">
                Manage daily work
              </h3>
              <p className="mt-2 text-slate-600">
                See exactly what needs attention today—tasks, clients, and follow-ups.
              </p>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-slate-950 text-center sm:text-4xl">
              Built for how solo operators actually work
            </h2>

            <div className="mt-16 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 p-6">
                <h3 className="text-xl font-semibold text-slate-950">
                  Workflow-first CRM
                </h3>
                <p className="mt-3 text-slate-600">
                  Track clients from first message to final payment in a single flow.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-6">
                <h3 className="text-xl font-semibold text-slate-950">
                  No complexity
                </h3>
                <p className="mt-3 text-slate-600">
                  No teams, no permissions, no setup overhead. Just your work.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-6">
                <h3 className="text-xl font-semibold text-slate-950">
                  Daily clarity
                </h3>
                <p className="mt-3 text-slate-600">
                  A focused view of what needs to be done today—nothing extra.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold text-slate-950">
              Replace scattered tools with one workflow
            </h2>

            <p className="mt-6 text-lg text-slate-600">
              Stop switching between apps. Manage your entire freelance process in one place.
            </p>

            <div className="mt-10">
              <Button
                asChild
                size="lg"
                className="h-14 rounded-2xl bg-slate-950 px-8 text-white"
              >
                <Link href={primaryHref}>
                  {userId ? "Go to Dashboard" : "Start for Free"}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 bg-slate-50/50 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-slate-950" />
              <span className="font-bold text-slate-950">Freelance OS</span>
            </div>
            <nav className="flex gap-8 text-sm font-medium text-slate-500">
              <Link href="/privacy" className="transition-colors hover:text-slate-950">
                Privacy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-slate-950">
                Terms
              </Link>
            </nav>
            <p className="text-sm text-slate-400">
              &copy; {new Date().getFullYear()} Freelance OS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
