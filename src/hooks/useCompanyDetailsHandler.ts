"use client";

import { useState, useCallback } from "react";
import { ZodError } from "zod";
import {
    useRegisterGuideStore,
} from "@/store/guide/guide-registration.store";
import {
    companyDetailsSchema,
    isValidUrl,
} from "@/utils/validators/registerAsGuide.validator";
import { showToast } from "@/components/global/showToast";
import { Lightbulb, Target, TrendingUp, Users } from "lucide-react";
import { CompanyDetails } from "@/types/register-as-guide.types";

export const features = [
    {
        icon: Users,
        title: "Expert Team",
        description: "Professional guides with local expertise",
    },
    {
        icon: Target,
        title: "Custom Tours",
        description: "Tailored experiences for every traveler",
    },
    {
        icon: Lightbulb,
        title: "Unique Insights",
        description: "Hidden gems and local secrets",
    },
    {
        icon: TrendingUp,
        title: "Quality Service",
        description: "Consistent excellence in every tour",
    },
];

type CompanyDetailsFields = keyof CompanyDetails;

export const useCompanyDetailsHandler = (onNext: () => void) => {
    const { formData, updateCompanyDetails, errors } = useRegisterGuideStore();
    const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
    const [isValidating, setIsValidating] = useState(false);

    // Validate entire step
    const validateStep = useCallback(() => {
        setIsValidating(true);
        setLocalErrors({});

        try {
            companyDetailsSchema.parse(formData.companyDetails);
            setIsValidating(false);
            return true;
        } catch (error) {
            const newErrors: Record<string, string> = {};
            if (error instanceof ZodError) {
                error.issues.forEach((issue) => {
                    const field = issue.path[0] as string;
                    if (field) {
                        newErrors[field] = issue.message;
                        showToast.warning(issue.message, `Field: ${field}`);
                    }
                });
            } else {
                console.error("Unexpected validation error:", error);
                showToast.warning("An unexpected error occurred.");
            }
            setLocalErrors(newErrors);
            setIsValidating(false);
            return false;
        }
    }, [formData.companyDetails]);

    // Handle input changes
    const handleInputChange = useCallback(
        (field: CompanyDetailsFields, value: string) => {
            updateCompanyDetails({ [field]: value });

            try {
                companyDetailsSchema.pick({ [field]: true }).parse({ [field]: value });
                setLocalErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[field];
                    return newErrors;
                });
            } catch (error) {
                if (error instanceof ZodError) {
                    const issue = error.issues[0];
                    setLocalErrors((prev) => ({ ...prev, [field]: issue.message }));
                }
            }
        },
        [updateCompanyDetails]
    );

    // Handle blur validation
    const handleBlur = useCallback(
        (field: CompanyDetailsFields) => {
            try {
                companyDetailsSchema
                    .pick({ [field]: true })
                    .parse({ [field]: formData.companyDetails[field] });
                setLocalErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[field];
                    return newErrors;
                });
            } catch (error) {
                if (error instanceof ZodError) {
                    const issue = error.issues[0];
                    setLocalErrors((prev) => ({ ...prev, [field]: issue.message }));
                }
            }
        },
        [formData.companyDetails]
    );

    // Handle URL validation
    const handleUrlChange = useCallback(
        (field: "social", value: string) => {
            if (value && !isValidUrl(value)) {
                setLocalErrors((prev) => ({
                    ...prev,
                    [field]: "Please enter a valid URL",
                }));
            } else {
                setLocalErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[field];
                    return newErrors;
                });
            }
            handleInputChange(field, value);
        },
        [handleInputChange]
    );

    const handleSocialUrlChange = useCallback(
        (index: number, value: string) => {
            const updated = { ...formData.companyDetails };
            updated.social[index].url = value;

            updateCompanyDetails({ ...updated });

            if (value && !isValidUrl(value)) {
                setLocalErrors((prev) => ({
                    ...prev,
                    [`socialMedia_${index}`]: "Please enter a valid URL",
                }));
            } else {
                setLocalErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[`socialMedia_${index}`];
                    return newErrors;
                });
            }
        },
        [formData.companyDetails, updateCompanyDetails]
    );

    // Helpers
    const getFieldError = (field: string) => localErrors[field] || errors[field];
    const isFieldValid = (field: string) =>
        !!formData.companyDetails[field as CompanyDetailsFields] &&
        !getFieldError(field);

    // Handle next button click
    const handleNext = () => {
        if (validateStep()) {
            onNext();
        }
    };

    return {
        formData,
        localErrors,
        isValidating,
        validateStep,
        handleInputChange,
        handleBlur,
        handleUrlChange,
        getFieldError,
        isFieldValid,
        handleNext,
        handleSocialUrlChange,
        updateCompanyDetails
    };
};
