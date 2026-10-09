export function parsePagination(query, allowedSortFields, defaultSortBy = 'created_at') {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 10));
  const sortBy = allowedSortFields.includes(query.sortBy)
    ? query.sortBy
    : defaultSortBy;
  const sortOrder = query.sortOrder === 'asc' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;

  return { page, limit, sortBy, sortOrder, offset };
}

export function buildMeta(page, limit, total) {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  return { page, limit, total, totalPages };
}
