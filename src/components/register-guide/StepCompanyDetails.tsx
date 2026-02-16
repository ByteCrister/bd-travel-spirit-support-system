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
import { GUIDE_SOCIAL_PLATFORM } from '@/constants/guide.const'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { jakarta } from '@/styles/fonts'

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
    handleSocialUrlChange,
    updateCompanyDetails,
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
      className={`w-full max-w-6xl mx-auto ${jakarta.className}`}
    >
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl mb-4 shadow-lg shadow-emerald-500/40">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-semibold mb-2 bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
          Company Details
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Tell us about your business and what makes you unique. This information helps travelers choose the perfect guide for their adventure.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Information Card */}
          <Card className="border border-gray-200 shadow-lg bg-white/90 backdrop-blur">
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900">
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
                      "h-12 pl-4 pr-12 transition-all duration-300 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus-visible:ring-emerald-500",
                      getFieldError('companyName') && "border-red-500 bg-red-50",
                      isFieldValid('companyName') && "border-emerald-500 bg-emerald-50"
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
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
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
                      className="text-sm text-red-600 flex items-center space-x-1"
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
                      "min-h-[140px] pl-4 pr-12 transition-all duration-300 resize-none bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus-visible:ring-emerald-500",
                      getFieldError('bio') && "border-red-500 bg-red-50",
                      isFieldValid('bio') && "border-emerald-500 bg-emerald-50"
                    )}
                    maxLength={500}
                  />
                  <div className="absolute right-3 top-3">
                    <AnimatePresence mode="wait">
                      {getFieldError('bio') ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : isFieldValid('bio') ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
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
                      className="text-sm text-red-600 flex items-center space-x-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>{getFieldError('bio')}</span>
                    </motion.p>
                  )}
                </AnimatePresence>
                <p className="text-xs text-gray-500">
                  Minimum 50 characters required. Tell us about your experience, specialties, and what travelers can expect.
                </p>
              </motion.div>
            </CardContent>
          </Card>

          {/* Online Presence Card */}
          <Card className="border border-gray-200 shadow-lg bg-white/90 backdrop-blur">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-gray-900">
                    Online Presence
                  </CardTitle>
                  <p className="text-sm text-gray-600">Connect with travelers online</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Section Header */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <Label className="text-sm font-medium flex items-center gap-2 text-gray-900">
                  <Share2 className="w-4 h-4 text-gray-500" />
                  <span>Social Media Links</span>
                  <span className="text-xs text-muted-foreground">(Optional)</span>
                </Label>
                <p className="text-xs text-gray-500">
                  Add links to your company’s social profiles. Up to 5 platforms.
                </p>
              </motion.div>

              {/* Social Links */}
              <div className="space-y-4">
                {(formData.companyDetails.social ?? []).map((social, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
                  >
                    {/* Platform Select */}
                    <Select
                      value={social.platform}
                      onValueChange={(newPlatform: GUIDE_SOCIAL_PLATFORM) => {
                        const updated = { ...formData.companyDetails };
                        updated.social = [...(updated.social ?? [])];
                        updated.social[index].platform = newPlatform;
                        updateCompanyDetails(updated);
                      }}
                    >
                      <SelectTrigger className="w-40 border-gray-300 bg-white text-gray-900">
                        <SelectValue placeholder="Platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(GUIDE_SOCIAL_PLATFORM).map((platform) => (
                          <SelectItem key={platform} value={platform}>
                            {platform.charAt(0).toUpperCase() + platform.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* URL Input */}
                    <div className="relative flex-1">
                      <Input
                        type="url"
                        placeholder={`https://${social.platform}.com/yourcompany`}
                        value={social.url}
                        onChange={(e) => handleSocialUrlChange(index, e.target.value)}
                        className={cn(
                          "h-10 pr-10 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300",
                          getFieldError(`socialMedia_${index}`) && "border-red-500 bg-red-50",
                          isFieldValid(`socialMedia_${index}`) && "border-emerald-500 bg-emerald-50"
                        )}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <AnimatePresence mode="wait">
                          {getFieldError(`socialMedia_${index}`) ? (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          ) : isFieldValid(`socialMedia_${index}`) ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : null}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Remove Button */}
                    {formData.companyDetails.social.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const updated = { ...formData.companyDetails };
                          updated.social = updated.social.filter((_, i) => i !== index);
                          updateCompanyDetails(updated);
                        }}
                        className="text-red-500 hover:text-red-600"
                      >
                        ✕
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Add Button */}
              <div className="flex items-center justify-between">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={(formData.companyDetails.social ?? []).length >= 5}
                  onClick={() => {
                    updateCompanyDetails({
                      ...formData.companyDetails,
                      social: [
                        ...(formData.companyDetails.social ?? []),
                        { platform: GUIDE_SOCIAL_PLATFORM.FACEBOOK, url: "" },
                      ],
                    });
                  }}
                >
                  + Add another platform
                </Button>
                {(formData.companyDetails.social ?? []).length >= 5 && (
                  <p className="text-xs text-gray-500">
                    Maximum of 5 social links allowed.
                  </p>
                )}
              </div>
            </CardContent>


          </Card>
        </div>

        {/* Features Sidebar */}
        <div className="space-y-6">
          <Card className="border border-gray-200 shadow-lg bg-white/90 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">
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
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{feature.title}</h4>
                      <p className="text-xs text-gray-600">{feature.description}</p>
                    </div>
                  </motion.div>
                )
              })}
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="border border-gray-200 shadow-lg bg-white/90 backdrop-blur">
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
                className="text-lg text-gray-900"
              >
                Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-600 space-y-2">
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
          className="flex items-center space-x-2 px-6 py-3 h-12 border-gray-300 text-gray-700 hover:bg-gray-100"
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
            className="flex items-center space-x-2 px-8 py-3 h-12 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white shadow-lg shadow-emerald-500/40"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
