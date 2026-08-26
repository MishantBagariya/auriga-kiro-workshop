import mongoose from 'mongoose';
import { z } from 'zod';

/**
 * Validates a Mongo ObjectId string. Used for :id path params so a
 * malformed id produces INVALID_ID rather than the generic
 * VALIDATION_ERROR code (see .kiro/steering/api-standards.md).
 */
export const objectIdSchema = z
  .string()
  .refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: 'Must be a valid id',
  });

export const idParamSchema = z.object({
  id: objectIdSchema,
});
