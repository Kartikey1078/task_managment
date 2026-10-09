import { Router } from 'express';
import * as healthController from '../controllers/healthController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(healthController.health));

export default router;
