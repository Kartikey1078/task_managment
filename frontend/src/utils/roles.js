export function dashboardPathForRole(role) {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'manager':
      return '/manager/dashboard';
    case 'user':
      return '/user/dashboard';
    default:
      return '/login';
  }
}
