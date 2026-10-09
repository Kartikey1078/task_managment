import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import FormInput from '../components/FormInput';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api, { getErrorMessage } from '../services/api';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']),
  assigned_to: z.coerce.number().int().positive(),
  due_date: z.string().optional(),
});

export default function TaskFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [assignees, setAssignees] = useState([]);
  const [loading, setLoading] = useState(isEdit);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { priority: 'medium' } });

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'manager') {
      api
        .get('/users/assignees')
        .then((res) => setAssignees(res.data.data ?? []))
        .catch((err) => {
          setAssignees([]);
          showToast(getErrorMessage(err) || 'Could not load assignees', 'error');
        });
    }
  }, [user, showToast]);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/tasks/${id}`)
      .then((res) => {
        const t = res.data.data;
        reset({
          title: t.title,
          description: t.description || '',
          status: t.status,
          priority: t.priority,
          assigned_to: t.assigned_to,
          due_date: t.due_date ? t.due_date.slice(0, 10) : '',
        });
      })
      .finally(() => setLoading(false));
  }, [id, isEdit, reset]);

  const onSubmit = async (values) => {
    try {
      const body = {
        ...values,
        description: values.description || null,
        due_date: values.due_date || null,
      };
      if (isEdit) {
        await api.put(`/tasks/${id}`, body);
        showToast('Task updated');
        navigate(`/tasks/${id}`);
      } else {
        const { data } = await api.post('/tasks', body);
        showToast('Task created');
        navigate(`/tasks/${data.data.id}`);
      }
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">{isEdit ? 'Edit task' : 'Create task'}</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <FormInput label="Title" id="title" error={errors.title?.message} {...register('title')} />
        <div className="space-y-1">
          <label htmlFor="description" className="text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            {...register('description')}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="assigned_to" className="text-sm font-medium text-slate-700">
            Assignee
          </label>
          <select
            id="assigned_to"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            {...register('assigned_to')}
          >
            <option value="">Select assignee</option>
            {assignees.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} · {u.role} ({u.email})
              </option>
            ))}
          </select>
          {errors.assigned_to && (
            <p className="text-xs text-red-600">{errors.assigned_to.message}</p>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Priority</label>
            <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" {...register('priority')}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          {isEdit && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" {...register('status')}>
                <option value="pending">Pending</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}
        </div>
        <FormInput label="Due date" id="due_date" type="date" {...register('due_date')} />
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white"
          >
            {isSubmitting ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
