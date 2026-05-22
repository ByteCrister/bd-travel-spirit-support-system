'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Users, Globe, Star, Heart } from 'lucide-react'

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
import { jakarta } from '@/styles/fonts'

const RegisterAsGuide: React.FC = () => {
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

  const features = [
    {
      icon: Users,
      title: "Join 10,000+ Guides",
      description: "Be part of our global community"
    },
    {
      icon: Globe,
      title: "Worldwide Reach",
      description: "Connect with travelers globally"
    },
    {
      icon: Star,
      title: "5-Star Rating",
      description: "Trusted by millions of travelers"
    },
    {
      icon: Heart,
      title: "Make a Difference",
      description: "Create unforgettable experiences"
    }
  ]

  return (
    <main
      className={`min-h-dvh bg-slate-50 text-slate-900 ${jakarta.className}`}
    >
      {/* Header */}
      <GuideRegisterHeader handleSaveAndContinueLater={handleSaveAndContinueLater} />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6, ease: 'easeOut' }}
        className="relative overflow-hidden border-b border-slate-800/60 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
      >
        {/* Background glows to mirror landing page feel */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-0 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-12 sm:py-16 lg:py-20 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 160 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 shadow-xl shadow-emerald-500/30 mb-6"
          >
            <Shield className="w-10 h-10 text-white" />
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
              Become a Verified Guide
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10">
            Join our global network of professional guides and help travelers
            discover authentic experiences with BD Travel Spirit.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.08 }}
                  className="text-center rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md px-3 py-4 sm:px-4 sm:py-5"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500/30 via-teal-500/30 to-cyan-500/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-100" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-50 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-300/80">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-10 sm:py-12 lg:py-16">
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