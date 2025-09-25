'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Upload,
  AlertCircle,
  CheckCircle,
  Shield,
  FileCheck,
  Camera,
  FileImage,
  ArrowRight,
  ArrowLeft,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useStepDocumentsHandlers } from '@/hooks/useStepDocumentsHandlers'
import { DocumentFile, SegmentedDocuments } from '@/store/useRegisterGuideStore'

// Document types and their details
export const documentTypes = [
  {
    icon: Shield,
    title: "Government ID",
    description: "Driver's License, Passport, or National ID",
    required: true
  },
  {
    icon: FileCheck,
    title: "Business License",
    description: "Official business registration certificate",
    required: true
  },
  {
    icon: Camera,
    title: "Professional Photo",
    description: "Clear headshot for your profile",
    required: false
  },
  {
    icon: FileImage,
    title: "Certifications",
    description: "Tour guide or professional certifications",
    required: false
  }
]

interface StepDocumentsProps {
  onNext: () => void
  onPrevious: () => void
}

export const StepDocuments: React.FC<StepDocumentsProps> = ({ onNext, onPrevious }) => {
  const {
    formData,
    isUploading,
    uploadError,
    dragActive,
    fileInputRef,
    removeDocument,
    handleFileInputChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleNext,
    formatFileSize,
    getFileInfo,
    selectedSegment,
    setSelectedSegment
  } = useStepDocumentsHandlers(onNext)

  const totalDocs = Object.values(formData.documents).reduce(
    (count, arr) => count + arr.length,
    0
  )

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
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold mb-2" style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: "'Poppins', system-ui, sans-serif"
        }}>
          Verification Documents
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Upload your verification documents to complete your guide registration. All documents are securely encrypted and stored.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            className="border-0 shadow-lg"
            style={{
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl flex items-center justify-center">
                  <Upload className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle
                    className="text-xl"
                    style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}
                  >
                    Upload Documents
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Select a category, then drag & drop or click to browse
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Segment Selector */}
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium">Select Document Type:</label>
                <select
                  value={selectedSegment}
                  onChange={(e) =>
                    setSelectedSegment(e.target.value as keyof SegmentedDocuments)
                  }
                  className="border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="governmentId">Government ID (Required)</option>
                  <option value="businessLicense">Business License (Required)</option>
                  <option value="professionalPhoto">Professional Photo</option>
                  <option value="certifications">Certifications</option>
                </select>
              </div>

              {/* Upload Area */}
              <motion.div
                className={cn(
                  "relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer group",
                  dragActive
                    ? "border-blue-500 bg-blue-50/50 scale-105"
                    : "border-gray-300 hover:border-blue-500/50 hover:bg-blue-50/30"
                )}
                onDrop={(e) => handleDrop(e, selectedSegment)}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileInputChange(e, selectedSegment)}
                  className="hidden"
                />

                {/* Upload Icon + Text */}
                <motion.div
                  className="flex flex-col items-center space-y-4"
                  animate={{
                    scale: isUploading ? [1, 1.1, 1] : 1,
                    rotate: isUploading ? [0, 5, -5, 0] : 0,
                  }}
                  transition={{
                    duration: 2,
                    repeat: isUploading ? Infinity : 0,
                  }}
                >
                  <div
                    className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300",
                      dragActive
                        ? "bg-blue-500 text-white shadow-lg"
                        : "bg-blue-100 text-blue-600 group-hover:bg-blue-500 group-hover:text-white"
                    )}
                  >
                    {isUploading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Upload className="w-8 h-8" />
                      </motion.div>
                    ) : (
                      <Upload className="w-8 h-8" />
                    )}
                  </div>

                  <div>
                    <p className="text-lg font-semibold">
                      {isUploading
                        ? "Processing files..."
                        : dragActive
                          ? "Drop files here"
                          : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-sm text-gray-500">
                      PDF, JPG, PNG files up to 5MB each
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Upload Error */}
              <AnimatePresence>
                {uploadError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-500">{uploadError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Uploaded Documents by Segment */}
              <div className="space-y-8">
                {Object.entries(formData.documents).map(([segment, docs]) => {
                  const typedSegment = segment as keyof SegmentedDocuments
                  const typedDocs = docs as DocumentFile[]

                  return (<div key={typedSegment} className="space-y-3">
                    <h3 className="font-semibold text-lg flex items-center space-x-2">
                      <span className="capitalize">{segment}</span>
                      {(segment === "governmentId" || segment === "businessLicense") && (
                        <span className="text-red-500 text-sm ml-2">(Required)</span>
                      )}
                      <span className="text-gray-500 text-sm ml-2">
                        ({docs.length})
                      </span>
                    </h3>

                    {docs.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No documents uploaded yet
                      </p>
                    ) : (
                      <AnimatePresence>
                        {typedDocs.map((doc, index) => {
                          const fileInfo = getFileInfo(doc.type)
                          const Icon = fileInfo.icon
                          return (
                            <motion.div
                              key={`${doc.name}-${index}`}
                              initial={{ opacity: 0, y: 20, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -20, scale: 0.95 }}
                              className={cn(
                                "flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-md",
                                fileInfo.bgColor,
                                fileInfo.borderColor
                              )}
                            >
                              <div className="flex items-center space-x-4">
                                <div
                                  className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center",
                                    fileInfo.bgColor,
                                    fileInfo.borderColor,
                                    "border"
                                  )}
                                >
                                  <Icon className={cn("w-6 h-6", fileInfo.color)} />
                                </div>
                                <div>
                                  <p className="font-semibold text-sm">{doc.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(doc.size)} •{" "}
                                    {new Date(doc.uploadedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 0.2 }}
                                >
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                </motion.div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    removeDocument(segment as keyof SegmentedDocuments, index)
                                  }
                                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </motion.div>
                          )
                        })}
                      </AnimatePresence>
                    )}
                  </div>)
                })}
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Sidebar */}
        <div className="space-y-6">
          {/* Document Requirements */}
          <Card className="border-0 shadow-lg" style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <CardHeader>
              <CardTitle className="text-lg" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
                Required Documents
              </CardTitle>
              <p className="text-sm text-gray-600">
                Upload these documents to verify your identity
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {documentTypes.map((doc, index) => {
                const Icon = doc.icon
                return (
                  <motion.div
                    key={doc.title}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-semibold">{doc.title}</h4>
                        {doc.required && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{doc.description}</p>
                    </div>
                  </motion.div>
                )
              })}
            </CardContent>
          </Card>

          {/* Security Info */}
          <Card className="border-0 shadow-lg" style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <CardHeader className="flex flex-row  gap-3">
              {/* Image instead of emoji */}
              <Image
                src="/images/register_as_guide/security.png"
                alt="Security & Privacy"
                width={28}
                height={28}
                className="rounded-md"
              />
              <CardTitle
                className="text-lg"
                style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}
              >
                Security & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-500 space-y-2">
                <p>• All documents are encrypted and stored securely</p>
                <p>• Only authorized personnel can access your files</p>
                <p>• Documents are used solely for verification purposes</p>
                <p>• You can request deletion at any time</p>
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
          disabled={isUploading}
          className="flex items-center space-x-2 px-6 py-3 h-12"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>

        <div className="flex items-center space-x-4 ml-auto">
          <div className="text-sm text-gray-600">
            Step 3 of 4
          </div>
          <Button
            onClick={handleNext}
            disabled={totalDocs === 0 || isUploading}
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