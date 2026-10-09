import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import {
  app,
  assertDatabaseAvailable,
  authed,
  CREDENTIALS,
  login,
  newAgent,
} from './helpers/http.js';

describe('Authentication', () => {
  beforeAll(async () => {
    await assertDatabaseAvailable();
  });

  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.data.db).toBe('connected');
  });

  it('rejects invalid login credentials', async () => {
    const agent = newAgent();
    const { res } = await login(agent, CREDENTIALS.admin.email, 'WrongPass123!');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('logs in admin and returns user profile', async () => {
    const agent = newAgent();
    const { res, csrf } = await login(
      agent,
      CREDENTIALS.admin.email,
      CREDENTIALS.admin.password,
    );
    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe('admin');
    expect(csrf).toBeTruthy();

    const me = await authed(agent, csrf).get('/api/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.data.user.email).toBe(CREDENTIALS.admin.email);
  });

  it('logout clears session', async () => {
    const agent = newAgent();
    const { csrf } = await login(
      agent,
      CREDENTIALS.admin.email,
      CREDENTIALS.admin.password,
    );
    const logout = await authed(agent, csrf).post('/api/auth/logout');
    expect(logout.status).toBe(200);

    const me = await agent.get('/api/auth/me');
    expect(me.status).toBe(401);
  });

  it('rejects inactive account login', async () => {
    const adminAgent = newAgent();
    const { csrf: adminCsrf } = await login(
      adminAgent,
      CREDENTIALS.admin.email,
      CREDENTIALS.admin.password,
    );
    const api = authed(adminAgent, adminCsrf);

    const created = await api.post('/api/users', {
      name: 'Inactive Test',
      email: `inactive-${Date.now()}@taskmgmt.local`,
      password: 'ChangeMe_Test123!',
      role: 'user',
    });
    expect(created.status).toBe(201);
    const userId = created.body.data.id;

    await api.patch(`/api/users/${userId}/status`, { is_active: false });

    const victim = newAgent();
    const attempt = await login(
      victim,
      created.body.data.email,
      'ChangeMe_Test123!',
    );
    expect(attempt.res.status).toBe(403);
    expect(attempt.res.body.error.code).toBe('FORBIDDEN');

    await api.patch(`/api/users/${userId}/status`, { is_active: true });
  });
});
