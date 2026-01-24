import * as yup from "yup";
import {
    UpdateEmployeePayload,
    ShiftDTO,
    DocumentDTO,
    ContactInfoDTO,
} from "@/types/employee.types";

import {
    EMPLOYEE_STATUS,
    EMPLOYMENT_TYPE,
    SALARY_PAYMENT_MODE,
} from "@/constants/employee.const";
import { CURRENCY } from "@/constants/tour.const";
import { showToast } from "@/components/global/showToast";
import { contactInfoValidationSchema, documentValidationSchema, shiftValidationSchema } from "./employee.validator";

/* ------------------------------------------------------------------
  Helper: show yup errors nicely
------------------------------------------------------------------- */
const showYupError = (error: unknown) => {
    if (error instanceof yup.ValidationError) {
        error.errors.forEach((msg) => showToast.error(msg));
    } else {
        showToast.error("Invalid input");
    }
};

/* ------------------------------------------------------------------
  Date helpers
------------------------------------------------------------------- */
/**
 * Parse a value (string | Date | number) into a Date object.
 * Returns null if the value is not a valid date.
 */
const parseToDate = (value: unknown): Date | null => {
    if (value === undefined || value === null || value === "") return null;
    if (value instanceof Date) {
        return isNaN(value.getTime()) ? null : value;
    }
    if (typeof value === "number") {
        const d = new Date(value);
        return isNaN(d.getTime()) ? null : d;
    }
    if (typeof value === "string") {
        const d = new Date(value);
        return isNaN(d.getTime()) ? null : d;
    }
    return null;
};

/* ------------------------------------------------------------------
  MAIN VALIDATOR
------------------------------------------------------------------- */
export const validateUpdateEmployeePayload = async (
    payload: UpdateEmployeePayload
): Promise<boolean> => {
    let hasError = false;

    /* ---------------- ID ---------------- */
    if (!payload.id) {
        showToast.error("Employee ID is required");
        return false;
    }

    /* ---------------- Name ---------------- */
    if (payload.name !== undefined) {
        try {
            await yup
                .string()
                .trim()
                .min(3, "Employee name must be at least 3 characters")
                .matches(
                    /^[A-Za-z]+(?: [A-Za-z]+)*$/,
                    "Name must contain only letters and single spaces"
                )
                .required()
                .validate(payload.name);
        } catch (err) {
            showYupError(err);
            hasError = true;
        }
    }

    /* ---------------- Employment Type ---------------- */
    if (payload.employmentType) {
        if (!Object.values(EMPLOYMENT_TYPE).includes(payload.employmentType)) {
            showToast.error("Invalid employment type");
            hasError = true;
        }
    }

    /* ---------------- Status ---------------- */
    if (payload.status) {
        if (!Object.values(EMPLOYEE_STATUS).includes(payload.status)) {
            showToast.error("Invalid employee status");
            hasError = true;
        }
    }

    /* ---------------- Salary ---------------- */
    if (payload.salary !== undefined) {
        try {
            await yup.number().positive("Salary must be positive").validate(payload.salary);
        } catch (err) {
            showYupError(err);
            hasError = true;
        }
    }

    /* ---------------- Currency ---------------- */
    if (payload.currency) {
        if (!Object.values(CURRENCY).includes(payload.currency as CURRENCY)) {
            showToast.error("Invalid currency");
            hasError = true;
        }
    }
     /* ---------------- Payment mode ---------------- */
     if (payload.paymentMode) {
        if (!Object.values(SALARY_PAYMENT_MODE).includes(payload.paymentMode as SALARY_PAYMENT_MODE)) {
            showToast.error("Invalid payment mode");
            hasError = true;
        }
    }

    /* ---------------- Dates (joining may be future; leaving disallowed when joining is future) ---------------- */
    const dojRaw = payload.dateOfJoining;
    const dolRaw = payload.dateOfLeaving;

    const doj = parseToDate(dojRaw);
    const dol = parseToDate(dolRaw);

    // Validate dateOfJoining if provided
    if (dojRaw !== undefined) {
        if (doj === null) {
            showToast.error("Invalid joining date format");
            hasError = true;
        }
        // joining may be in the future — no further restriction here
    }

    // Validate dateOfLeaving if provided
    if (dolRaw !== undefined) {
        if (dol === null) {
            showToast.error("Invalid leaving date format");
            hasError = true;
        } else {
            // If joining date is provided and valid, ensure leaving >= joining
            if (doj !== null) {
                if (dol.getTime() < doj.getTime()) {
                    showToast.error("Leaving date cannot be before joining date");
                    hasError = true;
                }

                // If joining is in the future, disallow providing a leaving date now
                const now = new Date();
                if (doj.getTime() > now.getTime()) {
                    showToast.error("Cannot set leaving date when joining date is in the future");
                    hasError = true;
                }
            }
            // If joining date is not provided but leaving is provided, we allow it (no relative check).
        }
    }

    /* ---------------- Contact Info ---------------- */
    if (payload.contactInfo) {
        try {
            await contactInfoValidationSchema.validate(payload.contactInfo as ContactInfoDTO, {
                abortEarly: false,
            });
        } catch (err) {
            showYupError(err);
            hasError = true;
        }
    }

    /* ---------------- Shifts ---------------- */
    if (payload.shifts) {
        for (let i = 0; i < payload.shifts.length; i++) {
            try {
                await shiftValidationSchema.validate(payload.shifts[i] as ShiftDTO, {
                    abortEarly: false,
                });
            } catch (err) {
                showYupError(err);
                hasError = true;
            }
        }
    }

    /* ---------------- Documents ---------------- */
    if (payload.documents) {
        for (let i = 0; i < payload.documents.length; i++) {
            try {
                await documentValidationSchema.validate(payload.documents[i] as DocumentDTO, {
                    abortEarly: false,
                });
            } catch (err) {
                showYupError(err);
                hasError = true;
            }
        }
    }

    /* ---------------- Notes ---------------- */
    if (payload.notes !== undefined) {
        if (typeof payload.notes !== "string") {
            showToast.error("Notes must be a string");
            hasError = true;
        }
    }

    return !hasError;
};