import { z } from 'zod'

const paymentStatusSchema = z.enum([
  'pending',
  'confirming',
  'confirmed',
  'failed',
  'expired',
])

export const verifyPaymentSchema = z.object({
  invoice_id: z.string().uuid('Invalid invoice ID'),
  transaction_hash: z.string().min(1, 'Transaction hash required'),
  block_number: z.number().int().positive().optional(),
})

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>

export const paymentSchema = z.object({
  id: z.string().uuid(),
  invoice_id: z.string().uuid(),
  merchant_id: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string(),
  status: paymentStatusSchema,
  transaction_hash: z.string().nullable(),
  block_number: z.number().int().nullable(),
  confirmations: z.number().int().default(0),
  fee_amount: z.number().default(0),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export type Payment = z.infer<typeof paymentSchema>

export const listPaymentsSchema = z.object({
  invoice_id: z.string().uuid().optional(),
  status: paymentStatusSchema.optional(),
  from_date: z.coerce.date().optional(),
  to_date: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type ListPaymentsInput = z.infer<typeof listPaymentsSchema>
