// employee.validator.ts
import * as yup from "yup";
import {
    EMPLOYMENT_TYPE,
    EmploymentType,
} from "@/constants/employee.const";
import { CURRENCY, Currency } from "@/constants/tour.const";
import { DayOfWeek, EmergencyContactDTO, ContactInfoDTO, ShiftDTO, DocumentDTO } from "@/types/employee.types";
import { Types } from "mongoose";

const objectIdSchema = yup
    .string()
    .test("is-object-id", "Invalid employee id", (value) =>
        value ? Types.ObjectId.isValid(value) : false
    );

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
        .matches(/^[A-Za-z]+(?: [A-Za-z]+)*$/, "Name must contain only letters A to Z and single spaces")
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
export const updateEmployeeServerSchema = yup.object({
    id: objectIdSchema.required("Employee ID is required"),
    name: yup.string()
        .min(3, "Employee must be at least 3 character")
        .trim()
        .matches(/^[A-Za-z]+(?: [A-Za-z]+)*$/, "Name must contain only letters A to Z and single spaces")
        .required("Employee name is required"),
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
    /**
  * dateOfJoining
  * - Accepts Date | ISO string | timestamp
  * - Optional and nullable
  * - No restriction on being in the future (joining may be planned)
  */
    dateOfJoining: yup
        .date()
        .optional()
        .nullable()
        .transform((value, originalValue) => (originalValue === "" ? undefined : value))
        .typeError("Invalid joining date")
        .test(
            "not-in-past",
            "Joining date cannot be in the past",
            function (value) {
                if (!value) return true; // not provided -> ok
                const today = new Date();
                today.setHours(0, 0, 0, 0); // normalize to start of day
                return value.getTime() >= today.getTime();
            }
        ),

    /**
     * dateOfLeaving
     * - Accepts Date | ISO string | timestamp
     * - Optional and nullable
     * - If provided, must not be before dateOfJoining (when dateOfJoining is provided and valid)
     * - If dateOfJoining is in the future, providing dateOfLeaving is disallowed
     */
    dateOfLeaving: yup
        .date()
        .optional()
        .nullable()
        .transform((value, originalValue) => (originalValue === "" ? undefined : value))
        .typeError("Invalid leaving date")
        .test(
            "leaving-after-joining",
            "Leaving date cannot be before joining date",
            function (value) {
                if (!value) return true; // not provided -> ok
                const { dateOfJoining } = this.parent as { dateOfJoining?: Date | string | null };
                if (!dateOfJoining) return true; // no joining provided -> cannot compare
                const doj = dateOfJoining instanceof Date ? dateOfJoining : new Date(dateOfJoining);
                if (isNaN(doj.getTime())) return true; // invalid joining handled by its own schema
                return value.getTime() >= doj.getTime();
            }
        )
        .test(
            "no-leaving-if-joining-future",
            "Cannot set leaving date when joining date is in the future",
            function (value) {
                if (!value) return true; // leaving not provided -> ok
                const { dateOfJoining } = this.parent as { dateOfJoining?: Date | string | null };
                if (!dateOfJoining) return true; // no joining provided -> ok
                const doj = dateOfJoining instanceof Date ? dateOfJoining : new Date(dateOfJoining);
                if (isNaN(doj.getTime())) return true; // invalid joining handled elsewhere
                const now = new Date();
                return doj.getTime() <= now.getTime(); // if joining is in future -> fail
            }
        ),
    contactInfo: contactInfoValidationSchema.required("Contact info is required"),
    shifts: yup.array().of(shiftValidationSchema).optional().default([]),
    documents: yup.array().of(documentValidationSchema).optional().default([]),
    notes: yup
        .string()
        .optional()
        .nullable()
        .transform((value) => (value === "" ? undefined : value)),
});
