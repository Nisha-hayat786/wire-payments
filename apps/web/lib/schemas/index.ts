// Export all schemas
export * from './invoice'
export * from './payment'
export * from './webhook'
export * from './merchant'
export * from './auth'

// Common pagination schema
import { z } from 'zod'

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(['created_at', 'updated_at', 'amount']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

export type Pagination = z.infer<typeof paginationSchema>

// Common API response wrappers
export const apiResponseSchema = <T>(dataSchema: z.ZodType<T>) => z.object({
  success: z.literal(true),
  data: dataSchema,
  request_id: z.string().uuid(),
})

export const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.string(), z.array(z.string())).optional(),
    request_id: z.string().uuid(),
  }),
})
