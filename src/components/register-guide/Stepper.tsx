'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check, User, Building2, FileText, Eye, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { jakarta } from '@/styles/fonts'

interface StepperProps {
  currentStep: number
  totalSteps: number
}

const steps = [
  {
    id: 1,
    title: 'Personal Info',
    description: 'Your basic information',
    icon: User
  },
  {
    id: 2,
    title: 'Company Details',
    description: 'Business information',
    icon: Building2
  },
  {
    id: 3,
    title: 'Documents',
    description: 'Verification documents',
    icon: FileText
  },
  {
    id: 4,
    title: 'Review',
    description: 'Confirm & submit',
    icon: Eye
  }
]

export const Stepper: React.FC<StepperProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className={`w-full max-w-5xl mx-auto mb-12 ${jakarta.className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl sm:text-3xl font-semibold mb-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-300 dark:via-teal-300 dark:to-cyan-300 bg-clip-text text-transparent">
          Registration Progress
        </h2>
        <p className="text-sm text-muted-foreground">
          Complete all steps to become a verified guide
        </p>
      </motion.div>

      <div className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-cyan-500/5 rounded-2xl blur-3xl" />

        {/* Progress line */}
        <div className="absolute top-8 left-0 right-0 h-1 bg-muted rounded-full -z-10 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400 rounded-full"
            style={{ boxShadow: '0 0 14px -4px rgba(16, 185, 129, 0.6)' }}
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
                    'relative w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shadow-lg',
                    isCompleted &&
                      'bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-400 text-white',
                    isCurrent &&
                      'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-700 dark:text-emerald-400 animate-bounce-gentle',
                    isUpcoming &&
                      'border-border bg-card text-muted-foreground'
                  )}
                  style={
                    isCompleted
                      ? { boxShadow: '0 0 22px -6px rgba(16, 185, 129, 0.8)' }
                      : isCurrent
                      ? { boxShadow: '0 0 22px -6px rgba(56, 189, 248, 0.7)' }
                      : {}
                  }
                  whileHover={{
                    scale: 1.1,
                    rotate: isCurrent ? [0, -5, 5, 0] : 0
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Glow effect for current step */}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400/25 to-transparent"
                      animate={{
                        opacity: [0.5, 1, 0.5],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut'
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
                      <Sparkles className="w-4 h-4 text-emerald-300" />
                    </motion.div>
                  )}

                  <div className="relative z-10">
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                      >
                        <Check className="w-7 h-7" />
                      </motion.div>
                    ) : (
                      <Icon
                        className={cn(
                          'w-7 h-7 transition-all duration-300',
                          isCurrent && 'animate-pulse'
                        )}
                      />
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
                      'text-sm font-semibold transition-all duration-300',
                      isCurrent && 'text-emerald-600 dark:text-emerald-300 text-base',
                      isCompleted && 'text-emerald-600 dark:text-emerald-300',
                      isUpcoming && 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={cn(
                      'text-xs mt-1 transition-colors duration-300',
                      isCurrent && 'text-emerald-600/80 dark:text-emerald-300/80',
                      isCompleted && 'text-emerald-600/70 dark:text-emerald-300/70',
                      isUpcoming && 'text-muted-foreground'
                    )}
                  >
                    {step.description}
                  </p>
                </motion.div>

                {/* Step number badge */}
                <motion.div
                  className={cn(
                    'absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
                    isCompleted && 'bg-emerald-500 text-white shadow-lg',
                    isCurrent &&
                      'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-500',
                    isUpcoming && 'bg-muted text-muted-foreground'
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
        <div className="inline-flex items-center space-x-2 rounded-full bg-muted px-4 py-2 border border-border">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-foreground">
            {Math.round((currentStep / totalSteps) * 100)}% complete
          </span>
        </div>
      </motion.div>
    </div>
  )
}
