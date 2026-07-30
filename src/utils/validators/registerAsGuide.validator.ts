import { documentTypes } from '@/components/register-guide/StepDocuments'
import { GUIDE_SOCIAL_PLATFORM } from '@/constants/guide.const'
import { BangladeshDistricts } from '@/data/bangladesh-districts'
import { BangladeshDivisions } from '@/data/bangladesh-division'
import { isValidBangladeshZip } from '@/data/bangladesh-zip-codes'
import { z } from 'zod'

/**
 * Normalizes a location string for fuzzy comparison:
 *   - lowercases
 *   - removes apostrophes, hyphens, and other punctuation
 *   - collapses multiple spaces into one
 *
 * Examples:
 *   "Cox's Bazar" → "coxs bazar"
 *   "Cox-Bazar"   → "coxbazar"
 *   "  Dhaka  "   → "dhaka"
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[''`´\-]/g, '')   // strip apostrophes & hyphens
    .replace(/[^a-z0-9 ]/g, '') // strip remaining non-alphanumeric (except space)
    .replace(/\s+/g, ' ')       // collapse multiple spaces
    .trim()
}

/** Pre-normalized district values for O(1) lookup */
const normalizedDistricts: Map<string, BangladeshDistricts> = new Map(
  Object.values(BangladeshDistricts).map((d) => [normalizeText(d), d])
)

/** Pre-normalized division values for O(1) lookup */
const normalizedDivisions: Map<string, BangladeshDivisions> = new Map(
  Object.values(BangladeshDivisions).map((d) => [normalizeText(d), d])
)

/** Returns the matched district enum value, or undefined if no match */
export function matchDistrict(input: string): BangladeshDistricts | undefined {
  return normalizedDistricts.get(normalizeText(input))
}

/** Returns the matched division enum value, or undefined if no match */
export function matchDivision(input: string): BangladeshDivisions | undefined {
  return normalizedDivisions.get(normalizeText(input))
}

// Personal Info validation schema
export const personalInfoSchema = z.object({
  name: z
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
      /^(?:\+?88)?01[3-9]\d{8}$/,
      'Please enter a valid Bangladeshi phone number (e.g. 01XXXXXXXXX or +8801XXXXXXXXX)'
    ),

  street: z
    .string()
    .trim()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must not exceed 200 characters'),

  city: z
    .string()
    .trim()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must not exceed 100 characters')
    .superRefine((val, ctx) => {
      if (matchDistrict(val) === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `"${val}" is not a recognised Bangladesh district. Try e.g. "Dhaka", "Chattogram", "Cox's Bazar".`,
        })
      }
    }),

  division: z
    .string()
    .trim()
    .superRefine((val, ctx) => {
      if (matchDivision(val) === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `"${val}" is not a recognised division. Must be one of: ${Object.values(BangladeshDivisions).join(', ')}.`,
        })
      }
    }),

  zip: z
    .string()
    .trim()
    .refine(isValidBangladeshZip, {
      message: 'Please enter a valid Bangladesh 4-digit postal code (e.g. 1200 for Dhaka)',
    }),

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
