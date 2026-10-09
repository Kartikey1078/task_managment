import { useEffect, useState } from 'react';
import DashboardStats from '../components/DashboardStats';
import api, { getErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function ManagerDashboardPage() {
  const { showToast } = useToast();
  const [team, setTeam] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(true);

  useEffect(() => {
    api
      .get('/users/assignees')
      .then((res) => {
        const list = res.data.data ?? [];
        setTeam(list.filter((u) => u.role === 'user'));
      })
      .catch((err) => {
        setTeam([]);
        showToast(getErrorMessage(err) || 'Could not load team', 'error');
      })
      .finally(() => setLoadingTeam(false));
  }, [showToast]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Manager role — create and track tasks for your team.
      </p>
      <DashboardStats title="Manager dashboard" />

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Your team</h2>
        {loadingTeam ? (
          <p className="mt-2 text-sm text-slate-500">Loading team…</p>
        ) : team.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            No users are linked to you yet. Ask an admin to set each user&apos;s manager on the Users
            page.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {team.map((member) => (
              <li key={member.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <span className="font-medium text-slate-900">{member.name}</span>
                <span className="text-slate-500">{member.email}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
