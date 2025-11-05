import { z } from "zod";

import {
    EMPLOYEE_ROLE,
    EMPLOYEE_SUB_ROLE,
    EMPLOYEE_STATUS,
    EMPLOYMENT_TYPE,
    EMPLOYEE_POSITIONS,
} from "@/constants/employee.const";

import { ObjectIdString } from "@/types/employee.types";

/**
 * Create employee payload validator
 *
 * Notes:
 * - Matches the updated CreateEmployeePayload in types: optional companyId, avatar, employmentType, salary*, etc.
 * - contactInfo requires at least email and phone (kept from previous form expectations).
 * - documents/shifts/permissions/performance accept flexible shapes; you can replace z.any() with stricter schemas later.
 */

export const createEmployeeSchema = z.object({
    companyId: z
        .string()
        .regex(/^[a-fA-F0-9]{24}$/, "Invalid Company ID")
        .optional()
        .transform((s) => s || undefined) as z.ZodType<ObjectIdString | undefined>,

    role: z.nativeEnum(EMPLOYEE_ROLE, { message: "Role is required" }),

    subRole: z.nativeEnum(EMPLOYEE_SUB_ROLE, { message: "Sub-role is required" }),

    // position is one of flattened EMPLOYEE_POSITIONS values
    position: z.enum(Object.values(EMPLOYEE_POSITIONS).flat() as string[]),

    status: z.nativeEnum(EMPLOYEE_STATUS).default("active"),

    employmentType: z.nativeEnum(EMPLOYMENT_TYPE).optional(),

    department: z.string().max(100).optional(),

    salary: z
        .number()
        .positive("Salary must be a positive number")
        .optional(),

    salaryCurrency: z.string().length(3).optional(),

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
        // keep email and phone required for create form UX
        email: z.string().email("Valid email required"),
        phone: z.string().min(5, "Phone number required"),
        // optional fields that the model supports
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        emergencyContact: z
            .object({
                name: z.string().min(1),
                phone: z.string().min(5),
                relation: z.string().min(1),
            })
            .optional(),
    }),

    // flexible placeholders — replace with strict schemas when available
    permissions: z.array(z.string()).optional(),
    shifts: z.any().optional(),
    performance: z.any().optional(),
    documents: z.any().optional(),
    notes: z.string().optional(),

    avatar: z
        .string()
        .regex(/^[a-fA-F0-9]{24}$/, "Invalid Asset ID")
        .optional()
        .transform((s) => s || undefined) as z.ZodType<ObjectIdString | undefined>,
});

// cross-field refinement: joining <= leaving when both present
export const createEmployeeSchemaWithDates = createEmployeeSchema.superRefine(
    (data, ctx) => {
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

        // companyId / role validation: mirrors model validator
        if (data.role === EMPLOYEE_ROLE.ASSISTANT && !data.companyId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "companyId is required for assistants",
                path: ["companyId"],
            });
        }
        if (data.role === EMPLOYEE_ROLE.SUPPORT && data.companyId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "companyId must be empty for support staff",
                path: ["companyId"],
            });
        }
    }
);

export type CreateEmployeeSchema = z.infer<typeof createEmployeeSchema>;
