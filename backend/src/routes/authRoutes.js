import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loginSchema } from '../validators/authValidators.js';

const router = Router();

router.post(
  '/login',
  loginRateLimiter,
  validate(loginSchema),
  asyncHandler(authController.login),
);

router.post('/logout', asyncHandler(authController.logout));

router.get('/me', authenticate, asyncHandler(authController.me));
router.get('/csrf', authenticate, asyncHandler(authController.csrf));

export default router;
