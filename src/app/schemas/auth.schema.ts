import { z } from 'zod';

export const loginRequestSchema = z.object({
  username: z.string().min(1, 'El usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const authResponseSchema = z.object({
  userType: z.string(),
  userId: z.number(),
  username: z.string(),
  roleName: z.string().nullable(),
  fullName: z.string().nullable(),
  tenantId: z.number().nullable(),
  tenantName: z.string().nullable(),
  tenantLogo: z.string().nullable(),
  mustChangePassword: z.boolean(),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
