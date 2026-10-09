export function toPublicTask(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    assigned_to: row.assigned_to,
    assigned_to_name: row.assigned_to_name ?? null,
    created_by: row.created_by,
    created_by_name: row.created_by_name ?? null,
    due_date: row.due_date,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
