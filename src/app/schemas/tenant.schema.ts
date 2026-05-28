import { z } from 'zod';

const IDENTIFICATION_PATTERN = /^[a-zA-Z]{2}\d{5}[a-zA-Z]$/;
const BUSINESS_NAME_PATTERN = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s.,\-&()]+$/;
const DB_HOST_PATTERN = /^[a-zA-Z0-9.\-_:]+$/;
const DB_IDENTIFIER_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_\-]*$/;
const DB_USER_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_.\-]*$/;
const API_USERNAME_PATTERN = /^[a-zA-Z0-9.\-_]+$/;

export const tenantDtoSchema = z.object({
  id: z.number(),
  identificationNumber: z.string(),
  businessName: z.string(),
  logo: z.string().nullable(),
  isActive: z.boolean(),
  isDeleted: z.boolean(),
  deletedAt: z.string().nullable(),
  deletedBy: z.string().nullable(),
  hasApiCredentials: z.boolean(),
  tenantSecretIsActive: z.boolean(),
  tenantSecretMasked: z.string().nullable(),
  tenantSecretCreatedAt: z.string().nullable(),
  tenantSecretRegeneratedAt: z.string().nullable(),
  tsaPrincipalConfigured: z.boolean(),
  tsaContingencyConfigured: z.boolean(),
  createdAt: z.string(),
  createdBy: z.string(),
  updatedAt: z.string().nullable(),
  updatedBy: z.string().nullable(),
});

export const createTenantSchema = z.object({
  identificationNumber: z
    .string()
    .min(1, 'Requerido')
    .max(50, 'Máximo 50 caracteres')
    .regex(IDENTIFICATION_PATTERN, 'Formato inválido. Ej: bs00105f'),
  businessName: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(255, 'Máximo 255 caracteres')
    .regex(BUSINESS_NAME_PATTERN, 'Solo letras, números y: . , - & ( )'),
  dbHost: z
    .string()
    .min(1, 'Requerido')
    .max(255, 'Máximo 255 caracteres')
    .regex(DB_HOST_PATTERN, 'Formato inválido'),
  dbName: z
    .string()
    .min(1, 'Requerido')
    .max(100, 'Máximo 100 caracteres')
    .regex(DB_IDENTIFIER_PATTERN, 'Formato inválido'),
  dbUser: z
    .string()
    .min(1, 'Requerido')
    .max(100, 'Máximo 100 caracteres')
    .regex(DB_USER_PATTERN, 'Formato inválido'),
  dbPassword: z.string().min(8, 'Mínimo 8 caracteres'),
  logDbHost: z.string().max(255).regex(DB_HOST_PATTERN, 'Formato inválido').optional().or(z.literal('')),
  logDbName: z.string().max(100).regex(DB_IDENTIFIER_PATTERN, 'Formato inválido').optional().or(z.literal('')),
  logDbPort: z.coerce.number().int().min(1).max(65535).optional().nullable(),
  createdBy: z.string().min(1, 'Requerido').optional(),
  creator: z.string().min(1, 'Requerido').optional(),
});

export const updateTenantSchema = createTenantSchema
  .omit({ identificationNumber: true })
  .partial();

export const setApiCredentialsSchema = z.object({
  apiUsername: z
    .string()
    .min(4, 'Mínimo 4 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .regex(API_USERNAME_PATTERN, 'Solo letras, números, guiones, puntos y guiones bajos'),
  apiPassword: z
    .string()
    .min(12, 'Mínimo 12 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .regex(/[^a-zA-Z0-9]/, 'Debe contener al menos un carácter especial'),
});

export const generateSecretSchema = z.object({
  adminPassword: z.string().min(1, 'La contraseña del administrador es requerida'),
  customSecret: z
    .string()
    .min(32, 'Mínimo 32 caracteres')
    .regex(/[A-Z]/, 'Debe contener mayúscula')
    .regex(/[a-z]/, 'Debe contener minúscula')
    .regex(/[0-9]/, 'Debe contener número')
    .regex(/[^a-zA-Z0-9]/, 'Debe contener carácter especial')
    .optional()
    .or(z.literal('')),
});

export const revokeSecretSchema = z.object({
  adminPassword: z.string().min(1, 'La contraseña del administrador es requerida'),
});

export const setTsaConfigSchema = z
  .object({
    tsaPrincipalUrl: z.string().max(500).url('URL inválida').optional().or(z.literal('')),
    tsaPrincipalUsername: z.string().max(150).optional().or(z.literal('')),
    tsaPrincipalPassword: z.string().max(255).optional().or(z.literal('')),
    tsaContingencyUrl: z.string().max(500).url('URL inválida').optional().or(z.literal('')),
    tsaContingencyUsername: z.string().max(150).optional().or(z.literal('')),
    tsaContingencyPassword: z.string().max(255).optional().or(z.literal('')),
  })
  .refine(
    (d) =>
      !d.tsaPrincipalUrl ||
      !d.tsaContingencyUrl ||
      d.tsaPrincipalUrl !== d.tsaContingencyUrl,
    {
      message: 'El TSA principal y de contingencia no pueden tener la misma URL',
      path: ['tsaContingencyUrl'],
    }
  );

export const tsaConfigStatusSchema = z.object({
  tsaPrincipalConfigured: z.boolean(),
  tsaContingencyConfigured: z.boolean(),
});

export type TenantDto = z.infer<typeof tenantDtoSchema>;
export type CreateTenantRequest = z.infer<typeof createTenantSchema>;
export type UpdateTenantRequest = z.infer<typeof updateTenantSchema>;
export type SetApiCredentialsRequest = z.infer<typeof setApiCredentialsSchema>;
export type GenerateSecretRequest = z.infer<typeof generateSecretSchema>;
export type RevokeSecretRequest = z.infer<typeof revokeSecretSchema>;
export type SetTsaConfigRequest = z.infer<typeof setTsaConfigSchema>;
export type TsaConfigStatus = z.infer<typeof tsaConfigStatusSchema>;
