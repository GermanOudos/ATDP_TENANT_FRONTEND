import { z } from 'zod';

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const BLOCKED_EMAIL_DOMAINS = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com'];

export const userDtoSchema = z.object({
  id: z.number(),
  username: z.string(),
  fullName: z.string(),
  isActive: z.boolean(),
  isDeleted: z.boolean(),
  deletedAt: z.string().nullable(),
  deletedBy: z.string().nullable(),
  createdAt: z.string(),
  createdBy: z.string(),
  updatedAt: z.string().nullable(),
  updatedBy: z.string().nullable(),
});

export const createUserSchema = z.object({
  username: z
    .string()
    .min(1, 'Requerido')
    .email('Debe ser un correo válido')
    .refine(
      (email) => !BLOCKED_EMAIL_DOMAINS.some((d) => email.endsWith(`@${d}`)),
      'No se permiten correos personales (Gmail, Hotmail, Yahoo, Outlook)'
    ),
  fullName: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(PASSWORD_PATTERN, 'Debe tener mayúscula, minúscula y número'),
  isActive: z.boolean().default(true),
  createdBy: z.string().optional(),
});

export const updateUserSchema = z.object({
  username: z
    .string()
    .email('Debe ser un correo válido')
    .refine(
      (email) => !BLOCKED_EMAIL_DOMAINS.some((d) => email.endsWith(`@${d}`)),
      'No se permiten correos personales'
    )
    .optional(),
  fullName: z.string().min(3).max(100).optional(),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(PASSWORD_PATTERN, 'Debe tener mayúscula, minúscula y número')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean().optional(),
});

export type UserDto = z.infer<typeof userDtoSchema>;
export type CreateUserRequest = z.infer<typeof createUserSchema>;
export type UpdateUserRequest = z.infer<typeof updateUserSchema>;
