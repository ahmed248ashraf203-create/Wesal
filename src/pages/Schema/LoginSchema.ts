import * as zod from "zod";

export const loginSchema = zod.object({
  email: zod
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a  email"),

  password: zod
    .string()

    .regex(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
      "Please enter a correct  Password",
    ),
});
