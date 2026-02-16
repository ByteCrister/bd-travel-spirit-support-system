'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRegisterGuideStore } from '@/store/guide/guide-registration.store'
import {
  User,
  Building2,
  FileText,
  Mail,
  Phone,
  MapPin,
  Globe,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Send,
  Shield,
  Eye,
  Clock,
  Sparkles,
  Award,
  Star,
  Heart
} from 'lucide-react'
import Image from 'next/image'
import { showToast } from '../global/showToast'
import { extractErrorMessage } from '@/utils/axios/extract-error-message'
import api from '@/utils/axios'
import { ConfirmationRegisterDialog } from './ConfirmationRegisterDialog'
import { EmailVerificationService } from '@/utils/api/email-verification.api'
import { jakarta } from '@/styles/fonts'

interface StepReviewSubmitProps {
  onPrevious: () => void
  onSuccess?: () => void
}

export const StepReviewSubmit: React.FC<StepReviewSubmitProps> = ({ onPrevious, onSuccess }) => {
  const { formData, isSubmitting, hasSearchedApplication, setSubmitting, resetForm } = useRegisterGuideStore()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [emailVerificationService, setEmailVerificationService] = useState<EmailVerificationService | null>(null)
  
  const totalDocuments = Object.values(formData.documents || {}).flat().length

  // Initialize email verification service when formData changes
  useEffect(() => {
    if (formData.personalInfo.email) {
      setEmailVerificationService(new EmailVerificationService(formData.personalInfo.email))
    }
  }, [formData.personalInfo.email])

  // Handle email verification email sending
  const handleSendVerificationEmail = async () => {
    if (!emailVerificationService) {
      return { success: false, message: 'Email not available' }
    }

    try {
      const result = await emailVerificationService.sendVerificationEmail()
      if (result.success) {
        showToast.success(result.message)
      } else {
        showToast.error(result.message)
      }
      return result
    } catch (error) {
      const message = extractErrorMessage(error)
      showToast.error(message)
      return { success: false, message }
    }
  }

  // Handle token verification
  const handleVerifyToken = async (token: string) => {
    if (!emailVerificationService) {
      return { success: false, message: 'Email not available' }
    }

    try {
      const result = await emailVerificationService.verifyToken(token)
      if (result.success) {
        showToast.success(result.message)
      } else {
        showToast.error(result.message)
      }
      return result
    } catch (error) {
      const message = extractErrorMessage(error)
      showToast.error(message)
      return { success: false, message }
    }
  }

  // Handle final form submission
  const handleSubmit = async () => {
    if (totalDocuments === 0) {
      showToast.error("Please upload at least one document before submitting");
      return;
    }

    setSubmitting(true);

    try {
      await api.post(
        "/guide-applications/v1",
        {
          ...formData,
          emailVerified: true // Add flag to indicate email is verified
        }
      );

      setIsSubmitted(true);
      showToast.success("Guide Application submitted successfully.");

      setTimeout(() => {
        resetForm();
        onSuccess?.();
      }, 5000);

    } catch (error: unknown) {
      const message = extractErrorMessage(error);
      console.error("Submission error:", message);
      showToast.error(
        message ||
        "An error occurred while submitting your application"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Rest of the component remains the same...
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <FileText className="w-4 h-4 text-blue-500" />
    }
    return <FileText className="w-4 h-4 text-red-500" />
  }

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-4xl mx-auto ${jakarta.className}`}
      >
        <Card className="border border-gray-200 shadow-lg bg-white/90 backdrop-blur">
          <CardContent className="pt-6">
            <div className="text-center space-y-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="relative"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/50">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <motion.div
                  className="absolute -top-2 -right-2"
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  <Sparkles className="w-8 h-8 text-yellow-400" />
                </motion.div>
              </motion.div>

              <div>
                <h2 className="text-3xl font-semibold mb-4 bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                  Application Submitted Successfully!
                </h2>
                <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                  Thank you for your interest in becoming a guide with BD Travel Spirit.
                  We will review your application and get back to you within 3-5 business days.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-gradient-to-br from-slate-900 to-slate-900/60 rounded-2xl p-6 border border-slate-700"
                >
                  <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      What happens next?
                    </h3>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>Our team will review your application and documents</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>We may contact you for additional information if needed</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>You&apos;ll receive an email notification about the decision</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>If approved, you&apos;ll get access to our guide dashboard</span>
                    </li>
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      Why choose us?
                    </h3>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start space-x-2">
                      <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span>Join thousands of successful guides worldwide</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Heart className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Make a positive impact on travelers&apos; experiences</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Shield className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Secure platform with insurance coverage</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Globe className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Global reach with local expertise</span>
                    </li>
                  </ul>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <>
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
            <Eye className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-semibold mb-2 bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
            Review & Submit
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Please review your information before submitting your application. Make sure all details are accurate and complete.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Review Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Review */}
            <Card className="border border-gray-200 shadow-lg bg-white/90 backdrop-blur">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">
                      Personal Information
                    </CardTitle>
                    <p className="text-sm text-gray-600">Your basic details</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-semibold text-gray-900">{formData.personalInfo.name}</p>
                        <p className="text-sm text-gray-500">Full Name</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-semibold text-gray-900">{formData.personalInfo.email}</p>
                        <p className="text-sm text-gray-500">Email Address</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-semibold text-gray-900">{formData.personalInfo.phone}</p>
                        <p className="text-sm text-gray-500">Phone Number</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900">{formData.personalInfo.street}</p>
                        <p className="text-sm text-gray-500">
                          {formData.personalInfo.city}, {formData.personalInfo.division} {formData.personalInfo.zip}
                        </p>
                        <p className="text-sm text-gray-500">{formData.personalInfo.country}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Details Review */}
            <Card className="border border-gray-200 shadow-lg bg-white/90 backdrop-blur">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">
                      Company Details
                    </CardTitle>
                    <p className="text-sm text-gray-600">Business information</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg mb-2 text-gray-900">{formData.companyDetails.companyName}</h4>
                  <p className="text-gray-700 text-sm mb-4">{formData.companyDetails.bio}</p>
                </div>

                {/* Social Links */}
                {(formData.companyDetails.social ?? []).length > 0 && (
                  <div className="mt-2 space-y-2">
                    {(formData.companyDetails.social ?? []).map((social, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <a
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-emerald-600 hover:underline"
                        >
                          {social.platform.charAt(0).toUpperCase() + social.platform.slice(1)}: {social.url}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Documents Review */}
            <Card className="border border-gray-200 shadow-lg bg-white/90 backdrop-blur">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">
                      Verification Documents ({totalDocuments})
                    </CardTitle>
                    <p className="text-sm text-gray-600">Uploaded files</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {totalDocuments > 0 ? (
                  <div className="space-y-3">
                    {Object.values(formData.documents || {}).flat().map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          {getFileIcon(doc.type)}
                          <div>
                            <p className="font-medium text-sm text-gray-900">{doc.name}</p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <p className="text-sm text-red-700">No documents uploaded</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Terms and Conditions */}
            <Card className="border border-gray-200 shadow-lg bg-white/90 backdrop-blur">
              <CardHeader className="flex flex-row gap-2">
                <Image
                  src="/images/register_as_guide/secure-data.png"
                  alt="Terms & Conditions Icon"
                  width={34}
                  height={34}
                  className="object-contain"
                />
                <CardTitle
                  className="text-lg text-gray-900"
                >
                  Terms & Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• By submitting this application, you agree to our terms of service and privacy policy</p>
                  <p>• You confirm that all information provided is accurate and truthful</p>
                  <p>• You have the right to submit the uploaded documents</p>
                  <p>• BD Travel Spirit reserves the right to verify all information and documents</p>
                  <p>• Your application will be reviewed within 3-5 business days</p>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="border border-gray-200 shadow-lg bg-white/90 backdrop-blur">
              <CardHeader className="flex flex-row gap-2">
                <Image
                  src="/images/register_as_guide/terms-and-conditions.png"
                  alt="Terms & Conditions Icon"
                  width={34}
                  height={34}
                  className="object-contain"
                />
                <CardTitle className="text-lg text-gray-900">
                  Security Notice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• All your data is encrypted and stored securely</p>
                  <p>• We use industry-standard security measures</p>
                  <p>• Your personal information is never shared with third parties</p>
                  <p>• You can request data deletion at any time</p>
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
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-6 py-3 h-12 border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          <div className="flex items-center space-x-4 ml-auto">
            <div className="text-sm text-gray-600">
              Step 4 of 4
            </div>
            <Button
              onClick={() => setShowConfirmDialog(true)}
              disabled={hasSearchedApplication || isSubmitting || totalDocuments === 0}
              className="flex items-center space-x-2 px-8 py-3 h-12 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 disabled:cursor-not-allowed disabled:opacity-60 hover:from-emerald-400 hover:to-cyan-400 text-white shadow-lg shadow-emerald-500/40"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Application</span>
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
      {
        /* Confirmation Dialog with Email Verification */
        !hasSearchedApplication && (
          <ConfirmationRegisterDialog
            open={showConfirmDialog}
            onOpenChange={setShowConfirmDialog}
            onConfirm={handleSubmit}
            title="Final Confirmation Required"
            confirmText="Yes, Submit Application"
            cancelText="Review Again"
            isLoading={isSubmitting}
            email={formData.personalInfo.email}
            onSendVerification={handleSendVerificationEmail}
            onVerifyToken={handleVerifyToken}
          />
        )
      }
    </>
  )
}