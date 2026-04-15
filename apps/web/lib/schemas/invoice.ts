import { z } from 'zod'

const currencySchema = z.enum(['WIRE', 'USDT', 'USDC'])

const invoiceStatusSchema = z.enum([
  'draft',
  'pending',
  'paid',
  'expired',
  'cancelled',
])

export const createInvoiceSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: currencySchema.default('WIRE'),
  description: z.string().min(1).max(500).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  customer_email: z.string().email().optional(),
  customer_name: z.string().min(1).max(200).optional(),
  expires_in_hours: z.number().int().positive().max(8760).default(24), // Max 1 year
})

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>

export const updateInvoiceSchema = z.object({
  description: z.string().min(1).max(500).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  customer_email: z.string().email().optional(),
  customer_name: z.string().min(1).max(200).optional(),
})

export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>

export const listInvoicesSchema = z.object({
  status: invoiceStatusSchema.optional(),
  customer_email: z.string().email().optional(),
  from_date: z.coerce.date().optional(),
  to_date: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type ListInvoicesInput = z.infer<typeof listInvoicesSchema>

export const invoiceSchema = z.object({
  id: z.string().uuid(),
  merchant_id: z.string().uuid(),
  amount: z.number().positive(),
  currency: currencySchema,
  description: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  customer_email: z.string().nullable(),
  customer_name: z.string().nullable(),
  status: invoiceStatusSchema,
  checkout_url: z.string().url(),
  redirect_url: z.string().url().nullable(),
  expires_at: z.coerce.date(),
  paid_at: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export type Invoice = z.infer<typeof invoiceSchema>
