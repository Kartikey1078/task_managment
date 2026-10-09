import * as activityLogRepository from '../repositories/activityLogRepository.js';
import { buildMeta, parsePagination } from '../utils/pagination.js';

const SORT_FIELDS = ['created_at', 'action', 'id'];

export async function record(userId, action, entityType, entityId, details, connection) {
  await activityLogRepository.insert(connection, {
    userId,
    action,
    entityType,
    entityId,
    details,
  });
}

export async function listLogs(query) {
  const pagination = parsePagination(query, SORT_FIELDS, 'created_at');
  const { rows, total } = await activityLogRepository.list({
    filters: {
      user_id: query.user_id,
      entity_type: query.entity_type,
      action: query.action,
      search: query.search,
    },
    pagination,
  });

  const data = rows.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    user_name: row.user_name,
    action: row.action,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    details:
      typeof row.details === 'string'
        ? row.details
        : row.details
          ? JSON.stringify(row.details)
          : null,
    created_at: row.created_at,
  }));

  return { data, meta: buildMeta(pagination.page, pagination.limit, total) };
}
