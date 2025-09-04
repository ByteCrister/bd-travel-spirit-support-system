import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types for form data
export interface PersonalInfo {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface CompanyDetails {
  companyName: string
  bio: string
  website: string
  socialMedia: string
}

export interface DocumentFile {
  name: string
  base64: string
  uploadedAt: string
  type: string
  size: number
}

export interface FormData {
  personalInfo: PersonalInfo
  companyDetails: CompanyDetails
  documents: DocumentFile[]
}

export interface RegisterGuideState {
  currentStep: number
  formData: FormData
  isSubmitting: boolean
  errors: Record<string, string>
  
  // Actions
  setCurrentStep: (step: number) => void
  updatePersonalInfo: (data: Partial<PersonalInfo>) => void
  updateCompanyDetails: (data: Partial<CompanyDetails>) => void
  addDocument: (document: DocumentFile) => void
  removeDocument: (index: number) => void
  setError: (field: string, error: string) => void
  clearError: (field: string) => void
  clearAllErrors: () => void
  setSubmitting: (isSubmitting: boolean) => void
  resetForm: () => void
}

const initialFormData: FormData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Bangladesh'
  },
  companyDetails: {
    companyName: '',
    bio: '',
    website: '',
    socialMedia: ''
  },
  documents: []
}

export const useRegisterGuideStore = create<RegisterGuideState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      formData: initialFormData,
      isSubmitting: false,
      errors: {},

      setCurrentStep: (step: number) => {
        set({ currentStep: step })
      },

      updatePersonalInfo: (data: Partial<PersonalInfo>) => {
        set((state) => ({
          formData: {
            ...state.formData,
            personalInfo: { ...state.formData.personalInfo, ...data }
          }
        }))
      },

      updateCompanyDetails: (data: Partial<CompanyDetails>) => {
        set((state) => ({
          formData: {
            ...state.formData,
            companyDetails: { ...state.formData.companyDetails, ...data }
          }
        }))
      },

      addDocument: (document: DocumentFile) => {
        set((state) => ({
          formData: {
            ...state.formData,
            documents: [...state.formData.documents, document]
          }
        }))
      },

      removeDocument: (index: number) => {
        set((state) => ({
          formData: {
            ...state.formData,
            documents: state.formData.documents.filter((_, i) => i !== index)
          }
        }))
      },

      setError: (field: string, error: string) => {
        set((state) => ({
          errors: { ...state.errors, [field]: error }
        }))
      },

      clearError: (field: string) => {
        set((state) => {
          const newErrors = { ...state.errors }
          delete newErrors[field]
          return { errors: newErrors }
        })
      },

      clearAllErrors: () => {
        set({ errors: {} })
      },

      setSubmitting: (isSubmitting: boolean) => {
        set({ isSubmitting })
      },

      resetForm: () => {
        set({
          currentStep: 1,
          formData: initialFormData,
          isSubmitting: false,
          errors: {}
        })
      }
    }),
    {
      name: 'register-guide-storage',
      partialize: (state) => ({
        formData: state.formData,
        currentStep: state.currentStep
      })
    }
  )
)
