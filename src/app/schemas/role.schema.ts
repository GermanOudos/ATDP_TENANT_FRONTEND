import { z } from 'zod';

export const roleDtoSchema = z.object({
  idRole: z.number(),
  roleName: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  createdBy: z.string(),
  updatedAt: z.string().nullable(),
  updatedBy: z.string().nullable(),
});

export const createRoleSchema = z.object({
  roleName: z
    .string()
    .min(1, 'Requerido')
    .max(50, 'Máximo 50 caracteres'),
  isActive: z.boolean().default(true),
});

export const updateRoleSchema = createRoleSchema.partial();

export type RoleDto = z.infer<typeof roleDtoSchema>;
export type CreateRoleRequest = z.infer<typeof createRoleSchema>;
export type UpdateRoleRequest = z.infer<typeof updateRoleSchema>;
