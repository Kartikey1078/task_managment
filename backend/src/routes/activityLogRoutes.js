import { Router } from 'express';
import * as activityLogController from '../controllers/activityLogController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listActivityLogsQuerySchema } from '../validators/activityLogValidators.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get(
  '/',
  validate(listActivityLogsQuerySchema, 'query'),
  asyncHandler(activityLogController.list),
);

export default router;
