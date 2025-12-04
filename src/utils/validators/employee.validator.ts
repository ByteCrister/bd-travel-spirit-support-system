import { z } from "zod";

import { EMPLOYEE_ROLE, EMPLOYMENT_TYPE } from "@/constants/employee.const";

const RoleEnum = z.enum(Object.values(EMPLOYEE_ROLE) as [string, ...string[]]);
const EmploymentEnum = z.enum(
    Object.values(EMPLOYMENT_TYPE) as [string, ...string[]]
);
const BD_PHONE = /^(?:\+?88)?01[3-9]\d{8}$/;

const DocumentSchema = z.object({
    type: z.string(),
    url: z.string(), // or z.string().regex(/^[a-fA-F0-9]{24}$/) if you store ObjectId
    uploadedAt: z
        .string()
        .refine((d) => !Number.isNaN(Date.parse(d)), "Invalid date"),
});

export const createEmployeeSchema = z.object({
    password: z.string().min(8, "Password too short"),
    role: RoleEnum,
    employmentType: EmploymentEnum.optional(),
    salary: z.number().nonnegative("Salary must be >= 0"),
    currency: z
        .string()
        .length(3)
        .transform((s) => s.toUpperCase()),
    dateOfJoining: z
        .string()
        .optional()
        .refine((d) => !d || !Number.isNaN(Date.parse(d)), {
            message: "Invalid date",
        }),
    contactInfo: z.object({
        email: z.string().email().optional(),
        phone: z.string().regex(BD_PHONE, "Invalid Bangladesh phone"),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        emergencyContact: z
            .object({
                name: z.string().min(1),
                phone: z.string().regex(BD_PHONE, "Invalid Bangladesh phone"),
                relation: z.string().min(1),
            })
            .optional(),
    }),
    shifts: z
        .array(
            z.object({
                startTime: z
                    .string()
                    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time"),
                endTime: z
                    .string()
                    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time"),
                days: z.array(
                    z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])
                ),
            })
        )
        .optional(),
    documents: z.array(DocumentSchema).optional(),
    notes: z.string().optional(),
    avatar: z
        .string()
        .regex(/^[a-fA-F0-9]{24}$/, "Invalid Asset ID")
        .optional(),
});
