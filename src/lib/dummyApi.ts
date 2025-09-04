import { FormData } from './registerGuideStore'

export interface GuideApplicationPayload {
  role: 'guide'
  personalInfo: FormData['personalInfo']
  companyDetails: FormData['companyDetails']
  documents: FormData['documents']
  organizerProfile: {
    status: 'pending'
    submittedAt: string
  }
}

export const submitGuideApplication = async (data: FormData): Promise<{ success: boolean; message?: string }> => {
  return new Promise((resolve) => {
    // Create the payload with required structure
    const payload: GuideApplicationPayload = {
      role: 'guide',
      personalInfo: data.personalInfo,
      companyDetails: data.companyDetails,
      documents: data.documents,
      organizerProfile: {
        status: 'pending',
        submittedAt: new Date().toISOString()
      }
    }

    console.log("Dummy API Payload:", payload)
    
    // Simulate API call delay
    setTimeout(() => {
      resolve({ 
        success: true, 
        message: 'Application submitted successfully! We will review your application and get back to you soon.' 
      })
    }, 1500)
  })
}
