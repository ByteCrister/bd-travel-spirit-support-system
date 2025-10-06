import { z } from "zod";

import {
    EMPLOYEE_ROLE,
    EMPLOYEE_SUB_ROLE,
    EMPLOYEE_STATUS,
    EMPLOYMENT_TYPE,
    EMPLOYEE_POSITIONS,
} from "@/constants/employee.const";

import { ObjectIdString } from "@/types/employee.types";

export const createEmployeeSchema = z.object({
    userId: z
        .string()
        .regex(/^[a-fA-F0-9]{24}$/, "Invalid User ID")
        .transform((s) => s) as z.ZodType<ObjectIdString>,

    role: z.nativeEnum(EMPLOYEE_ROLE, { message: "Role is required" }),

    subRole: z.nativeEnum(EMPLOYEE_SUB_ROLE, { message: "Sub-role is required" }),

    position: z.enum(Object.values(EMPLOYEE_POSITIONS).flat() as string[]),

    status: z.nativeEnum(EMPLOYEE_STATUS).default("active"),

    employmentType: z.nativeEnum(EMPLOYMENT_TYPE, { message: "Employment type is required" }),

    department: z.string().optional(),

    salary: z.number().positive("Salary must be a positive number").optional(),

    salaryCurrency: z.string().optional(),

    dateOfJoining: z
        .string()
        .optional()
        .refine((d) => !d || !Number.isNaN(Date.parse(d)), {
            message: "Date of joining must be a valid date",
        }),

    dateOfLeaving: z
        .string()
        .optional()
        .refine((d) => !d || !Number.isNaN(Date.parse(d)), {
            message: "Date of leaving must be a valid date",
        }),

    contactInfo: z.object({
        email: z.string().email("Valid email required"),
        phone: z.string().min(5, "Phone number required"),
    }),

    permissions: z.any().optional(),

    shifts: z.any().optional(),

    performance: z.any().optional(),

    documents: z.any().optional(),

    notes: z.string().optional(),
});

// cross-field refinement: joining <= leaving when both present
export const createEmployeeSchemaWithDates = createEmployeeSchema.superRefine((data, ctx) => {
    if (data.dateOfJoining && data.dateOfLeaving) {
        const join = Date.parse(data.dateOfJoining);
        const leave = Date.parse(data.dateOfLeaving);
        if (isNaN(join) || isNaN(leave)) return;
        if (join > leave) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Date of joining must be before or equal to date of leaving",
                path: ["dateOfJoining"],
            });
        }
    }
});

export type CreateEmployeeSchema = z.infer<typeof createEmployeeSchema>;
