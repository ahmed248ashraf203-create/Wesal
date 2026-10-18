import * as zod from "zod";

export const signupSchema = zod
  .object({
    name: zod
      .string()
      .trim()
      .min(3, "name must be at least 3 characters")
      .max(20, "name must not exceed 20 characters"),
    username: zod
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must not exceed 20 characters"),

    email: zod
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Please enter a valid email"),

    dateOfBirth: zod.string().min(1, "Date of birth is required"),

    gender: zod.string().min(1, "Please select your gender"),

    password: zod
      .string()
      .min(8, "Password must be at least 8 characters long.")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
      .regex(/[0-9]/, "Password must contain at least one number.")
      .regex(
        /[#?!@$%^&*-]/,
        "Password must contain at least one special character (#?!@$%^&*-).",
      ),
    rePassword: zod.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.rePassword, {
    error: "Passwords do not match",
    path: ["rePassword"],
  });
