import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFoundPage() {
  const { dashboardPath } = useAuth();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-4xl font-bold text-slate-900">404</h1>
      <p className="text-slate-600">Page not found.</p>
      <Link to={dashboardPath || '/login'} className="text-brand-700 underline">
        Go home
      </Link>
    </div>
  );
}
