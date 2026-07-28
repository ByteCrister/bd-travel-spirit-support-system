'use client'

import { motion } from 'framer-motion'
import {
  Wallet,
  Rocket,
  CheckCircle2,
  TrendingUp,
  Lock,
  ArrowRight,
  BadgePercent,
  Building2,
} from 'lucide-react'
import { jakarta } from '@/styles/fonts'

// ── How money flows ───────────────────────────────────────────────────────────

const flowSteps = [
  {
    step: '01',
    icon: Wallet,
    gradient: 'from-emerald-500 to-teal-500',
    title: 'Traveller Books & Pays',
    body: 'A traveller selects your tour and completes payment through the platform. The full booking amount is securely held in an escrow block account — not released to anyone yet.',
    tag: 'Booking',
  },
  {
    step: '02',
    icon: Lock,
    gradient: 'from-teal-500 to-cyan-500',
    title: 'Funds Held in Block Account',
    body: 'The full payment sits in a protected block account during the tour. This protects both the traveller and your company — no party can access it until the tour is complete.',
    tag: 'Escrow',
  },
  {
    step: '03',
    icon: CheckCircle2,
    gradient: 'from-cyan-500 to-blue-500',
    title: 'Tour Marked as Completed',
    body: 'Once the tour is finished and verified as completed, the block account releases the funds automatically. No manual chasing, no delays on your end.',
    tag: 'Completion',
  },
  {
    step: '04',
    icon: Building2,
    gradient: 'from-blue-500 to-violet-500',
    title: '85% → Your Company Account',
    body: 'The majority — 85% of the total booking amount — is transferred directly into your registered company transaction account, promptly after completion.',
    tag: 'Your Earnings',
  },
  {
    step: '05',
    icon: BadgePercent,
    gradient: 'from-violet-500 to-purple-500',
    title: '15% → Platform Account',
    body: 'A flat 15% platform fee is transferred to the BD Travel Spirit transaction account. This funds platform operations, marketing, SEO, and the support infrastructure that brings you travellers.',
    tag: 'Platform Fee',
  },
  {
    step: '06',
    icon: TrendingUp,
    gradient: 'from-purple-500 to-pink-500',
    title: 'Keep Growing',
    body: 'Every successful tour builds your rating, improves your search ranking, and increases the organic traffic to your listings — compounding your growth over time.',
    tag: 'Growth',
  },
]

const whyEscrow = [
  {
    icon: Lock,
    title: 'Fraud-Free Guarantee',
    body: 'Funds are never accessible before tour completion — eliminating cancellation scams and payment disputes.',
  },
  {
    icon: CheckCircle2,
    title: 'Instant Release on Completion',
    body: 'No waiting periods or manual processing. The moment your tour is confirmed complete, the transfer triggers automatically.',
  },
  {
    icon: Rocket,
    title: 'No Hidden Charges',
    body: '15% is the only deduction. No registration fee, no listing fee, no monthly subscription — you only pay when you earn.',
  },
]

// ── Animation helpers ─────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: 'easeOut' as const, delay },
})

// ── Component ─────────────────────────────────────────────────────────────────

export function RevenueSection() {
  return (
    <section
      className={`relative py-20 sm:py-24 lg:py-32 overflow-hidden ${jakarta.className}`}
      aria-labelledby="revenue-heading"
    >
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute bottom-0 -left-20 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ── */}
        <motion.div {...fadeUp()} className="text-center mb-16 sm:mb-20">
          <span className="inline-block mb-3 rounded-full bg-amber-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-amber-400">
            Revenue Model
          </span>
          <h2
            id="revenue-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-5"
          >
            <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-300 bg-clip-text text-transparent">
              Transparent Earnings,
            </span>
            <br />
            <span className="text-slate-100">You Keep 85% of Every Booking.</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            One flat structure. No tiers, no hidden fees, no monthly subscriptions. Every booking follows the same secure, transparent payment flow.
          </p>
        </motion.div>

        {/* ── Split visual ── */}
        <motion.div
          {...fadeUp(0.1)}
          className="mx-auto mb-16 max-w-sm rounded-3xl border border-white/8 bg-slate-900/70 backdrop-blur-md overflow-hidden shadow-2xl shadow-black/30"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-cyan-500/20 px-6 py-4 border-b border-white/5 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
              Per Booking Breakdown
            </p>
            <p className="text-sm text-slate-300">Total booking amount = 100%</p>
          </div>

          {/* 85% bar */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-semibold text-slate-200">Your Company</span>
              </div>
              <span className="text-2xl font-black text-emerald-300">85%</span>
            </div>
            <div className="h-4 w-full overflow-hidden rounded-full bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '85%' }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              Transferred directly to your company&apos;s registered transaction account
            </p>
          </div>

          {/* 15% bar */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BadgePercent className="h-4 w-4 text-violet-400" />
                <span className="text-sm font-semibold text-slate-200">Platform Fee</span>
              </div>
              <span className="text-2xl font-black text-violet-300">15%</span>
            </div>
            <div className="h-4 w-full overflow-hidden rounded-full bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '15%' }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 shadow-lg shadow-violet-500/20"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              Transferred to BD Travel Spirit — funds operations, SEO &amp; marketing that bring you travellers
            </p>
          </div>
        </motion.div>

        {/* ── Payment flow steps ── */}
        <motion.div {...fadeUp(0.1)} className="text-center mb-12">
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-3">
            How the Money Flows
          </h3>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Every booking follows a secure escrow process — your money is protected at every stage.
          </p>
        </motion.div>

        {/* Flow grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
          {flowSteps.map((step, i) => {
            const Icon = step.icon
            const isHighlighted = step.step === '04'
            return (
              <motion.div
                key={step.step}
                {...fadeUp(0.1 + i * 0.07)}
                className={`relative flex flex-col gap-4 rounded-2xl border p-6 backdrop-blur-sm transition-all duration-300
                  ${isHighlighted
                    ? 'border-emerald-500/30 bg-emerald-500/5 ring-1 ring-emerald-500/20 shadow-lg shadow-emerald-500/10'
                    : 'border-white/5 bg-slate-900/60 hover:border-white/10'
                  }`}
              >
                {/* Step number */}
                <span className="absolute top-4 right-4 text-3xl font-black text-white/4 select-none">
                  {step.step}
                </span>

                {/* Tag */}
                <span className="self-start rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  {step.tag}
                </span>

                {/* Icon */}
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${step.gradient} shadow-lg`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>

                <h4 className="font-semibold text-slate-100 leading-snug">{step.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed flex-1">{step.body}</p>

                {/* Arrow connector for non-last items */}
                {i < flowSteps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-6 w-6 items-center justify-center rounded-full bg-slate-800 border border-white/5">
                    <ArrowRight className="h-3 w-3 text-slate-500" />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* ── Why escrow ── */}
        <motion.div {...fadeUp(0.1)} className="text-center mb-10">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-100 mb-2">
            Why Escrow? Why Not Direct Transfer?
          </h3>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            Our escrow model exists to protect you as much as the traveller.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-5 mb-14">
          {whyEscrow.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                {...fadeUp(0.15 + i * 0.08)}
                className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-slate-900/60 backdrop-blur-sm p-6 hover:border-white/10 transition-colors duration-300"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                  <Icon className="h-5 w-5 text-emerald-400" />
                </div>
                <h4 className="font-semibold text-slate-100">{item.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{item.body}</p>
              </motion.div>
            )
          })}
        </div>

        {/* ── Disclaimer ── */}
        <motion.p
          {...fadeUp(0.3)}
          className="text-center text-xs text-slate-600 max-w-xl mx-auto leading-relaxed"
        >
          The 15% platform fee applies to the gross booking amount received. All transfers are subject to applicable Bangladesh banking regulations and may take 1–3 business days to reflect depending on your bank. Exact payout timelines are shown in your guide dashboard.
        </motion.p>
      </div>
    </section>
  )
}
