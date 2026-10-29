import * as zod from "zod";

// Login only checks that the fields are filled in. Password-strength rules
// belong to signup / change-password; applying them here would reject valid
// accounts (for example older passwords) before the server even sees them.
export const loginSchema = zod.object({
  email: zod
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email"),

  password: zod.string().min(1, "Password is required"),
});
