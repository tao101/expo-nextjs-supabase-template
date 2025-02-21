import { z } from "zod";

export const firstNameSchema = z.string().min(1).max(50);
export const lastNameSchema = z.string().min(1).max(50);
export const emailSchema = z.string().trim().toLowerCase().email();
export const passwordSchema = z
  .string()
  .min(8)
  .max(50)
  .refine(
    (val) =>
      /[A-Z]/.test(val) &&
      /[a-z]/.test(val) &&
      /\d/.test(val) &&
      /[!@#$%^&*]/.test(val),
    {
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    }
  );

export const signupSchema = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export type SignupSchema = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const otpSchema = z.string().length(6).regex(/^\d+$/, {
  message: "OTP must be 6 digits",
});

export type OtpSchema = z.infer<typeof otpSchema>;
