import crypto from 'crypto';
import { env } from '../config/env.js';

const TOKEN_COOKIE = 'token';
const CSRF_COOKIE = 'csrf_token';

function baseCookieOptions() {
  const secure = env.isProduction;
  return {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    path: '/',
  };
}

export function setAuthCookies(res, token) {
  const csrfToken = crypto.randomBytes(32).toString('hex');

  res.cookie(TOKEN_COOKIE, token, {
    ...baseCookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.cookie(CSRF_COOKIE, csrfToken, {
    httpOnly: false,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return csrfToken;
}

export function clearAuthCookies(res) {
  const opts = { path: '/', httpOnly: true, secure: env.isProduction };
  res.clearCookie(TOKEN_COOKIE, opts);
  res.clearCookie(CSRF_COOKIE, {
    path: '/',
    httpOnly: false,
    secure: env.isProduction,
  });
}

export function getTokenFromRequest(req) {
  return req.cookies?.[TOKEN_COOKIE] ?? null;
}

export function getCsrfFromRequest(req) {
  return req.cookies?.[CSRF_COOKIE] ?? null;
}

export { TOKEN_COOKIE, CSRF_COOKIE };
