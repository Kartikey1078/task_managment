import axios from 'axios';

let csrfToken = null;

export function setCsrfToken(token) {
  csrfToken = token || null;
}

function getCsrfToken() {
  if (csrfToken) return csrfToken;
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase() ?? '';
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    const csrf = getCsrfToken();
    if (csrf) {
      config.headers['X-CSRF-Token'] = csrf;
    }
  }
  return config;
});

export function getErrorMessage(error) {
  return (
    error.response?.data?.error?.message ||
    error.message ||
    'Something went wrong'
  );
}

export default api;
