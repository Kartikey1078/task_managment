import { z } from 'zod';
import { basePaginationQuerySchema } from './commonValidators.js';

const roleEnum = z.enum(['admin', 'manager', 'user']);

export const listUsersQuerySchema = basePaginationQuerySchema.extend({
  role: roleEnum.optional(),
  is_active: z
    .union([z.enum(['0', '1']), z.boolean()])
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      if (v === true || v === '1') return true;
      if (v === false || v === '0') return false;
      return undefined;
    }),
});

export const createUserSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  role: roleEnum.default('user'),
  manager_id: z
    .union([z.number().int().positive(), z.null()])
    .optional(),
  is_active: z.boolean().optional().default(true),
});

export const adminUpdateUserSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  email: z.string().email().max(255).optional(),
  role: roleEnum.optional(),
  manager_id: z
    .union([z.number().int().positive(), z.null()])
    .optional(),
  is_active: z.boolean().optional(),
});

export const selfUpdateUserSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  email: z.string().email().max(255).optional(),
});

export const patchUserStatusSchema = z.object({
  is_active: z.boolean(),
});
