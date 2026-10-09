import { pool } from '../config/db.js';

const SORT_COLUMNS = new Set([
  'created_at',
  'due_date',
  'title',
  'status',
  'priority',
  'updated_at',
]);

const TASK_SELECT = `
  t.id, t.title, t.description, t.status, t.priority,
  t.assigned_to, au.name AS assigned_to_name,
  t.created_by, cu.name AS created_by_name,
  t.due_date, t.created_at, t.updated_at
`;

export async function findById(id, connection) {
  const conn = connection ?? pool;
  const [rows] = await conn.execute(
    `SELECT ${TASK_SELECT}
     FROM tasks t
     JOIN users au ON au.id = t.assigned_to
     JOIN users cu ON cu.id = t.created_by
     WHERE t.id = ?
     LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function list({ scopeSql, scopeParams, filters, pagination }) {
  const { limit, offset, sortBy, sortOrder } = pagination;
  const safeSort = SORT_COLUMNS.has(sortBy) ? sortBy : 'created_at';

  const where = [scopeSql];
  const params = [...scopeParams];

  if (filters.search) {
    where.push('(t.title LIKE ? OR t.description LIKE ?)');
    const term = `%${filters.search}%`;
    params.push(term, term);
  }
  if (filters.status) {
    where.push('t.status = ?');
    params.push(filters.status);
  }
  if (filters.priority) {
    where.push('t.priority = ?');
    params.push(filters.priority);
  }
  if (filters.assigned_to) {
    where.push('t.assigned_to = ?');
    params.push(filters.assigned_to);
  }

  const whereSql = `WHERE ${where.join(' AND ')}`;

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM tasks t ${whereSql}`,
    params,
  );
  const total = countRows[0].total;

  const [rows] = await pool.execute(
    `SELECT ${TASK_SELECT}
     FROM tasks t
     JOIN users au ON au.id = t.assigned_to
     JOIN users cu ON cu.id = t.created_by
     ${whereSql}
     ORDER BY t.${safeSort} ${sortOrder}
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  return { rows, total };
}

export async function create(connection, data) {
  const [result] = await connection.execute(
    `INSERT INTO tasks (title, description, status, priority, assigned_to, created_by, due_date)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.title,
      data.description ?? null,
      data.status,
      data.priority,
      data.assigned_to,
      data.created_by,
      data.due_date ?? null,
    ],
  );
  return result.insertId;
}

export async function updateById(connection, id, fields) {
  const sets = [];
  const params = [];

  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    sets.push(`${key} = ?`);
    params.push(value);
  }

  if (sets.length === 0) {
    return findById(id, connection);
  }

  params.push(id);
  await connection.execute(
    `UPDATE tasks SET ${sets.join(', ')} WHERE id = ?`,
    params,
  );
  return findById(id, connection);
}

export async function deleteById(connection, id) {
  const [result] = await connection.execute('DELETE FROM tasks WHERE id = ?', [
    id,
  ]);
  return result.affectedRows > 0;
}

export async function countByStatus(scopeSql, scopeParams) {
  const [rows] = await pool.execute(
    `SELECT status, COUNT(*) AS count
     FROM tasks t
     WHERE ${scopeSql}
     GROUP BY status`,
    scopeParams,
  );
  return rows;
}
