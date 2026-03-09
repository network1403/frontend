import axios from 'axios';


const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request: attach token
api.interceptors.request.use((config) => {
  try {
    const stored = JSON.parse(localStorage.getItem('quizzer-auth') || '{}');
    const token = stored?.state?.accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

// Response: auto-refresh on 401
let isRefreshing = false;
let queue = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const orig = error.config;
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !orig._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then(token => {
          orig.headers.Authorization = `Bearer ${token}`;
          return api(orig);
        });
      }

      orig._retry = true;
      isRefreshing = true;

      try {
        const stored = JSON.parse(localStorage.getItem('quizzer-auth') || '{}');
        const refreshToken = stored?.state?.refreshToken;
        // const { data } = await axios.post('/api/auth/refresh', { refreshToken });
        const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });

        // Update store
        const current = JSON.parse(localStorage.getItem('quizzer-auth') || '{}');
        current.state.accessToken = data.accessToken;
        current.state.refreshToken = data.refreshToken;
        localStorage.setItem('quizzer-auth', JSON.stringify(current));

        queue.forEach(p => p.resolve(data.accessToken));
        queue = [];
        orig.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(orig);
      } catch (e) {
        queue.forEach(p => p.reject(e));
        queue = [];
        // Force logout
        localStorage.removeItem('quizzer-auth');
        window.location.href = '/login';
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
