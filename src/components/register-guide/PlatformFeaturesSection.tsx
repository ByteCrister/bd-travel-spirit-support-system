'use client'

import { motion } from 'framer-motion'
import {
  Building2,
  MapPin,
  FileText,
  Star,
  Bell,
  Lock,
  LayoutDashboard,
  Users2,
  Headphones,
  BookOpen,
  Search,
  Globe,
} from 'lucide-react'
import { jakarta } from '@/styles/fonts'

// ── Data ─────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: Building2,
    gradient: 'from-emerald-500 to-teal-500',
    shadow: 'shadow-emerald-500/30',
    title: 'Company Profile Page',
    description:
      'Your own branded company page with logo, bio, gallery, and contact details — a professional home on the web for your tour business.',
    tag: 'Branding',
  },
  {
    icon: MapPin,
    gradient: 'from-teal-500 to-cyan-500',
    shadow: 'shadow-teal-500/30',
    title: 'Tour Listing & Management',
    description:
      'Create unlimited tour packages with rich itineraries, pricing tiers, availability calendars, and high-quality photo galleries.',
    tag: 'Core',
  },
  {
    icon: Search,
    gradient: 'from-cyan-500 to-blue-500',
    shadow: 'shadow-cyan-500/30',
    title: 'SEO-Powered Discovery',
    description:
      'Every tour you publish gets its own SEO-optimised page that ranks on Google — bringing in travellers who are actively searching.',
    tag: 'Growth',
  },
  {
    icon: LayoutDashboard,
    gradient: 'from-blue-500 to-violet-500',
    shadow: 'shadow-blue-500/30',
    title: 'Guide Dashboard',
    description:
      'A powerful command centre to manage enquiries, track earnings, monitor tour performance, and update your listings in real time.',
    tag: 'Operations',
  },
  {
    icon: Star,
    gradient: 'from-violet-500 to-purple-500',
    shadow: 'shadow-violet-500/30',
    title: 'Verified Reviews System',
    description:
      'Travellers leave structured ratings after trips. Positive reviews automatically boost your ranking on the platform.',
    tag: 'Trust',
  },
  {
    icon: Bell,
    gradient: 'from-purple-500 to-pink-500',
    shadow: 'shadow-purple-500/30',
    title: 'Real-Time Notifications',
    description:
      'Instant alerts for new enquiries, booking confirmations, review submissions, and platform announcements — never miss a lead.',
    tag: 'Engagement',
  },
  {
    icon: FileText,
    gradient: 'from-pink-500 to-rose-500',
    shadow: 'shadow-pink-500/30',
    title: 'Article Publishing',
    description:
      'Publish travel articles and destination guides to build authority, attract organic traffic, and warm up prospective clients.',
    tag: 'Content',
  },
  {
    icon: Users2,
    gradient: 'from-rose-500 to-orange-500',
    shadow: 'shadow-rose-500/30',
    title: 'Team & Staff Management',
    description:
      'Add co-guides, assign roles, and manage your team under one company account — perfect for growing tour operators.',
    tag: 'Teams',
  },
  {
    icon: Lock,
    gradient: 'from-orange-500 to-amber-500',
    shadow: 'shadow-orange-500/30',
    title: 'Secure Data & Privacy',
    description:
      "Your business data is encrypted and only visible to you. We never sell your client data or share bookings with competitors.",
    tag: 'Security',
  },
  {
    icon: BookOpen,
    gradient: 'from-amber-500 to-yellow-500',
    shadow: 'shadow-amber-500/30',
    title: 'Knowledge Base & Guides',
    description:
      'Access our library of resources on pricing strategy, tour photography, customer handling, and business growth tips.',
    tag: 'Learning',
  },
  {
    icon: Globe,
    gradient: 'from-yellow-500 to-lime-500',
    shadow: 'shadow-yellow-500/30',
    title: 'Multi-Division Reach',
    description:
      'Your tours are visible to travellers searching across all eight divisions of Bangladesh — plus international visitors.',
    tag: 'Reach',
  },
  {
    icon: Headphones,
    gradient: 'from-lime-500 to-emerald-500',
    shadow: 'shadow-lime-500/30',
    title: 'Dedicated Support',
    description:
      '24/7 priority support for registered guides. Our team is available via chat, email, and in-app tickets to resolve issues fast.',
    tag: 'Support',
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

export function PlatformFeaturesSection() {
  return (
    <section
      className={`relative py-20 sm:py-24 lg:py-32 overflow-hidden ${jakarta.className}`}
      aria-labelledby="features-heading"
    >
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-emerald-500/4 blur-[120px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div {...fadeUp()} className="text-center mb-16 sm:mb-20">
          <span className="inline-block mb-3 rounded-full bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-cyan-400">
            Platform Features
          </span>
          <h2
            id="features-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-5"
          >
            <span className="text-slate-100">Everything You Need,</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300 bg-clip-text text-transparent">
              Nothing You Don&apos;t.
            </span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            BD Travel Spirit is purpose-built for Bangladeshi tour operators. Every feature solves a real problem you face today.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.article
                key={feature.title}
                {...fadeUp(0.05 + i * 0.04)}
                className="group relative flex flex-col gap-4 rounded-2xl border border-white/5 bg-slate-900/60 backdrop-blur-sm p-6 hover:border-white/10 hover:bg-slate-900/80 transition-all duration-300 cursor-default"
              >
                {/* Tag badge */}
                <span className="absolute top-4 right-4 rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  {feature.tag}
                </span>

                {/* Icon */}
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg ${feature.shadow} group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>

                {/* Text */}
                <h3 className="text-base font-semibold text-slate-100 leading-snug">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed flex-1">
                  {feature.description}
                </p>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
