import { pool } from '../config/db.js';

const USER_COLUMNS =
  'id, name, email, password_hash, role, manager_id, is_active, created_at, updated_at';

const SORT_COLUMNS = new Set(['created_at', 'name', 'email', 'role']);

export async function findByEmail(email) {
  const [rows] = await pool.execute(
    `SELECT ${USER_COLUMNS} FROM users WHERE email = ? LIMIT 1`,
    [email],
  );
  return rows[0] ?? null;
}

export async function findById(id, connection) {
  const conn = connection ?? pool;
  const [rows] = await conn.execute(
    `SELECT ${USER_COLUMNS} FROM users WHERE id = ? LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function list({ filters, pagination }) {
  const { limit, offset, sortBy, sortOrder } = pagination;
  const safeSort = SORT_COLUMNS.has(sortBy) ? sortBy : 'created_at';

  const where = [];
  const params = [];

  if (filters.search) {
    where.push('(name LIKE ? OR email LIKE ?)');
    const term = `%${filters.search}%`;
    params.push(term, term);
  }
  if (filters.role) {
    where.push('role = ?');
    params.push(filters.role);
  }
  if (filters.is_active !== undefined) {
    where.push('is_active = ?');
    params.push(filters.is_active ? 1 : 0);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM users ${whereSql}`,
    params,
  );
  const total = countRows[0].total;

  const [rows] = await pool.execute(
    `SELECT id, name, email, role, manager_id, is_active, created_at, updated_at
     FROM users ${whereSql}
     ORDER BY ${safeSort} ${sortOrder}
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  return { rows, total };
}

export async function create(connection, data) {
  const [result] = await connection.execute(
    `INSERT INTO users (name, email, password_hash, role, manager_id, is_active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.name,
      data.email,
      data.password_hash,
      data.role,
      data.manager_id ?? null,
      data.is_active ? 1 : 0,
    ],
  );
  return result.insertId;
}

export async function updateById(connection, id, fields) {
  const sets = [];
  const params = [];

  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    if (key === 'is_active') {
      sets.push('is_active = ?');
      params.push(value ? 1 : 0);
    } else if (key === 'manager_id') {
      sets.push('manager_id = ?');
      params.push(value);
    } else {
      sets.push(`${key} = ?`);
      params.push(value);
    }
  }

  if (sets.length === 0) {
    return findById(id, connection);
  }

  params.push(id);
  await connection.execute(
    `UPDATE users SET ${sets.join(', ')} WHERE id = ?`,
    params,
  );
  return findById(id, connection);
}

export async function getTeamMemberIds(managerId) {
  const [rows] = await pool.execute(
    'SELECT id FROM users WHERE manager_id = ?',
    [managerId],
  );
  return rows.map((r) => r.id);
}

export async function listAssigneesForManager(managerId) {
  const [rows] = await pool.execute(
    `SELECT id, name, email, role FROM users
     WHERE is_active = 1 AND (manager_id = ? OR id = ?)
     ORDER BY name ASC`,
    [managerId, managerId],
  );
  return rows;
}

export async function listActiveUsersBrief() {
  const [rows] = await pool.execute(
    `SELECT id, name, email, role FROM users WHERE is_active = 1 ORDER BY name ASC`,
  );
  return rows;
}

export async function emailExists(email, excludeId = null) {
  const params = [email];
  let sql = 'SELECT id FROM users WHERE email = ?';
  if (excludeId) {
    sql += ' AND id <> ?';
    params.push(excludeId);
  }
  sql += ' LIMIT 1';
  const [rows] = await pool.execute(sql, params);
  return Boolean(rows[0]);
}
