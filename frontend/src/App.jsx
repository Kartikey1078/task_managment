import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import DashboardLayout from './layouts/DashboardLayout';
import ActivityLogsPage from './pages/ActivityLogsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import ManagerDashboardPage from './pages/ManagerDashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import ProfilePage from './pages/ProfilePage';
import TaskDetailPage from './pages/TaskDetailPage';
import TaskFormPage from './pages/TaskFormPage';
import TaskListPage from './pages/TaskListPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import UserDashboardPage from './pages/UserDashboardPage';
import UsersPage from './pages/UsersPage';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleGuard from './routes/RoleGuard';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route
                path="/admin/dashboard"
                element={
                  <RoleGuard allowedRoles={['admin']}>
                    <AdminDashboardPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/manager/dashboard"
                element={
                  <RoleGuard allowedRoles={['manager']}>
                    <ManagerDashboardPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/user/dashboard"
                element={
                  <RoleGuard allowedRoles={['user']}>
                    <UserDashboardPage />
                  </RoleGuard>
                }
              />
              <Route path="/tasks" element={<TaskListPage />} />
              <Route path="/tasks/new" element={<RoleGuard allowedRoles={['admin', 'manager']}><TaskFormPage /></RoleGuard>} />
              <Route path="/tasks/:id/edit" element={<RoleGuard allowedRoles={['admin', 'manager']}><TaskFormPage /></RoleGuard>} />
              <Route path="/tasks/:id" element={<TaskDetailPage />} />
              <Route
                path="/users"
                element={
                  <RoleGuard allowedRoles={['admin']}>
                    <UsersPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/activity-logs"
                element={
                  <RoleGuard allowedRoles={['admin']}>
                    <ActivityLogsPage />
                  </RoleGuard>
                }
              />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
