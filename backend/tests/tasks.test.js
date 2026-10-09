import { beforeAll, describe, expect, it } from 'vitest';
import {
  assertDatabaseAvailable,
  authed,
  CREDENTIALS,
  login,
  newAgent,
} from './helpers/http.js';

describe('Tasks API', () => {
  beforeAll(async () => {
    await assertDatabaseAvailable();
  });

  it('manager can create task for team member', async () => {
    const agent = newAgent();
    const { csrf } = await login(
      agent,
      CREDENTIALS.manager.email,
      CREDENTIALS.manager.password,
    );
    const res = await authed(agent, csrf).post('/api/tasks', {
      title: `Manager task ${Date.now()}`,
      assigned_to: 3,
      priority: 'high',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.assigned_to).toBe(3);

    await authed(agent, csrf).delete(`/api/tasks/${res.body.data.id}`);
  });

  it('user can patch status on own assigned task', async () => {
    const admin = newAgent();
    const { csrf: adminCsrf } = await login(
      admin,
      CREDENTIALS.admin.email,
      CREDENTIALS.admin.password,
    );
    const created = await authed(admin, adminCsrf).post('/api/tasks', {
      title: `User patch test ${Date.now()}`,
      assigned_to: 3,
      priority: 'medium',
    });
    expect(created.status).toBe(201);
    const taskId = created.body.data.id;
    const originalStatus = created.body.data.status;

    const agent = newAgent();
    const { csrf } = await login(
      agent,
      CREDENTIALS.user.email,
      CREDENTIALS.user.password,
    );
    const nextStatus = originalStatus === 'pending' ? 'in_progress' : 'pending';

    const patch = await authed(agent, csrf).patch(`/api/tasks/${taskId}/status`, {
      status: nextStatus,
    });
    expect(patch.status).toBe(200);
    expect(patch.body.data.status).toBe(nextStatus);

    await authed(agent, csrf).patch(`/api/tasks/${taskId}/status`, {
      status: originalStatus,
    });

    await authed(admin, adminCsrf).delete(`/api/tasks/${taskId}`);
  });

  it('validates invalid task payload', async () => {
    const agent = newAgent();
    const { csrf } = await login(
      agent,
      CREDENTIALS.admin.email,
      CREDENTIALS.admin.password,
    );
    const res = await authed(agent, csrf).post('/api/tasks', {
      title: '',
      assigned_to: 3,
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('supports pagination metadata', async () => {
    const agent = newAgent();
    const { csrf } = await login(
      agent,
      CREDENTIALS.admin.email,
      CREDENTIALS.admin.password,
    );
    const res = await authed(agent, csrf).get('/api/tasks?page=1&limit=2');
    expect(res.status).toBe(200);
    expect(res.body.meta).toMatchObject({
      page: 1,
      limit: 2,
      total: expect.any(Number),
      totalPages: expect.any(Number),
    });
  });
});
