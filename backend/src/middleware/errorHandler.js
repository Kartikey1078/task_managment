import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';
import { sendError } from '../utils/response.js';
import { env } from '../config/env.js';

export function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
    return sendError(
      res,
      ApiError.badRequest('Invalid request', details),
    );
  }

  if (err instanceof ApiError) {
    return sendError(res, err);
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return sendError(res, ApiError.unauthorized('Invalid or expired session'));
  }

  if (!env.isProduction) {
    console.error(err);
  }

  return sendError(
    res,
    new ApiError(500, 'INTERNAL_ERROR', 'An unexpected error occurred'),
  );
}
