import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { idParamSchema } from '../validators/commonValidators.js';
import {
  adminUpdateUserSchema,
  createUserSchema,
  listUsersQuerySchema,
  patchUserStatusSchema,
  selfUpdateUserSchema,
} from '../validators/userValidators.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize('admin'),
  validate(listUsersQuerySchema, 'query'),
  asyncHandler(userController.list),
);

router.get(
  '/assignees',
  authorize('admin', 'manager'),
  asyncHandler(userController.listAssignees),
);

router.get(
  '/:id',
  validate(idParamSchema, 'params'),
  asyncHandler(userController.getById),
);

router.post(
  '/',
  authorize('admin'),
  validate(createUserSchema),
  asyncHandler(userController.create),
);

router.put(
  '/:id',
  validate(idParamSchema, 'params'),
  asyncHandler((req, res, next) => {
    const schema =
      req.user.role === 'admin' ? adminUpdateUserSchema : selfUpdateUserSchema;
    try {
      req.validated = schema.parse(req.body);
      next();
    } catch (err) {
      next(err);
    }
  }),
  asyncHandler(userController.update),
);

router.patch(
  '/:id/status',
  authorize('admin'),
  validate(idParamSchema, 'params'),
  validate(patchUserStatusSchema),
  asyncHandler(userController.patchStatus),
);

export default router;
