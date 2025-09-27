import { z } from "zod";

export const forgotPasswordValidator = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email" })
    .max(254, { message: "Email must be less than 254 characters" }),

  description: z
    .string()
    .trim()
    .min(1, { message: "Description is required" })
    .min(10, { message: "Description must be at least 10 characters" })
    .max(500, { message: "Description must be less than 500 characters" }),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordValidator>;