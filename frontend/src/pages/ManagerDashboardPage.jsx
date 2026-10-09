import { useEffect, useState } from 'react';
import DashboardStats from '../components/DashboardStats';
import api from '../services/api';

export default function ManagerDashboardPage() {
  const [teamCount, setTeamCount] = useState(null);

  useEffect(() => {
    api.get('/users/assignees').then((res) => {
      setTeamCount(res.data.data?.length ?? 0);
    });
  }, []);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Manager role — manage tasks for your team
        {teamCount !== null ? ` (${teamCount} assignable users)` : ''}.
      </p>
      <DashboardStats title="Manager dashboard" />
    </div>
  );
}
