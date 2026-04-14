import axios from 'axios';

const TOKEN_KEY = 'haym_web_token';
const USER_KEY  = 'haym_web_user';

// In production, set VITE_API_URL in your build environment or replace with your real backend URL
// e.g. 'https://api.yourdomain.com/api' or 'https://yourdomain.com:5000/api'
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30s — allows for Render free tier cold start (~15-30s wake-up time)
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Unwrap response.data and handle errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;

// ── Auth helpers ─────────────────────────────────────────────
export const saveSession = (token, user) => {
  // Token in sessionStorage — clears when browser tab/window is closed
  // so users must log in again each new browser session (suitable for a finance app)
  sessionStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user)); // keep user info for display
};

export const clearSession = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = () => {
  try {
    // Only restore user if there is an active session token
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    const u = localStorage.getItem(USER_KEY);
    return u ? JSON.parse(u) : null;
  } catch { return null; }
};

export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
