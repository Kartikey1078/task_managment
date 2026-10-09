import { pool } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { buildMeta, parsePagination } from '../utils/pagination.js';
import { toPublicTask } from '../utils/taskMapper.js';
import * as taskRepository from '../repositories/taskRepository.js';
import * as userRepository from '../repositories/userRepository.js';
import * as activityLogService from './activityLogService.js';
import {
  assertManagerAssignee,
  assertTaskDelete,
  assertTaskMutate,
  assertTaskRead,
  buildTaskScope,
} from './taskAccess.js';

const TASK_SORT_FIELDS = [
  'created_at',
  'due_date',
  'title',
  'status',
  'priority',
  'updated_at',
];

export async function listTasks(actor, query) {
  const scope = await buildTaskScope(actor);
  const pagination = parsePagination(query, TASK_SORT_FIELDS, 'created_at');

  if (query.assigned_to && actor.role !== 'admin') {
    throw ApiError.forbidden();
  }

  const { rows, total } = await taskRepository.list({
    scopeSql: scope.scopeSql,
    scopeParams: scope.scopeParams,
    filters: {
      search: query.search,
      status: query.status,
      priority: query.priority,
      assigned_to: query.assigned_to,
    },
    pagination,
  });

  return {
    data: rows.map(toPublicTask),
    meta: buildMeta(pagination.page, pagination.limit, total),
  };
}

export async function getTaskById(actor, id) {
  const task = await taskRepository.findById(id);
  await assertTaskRead(actor, task);
  return toPublicTask(task);
}

export async function createTask(actor, payload) {
  if (actor.role === 'user') {
    throw ApiError.forbidden();
  }

  const assignee = await userRepository.findById(payload.assigned_to);
  if (!assignee || !assignee.is_active) {
    throw ApiError.badRequest('assigned_to must be an active user');
  }

  if (actor.role === 'manager') {
    await assertManagerAssignee(actor.id, payload.assigned_to);
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const taskId = await taskRepository.create(connection, {
      title: payload.title,
      description: payload.description ?? null,
      status: payload.status ?? 'pending',
      priority: payload.priority ?? 'medium',
      assigned_to: payload.assigned_to,
      created_by: actor.id,
      due_date: payload.due_date ?? null,
    });

    await activityLogService.record(
      actor.id,
      'task.created',
      'task',
      taskId,
      { title: payload.title, assigned_to: payload.assigned_to },
      connection,
    );

    await connection.commit();
    const task = await taskRepository.findById(taskId);
    return toPublicTask(task);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export async function updateTask(actor, id, payload) {
  const existing = await taskRepository.findById(id);
  await assertTaskMutate(actor, existing);

  if (actor.role === 'user') {
    throw ApiError.forbidden();
  }

  const updates = { ...payload };

  if (updates.assigned_to !== undefined && actor.role === 'manager') {
    await assertManagerAssignee(actor.id, updates.assigned_to);
  }

  if (updates.assigned_to !== undefined) {
    const assignee = await userRepository.findById(updates.assigned_to);
    if (!assignee || !assignee.is_active) {
      throw ApiError.badRequest('assigned_to must be an active user');
    }
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const updated = await taskRepository.updateById(connection, id, updates);

    await activityLogService.record(
      actor.id,
      'task.updated',
      'task',
      id,
      { fields: Object.keys(updates) },
      connection,
    );

    await connection.commit();
    return toPublicTask(updated);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export async function patchTaskStatus(actor, id, status) {
  const existing = await taskRepository.findById(id);

  if (actor.role === 'user') {
    await assertTaskRead(actor, existing);
    if (!existing || existing.assigned_to !== actor.id) {
      throw ApiError.forbidden();
    }
  } else {
    await assertTaskMutate(actor, existing);
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const updated = await taskRepository.updateById(connection, id, { status });

    await activityLogService.record(
      actor.id,
      'task.status_updated',
      'task',
      id,
      { status },
      connection,
    );

    await connection.commit();
    return toPublicTask(updated);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export async function deleteTask(actor, id) {
  const existing = await taskRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound('Task not found');
  }
  await assertTaskDelete(actor, existing);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const deleted = await taskRepository.deleteById(connection, id);
    if (!deleted) {
      throw ApiError.notFound('Task not found');
    }

    await activityLogService.record(
      actor.id,
      'task.deleted',
      'task',
      id,
      { title: existing.title },
      connection,
    );

    await connection.commit();
    return { message: 'Task deleted', id };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export async function getTaskStats(actor) {
  const scope = await buildTaskScope(actor);
  const rows = await taskRepository.countByStatus(
    scope.scopeSql,
    scope.scopeParams,
  );
  const stats = { pending: 0, in_progress: 0, completed: 0, total: 0 };
  for (const row of rows) {
    stats[row.status] = row.count;
    stats.total += row.count;
  }
  return stats;
}
