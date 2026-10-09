import * as authService from '../services/authService.js';
import { clearAuthCookies, getCsrfFromRequest, setAuthCookies } from '../utils/cookies.js';
import { sendSuccess } from '../utils/response.js';

export async function login(req, res) {
  const { email, password } = req.validated;
  const { token, user } = await authService.login(email, password);
  const csrfToken = setAuthCookies(res, token);
  return sendSuccess(res, { user, csrfToken });
}

export async function logout(_req, res) {
  clearAuthCookies(res);
  return sendSuccess(res, { message: 'Logged out' });
}

export async function me(req, res) {
  const user = await authService.getCurrentUser(req.user.id);
  return sendSuccess(res, { user });
}

export async function csrf(req, res) {
  const csrfToken = getCsrfFromRequest(req);
  return sendSuccess(res, { csrfToken });
}
