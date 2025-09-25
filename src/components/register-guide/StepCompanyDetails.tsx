'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Building2,
  FileText,
  Globe,
  Share2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { features, useCompanyDetailsHandler } from '@/hooks/useCompanyDetailsHandler'

interface StepCompanyDetailsProps {
  onNext: () => void
  onPrevious: () => void
}

export const StepCompanyDetails: React.FC<StepCompanyDetailsProps> = ({ onNext, onPrevious }) => {
  const {
    formData,
    isValidating,
    handleInputChange,
    handleBlur,
    handleUrlChange,
    getFieldError,
    isFieldValid,
    handleNext,
  } = useCompanyDetailsHandler(onNext);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-6xl mx-auto"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg" style={{ boxShadow: '0 0 20px -5px rgba(59, 130, 246, 0.3)' }}>
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold mb-2" style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: "'Poppins', system-ui, sans-serif"
        }}>
          Company Details
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Tell us about your business and what makes you unique. This information helps travelers choose the perfect guide for their adventure.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Information Card */}
          <Card className="border-0 shadow-lg" style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
                    Company Information
                  </CardTitle>
                  <p className="text-sm text-gray-600">Basic business details</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company Name */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-2"
              >
                <Label htmlFor="companyName" className="text-sm font-semibold flex items-center space-x-2">
                  <Building2 className="w-4 h-4" />
                  <span>Company/Organization Name</span>
                  <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="Enter your company or organization name"
                    value={formData.companyDetails.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    onBlur={() => handleBlur('companyName')}
                    className={cn(
                      "h-12 pl-4 pr-12 transition-all duration-300",
                      getFieldError('companyName') && "border-red-500 bg-red-50",
                      isFieldValid('companyName') && "border-green-500 bg-green-50",
                      "focus:border-blue-500"
                    )}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AnimatePresence mode="wait">
                      {getFieldError('companyName') ? (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                        >

                          <AlertCircle className="w-5 h-5 text-red-500" />
                        </motion.div>
                      ) : isFieldValid('companyName') ? (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                        >
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </div>
                <AnimatePresence>
                  {getFieldError('companyName') && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm text-red-500 flex items-center space-x-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>{getFieldError('companyName')}</span>
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Bio */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <Label htmlFor="bio" className="text-sm font-semibold flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Company Bio</span>
                  <span className="text-destructive">*</span>
                  <span className="text-muted-foreground ml-2">
                    ({formData.companyDetails.bio.trim().length}/500 characters)
                  </span>
                </Label>
                <div className="relative">
                  <Textarea
                    id="bio"
                    placeholder="Describe your company, services, and what makes you unique. This will help travelers understand your business better."
                    value={formData.companyDetails.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    onBlur={() => handleBlur('bio')}
                    className={cn(
                      "min-h-[140px] pl-4 pr-12 transition-all duration-300 resize-none",
                      getFieldError('bio') && "border-red-500 bg-red-50",
                      isFieldValid('bio') && "border-green-500 bg-green-50",
                      "focus:border-blue-500"
                    )}
                    maxLength={500}
                  />
                  <div className="absolute right-3 top-3">
                    <AnimatePresence mode="wait">
                      {getFieldError('bio') ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : isFieldValid('bio') ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : null}
                    </AnimatePresence>
                  </div>
                </div>
                <AnimatePresence>
                  {getFieldError('bio') && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm text-red-500 flex items-center space-x-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>{getFieldError('bio')}</span>
                    </motion.p>
                  )}
                </AnimatePresence>
                <p className="text-xs text-muted-foreground">
                  Minimum 50 characters required. Tell us about your experience, specialties, and what travelers can expect.
                </p>
              </motion.div>
            </CardContent>
          </Card>

          {/* Online Presence Card */}
          <Card className="border-0 shadow-lg" style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
                    Online Presence
                  </CardTitle>
                  <p className="text-sm text-gray-600">Connect with travelers online</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Website */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="website" className="text-sm font-semibold flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>Website URL</span>
                  <span className="text-xs text-muted-foreground">(Optional)</span>
                </Label>
                <div className="relative">
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://yourcompany.com"
                    value={formData.companyDetails.website}
                    onChange={(e) => handleUrlChange('website', e.target.value)}
                    className={cn(
                      "h-12 pl-4 pr-12 transition-all duration-300",
                      getFieldError('website') && "border-red-500 bg-red-50",
                      isFieldValid('website') && "border-green-500 bg-green-50",
                      "focus:border-blue-500"
                    )}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AnimatePresence mode="wait">
                      {getFieldError('website') ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : isFieldValid('website') ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : null}
                    </AnimatePresence>
                  </div>
                </div>
                <AnimatePresence>
                  {getFieldError('website') && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 flex items-center space-x-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>{getFieldError('website')}</span>
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Social Media */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="socialMedia" className="text-sm font-semibold flex items-center space-x-2">
                  <Share2 className="w-4 h-4" />
                  <span>Social Media URL</span>
                  <span className="text-xs text-muted-foreground">(Optional)</span>
                </Label>
                <div className="relative">
                  <Input
                    id="socialMedia"
                    type="url"
                    placeholder="https://facebook.com/yourcompany or https://instagram.com/yourcompany"
                    value={formData.companyDetails.socialMedia}
                    onChange={(e) => handleUrlChange('socialMedia', e.target.value)}
                    className={cn(
                      "h-12 pl-4 pr-12 transition-all duration-300",
                      getFieldError('socialMedia') && "border-red-500 bg-red-50",
                      isFieldValid('socialMedia') && "border-green-500 bg-green-50",
                      "focus:border-blue-500"
                    )}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AnimatePresence mode="wait">
                      {getFieldError('socialMedia') ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : isFieldValid('socialMedia') ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : null}
                    </AnimatePresence>
                  </div>
                </div>
                <AnimatePresence>
                  {getFieldError('socialMedia') && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 flex items-center space-x-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>{getFieldError('socialMedia')}</span>
                    </motion.p>
                  )}
                </AnimatePresence>
                <p className="text-xs text-muted-foreground">
                  Share your Facebook, Instagram, or other social media profile to help travelers connect with you.
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </div>

        {/* Features Sidebar */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg" style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <CardHeader>
              <CardTitle className="text-lg" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
                Why Travelers Choose Us
              </CardTitle>
              <p className="text-sm text-gray-600">
                Highlight what makes your company special
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">{feature.title}</h4>
                      <p className="text-xs text-gray-500">{feature.description}</p>
                    </div>
                  </motion.div>
                )
              })}
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="border-0 shadow-lg" style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <CardHeader className="flex flex-row items-center gap-3">
              {/* Image instead of icon/emoji */}
              <Image
                src="/images/register_as_guide/idea.png"
                alt="Pro Tips"
                width={28}
                height={28}
                className="rounded-md"
              />
              <CardTitle
                className="text-lg"
                style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}
              >
                Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-500 space-y-2">
                <p>• Be specific about your specialties and unique offerings</p>
                <p>• Mention any certifications or awards you&apos;ve received</p>
                <p>• Include languages you speak fluently</p>
                <p>• Highlight your local knowledge and hidden gems</p>
              </div>
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
        <Button
          variant="outline"
          onClick={onPrevious}
          className="flex items-center space-x-2 px-6 py-3 h-12"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>

        <div className="flex items-center space-x-4 ml-auto">
          <div className="text-sm text-gray-600">
            Step 2 of 4
          </div>
          <Button
            onClick={handleNext}
            disabled={isValidating}
            className="flex items-center space-x-2 px-8 py-3 h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
            style={{ boxShadow: '0 0 20px -5px rgba(59, 130, 246, 0.3)' }}
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
