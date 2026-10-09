import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import FormInput from '../components/FormInput';
import { getErrorMessage, useAuth } from '../context/AuthContext';
import { dashboardPathForRole } from '../utils/roles';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (user) {
      navigate(dashboardPathForRole(user.role), { replace: true });
    }
  }, [user, navigate]);

  const onSubmit = async (values) => {
    setError('');
    try {
      const loggedIn = await login(values.email, values.password);
      navigate(dashboardPathForRole(loggedIn.role), { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
        <p className="mt-1 text-sm text-slate-500">RBAC Task Management System</p>
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          <p className="font-medium text-slate-800">Local demo accounts</p>
          <ul className="mt-2 space-y-1">
            <li>
              <span className="font-medium">Admin:</span> admin@taskmgmt.local
            </li>
            <li>
              <span className="font-medium">Manager:</span> manager@taskmgmt.local
            </li>
            <li>
              <span className="font-medium">User:</span> user1@taskmgmt.local
            </li>
          </ul>
          <p className="mt-2 text-slate-500">Password: see README (e.g. ChangeMe_Manager123!)</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <FormInput
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <FormInput
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-brand-700 py-2.5 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
