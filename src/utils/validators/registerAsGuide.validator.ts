import { documentTypes } from '@/components/register-guide/StepDocuments'
import { GUIDE_SOCIAL_PLATFORM } from '@/constants/guide.const'
import { z } from 'zod'

// Personal Info validation schema
export const personalInfoSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Full name can only contain letters, spaces, apostrophes, and hyphens'),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address')
    .max(254, 'Email must not exceed 254 characters'),

  phone: z
    .string()
    .trim()
    .regex(
      /^\+?[0-9]{7,15}$/,
      'Phone number must be 7–15 digits and may include a leading +'
    ),

  address: z
    .string()
    .trim()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must not exceed 200 characters'),

  city: z
    .string()
    .trim()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must not exceed 100 characters'),

  state: z
    .string()
    .trim()
    .min(2, 'State must be at least 2 characters')
    .max(100, 'State must not exceed 100 characters'),

  zipCode: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9\- ]{3,10}$/, 'Please enter a valid zip/postal code'),

  country: z
    .string()
    .trim()
    .min(2, 'Country must be at least 2 characters')
    .max(100, 'Country must not exceed 100 characters')
})

// Company Details validation schema
export const companyDetailsSchema = z.object({
  companyName: z.string().trim().min(2, 'Company name must be at least 2 characters'),
  bio: z.string().trim().min(50, 'Bio must be at least 50 characters').max(500, 'Bio must not exceed 500 characters'),
  social: z.array(
    z.object({
      platform: z.nativeEnum(GUIDE_SOCIAL_PLATFORM),
      url: z
        .string()
        .trim()
        .url('Please enter a valid social media URL')
        .optional()
        .or(z.literal(''))
    })
  )
})

// Document validation schema
export const documentSchema = z.object({
  name: z.string(),
  base64: z.string(),
  uploadedAt: z.string(),
  type: z.string(),
  size: z.number()
})

// Build segmented schema dynamically
const segmentedDocumentsSchema = z.object(
  Object.fromEntries(
    documentTypes.map((doc) => [
      // create a stable key (e.g. camelCase from title)
      doc.title.replace(/\s+/g, "").charAt(0).toLowerCase() +
      doc.title.replace(/\s+/g, "").slice(1),
      doc.required
        ? z.array(documentSchema).min(1, `${doc.title} is required`)
        : z.array(documentSchema)
    ])
  )
)

// Complete form validation schema
export const completeFormSchema = z.object({
  personalInfo: personalInfoSchema,
  companyDetails: companyDetailsSchema,
  documents: segmentedDocumentsSchema,
})

// File validation helper
export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']

  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 5MB' }
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only JPEG, PNG, and PDF files are allowed' }
  }

  return { isValid: true }
}

// URL validation helper
export const isValidUrl = (url: string): boolean => {
  if (!url) return true // Empty URLs are allowed
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
