import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { buildMeta, parsePagination } from '../utils/pagination.js';
import { toPublicUser } from '../utils/userMapper.js';
import * as userRepository from '../repositories/userRepository.js';
import * as activityLogService from './activityLogService.js';

const USER_SORT_FIELDS = ['created_at', 'name', 'email', 'role'];

export async function listAssignees(actor) {
  if (actor.role === 'admin') {
    return await userRepository.listActiveUsersBrief();
  }
  if (actor.role === 'manager') {
    return await userRepository.listAssigneesForManager(actor.id);
  }
  throw ApiError.forbidden();
}

export async function listUsers(actor, query) {
  if (actor.role !== 'admin') {
    throw ApiError.forbidden();
  }

  const pagination = parsePagination(query, USER_SORT_FIELDS, 'created_at');
  const { rows, total } = await userRepository.list({
    filters: {
      search: query.search,
      role: query.role,
      is_active: query.is_active,
    },
    pagination,
  });

  return {
    data: rows.map((r) => toPublicUser(r)),
    meta: buildMeta(pagination.page, pagination.limit, total),
  };
}

export async function getUserById(actor, id) {
  if (actor.role !== 'admin' && actor.id !== id) {
    throw ApiError.forbidden();
  }

  const user = await userRepository.findById(id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return toPublicUser(user);
}

export async function createUser(actor, payload) {
  if (actor.role !== 'admin') {
    throw ApiError.forbidden();
  }

  const email = payload.email.toLowerCase().trim();
  if (await userRepository.emailExists(email)) {
    throw ApiError.conflict('Email already in use');
  }

  if (payload.manager_id) {
    const manager = await userRepository.findById(payload.manager_id);
    if (!manager || manager.role !== 'manager') {
      throw ApiError.badRequest('manager_id must reference an active manager');
    }
  }

  const password_hash = await bcrypt.hash(payload.password, 10);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const userId = await userRepository.create(connection, {
      name: payload.name.trim(),
      email,
      password_hash,
      role: payload.role,
      manager_id: payload.manager_id ?? null,
      is_active: payload.is_active ?? true,
    });

    await activityLogService.record(
      actor.id,
      'user.created',
      'user',
      userId,
      { email, role: payload.role },
      connection,
    );

    await connection.commit();
    const user = await userRepository.findById(userId);
    return toPublicUser(user);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export async function updateUser(actor, id, payload) {
  const existing = await userRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound('User not found');
  }

  const isAdmin = actor.role === 'admin';
  const isSelf = actor.id === id;

  if (!isAdmin && !isSelf) {
    throw ApiError.forbidden();
  }

  const updates = {};

  if (isAdmin) {
    if (payload.name !== undefined) updates.name = payload.name.trim();
    if (payload.email !== undefined) {
      const email = payload.email.toLowerCase().trim();
      if (await userRepository.emailExists(email, id)) {
        throw ApiError.conflict('Email already in use');
      }
      updates.email = email;
    }
    if (payload.role !== undefined) updates.role = payload.role;
    if (payload.manager_id !== undefined) updates.manager_id = payload.manager_id;
    if (payload.is_active !== undefined) updates.is_active = payload.is_active;
  } else {
    if (payload.name !== undefined) updates.name = payload.name.trim();
    if (payload.email !== undefined) {
      const email = payload.email.toLowerCase().trim();
      if (await userRepository.emailExists(email, id)) {
        throw ApiError.conflict('Email already in use');
      }
      updates.email = email;
    }
  }

  if (Object.keys(updates).length === 0) {
    return toPublicUser(existing);
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const updated = await userRepository.updateById(connection, id, updates);

    await activityLogService.record(
      actor.id,
      'user.updated',
      'user',
      id,
      { fields: Object.keys(updates) },
      connection,
    );

    if (updates.role && updates.role !== existing.role) {
      await activityLogService.record(
        actor.id,
        'user.role_changed',
        'user',
        id,
        { from: existing.role, to: updates.role },
        connection,
      );
    }

    await connection.commit();
    return toPublicUser(updated);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export async function patchUserStatus(actor, id, isActive) {
  if (actor.role !== 'admin') {
    throw ApiError.forbidden();
  }

  const existing = await userRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound('User not found');
  }

  if (actor.id === id && !isActive) {
    throw ApiError.badRequest('You cannot deactivate your own account');
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const updated = await userRepository.updateById(connection, id, {
      is_active: isActive,
    });

    await activityLogService.record(
      actor.id,
      'user.status_changed',
      'user',
      id,
      { is_active: isActive },
      connection,
    );

    await connection.commit();
    return toPublicUser(updated);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}
