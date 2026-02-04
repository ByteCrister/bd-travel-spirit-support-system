// employee.validator.ts
import * as yup from "yup";
import {
    EMPLOYMENT_TYPE,
    EmploymentType,
    SALARY_PAYMENT_MODE,
    SalaryPaymentMode,
} from "@/constants/employee.const";
import { CURRENCY, Currency } from "@/constants/tour.const";
import { DayOfWeek, EmergencyContactDTO, ContactInfoDTO, ShiftDTO, DocumentDTO, CreateEmployeePayload } from "@/types/employee.types";

// Phone validation regex for Bangladesh
export const phoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;

// Day of Week validation
export const dayOfWeekSchema = yup
    .mixed<DayOfWeek>()
    .oneOf(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const);

// Emergency Contact validation
export const emergencyContactValidationSchema: yup.ObjectSchema<EmergencyContactDTO> = yup.object({
    name: yup
        .string()
        .trim()
        .min(3, "Employee must be at least 3 characters")
        .matches(/^[A-Za-z]+\.?(?: [A-Za-z]+\.?)*$/, "Name must contain only letters, dots, and single spaces")
        .required("Emergency contact name is required"),

    phone: yup
        .string()
        .matches(phoneRegex, "Invalid Bangladeshi phone number")
        .required("Emergency contact phone is required"),
    relation: yup.string().required("Relation is required"),
});

// Contact Info validation
export const contactInfoValidationSchema: yup.ObjectSchema<ContactInfoDTO> = yup.object({
    phone: yup
        .string()
        .trim()
        .matches(phoneRegex, "Invalid Bangladeshi phone number")
        .required("Contact phone number is required"),
    email: yup
        .string()
        .trim()
        .lowercase()
        .email("Invalid email address")
        .required("Contact email is required"),
    emergencyContact: emergencyContactValidationSchema
        .required()
});

// Shift validation
export const shiftValidationSchema: yup.ObjectSchema<ShiftDTO> = yup.object({
    startTime: yup
        .string()
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)")
        .required("Start time is required"),
    endTime: yup
        .string()
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)")
        .required("End time is required"),
    days: yup
        .array()
        .of(dayOfWeekSchema.required()) // <--- required here
        .min(1, "At least one day is required")
        .required()
        .default([]),
});

// Document validation
export const documentValidationSchema: yup.ObjectSchema<DocumentDTO> = yup.object({
    type: yup.string().required("Document type is required"),
    url: yup.string().required("Document URL is required"),
    uploadedAt: yup.string().required(),
});

// Main validation schema
export const createEmployeeValidationSchema = yup.object({
    name: yup.string()
        .min(3, "Employee must be at least 3 character")
        .trim()
        .matches(/^[A-Za-z]+\.?(?: [A-Za-z]+\.?)*$/, "Name must contain only letters, dots, and single spaces")
        .required("Employee name is required"),
    password: yup
        .string()
        .min(8, "Password must be at least 8 characters")
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            "Password must contain at least one uppercase letter, one lowercase letter, and one number"
        )
        .required("Password is required"),
    employmentType: yup
        .mixed<EmploymentType>()
        .oneOf(Object.values(EMPLOYMENT_TYPE))
        .optional(),
    avatar: yup.string().optional().nullable(),
    salary: yup
        .number()
        .positive("Salary must be positive")
        .required("Salary is required"),
    currency: yup
        .mixed<Currency>()
        .oneOf(Object.values(CURRENCY))
        .required("Currency is required"),
    paymentMode: yup
        .mixed<SalaryPaymentMode>()
        .oneOf(Object.values(SALARY_PAYMENT_MODE))
        .required("Payment mode is required"),
    dateOfJoining: yup
        .date()
        .min(new Date(), "Date cannot be in the past")
        .optional()
        .nullable()
        .transform((value) => (value === "" ? undefined : value)),
    contactInfo: contactInfoValidationSchema.required("Contact info is required"),
    shifts: yup.array().of(shiftValidationSchema).optional().default([]),
    documents: yup.array().of(documentValidationSchema).optional().default([]),
    notes: yup
        .string()
        .optional()
        .nullable()
        .transform((value) => (value === "" ? undefined : value)),
});

// Form values type that matches the schema
export type CreateEmployeeFormValues = {
    name: string;
    password: string;
    employmentType: EmploymentType;
    avatar: string | null;
    salary: number | null;
    currency: Currency;
    paymentMode: SalaryPaymentMode; // auto | manual
    dateOfJoining: Date;
    contactInfo: ContactInfoDTO;
    shifts: ShiftDTO[];
    documents: DocumentDTO[];
    notes?: string | null;
};

// Helper function to transform form values to API payload
export const transformToCreateEmployeePayload = (
    values: CreateEmployeeFormValues
) => {
    const now = new Date().toISOString();
    const payload: CreateEmployeePayload = {
        name: values.name,
        password: values.password,
        salary: values.salary,
        currency: values.currency,
        paymentMode: values.paymentMode,
        employmentType: values.employmentType
            ? EMPLOYMENT_TYPE[values.employmentType as keyof typeof EMPLOYMENT_TYPE]
            : EMPLOYMENT_TYPE.FULL_TIME, // default
        avatar: values.avatar ?? "", // base64 image string
        dateOfJoining: values.dateOfJoining?.toISOString() ?? new Date().toISOString(),
        contactInfo: {
            phone: values.contactInfo.phone,
            email: values.contactInfo.email || "",
            emergencyContact: values.contactInfo.emergencyContact || { name: "", phone: "", relation: "" },
        },
        shifts: values.shifts ?? [],
        documents: (values.documents ?? []).map((doc) => ({
            type: doc.type,
            url: doc.url, // base64 string
            uploadedAt: doc.uploadedAt ?? now,
        })),
        notes: values.notes ?? undefined,
    };

    // Add optional fields only if they have values
    if (values.employmentType) {
        payload.employmentType = values.employmentType;
    }

    if (values.avatar) {
        payload.avatar = values.avatar;
    }

    if (values.dateOfJoining) {
        payload.dateOfJoining = values.dateOfJoining.toISOString();
    }

    if (values.shifts.length > 0) {
        payload.shifts = values.shifts;
    }

    if (values.documents.length > 0) {
        // Add uploadedAt for new documents
        const now = new Date().toISOString();
        payload.documents = values.documents.map(doc => ({
            ...doc,
            uploadedAt: doc.uploadedAt || now,
        }));
    }

    if (values.notes) {
        payload.notes = values.notes;
    }

    return payload;
};