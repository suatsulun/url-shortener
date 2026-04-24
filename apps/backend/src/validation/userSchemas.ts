import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
  email: z.email(),
  password: z
    .string()
    .min(8)
    .regex(
      /(?=.*[A-Za-z])(?=.*\d).{8,}/,
      "Password must contain at least 8 characters, one letter and one number",
    ),
});

export const loginSchema = z.object({
  loginName: z.string().min(1).max(50), // Can be either username or email
  password: z.string().min(1),
});

export const updateProfileSchema = z
  .object({
    username: z
      .string()
      .min(3)
      .max(20)
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      )
      .optional(),
    email: z.email().optional(),
  })
  .refine((data) => data.username || data.email, {
    message: "At least one of username or email must be provided",
  });

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .regex(
      /(?=.*[A-Za-z])(?=.*\d).{8,}/,
      "Password must contain at least 8 characters, one letter and one number",
    ),
});
