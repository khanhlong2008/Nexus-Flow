import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';
const appBaseUrl = import.meta.env.BASE_URL ?? '/';
const loginPath = new URL('login', `https://example.com${appBaseUrl}`).pathname;

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — đính kèm Bearer token từ localStorage nếu có
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — xử lý lỗi 401 toàn cục
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('auth_user');
      window.location.href = loginPath;
    }
    return Promise.reject(error);
  },
);

export default apiClient;
