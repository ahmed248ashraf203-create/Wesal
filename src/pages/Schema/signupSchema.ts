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
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        "Password must contain an uppercase letter",
      ),
    rePassword: zod.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.rePassword, {
    error: "Passwords do not match",
    path: ["rePassword"],
  });
