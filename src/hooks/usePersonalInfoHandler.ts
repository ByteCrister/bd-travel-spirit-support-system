'use client'

import { useState, useEffect, useCallback } from 'react'
import { ZodError } from 'zod'
import { useRegisterGuideStore } from '@/store/guide/guide-registration.store'
import { personalInfoSchema } from '@/utils/validators/registerAsGuide.validator'
import { showToast } from '@/components/global/showToast'
import { Building, Mail, MapPin, Phone, User } from 'lucide-react'

export const formFields = [
    {
        id: 'name',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        icon: User,
        required: true,
        type: 'text'
    },
    {
        id: 'email',
        label: 'Email Address',
        placeholder: 'Enter your email address',
        icon: Mail,
        required: true,
        type: 'email'
    },
    {
        id: 'phone',
        label: 'Phone Number',
        placeholder: 'Enter your phone number',
        icon: Phone,
        required: true,
        type: 'tel'
    },
    {
        id: 'street',
        label: 'Street Address',
        placeholder: 'Enter your street address',
        icon: MapPin,
        required: true,
        type: 'text'
    }
]

export const locationFields = [
    {
        id: 'city',
        label: 'City',
        placeholder: 'City',
        icon: Building,
        required: true
    },
    {
        id: 'division',
        label: 'Division/State',
        placeholder: 'Division',
        icon: Building,
        required: true
    },
    {
        id: 'zip',
        label: 'Zip Code',
        placeholder: 'Zip Code',
        icon: Building,
        required: true
    }
]

export const usePersonalInfoHandler = (onNext: () => void) => {
    const { formData, updatePersonalInfo, clearError, errors } = useRegisterGuideStore()
    const [localErrors, setLocalErrors] = useState<Record<string, string>>({})
    const [isValidating, setIsValidating] = useState(false)

    // Validation
    const validateStep = useCallback(() => {
        setIsValidating(true)
        try {
            personalInfoSchema.parse(formData.personalInfo)
            setLocalErrors({})
            setIsValidating(false)
            return true
        } catch (error) {
            if (error instanceof ZodError) {
                const newErrors: Record<string, string> = {}
                error.issues.forEach(err => {
                    if (err.path[0]) {
                        newErrors[err.path[0] as string] = err.message
                    }
                })
                setLocalErrors(newErrors)
                showToast.warning(Object.values(newErrors).join(', '), 'Please correct the highlighted fields.')
            } else {
                console.error('Unexpected validation error:', error)
            }
            setIsValidating(false)
            return false
        }
    }, [formData.personalInfo])

    //  Input change handler
    const handleInputChange = useCallback(
        (field: keyof typeof formData.personalInfo, value: string) => {
            updatePersonalInfo({ [field]: value })
            clearError(field)

            if (localErrors[field]) {
                setLocalErrors(prev => {
                    const newErrors = { ...prev }
                    delete newErrors[field]
                    return newErrors
                })
            }
        },
        [formData, updatePersonalInfo, clearError, localErrors]
    )

    //  Auto-fill email if available
    useEffect(() => {
        const userEmail = localStorage.getItem('userEmail')
        if (userEmail && !formData.personalInfo.email) {
            updatePersonalInfo({ email: userEmail })
        }
    }, [formData.personalInfo.email, updatePersonalInfo])

    // Helpers
    const getFieldError = (field: string) => localErrors[field] || errors[field]
    const isFieldValid = (field: string) =>
        !getFieldError(field) && formData.personalInfo[field as keyof typeof formData.personalInfo]

    const handleNext = () => {
        if (validateStep()) {
            onNext()
        }
    }

    return {
        formData,
        // localErrors,
        isValidating,
        // validateStep,
        handleInputChange,
        getFieldError,
        isFieldValid,
        handleNext,
    }
}
