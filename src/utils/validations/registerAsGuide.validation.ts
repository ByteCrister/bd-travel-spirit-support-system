import { z } from 'zod'

// Personal Info validation schema
export const personalInfoSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').regex(/^[0-9+\-\s()]+$/, 'Please enter a valid phone number'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  zipCode: z.string().min(3, 'Zip code must be at least 3 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters')
})

// Company Details validation schema
export const companyDetailsSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  bio: z.string().min(50, 'Bio must be at least 50 characters').max(500, 'Bio must not exceed 500 characters'),
  website: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
  socialMedia: z.string().url('Please enter a valid social media URL').optional().or(z.literal(''))
})

// Document validation schema
export const documentSchema = z.object({
  name: z.string(),
  base64: z.string(),
  uploadedAt: z.string(),
  type: z.string(),
  size: z.number()
})

// Complete form validation schema
export const completeFormSchema = z.object({
  personalInfo: personalInfoSchema,
  companyDetails: companyDetailsSchema,
  documents: z.array(documentSchema).min(1, 'At least one document is required')
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
