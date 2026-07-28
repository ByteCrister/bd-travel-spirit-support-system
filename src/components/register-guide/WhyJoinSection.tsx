'use client'

import { motion } from 'framer-motion'
import {
  Facebook,
  Instagram,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  BarChart3,
  MessageSquare,
  Repeat2,
  Zap,
  Crown,
} from 'lucide-react'
import { jakarta } from '@/styles/fonts'

// ── Data ─────────────────────────────────────────────────────────────────────

const pains = [
  {
    icon: Facebook,
    iconColor: 'text-blue-400',
    bg: 'bg-blue-500/10',
    title: 'Algorithm Dependency',
    body:
      "Facebook & Instagram throttle your reach every update. Your posts disappear in hours and you can't control who sees them.",
  },
  {
    icon: AlertTriangle,
    iconColor: 'text-amber-400',
    bg: 'bg-amber-500/10',
    title: 'Zero Booking Infrastructure',
    body:
      'Social DMs are chaotic. No calendar, no payment system, no confirmation trail — just messages that fall through the cracks.',
  },
  {
    icon: Instagram,
    iconColor: 'text-pink-400',
    bg: 'bg-pink-500/10',
    title: 'No Professional Credibility',
    body:
      "A Facebook page doesn't signal trust. Travellers can't verify your licence, read structured reviews, or compare your packages.",
  },
  {
    icon: Repeat2,
    iconColor: 'text-violet-400',
    bg: 'bg-violet-500/10',
    title: 'Unpredictable Revenue',
    body:
      'Bookings come in bursts through referrals or viral posts. There is no steady pipeline, no analytics, no repeat-client system.',
  },
]

const gains = [
  {
    icon: ShieldCheck,
    iconColor: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    title: 'Verified Badge & Trust',
    body:
      'Your company goes through our vetting process and earns a Verified Guide badge — the signal travellers look for before booking.',
  },
  {
    icon: BarChart3,
    iconColor: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    title: 'Built-in Analytics',
    body:
      'Track views, enquiries, conversions, and revenue month-over-month from your personalised dashboard — no spreadsheets needed.',
  },
  {
    icon: MessageSquare,
    iconColor: 'text-teal-400',
    bg: 'bg-teal-500/10',
    title: 'Structured Enquiries',
    body:
      'Every traveller interest arrives as a structured enquiry with dates, group size, and budget — giving you everything to close fast.',
  },
  {
    icon: TrendingUp,
    iconColor: 'text-green-400',
    bg: 'bg-green-500/10',
    title: 'Organic SEO Exposure',
    body:
      'Your tours rank on Google through our platform SEO. Earn free, intent-driven traffic without paying for Facebook ads.',
  },
  {
    icon: Zap,
    iconColor: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    title: 'Instant Setup',
    body:
      'Go from registration to your first live tour listing in under 30 minutes. No coding, no design skills required.',
  },
  {
    icon: Crown,
    iconColor: 'text-orange-400',
    bg: 'bg-orange-500/10',
    title: 'Own Your Brand',
    body:
      'Your company page, your photos, your reviews — all owned by you. We are the stage, you are the star.',
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

export function WhyJoinSection() {
  return (
    <section
      className={`relative py-20 sm:py-24 lg:py-32 overflow-hidden ${jakarta.className}`}
      aria-labelledby="why-join-heading"
    >
      {/* subtle background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-500/6 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-500/6 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ── */}
        <motion.div {...fadeUp()} className="text-center mb-16 sm:mb-20">
          <span className="inline-block mb-3 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400">
            Why BD Travel Spirit?
          </span>
          <h2
            id="why-join-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-5"
          >
            <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
              Stop Chasing Algorithms.
            </span>
            <br />
            <span className="text-slate-100">Start Building a Real Business.</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Thousands of talented guides in Bangladesh are stuck in the Social Media trap — beautiful content, zero guaranteed bookings. Here is the difference.
          </p>
        </motion.div>

        {/* ── VS grid ── */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* Left — Pain (Social Media) */}
          <div>
            <motion.div {...fadeUp(0.1)} className="mb-6 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/15">
                <span className="text-lg font-bold text-red-400">✗</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-200">
                Managing tours via social media
              </h3>
            </motion.div>

            <div className="space-y-4">
              {pains.map((item, i) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={item.title}
                    {...fadeUp(0.15 + i * 0.07)}
                    className="group flex gap-4 rounded-2xl border border-red-500/10 bg-slate-900/60 backdrop-blur-sm p-5 hover:border-red-500/25 transition-colors duration-300"
                  >
                    <div className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-xl ${item.bg}`}>
                      <Icon className={`h-5 w-5 ${item.iconColor}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-200 mb-1">{item.title}</p>
                      <p className="text-sm text-slate-400 leading-relaxed">{item.body}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Right — Gain (BD Travel Spirit) */}
          <div>
            <motion.div {...fadeUp(0.1)} className="mb-6 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15">
                <span className="text-lg font-bold text-emerald-400">✓</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-200">
                Running your business on BD Travel Spirit
              </h3>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
              {gains.map((item, i) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={item.title}
                    {...fadeUp(0.15 + i * 0.07)}
                    className="group flex flex-col gap-3 rounded-2xl border border-emerald-500/10 bg-slate-900/60 backdrop-blur-sm p-5 hover:border-emerald-500/30 hover:bg-slate-900/80 transition-all duration-300"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.bg}`}>
                      <Icon className={`h-5 w-5 ${item.iconColor}`} />
                    </div>
                    <p className="font-semibold text-slate-200">{item.title}</p>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.body}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
