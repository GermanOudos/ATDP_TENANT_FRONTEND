import { z } from 'zod';

const fieldRuleSchema = z.object({
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  pattern: z.string().optional(),
  required: z.boolean().optional(),
});

export const validationRulesSchema = z.object({
  tenant: z
    .object({
      identificationNumber: fieldRuleSchema.optional(),
      businessName: fieldRuleSchema.optional(),
      dbHost: fieldRuleSchema.optional(),
      dbName: fieldRuleSchema.optional(),
      dbUser: fieldRuleSchema.optional(),
      dbPassword: fieldRuleSchema.optional(),
    })
    .optional(),
  user: z
    .object({
      username: fieldRuleSchema.optional(),
      fullName: fieldRuleSchema.optional(),
      password: fieldRuleSchema.optional(),
    })
    .optional(),
  apiCredentials: z
    .object({
      apiUsername: fieldRuleSchema.optional(),
      apiPassword: fieldRuleSchema.optional(),
    })
    .optional(),
  tenantSecret: z
    .object({
      customSecret: fieldRuleSchema.optional(),
    })
    .optional(),
  role: z
    .object({
      roleName: fieldRuleSchema.optional(),
    })
    .optional(),
  menu: z
    .object({
      menuName: fieldRuleSchema.optional(),
    })
    .optional(),
});

export type ValidationRules = z.infer<typeof validationRulesSchema>;
