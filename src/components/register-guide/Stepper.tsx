'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check, User, Building2, FileText, Eye, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepperProps {
  currentStep: number
  totalSteps: number
}

const steps = [
  {
    id: 1,
    title: 'Personal Info',
    description: 'Your basic information',
    icon: User,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 2,
    title: 'Company Details',
    description: 'Business information',
    icon: Building2,
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    id: 3,
    title: 'Documents',
    description: 'Verification documents',
    icon: FileText,
    color: 'from-amber-500 to-amber-600'
  },
  {
    id: 4,
    title: 'Review',
    description: 'Confirm & submit',
    icon: Eye,
    color: 'from-purple-500 to-purple-600'
  }
]

export const Stepper: React.FC<StepperProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="w-full max-w-5xl mx-auto mb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold mb-2" style={{ 
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: "'Poppins', system-ui, sans-serif"
        }}>
          Registration Progress
        </h2>
        <p className="text-muted-foreground">
          Complete all steps to become a verified guide
        </p>
      </motion.div>

      <div className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5 rounded-2xl blur-3xl" />
        
        {/* Progress line */}
        <div className="absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-gray-200 via-gray-200 to-gray-200 rounded-full -z-10">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 rounded-full"
            style={{ boxShadow: '0 0 10px -2px rgba(59, 130, 246, 0.3)' }}
            initial={{ width: '0%' }}
            animate={{ 
              width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` 
            }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
        </div>

        <div className="flex items-center justify-between relative z-10">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.id
            const isCurrent = currentStep === step.id
            const isUpcoming = currentStep < step.id
            const Icon = step.icon

            return (
              <motion.div
                key={step.id}
                className="flex flex-col items-center relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Step circle with enhanced styling */}
                <motion.div
                  className={cn(
                    "relative w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shadow-lg",
                    isCompleted && "bg-gradient-to-br from-blue-500 to-blue-600 border-blue-500 text-white",
                    isCurrent && "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-500 text-blue-600 animate-bounce-gentle",
                    isUpcoming && "border-gray-300 bg-white/50 text-gray-400 backdrop-blur-sm"
                  )}
                  style={isCompleted ? { boxShadow: '0 0 20px -5px rgba(59, 130, 246, 0.4)' } : isCurrent ? { boxShadow: '0 0 20px -5px rgba(59, 130, 246, 0.3)' } : {}}
                  whileHover={{ 
                    scale: 1.1,
                    rotate: isCurrent ? [0, -5, 5, 0] : 0
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Glow effect for current step */}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 to-transparent"
                      animate={{ 
                        opacity: [0.5, 1, 0.5],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                  
                  {/* Success sparkle effect */}
                  {isCompleted && (
                    <motion.div
                      className="absolute -top-1 -right-1"
                      initial={{ scale: 0, rotate: 0 }}
                      animate={{ scale: 1, rotate: 360 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                    </motion.div>
                  )}

                  <div className="relative z-10">
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      >
                        <Check className="w-7 h-7" />
                      </motion.div>
                    ) : (
                      <Icon className={cn(
                        "w-7 h-7 transition-all duration-300",
                        isCurrent && "animate-pulse"
                      )} />
                    )}
                  </div>
                </motion.div>

                {/* Step info with enhanced typography */}
                <motion.div
                  className="mt-4 text-center max-w-36"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  <h3
                    className={cn(
                      "text-sm font-semibold transition-all duration-300",
                      isCurrent && "text-blue-600 text-base",
                      isCompleted && "text-blue-600",
                      isUpcoming && "text-gray-500"
                    )}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={cn(
                      "text-xs mt-1 transition-colors duration-300",
                      isCurrent && "text-blue-500",
                      isCompleted && "text-blue-500",
                      isUpcoming && "text-gray-400"
                    )}
                  >
                    {step.description}
                  </p>
                </motion.div>

                {/* Step number badge */}
                <motion.div
                  className={cn(
                    "absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                    isCompleted && "bg-blue-500 text-white shadow-lg",
                    isCurrent && "bg-blue-100 text-blue-600 border-2 border-blue-500",
                    isUpcoming && "bg-gray-200 text-gray-500"
                  )}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                >
                  {step.id}
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Progress percentage */}
      <motion.div
        className="text-center mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="inline-flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-gray-600">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </span>
        </div>
      </motion.div>
    </div>
  )
}
