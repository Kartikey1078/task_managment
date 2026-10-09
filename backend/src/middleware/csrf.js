import { ApiError } from '../utils/ApiError.js';
import { getCsrfFromRequest } from '../utils/cookies.js';

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function csrfProtection(req, res, next) {
  if (!MUTATING.has(req.method)) {
    return next();
  }

  if (req.path === '/api/auth/login') {
    return next();
  }

  const cookieToken = getCsrfFromRequest(req);
  const headerToken = req.get('X-CSRF-Token');

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(ApiError.forbidden('Invalid CSRF token'));
  }

  next();
}
