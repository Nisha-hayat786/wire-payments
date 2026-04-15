import { describe, it, expect } from 'vitest'
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  listInvoicesSchema,
  invoiceSchema,
  type CreateInvoiceInput,
  type UpdateInvoiceInput,
  type ListInvoicesInput,
  type Invoice,
} from './invoice'

describe('Invoice Schemas', () => {
  describe('createInvoiceSchema', () => {
    it('should validate a valid invoice with all fields', () => {
      const input = {
        amount: 100.5,
        currency: 'USDT',
        description: 'Test invoice',
        customer_email: 'test@example.com',
        customer_name: 'John Doe',
        expires_in_hours: 48,
      }

      const result = createInvoiceSchema.safeParse(input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.amount).toBe(100.5)
        expect(result.data.currency).toBe('USDT')
        expect(result.data.description).toBe('Test invoice')
        expect(result.data.customer_email).toBe('test@example.com')
        expect(result.data.customer_name).toBe('John Doe')
        expect(result.data.expires_in_hours).toBe(48)
      }
    })

    it('should validate a minimal invoice with defaults', () => {
      const input = {
        amount: 50,
      }

      const result = createInvoiceSchema.safeParse(input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.amount).toBe(50)
        expect(result.data.currency).toBe('WIRE') // default
        expect(result.data.expires_in_hours).toBe(24) // default
      }
    })

    it('should reject invalid amount', () => {
      const input = {
        amount: -10,
      }

      const result = createInvoiceSchema.safeParse(input)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('positive')
      }
    })

    it('should reject zero amount', () => {
      const input = {
        amount: 0,
      }

      const result = createInvoiceSchema.safeParse(input)

      expect(result.success).toBe(false)
    })

    it('should reject invalid currency', () => {
      const input = {
        amount: 100,
        currency: 'INVALID',
      }

      const result = createInvoiceSchema.safeParse(input)

      expect(result.success).toBe(false)
    })

    it('should accept valid currencies', () => {
      const currencies = ['WIRE', 'USDT', 'USDC'] as const

      currencies.forEach((currency) => {
        const input = { amount: 100, currency }
        const result = createInvoiceSchema.safeParse(input)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid email', () => {
      const input = {
        amount: 100,
        customer_email: 'not-an-email',
      }

      const result = createInvoiceSchema.safeParse(input)

      expect(result.success).toBe(false)
    })

    it('should reject description that is too long', () => {
      const input = {
        amount: 100,
        description: 'a'.repeat(501), // exceeds 500
      }

      const result = createInvoiceSchema.safeParse(input)

      expect(result.success).toBe(false)
    })

    it('should reject customer_name that is too long', () => {
      const input = {
        amount: 100,
        customer_name: 'a'.repeat(201), // exceeds 200
      }

      const result = createInvoiceSchema.safeParse(input)

      expect(result.success).toBe(false)
    })

    it('should reject expires_in_hours that exceeds maximum', () => {
      const input = {
        amount: 100,
        expires_in_hours: 8761, // exceeds 8760 (1 year)
      }

      const result = createInvoiceSchema.safeParse(input)

      expect(result.success).toBe(false)
    })

    it('should accept maximum expires_in_hours', () => {
      const input = {
        amount: 100,
        expires_in_hours: 8760,
      }

      const result = createInvoiceSchema.safeParse(input)

      expect(result.success).toBe(true)
    })

    it('should reject negative expires_in_hours', () => {
      const input = {
        amount: 100,
        expires_in_hours: -10,
      }

      const result = createInvoiceSchema.safeParse(input)

      expect(result.success).toBe(false)
    })
  })

  describe('updateInvoiceSchema', () => {
    it('should validate valid updates', () => {
      const input = {
        description: 'Updated description',
        customer_email: 'newemail@example.com',
        customer_name: 'Jane Doe',
      }

      const result = updateInvoiceSchema.safeParse(input)

      expect(result.success).toBe(true)
    })

    it('should allow empty updates', () => {
      const input = {}

      const result = updateInvoiceSchema.safeParse(input)

      expect(result.success).toBe(true)
    })

    it('should reject invalid email in update', () => {
      const input = {
        customer_email: 'invalid-email',
      }

      const result = updateInvoiceSchema.safeParse(input)

      expect(result.success).toBe(false)
    })

    it('should ignore unknown fields in update', () => {
      const input = {
        description: 'Updated description',
      }

      const result = updateInvoiceSchema.safeParse(input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.description).toBe('Updated description')
      }
    })
  })

  describe('listInvoicesSchema', () => {
    it('should validate list query with defaults', () => {
      const input = {}

      const result = listInvoicesSchema.safeParse(input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1) // default
        expect(result.data.limit).toBe(20) // default
      }
    })

    it('should validate list query with filters', () => {
      const input = {
        status: 'paid',
        customer_email: 'customer@example.com',
        from_date: '2024-01-01',
        to_date: '2024-12-31',
        page: 2,
        limit: 50,
      }

      const result = listInvoicesSchema.safeParse(input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe('paid')
        expect(result.data.page).toBe(2)
        expect(result.data.limit).toBe(50)
      }
    })

    it('should reject invalid status', () => {
      const input = {
        status: 'invalid-status',
      }

      const result = listInvoicesSchema.safeParse(input)

      expect(result.success).toBe(false)
    })

    it('should accept all valid statuses', () => {
      const statuses = ['draft', 'pending', 'paid', 'expired', 'cancelled'] as const

      statuses.forEach((status) => {
        const input = { status }
        const result = listInvoicesSchema.safeParse(input)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid email in filter', () => {
      const input = {
        customer_email: 'not-an-email',
      }

      const result = listInvoicesSchema.safeParse(input)

      expect(result.success).toBe(false)
    })

    it('should reject limit over maximum', () => {
      const input = {
        limit: 101,
      }

      const result = listInvoicesSchema.safeParse(input)

      expect(result.success).toBe(false)
    })

    it('should accept maximum limit', () => {
      const input = {
        limit: 100,
      }

      const result = listInvoicesSchema.safeParse(input)

      expect(result.success).toBe(true)
    })

    it('should reject negative or zero page', () => {
      const input = {
        page: 0,
      }

      const result = listInvoicesSchema.safeParse(input)

      expect(result.success).toBe(false)
    })

    it('should coerce date strings to Date objects', () => {
      const input = {
        from_date: '2024-01-15',
        to_date: '2024-12-31',
      }

      const result = listInvoicesSchema.safeParse(input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.from_date).toBeInstanceOf(Date)
        expect(result.data.to_date).toBeInstanceOf(Date)
      }
    })
  })

  describe('invoiceSchema', () => {
    const validInvoice = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      merchant_id: '660e8400-e29b-41d4-a716-446655440000',
      amount: 100.5,
      currency: 'USDT',
      description: 'Test invoice',
      metadata: null,
      customer_email: 'test@example.com',
      customer_name: 'John Doe',
      status: 'pending',
      checkout_url: 'https://example.com/checkout/123',
      expires_at: '2024-12-31T23:59:59Z',
      paid_at: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    it('should validate a complete invoice object', () => {
      const result = invoiceSchema.safeParse(validInvoice)

      expect(result.success).toBe(true)
    })

    it('should reject invalid UUID for id', () => {
      const invalidInvoice = { ...validInvoice, id: 'not-a-uuid' }
      const result = invoiceSchema.safeParse(invalidInvoice)

      expect(result.success).toBe(false)
    })

    it('should reject invalid status', () => {
      const invalidInvoice = { ...validInvoice, status: 'invalid' }
      const result = invoiceSchema.safeParse(invalidInvoice)

      expect(result.success).toBe(false)
    })

    it('should accept invoice with null optional fields', () => {
      const minimalInvoice = {
        ...validInvoice,
        description: null,
        metadata: null,
        customer_email: null,
        customer_name: null,
        paid_at: null,
      }

      const result = invoiceSchema.safeParse(minimalInvoice)

      expect(result.success).toBe(true)
    })

    it('should reject invalid URL for checkout_url', () => {
      const invalidInvoice = { ...validInvoice, checkout_url: 'not-a-url' }
      const result = invoiceSchema.safeParse(invalidInvoice)

      expect(result.success).toBe(false)
    })

    it('should coerce date strings to Date objects', () => {
      const result = invoiceSchema.safeParse(validInvoice)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.expires_at).toBeInstanceOf(Date)
        expect(result.data.created_at).toBeInstanceOf(Date)
        expect(result.data.updated_at).toBeInstanceOf(Date)
      }
    })
  })

  describe('Type exports', () => {
    it('should export CreateInvoiceInput type', () => {
      const input: CreateInvoiceInput = {
        amount: 100,
        currency: 'WIRE',
      }
      expect(input).toBeDefined()
    })

    it('should export UpdateInvoiceInput type', () => {
      const input: UpdateInvoiceInput = {
        description: 'Updated',
      }
      expect(input).toBeDefined()
    })

    it('should export ListInvoicesInput type', () => {
      const input: ListInvoicesInput = {
        page: 1,
        limit: 20,
      }
      expect(input).toBeDefined()
    })

    it('should export Invoice type', () => {
      const invoice: Invoice = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        merchant_id: '660e8400-e29b-41d4-a716-446655440000',
        amount: 100,
        currency: 'WIRE',
        description: null,
        metadata: null,
        customer_email: null,
        customer_name: null,
        status: 'pending',
        checkout_url: 'https://example.com/checkout',
        expires_at: new Date(),
        paid_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      }
      expect(invoice).toBeDefined()
    })
  })
})
