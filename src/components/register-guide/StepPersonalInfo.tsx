'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  User,
  MapPin,
  Globe,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formFields, locationFields, usePersonalInfoHandler } from '@/hooks/usePersonalInfoHandler'
import { jakarta } from '@/styles/fonts'

interface StepPersonalInfoProps {
  onNext: () => void
  onPrevious?: () => void
}

export const StepPersonalInfo: React.FC<StepPersonalInfoProps> = ({ onNext, onPrevious }) => {
  const {
    formData,
    isValidating,
    handleInputChange,
    getFieldError,
    isFieldValid,
    handleNext,
  } = usePersonalInfoHandler(onNext);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
      className={`w-full max-w-4xl mx-auto ${jakarta.className}`}
    >
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl mb-4 shadow-lg shadow-emerald-500/40">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-semibold mb-2 bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
          Personal Information
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Let&apos;s start with your basic information. This helps us verify your identity and create your guide profile.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card className="border border-gray-200 shadow-lg bg-white/90 backdrop-blur">
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900">Basic Information</CardTitle>
                  <p className="text-sm text-gray-600">Tell us about yourself</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {formFields.map((field, index) => {
                const Icon = field.icon
                const hasError = getFieldError(field.id)
                const isValid = isFieldValid(field.id)

                return (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className="space-y-2"
                  >
                    <Label htmlFor={field.id} className="text-sm font-semibold flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>{field.label}</span>
                      {field.required && <span className="text-destructive">*</span>}
                    </Label>

                    <div className="relative">
                      <Input
                        id={field.id}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={formData.personalInfo[field.id as keyof typeof formData.personalInfo]}
                        onChange={(e) => handleInputChange(field.id as keyof typeof formData.personalInfo, e.target.value)}
                        className={cn(
                          "h-12 pl-4 pr-12 transition-all duration-300 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus-visible:ring-emerald-500",
                          hasError && "border-red-500 bg-red-50",
                          isValid && "border-emerald-500 bg-emerald-50"
                        )}
                        style={{ boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)' }}
                      />

                      {/* Status Icons */}
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <AnimatePresence mode="wait">
                          {hasError ? (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 180 }}
                            >
                          <AlertCircle className="w-5 h-5 text-red-500" />
                            </motion.div>
                          ) : isValid ? (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 180 }}
                            >
                              <CheckCircle className="w-5 h-5 text-emerald-500" />
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    </div>

                    <AnimatePresence>
                      {hasError && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-sm text-red-600 flex items-center space-x-1"
                        >
                          <AlertCircle className="w-4 h-4" />
                          <span>{hasError}</span>
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Address Section */}
        <div className="space-y-6">
          <Card className="border border-gray-200 shadow-lg bg-white/90 backdrop-blur">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-gray-900">Address Details</CardTitle>
                  <p className="text-sm text-gray-600">Your location</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Street Address */}
              {/* <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="address" className="text-sm font-semibold flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Street Address</span>
                  <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="street"
                    type="text"
                    placeholder="Enter your street address"
                    value={formData.personalInfo.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    className={cn(
                      "h-12 pl-4 pr-12 transition-all duration-300",
                      getFieldError('street') && "border-red-500 bg-red-50",
                      isFieldValid('street') && "border-green-500 bg-green-50",
                      "focus:border-blue-500"
                    )}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AnimatePresence mode="wait">
                      {getFieldError('street') ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : isFieldValid('street') ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : null}
                    </AnimatePresence>
                  </div>
                </div>
                <AnimatePresence>
                  {getFieldError('street') && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive flex items-center space-x-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>{getFieldError('street')}</span>
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div> */}

              {/* Location Grid */}
              <div className="space-y-3">
                {locationFields.map((field, index) => {
                  const Icon = field.icon
                  const hasError = getFieldError(field.id)
                  const isValid = isFieldValid(field.id)

                  return (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="space-y-2"
                    >
                      <Label htmlFor={field.id} className="text-sm font-semibold flex items-center space-x-2">
                        <Icon className="w-4 h-4" />
                        <span>{field.label}</span>
                        {field.required && <span className="text-destructive">*</span>}
                      </Label>
                      <div className="relative">
                        <Input
                          id={field.id}
                          type="text"
                          placeholder={field.placeholder}
                          value={formData.personalInfo[field.id as keyof typeof formData.personalInfo]}
                          onChange={(e) => handleInputChange(field.id as keyof typeof formData.personalInfo, e.target.value)}
                          className={cn(
                            "h-10 pl-4 pr-10 transition-all duration-300 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus-visible:ring-emerald-500",
                            hasError && "border-red-500 bg-red-50",
                            isValid && "border-emerald-500 bg-emerald-50"
                          )}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <AnimatePresence mode="wait">
                            {hasError ? (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            ) : isValid ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : null}
                          </AnimatePresence>
                        </div>
                      </div>
                      <AnimatePresence>
                        {hasError && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-red-500 flex items-center space-x-1"
                          >
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <span>{hasError}</span>
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>

              {/* Country */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="space-y-2"
              >
                <Label htmlFor="country" className="text-sm font-semibold flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>Country</span>
                  <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="country"
                    type="text"
                    placeholder="Country"
                    value={formData.personalInfo.country}
                    // onChange={(e) => handleInputChange('country', e.target.value)}
                    readOnly
                    disabled
                    className={cn(
                      "h-10 pl-4 pr-10 transition-all duration-300 bg-gray-100 text-gray-700 placeholder:text-gray-400 border-gray-300 focus-visible:ring-emerald-500",
                      getFieldError('country') && "border-red-500 bg-red-50",
                      isFieldValid('country') && "border-emerald-500 bg-emerald-50"
                    )}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AnimatePresence mode="wait">
                      {getFieldError('country') ? (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      ) : isFieldValid('country') ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : null}
                    </AnimatePresence>
                  </div>
                </div>
                <AnimatePresence>
                  {getFieldError('country') && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive flex items-center space-x-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>{getFieldError('country')}</span>
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex justify-between items-center pt-8"
      >
        {onPrevious && (
          <Button
            variant="outline"
            onClick={onPrevious}
            className="flex items-center space-x-2 px-6 py-3 h-12"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>
        )}

        <div className="flex items-center space-x-4 ml-auto">
          <div className="text-sm text-gray-600">
            Step 1 of 4
          </div>
          <Button
            onClick={handleNext}
            disabled={isValidating}
            className="flex items-center space-x-2 px-8 py-3 h-12 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white shadow-lg shadow-emerald-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}