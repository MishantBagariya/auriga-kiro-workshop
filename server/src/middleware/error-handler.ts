import { Request, Response, NextFunction } from 'express'
import { Prisma } from '@prisma/client'

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error('Error:', err.message)

  // Prisma known request error (e.g., record not found, unique constraint violation)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: { message: 'Record not found', code: 'NOT_FOUND' },
      })
    }
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: { message: 'Record already exists', code: 'CONFLICT' },
      })
    }
    if (err.code === 'P2003') {
      return res.status(400).json({
        error: { message: 'Related record not found', code: 'INVALID_REFERENCE' },
      })
    }
  }

  // Default server error
  res.status(500).json({
    error: { message: 'Internal server error', code: 'INTERNAL_ERROR' },
  })
}
