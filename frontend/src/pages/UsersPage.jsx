import { useCallback, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import ConfirmationDialog from '../components/ConfirmationDialog';
import FormInput from '../components/FormInput';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import { useToast } from '../context/ToastContext';
import api, { getErrorMessage } from '../services/api';

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'manager', 'user']),
});

const updateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'manager', 'user']),
});

export default function UsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deactivateUser, setDeactivateUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(createSchema),
    defaultValues: { role: 'user' },
  });

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    formState: { errors: editErrors, isSubmitting: editSubmitting },
  } = useForm({
    resolver: zodResolver(updateSchema),
  });

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 10 });
    if (search) params.set('search', search);
    if (roleFilter) params.set('role', roleFilter);
    api
      .get(`/users?${params}`)
      .then((res) => {
        setUsers(res.data.data);
        setMeta(res.data.meta);
      })
      .finally(() => setLoading(false));
  }, [page, search, roleFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const onCreate = async (values) => {
    try {
      await api.post('/users', values);
      showToast('User created');
      reset();
      setShowForm(false);
      load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const startEdit = (user) => {
    setEditingUser(user);
    resetEdit({
      name: user.name,
      email: user.email,
      role: user.role,
    });
  };

  const onUpdate = async (values) => {
    if (!editingUser) return;
    try {
      await api.put(`/users/${editingUser.id}`, values);
      showToast('User updated');
      setEditingUser(null);
      load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const toggleActive = async (user, active) => {
    try {
      await api.patch(`/users/${user.id}/status`, { is_active: active });
      showToast(active ? 'User activated' : 'User deactivated');
      load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">User management</h1>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg bg-brand-700 px-4 py-2 text-sm text-white"
        >
          {showForm ? 'Close form' : 'Add user'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit(onCreate)}
          className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2"
        >
          <FormInput label="Name" error={errors.name?.message} {...register('name')} />
          <FormInput label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <FormInput label="Password" type="password" error={errors.password?.message} {...register('password')} />
          <div className="space-y-1">
            <label className="text-sm font-medium">Role</label>
            <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" {...register('role')}>
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" disabled={isSubmitting} className="md:col-span-2 rounded-lg bg-brand-700 py-2 text-sm text-white">
            Create user
          </button>
        </form>
      )}

      <div className="flex flex-wrap gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search users…" />
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          aria-label="Filter by role"
        >
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="user">User</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <table className="min-w-full text-sm">
            <thead className="border-b bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3">{u.is_active ? 'Active' : 'Inactive'}</td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button
                      type="button"
                      className="text-sm text-brand-700"
                      onClick={() => startEdit(u)}
                    >
                      Edit
                    </button>
                    {u.is_active ? (
                      <button
                        type="button"
                        className="text-sm text-red-600"
                        onClick={() => setDeactivateUser(u)}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="text-sm text-brand-700"
                        onClick={() => toggleActive(u, true)}
                      >
                        Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {meta && <Pagination meta={meta} onPageChange={setPage} />}
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <form
            onSubmit={handleEditSubmit(onUpdate)}
            className="w-full max-w-md space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <h2 className="text-lg font-semibold">Edit user</h2>
            <FormInput label="Name" error={editErrors.name?.message} {...registerEdit('name')} />
            <FormInput label="Email" type="email" error={editErrors.email?.message} {...registerEdit('email')} />
            <div className="space-y-1">
              <label className="text-sm font-medium">Role</label>
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" {...registerEdit('role')}>
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editSubmitting}
                className="rounded-lg bg-brand-700 px-4 py-2 text-sm text-white"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmationDialog
        open={Boolean(deactivateUser)}
        title="Deactivate user"
        message={`Deactivate ${deactivateUser?.name}?`}
        confirmLabel="Deactivate"
        danger
        onCancel={() => setDeactivateUser(null)}
        onConfirm={() => {
          toggleActive(deactivateUser, false);
          setDeactivateUser(null);
        }}
      />
    </div>
  );
}
