import request from 'supertest';
import { createApp } from '../../src/app.js';
import { pingDatabase } from '../../src/config/db.js';

export const app = createApp();

export async function assertDatabaseAvailable() {
  await pingDatabase();
}

export function newAgent() {
  return request.agent(app);
}

export async function login(agent, email, password) {
  const res = await agent.post('/api/auth/login').send({ email, password });
  const csrf = getCsrfToken(agent) ?? parseCsrfFromSetCookie(res.headers['set-cookie']);
  return { res, csrf };
}

function parseCsrfFromSetCookie(setCookie) {
  if (!setCookie) return null;
  const lines = Array.isArray(setCookie) ? setCookie : [setCookie];
  for (const line of lines) {
    const match = line.match(/csrf_token=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
  }
  return null;
}

function getCsrfToken(agent) {
  if (!agent.jar?.getCookies) return null;
  const cookies = agent.jar.getCookies({ path: '/' });
  const csrf = cookies.find((c) => c.name === 'csrf_token');
  return csrf?.value ?? null;
}

export function authed(agent, csrf) {
  return {
    get: (url) => agent.get(url),
    post: (url, body) =>
      agent.post(url).set('X-CSRF-Token', csrf).send(body),
    put: (url, body) =>
      agent.put(url).set('X-CSRF-Token', csrf).send(body),
    patch: (url, body) =>
      agent.patch(url).set('X-CSRF-Token', csrf).send(body),
    delete: (url) => agent.delete(url).set('X-CSRF-Token', csrf),
  };
}

export const CREDENTIALS = {
  admin: { email: 'admin@taskmgmt.local', password: 'ChangeMe_Admin123!' },
  manager: { email: 'manager@taskmgmt.local', password: 'ChangeMe_Manager123!' },
  user: { email: 'user1@taskmgmt.local', password: 'ChangeMe_User123!' },
};
