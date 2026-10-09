import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ConfirmationDialog from '../components/ConfirmationDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api, { getErrorMessage } from '../services/api';

export default function TaskDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const canEdit = user?.role === 'admin' || user?.role === 'manager';
  const canDelete = canEdit;
  const canUpdateStatus =
    user?.role === 'admin' ||
    user?.role === 'manager' ||
    (user?.role === 'user' && task?.assigned_to === user.id);

  useEffect(() => {
    api
      .get(`/tasks/${id}`)
      .then((res) => setTask(res.data.data))
      .catch(() => showToast(getErrorMessage({ message: 'Task not found' }), 'error'))
      .finally(() => setLoading(false));
  }, [id, showToast]);

  const updateStatus = async (status) => {
    try {
      const { data } = await api.patch(`/tasks/${id}/status`, { status });
      setTask(data.data);
      showToast('Status updated');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const deleteTask = async () => {
    try {
      await api.delete(`/tasks/${id}`);
      showToast('Task deleted');
      navigate('/tasks');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!task) return <p className="text-slate-500">Task not found.</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{task.title}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Link
              to={`/tasks/${id}/edit`}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
            >
              Edit
            </Link>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-700"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 text-sm">
        <p className="text-slate-700 whitespace-pre-wrap">{task.description || 'No description.'}</p>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Assignee</dt>
            <dd className="font-medium">{task.assigned_to_name}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Created by</dt>
            <dd className="font-medium">{task.created_by_name}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Due date</dt>
            <dd>
              {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
            </dd>
          </div>
        </dl>
      </div>

      {canUpdateStatus && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-2 text-sm font-medium text-slate-700">Update status</p>
          <div className="flex flex-wrap gap-2">
            {['pending', 'in_progress', 'completed'].map((s) => (
              <button
                key={s}
                type="button"
                disabled={task.status === s}
                onClick={() => updateStatus(s)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm capitalize disabled:opacity-40"
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      <ConfirmationDialog
        open={confirmDelete}
        title="Delete task"
        message="This action cannot be undone."
        confirmLabel="Delete"
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          deleteTask();
        }}
      />
    </div>
  );
}
