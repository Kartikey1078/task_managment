export function toPublicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    is_active: Boolean(row.is_active),
    manager_id: row.manager_id ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
