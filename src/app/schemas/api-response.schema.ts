import { z, ZodTypeAny } from 'zod';

export const baseResponseSchema = <T extends ZodTypeAny>(dataSchema: T) =>
  z.object({
    ok: z.boolean(),
    data: dataSchema.nullable().optional(),
    error: z.string().nullable().optional(),
    codeError: z.string().nullable().optional(),
    validationErrors: z.array(z.string()).default([]),
    warning: z.string().nullable().optional(),
  });

export const paginatedResponseSchema = <T extends ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    totalRecords: z.number(),
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
  });

export type BaseResponse<T> = {
  ok: boolean;
  data?: T | null;
  error?: string | null;
  codeError?: string | null;
  validationErrors: string[];
  warning?: string | null;
};

export type PaginatedResponse<T> = {
  data: T[];
  totalRecords: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export interface PaginationParams {
  page: number;
  pageSize: number;
  searchTerm?: string;
  includeDeleted?: boolean;
}
