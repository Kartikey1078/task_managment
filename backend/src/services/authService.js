import bcrypt from 'bcrypt';
import { ApiError } from '../utils/ApiError.js';
import { signAccessToken } from '../utils/jwt.js';
import { toPublicUser } from '../utils/userMapper.js';
import * as userRepository from '../repositories/userRepository.js';
import * as activityLogService from './activityLogService.js';

export async function login(email, password) {
  const user = await userRepository.findByEmail(email.toLowerCase().trim());
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.is_active) {
    throw ApiError.forbidden('Account is inactive');
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = signAccessToken(user.id);
  await activityLogService.record(user.id, 'auth.login', 'user', user.id, {
    email: user.email,
  });
  return {
    token,
    user: toPublicUser(user),
  };
}

export async function getCurrentUser(userId) {
  const user = await userRepository.findById(userId);
  if (!user || !user.is_active) {
    throw ApiError.unauthorized();
  }
  return toPublicUser(user);
}
