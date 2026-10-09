import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getTokenFromRequest } from '../utils/cookies.js';
import { verifyAccessToken } from '../utils/jwt.js';
import * as userRepository from '../repositories/userRepository.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    throw ApiError.unauthorized();
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired session');
  }

  const userId = Number(payload.sub);
  if (!userId) {
    throw ApiError.unauthorized();
  }

  const user = await userRepository.findById(userId);
  if (!user) {
    throw ApiError.unauthorized();
  }

  if (!user.is_active) {
    throw ApiError.forbidden('Account is inactive');
  }

  req.user = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    manager_id: user.manager_id,
    is_active: Boolean(user.is_active),
  };

  next();
});
