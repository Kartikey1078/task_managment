import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function UnauthorizedPage() {
  const { dashboardPath } = useAuth();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Access denied</h1>
      <p className="max-w-md text-slate-600">
        You do not have permission to view this page.
      </p>
      <Link
        to={dashboardPath || '/login'}
        className="rounded-lg bg-brand-700 px-4 py-2 text-sm text-white"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
