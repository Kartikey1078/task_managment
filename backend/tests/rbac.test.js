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

describe('RBAC authorization', () => {
  beforeAll(async () => {
    await assertDatabaseAvailable();
  });

  it('blocks unauthenticated access to tasks', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
  });

  it('admin can list all users', async () => {
    const agent = newAgent();
    const { csrf } = await login(
      agent,
      CREDENTIALS.admin.email,
      CREDENTIALS.admin.password,
    );
    const res = await authed(agent, csrf).get('/api/users');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('user cannot list users', async () => {
    const agent = newAgent();
    const { csrf } = await login(
      agent,
      CREDENTIALS.user.email,
      CREDENTIALS.user.password,
    );
    const res = await authed(agent, csrf).get('/api/users');
    expect(res.status).toBe(403);
  });

  it('user cannot access activity logs', async () => {
    const agent = newAgent();
    const { csrf } = await login(
      agent,
      CREDENTIALS.user.email,
      CREDENTIALS.user.password,
    );
    const res = await authed(agent, csrf).get('/api/activity-logs');
    expect(res.status).toBe(403);
  });

  it('user cannot create tasks', async () => {
    const agent = newAgent();
    const { csrf } = await login(
      agent,
      CREDENTIALS.user.email,
      CREDENTIALS.user.password,
    );
    const res = await authed(agent, csrf).post('/api/tasks', {
      title: 'Forbidden task',
      assigned_to: 3,
      priority: 'low',
    });
    expect(res.status).toBe(403);
  });

  it('user self-update cannot escalate role', async () => {
    const agent = newAgent();
    const { csrf } = await login(
      agent,
      CREDENTIALS.user.email,
      CREDENTIALS.user.password,
    );
    const me = await authed(agent, csrf).get('/api/auth/me');
    const userId = me.body.data.user.id;

    const res = await authed(agent, csrf).put(`/api/users/${userId}`, {
      name: 'Bob User',
      role: 'admin',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe('user');
  });

  it('manager assignees list includes team member names', async () => {
    const agent = newAgent();
    const { csrf } = await login(
      agent,
      CREDENTIALS.manager.email,
      CREDENTIALS.manager.password,
    );
    const res = await authed(agent, csrf).get('/api/users/assignees');
    expect(res.status).toBe(200);
    const names = res.body.data.map((u) => u.name);
    expect(names).toContain('Bob User');
  });

  it('manager sees task assigned to them by admin', async () => {
    const admin = newAgent();
    const { csrf: adminCsrf } = await login(
      admin,
      CREDENTIALS.admin.email,
      CREDENTIALS.admin.password,
    );
    const created = await authed(admin, adminCsrf).post('/api/tasks', {
      title: `For manager ${Date.now()}`,
      assigned_to: 2,
      priority: 'medium',
    });
    expect(created.status).toBe(201);

    const manager = newAgent();
    const { csrf } = await login(
      manager,
      CREDENTIALS.manager.email,
      CREDENTIALS.manager.password,
    );
    const list = await authed(manager, csrf).get('/api/tasks');
    expect(list.status).toBe(200);
    expect(list.body.data.some((t) => t.id === created.body.data.id)).toBe(true);

    await authed(admin, adminCsrf).delete(`/api/tasks/${created.body.data.id}`);
  });

  it('user cannot read another users assigned task', async () => {
    const admin = newAgent();
    const { csrf: adminCsrf } = await login(
      admin,
      CREDENTIALS.admin.email,
      CREDENTIALS.admin.password,
    );
    const created = await authed(admin, adminCsrf).post('/api/tasks', {
      title: `Private ${Date.now()}`,
      assigned_to: 4,
      priority: 'medium',
    });
    expect(created.status).toBe(201);
    const taskId = created.body.data.id;

    const userAgent = newAgent();
    const { csrf } = await login(
      userAgent,
      CREDENTIALS.user.email,
      CREDENTIALS.user.password,
    );
    const forbidden = await authed(userAgent, csrf).get(`/api/tasks/${taskId}`);
    expect(forbidden.status).toBe(403);

    await authed(admin, adminCsrf).delete(`/api/tasks/${taskId}`);
  });
});
