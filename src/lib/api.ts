import axios from 'axios';

const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return typeof window !== 'undefined' ? '/api' : 'http://localhost:5001/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if access token exists in localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Automatic token refresh on 401 response
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const refreshEndpoint = `${getApiBaseUrl()}/auth/refresh`;
        const res = await axios.post(
          refreshEndpoint,
          { refreshToken },
          { withCredentials: true },
        );
        const { accessToken } = res.data.data || res.data;
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
            window.location.href = '/login';
          }
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
