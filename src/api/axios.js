import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const FAKE_TOKENS = new Set(['active_operator_session']);

function getStoredToken() {
  const token = localStorage.getItem('studio_token') || localStorage.getItem('token');
  if (!token || FAKE_TOKENS.has(token)) {
    if (token && FAKE_TOKENS.has(token)) {
      localStorage.removeItem('studio_token');
      localStorage.removeItem('token');
    }
    return null;
  }
  return token;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (config.headers?.Authorization) {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;
export { API_BASE_URL, getStoredToken };
