'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRegisterGuideStore } from '@/lib/registerGuideStore'
import { Stepper } from '@/components/register-guide/Stepper'
import { StepPersonalInfo } from '@/components/register-guide/StepPersonalInfo'
import { StepCompanyDetails } from '@/components/register-guide/StepCompanyDetails'
import { StepDocuments } from '@/components/register-guide/StepDocuments'
import { StepReviewSubmit } from '@/components/register-guide/StepReviewSubmit'
import { Shield, Users, Globe, Star, Heart } from 'lucide-react'
import { toast } from 'sonner'
import { GuideRegisterHeader } from './GuideRegisterHeader'
import { GuideRegisterFooter } from './GuideRegisterFooter'

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
    console.log(currentStep);
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
    toast.success('Progress saved! You can continue later.')
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
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      {/* Header */}
      <GuideRegisterHeader handleSaveAndContinueLater={handleSaveAndContinueLater} />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16"
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm"
          >
            <Shield className="w-10 h-10" />
          </motion.div>
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
            Become a Verified Guide
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Join thousands of successful guides worldwide and help travelers discover amazing experiences
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                  <p className="text-xs text-blue-100">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Progress Stepper */}
        <Stepper currentStep={currentStep} totalSteps={totalSteps} />

        {/* Step Content */}
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <GuideRegisterFooter />
    </div>
  )
}

export default RegisterAsGuide
