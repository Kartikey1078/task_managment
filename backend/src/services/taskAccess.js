import { ApiError } from '../utils/ApiError.js';
import * as userRepository from '../repositories/userRepository.js';

export async function getManagerTeamIds(managerId) {
  const team = await userRepository.getTeamMemberIds(managerId);
  return new Set([managerId, ...team]);
}

export function managerCanAccessTask(managerId, teamIds, task) {
  return (
    task.created_by === managerId || teamIds.has(task.assigned_to)
  );
}

export function userCanAccessTask(userId, task) {
  return task.assigned_to === userId;
}

export async function assertTaskRead(actor, task) {
  if (!task) {
    throw ApiError.notFound('Task not found');
  }
  if (actor.role === 'admin') return;
  if (actor.role === 'user') {
    if (!userCanAccessTask(actor.id, task)) {
      throw ApiError.forbidden();
    }
    return;
  }
  if (actor.role === 'manager') {
    const teamIds = await getManagerTeamIds(actor.id);
    if (!managerCanAccessTask(actor.id, teamIds, task)) {
      throw ApiError.forbidden();
    }
    return;
  }
  throw ApiError.forbidden();
}

export async function assertTaskMutate(actor, task, { allowUserStatusOnly = false } = {}) {
  await assertTaskRead(actor, task);
  if (actor.role === 'user' && !allowUserStatusOnly) {
    throw ApiError.forbidden();
  }
}

export async function assertManagerAssignee(managerId, assigneeId) {
  const teamIds = await getManagerTeamIds(managerId);
  if (!teamIds.has(assigneeId)) {
    throw ApiError.forbidden('Cannot assign task to this user');
  }
}

export async function buildTaskScope(actor) {
  if (actor.role === 'admin') {
    return { scopeSql: '1=1', scopeParams: [] };
  }
  if (actor.role === 'user') {
    return {
      scopeSql: 't.assigned_to = ?',
      scopeParams: [actor.id],
    };
  }
  if (actor.role === 'manager') {
    const teamIds = [...(await getManagerTeamIds(actor.id))];
    const placeholders = teamIds.map(() => '?').join(', ');
    return {
      scopeSql: `(t.created_by = ? OR t.assigned_to IN (${placeholders}))`,
      scopeParams: [actor.id, ...teamIds],
    };
  }
  throw ApiError.forbidden();
}

export async function assertTaskDelete(actor, task) {
  await assertTaskRead(actor, task);
  if (actor.role === 'admin') return;
  if (actor.role === 'manager') {
    const teamIds = await getManagerTeamIds(actor.id);
    const inScope = managerCanAccessTask(actor.id, teamIds, task);
    if (!inScope) {
      throw ApiError.forbidden();
    }
    return;
  }
  throw ApiError.forbidden();
}
