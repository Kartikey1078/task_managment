import { z } from 'zod';
import { basePaginationQuerySchema } from './commonValidators.js';

const statusEnum = z.enum(['pending', 'in_progress', 'completed']);
const priorityEnum = z.enum(['low', 'medium', 'high']);

export const listTasksQuerySchema = basePaginationQuerySchema.extend({
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  assigned_to: z.coerce.number().int().positive().optional(),
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).nullable().optional(),
  status: statusEnum.optional().default('pending'),
  priority: priorityEnum.optional().default('medium'),
  assigned_to: z.number().int().positive(),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'due_date must be YYYY-MM-DD')
    .nullable()
    .optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  assigned_to: z.number().int().positive().optional(),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
});

export const patchTaskStatusSchema = z.object({
  status: statusEnum,
});
