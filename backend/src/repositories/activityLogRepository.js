import { pool } from '../config/db.js';

const SORT_COLUMNS = new Set(['created_at', 'action', 'id']);

export async function insert(connection, { userId, action, entityType, entityId, details }) {
  const conn = connection ?? pool;
  const [result] = await conn.execute(
    `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
     VALUES (?, ?, ?, ?, ?)`,
    [
      userId ?? null,
      action,
      entityType,
      entityId ?? null,
      details ?? null,
    ],
  );
  return result.insertId;
}

export async function list({ filters, pagination }) {
  const { page, limit, offset, sortBy, sortOrder } = pagination;
  const safeSort = SORT_COLUMNS.has(sortBy) ? sortBy : 'created_at';

  const where = [];
  const params = [];

  if (filters.user_id) {
    where.push('al.user_id = ?');
    params.push(filters.user_id);
  }
  if (filters.entity_type) {
    where.push('al.entity_type = ?');
    params.push(filters.entity_type);
  }
  if (filters.action) {
    where.push('al.action = ?');
    params.push(filters.action);
  }
  if (filters.search) {
    where.push('(al.action LIKE ? OR al.entity_type LIKE ?)');
    const term = `%${filters.search}%`;
    params.push(term, term);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM activity_logs al ${whereSql}`,
    params,
  );
  const total = countRows[0].total;

  const [rows] = await pool.execute(
    `SELECT al.id, al.user_id, u.name AS user_name, al.action, al.entity_type,
            al.entity_id, al.details, al.created_at
     FROM activity_logs al
     LEFT JOIN users u ON u.id = al.user_id
     ${whereSql}
     ORDER BY al.${safeSort} ${sortOrder}
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  return { rows, total };
}
