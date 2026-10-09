import { z } from 'zod';
import { basePaginationQuerySchema } from './commonValidators.js';

export const listActivityLogsQuerySchema = basePaginationQuerySchema.extend({
  user_id: z.coerce.number().int().positive().optional(),
  entity_type: z.string().trim().max(32).optional(),
  action: z.string().trim().max(64).optional(),
});
