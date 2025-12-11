// src/utils/validators/footer-settings.validator.ts
import { z } from "zod";

export const socialLinkSchema = z.object({
    id: z.string().optional(),
    key: z.string().min(1, "Key is required"),
    label: z.string().nullish(),
    icon: z.string().optional().nullable(),
    url: z.string().url("Must be a valid URL"),
    active: z.boolean().optional(),
    order: z.number()
        .int("Order must be an integer")
        .min(0, "Order cannot be negative")  // Add min constraint
        .nullable()
        .optional(),
});

export type SocialLinkForm = z.infer<typeof socialLinkSchema>;

export const locationSchema = z.object({
    key: z.string().min(1, "Key is required"),
    country: z.string().min(1, "Country is required"),
    region: z.string().nullish(),
    city: z.string().nullish(),
    slug: z.string().nullish(),

    lat: z.coerce
        .number()
        .refine((v) => !isNaN(v), "Latitude required"),

    lng: z.coerce
        .number()
        .refine((v) => !isNaN(v), "Longitude required"),

    active: z.boolean().optional(),

    location: z
        .object({
            type: z.literal("Point"),
            coordinates: z.tuple([z.number(), z.number()]),
        })
        .nullish(),
});

export type LocationForm = z.infer<typeof locationSchema>;

export const FooterSettingsInputSchema = z.object({
    socialLinks: z.array(socialLinkSchema).optional(),
    locations: z.array(locationSchema).optional(),
    version: z.number().optional(),
});
