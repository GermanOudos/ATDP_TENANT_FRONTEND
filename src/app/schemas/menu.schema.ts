import { z } from 'zod';

export const menuDtoSchema = z.object({
  idMenu: z.number(),
  idMenuPrimary: z.number().nullable(),
  menuName: z.string(),
  url: z.string().nullable(),
  onClick: z.string().nullable(),
  classImage: z.string().nullable(),
  order: z.number(),
  visible: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.string(),
  createdBy: z.string(),
  updatedAt: z.string().nullable(),
  updatedBy: z.string().nullable(),
});

export const createMenuSchema = z.object({
  idMenuPrimary: z.number().nullable().optional(),
  menuName: z
    .string()
    .min(1, 'Requerido')
    .max(50, 'Máximo 50 caracteres'),
  url: z.string().max(255).optional().or(z.literal('')),
  onClick: z.string().max(500).optional().or(z.literal('')),
  classImage: z.string().max(100).optional().or(z.literal('')),
  order: z.coerce.number().int().min(0).default(0),
  visible: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

export const updateMenuSchema = createMenuSchema.partial();

export interface MenuTreeNode extends z.infer<typeof menuDtoSchema> {
  children: MenuTreeNode[];
}

export type MenuDto = z.infer<typeof menuDtoSchema>;
export type CreateMenuRequest = z.infer<typeof createMenuSchema>;
export type UpdateMenuRequest = z.infer<typeof updateMenuSchema>;
