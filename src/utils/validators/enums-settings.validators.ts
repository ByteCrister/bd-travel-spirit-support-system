// enums-settings.validators.ts
import * as z from "zod";

export const enumValueSchema = z.object({
    key: z.string().min(3, "Key is required"),
    label: z.string().min(3, "Label is required"),
    value: z.union([z.string(), z.number()]),
    description: z.string().optional().nullable(),
    active: z.boolean().optional(),
});

export type EnumValueFormSchema = z.infer<typeof enumValueSchema>;

export const enumGroupSchema = z.object({
    _id: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional().nullable(),
    values: z.array(enumValueSchema).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
});

export type EnumGroupFormSchema = z.infer<typeof enumGroupSchema>;
