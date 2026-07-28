'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ArrowDown } from 'lucide-react'

import { useRegisterGuideStore } from '@/store/guide/guide-registration.store'
import { Stepper } from '@/components/register-guide/Stepper'
import { StepPersonalInfo } from '@/components/register-guide/StepPersonalInfo'
import { StepCompanyDetails } from '@/components/register-guide/StepCompanyDetails'
import { StepDocuments } from '@/components/register-guide/StepDocuments'
import { StepReviewSubmit } from '@/components/register-guide/StepReviewSubmit'
import { GuideRegisterHeader } from './GuideRegisterHeader'
import { GuideRegisterFooter } from './GuideRegisterFooter'
import { showToast } from '../global/showToast'
import SearchApplication from './SearchApplication'
import { WhyJoinSection } from './WhyJoinSection'
import { PlatformFeaturesSection } from './PlatformFeaturesSection'
import { RevenueSection } from './RevenueSection'
import { jakarta } from '@/styles/fonts'
import type { RegisterGuideStats } from '@/lib/handlers/fetch-static/fetchRegisterGuideData'

interface RegisterAsGuideProps {
  stats: RegisterGuideStats;
}

const RegisterAsGuide: React.FC<RegisterAsGuideProps> = ({ stats }) => {
  const {
    currentStep,
    setCurrentStep,
    formData,
    clearAllErrors
  } = useRegisterGuideStore()

  const totalSteps = 4

  // Handle step navigation
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Handle save and continue later
  const handleSaveAndContinueLater = () => {
    localStorage.setItem('registerGuideDraft', JSON.stringify(formData))
    showToast.success('Progress saved! You can continue later.')
  }

  // Handle successful submission
  const handleSubmissionSuccess = () => {
    window.location.href = '/'
  }

  // Clear any existing errors when component mounts
  useEffect(() => {
    clearAllErrors()
  }, [clearAllErrors])

  // Render current step component
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <StepPersonalInfo onNext={handleNext} />
      case 2:
        return <StepCompanyDetails onNext={handleNext} onPrevious={handlePrevious} />
      case 3:
        return <StepDocuments onNext={handleNext} onPrevious={handlePrevious} />
      case 4:
        return <StepReviewSubmit onPrevious={handlePrevious} onSuccess={handleSubmissionSuccess} />
      default:
        return <StepPersonalInfo onNext={handleNext} />
    }
  }

  return (
    <main
      className={`min-h-dvh bg-background text-foreground ${jakarta.className}`}
    >
      {/* Header */}
      <GuideRegisterHeader handleSaveAndContinueLater={handleSaveAndContinueLater} />

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6, ease: 'easeOut' }}
        className="relative overflow-hidden border-b border-slate-800/60 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
      >
        {/* Background glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-0 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-teal-500/5 blur-[100px]" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16 sm:py-20 lg:py-28 text-center">
          {/* Badge */}
          <motion.span
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-block mb-6 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-300"
          >
            Guide Registration Open
          </motion.span>

          {/* Icon */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 160 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 shadow-xl shadow-emerald-500/30 mb-7"
          >
            <Shield className="w-10 h-10 text-white" />
          </motion.div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
            <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
              Become a Verified Guide
            </span>
            <br />
            <span className="text-slate-200 text-3xl sm:text-4xl lg:text-5xl font-semibold">
              on Bangladesh&apos;s #1 Travel Platform
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto mb-8 leading-relaxed">
            Register your company, list your tours, and reach thousands of travellers who are actively searching for authentic Bangladesh experiences — without depending on social media algorithms.
          </p>

          {/* CTA group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <a
              href="#registration-form"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-400 hover:to-teal-400 transition-all duration-200"
            >
              Start Your Application
              <ArrowDown className="w-4 h-4" />
            </a>
            <span className="text-xs text-slate-500">
              Free to join · Takes ~10 minutes
            </span>
          </div>

          {/* Stat bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto"
          >
            {[
              { value: stats.registeredGuides, label: 'Registered Guides' },
              { value: stats.happyTravellers, label: 'Happy Travellers' },
              { value: stats.averageRating, label: 'Average Rating' },
              { value: stats.nationwideReach, label: 'Nationwide Reach' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md px-4 py-5"
              >
                <p className="text-xl sm:text-2xl font-bold text-emerald-300 mb-1">{stat.value}</p>
                <p className="text-[11px] sm:text-xs text-slate-400">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ── Why Join Section ──────────────────────────────────────────────── */}
      <div className="bg-gradient-to-b from-slate-950 via-slate-900/95 to-slate-950">
        <WhyJoinSection />
      </div>

      {/* ── Platform Features Section ─────────────────────────────────────── */}
      <div className="bg-gradient-to-b from-slate-950 via-slate-900/95 to-slate-950">
        <PlatformFeaturesSection />
      </div>

      {/* ── Revenue Section ───────────────────────────────────────────────── */}
      <div className="bg-gradient-to-b from-slate-950 via-slate-900/95 to-slate-950">
        <RevenueSection />
      </div>

      {/* ── Divider before form ───────────────────────────────────────────── */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
      </div>

      {/* Main Content */}
      <section id="registration-form" className="container mx-auto px-4 py-10 sm:py-12 lg:py-16">
        {/* Progress Stepper */}
        <Stepper currentStep={currentStep} totalSteps={totalSteps} />

        <SearchApplication />

        {/* Step Content */}
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.4 }}
            >
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Footer */}
      <GuideRegisterFooter />
    </main>
  )
}

export default RegisterAsGuide