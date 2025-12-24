import { GUIDE_SOCIAL_PLATFORM } from "@/constants/guide.const";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/utils/axios"; // Make sure you have this import
import { extractErrorMessage } from "@/utils/axios/extract-error-message";
import { ApiResponse } from "@/types/api.types";
import { CompanyDetails, DocumentFile, FormData, PersonalInfo, SegmentedDocuments } from "@/types/register-as-guide.types";

export interface RegisterGuideState {
  currentStep: number;
  formData: FormData;
  isSubmitting: boolean;
  errors: Record<string, string>;
  isSearching: boolean;
  searchError: string | null;

  // Actions
  setCurrentStep: (step: number) => void;
  updatePersonalInfo: (data: Partial<PersonalInfo>) => void;
  updateCompanyDetails: (data: Partial<CompanyDetails>) => void;
  addDocument: (
    segment: keyof SegmentedDocuments,
    document: DocumentFile
  ) => void;
  removeDocument: (segment: keyof SegmentedDocuments, index: number) => void;
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  setSubmitting: (isSubmitting: boolean) => void;
  resetForm: () => void;

  // Fetch and fill form data method
  fetchAndFillApplication: (email: string, accessToken: string) => Promise<boolean>;
  setSearching: (isSearching: boolean) => void;
  setSearchError: (error: string | null) => void;
}

const initialFormData: FormData = {
  personalInfo: {
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    division: "",
    zip: "",
    country: "Bangladesh",
  },
  companyDetails: {
    companyName: "",
    bio: "",
    social: [{ platform: GUIDE_SOCIAL_PLATFORM.FACEBOOK, url: "" }],
  },
  documents: {
    governmentId: [],
    businessLicense: [],
    professionalPhoto: [],
    certifications: [],
  },
};

// Validation helpers
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidAccessToken = (token: string): boolean => {
  return token.length === 20;
};

export const useRegisterGuideStore = create<RegisterGuideState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      formData: initialFormData,
      isSubmitting: false,
      errors: {},
      isSearching: false,
      searchError: null,

      setCurrentStep: (step: number) => {
        set({ currentStep: step });
      },

      updatePersonalInfo: (data: Partial<PersonalInfo>) => {
        set((state) => ({
          formData: {
            ...state.formData,
            personalInfo: { ...state.formData.personalInfo, ...data },
          },
        }));
      },

      updateCompanyDetails: (data: Partial<CompanyDetails>) => {
        set((state) => ({
          formData: {
            ...state.formData,
            companyDetails: { ...state.formData.companyDetails, ...data },
          },
        }));
      },

      addDocument: (
        segment: keyof SegmentedDocuments,
        document: DocumentFile
      ) => {
        set((state) => ({
          formData: {
            ...state.formData,
            documents: {
              ...state.formData.documents,
              [segment]: [document],
            },
          },
        }));
      },

      removeDocument: (segment: keyof SegmentedDocuments, index: number) => {
        set((state) => ({
          formData: {
            ...state.formData,
            documents: {
              ...state.formData.documents,
              [segment]: state.formData.documents[segment].filter(
                (_, i) => i !== index
              ),
            },
          },
        }));
      },

      setError: (field: string, error: string) => {
        set((state) => ({
          errors: { ...state.errors, [field]: error },
        }));
      },

      clearError: (field: string) => {
        set((state) => {
          const newErrors = { ...state.errors };
          delete newErrors[field];
          return { errors: newErrors };
        });
      },

      clearAllErrors: () => {
        set({ errors: {} });
      },

      setSubmitting: (isSubmitting: boolean) => {
        set({ isSubmitting });
      },

      setSearching: (isSearching: boolean) => {
        set({ isSearching });
      },

      setSearchError: (error: string | null) => {
        set({ searchError: error });
      },

      resetForm: () => {
        set({
          currentStep: 1,
          formData: initialFormData,
          isSubmitting: false,
          errors: {},
          searchError: null,
          isSearching: false,
        });
      },

      fetchAndFillApplication: async (email: string, accessToken: string): Promise<boolean> => {
        if (get().isSearching) return false;
        // Clear previous errors
        set({
          searchError: null,
          isSearching: true
        });

        // Validate email format
        if (!isValidEmail(email)) {
          set({
            searchError: "Please enter a valid email address",
            isSearching: false
          });
          return false;
        }

        // Validate access token length
        if (!isValidAccessToken(accessToken)) {
          set({
            searchError: "Invalid access token",
            isSearching: false
          });
          return false;
        }

        try {
          // Make GET request with email and accessToken in the body
          const response = await api.get<ApiResponse<FormData>>('/guide-applications/v1/application', {
            data: { email, accessToken }
          });

          // Assuming the API returns the formData structure
          const formDataResponse: FormData | undefined = response.data?.data;

          if (!formDataResponse) {
            throw new Error("Invalid response body")
          }

          if (!formDataResponse) {
            set({
              searchError: "No application data found",
              isSearching: false
            });
            return false;
          }

          // Update the form data in the store
          set({
            formData: {
              // Merge with initial data to ensure all fields exist
              ...initialFormData,
              // Update with fetched data
              personalInfo: {
                ...initialFormData.personalInfo,
                ...formDataResponse.personalInfo,
                // Ensure email from request is used
                email: email
              },
              companyDetails: {
                ...initialFormData.companyDetails,
                ...formDataResponse.companyDetails,
              },
              documents: {
                ...initialFormData.documents,
                ...formDataResponse.documents,
              },
            },
            isSearching: false,
            // Optionally set to step 4 (review) if you want to jump to review
            // currentStep: 4
          });

          return true;

        } catch (error: unknown) {

          let errorMessage = "Failed to fetch application data";

          errorMessage = extractErrorMessage(error) ?? errorMessage;

          console.error('Fetch application error:', error);

          set({
            searchError: errorMessage,
            isSearching: false
          });

          return false;
        }
      },
    }),
    {
      name: "guide-registration.store",
      partialize: (state) => ({
        formData: state.formData,
        currentStep: state.currentStep,
      }),
    }
  )
);