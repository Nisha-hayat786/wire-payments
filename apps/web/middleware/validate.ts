import { NextRequest, NextResponse } from 'next/server'
import { ZodSchema, ZodError } from 'zod'

export function validateBody<T>(schema: ZodSchema<T>) {
  return async (request: NextRequest) => {
    try {
      const body = await request.json()
      const validated = schema.parse(body)
      return { success: true, data: validated }
    } catch (error) {
      if (error instanceof ZodError) {
        const details = (error as any).errors.reduce((acc: Record<string, string[]>, err: any) => {
          const path = err.path.join('.')
          if (!acc[path]) acc[path] = []
          acc[path].push(err.message)
          return acc
        }, {} as Record<string, string[]>)

        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details,
          },
        }
      }
      throw error
    }
  }
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (request: NextRequest) => {
    try {
      const searchParams = Object.fromEntries(request.nextUrl.searchParams)
      const validated = schema.parse(searchParams)
      return { success: true, data: validated }
    } catch (error) {
      if (error instanceof ZodError) {
        const details = (error as any).errors.reduce((acc: Record<string, string[]>, err: any) => {
          const path = err.path.join('.')
          if (!acc[path]) acc[path] = []
          acc[path].push(err.message)
          return acc
        }, {} as Record<string, string[]>)

        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Query validation failed',
            details,
          },
        }
      }
      throw error
    }
  }
}

export function createValidationResponse(
  requestId: string,
  error: { code: string; message: string; details?: Record<string, string[]> }
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        ...error,
        request_id: requestId,
      },
    },
    { status: 400 }
  )
}
