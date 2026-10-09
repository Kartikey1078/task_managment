import { Router } from 'express';
import * as taskController from '../controllers/taskController.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { idParamSchema } from '../validators/commonValidators.js';
import {
  createTaskSchema,
  listTasksQuerySchema,
  patchTaskStatusSchema,
  updateTaskSchema,
} from '../validators/taskValidators.js';

const router = Router();

router.use(authenticate);

router.get(
  '/stats/summary',
  asyncHandler(taskController.stats),
);

router.get(
  '/',
  validate(listTasksQuerySchema, 'query'),
  asyncHandler(taskController.list),
);

router.get(
  '/:id',
  validate(idParamSchema, 'params'),
  asyncHandler(taskController.getById),
);

router.post('/', validate(createTaskSchema), asyncHandler(taskController.create));

router.put(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateTaskSchema),
  asyncHandler(taskController.update),
);

router.patch(
  '/:id/status',
  validate(idParamSchema, 'params'),
  validate(patchTaskStatusSchema),
  asyncHandler(taskController.patchStatus),
);

router.delete(
  '/:id',
  validate(idParamSchema, 'params'),
  asyncHandler(taskController.remove),
);

export default router;
