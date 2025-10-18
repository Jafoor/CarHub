// lib/axios.ts
import axios from 'axios';
import { 
  getAccessToken, 
  getRefreshToken, 
  storeTokens, 
  clearTokens, 
  isTokenExpired,
  setRefreshAttempt 
} from './auth';
import { refreshToken } from './api/auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  withCredentials: false, // ⚠️ Set to false to prevent sending cookies
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track refresh attempts to prevent loops
let refreshPromise: Promise<string> | null = null;
let isRefreshing = false;

api.interceptors.request.use(
  (config) => {
    // Clear any cookies that might be sent automatically
    config.withCredentials = false;
    
    // Only use our stored token, not cookies
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry if already retried or it's a refresh request
    if (originalRequest._retry || originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    // Only handle 401 errors
    if (error.response?.status === 401) {
      originalRequest._retry = true;

      try {
        // If already refreshing, wait for the current refresh to complete
        if (isRefreshing) {
          const newToken = await refreshPromise;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }

        // Start refresh process
        isRefreshing = true;
        refreshPromise = new Promise(async (resolve, reject) => {
          try {
            const refreshTokenValue = getRefreshToken();
            
            if (!refreshTokenValue) {
              throw new Error('No refresh token available');
            }

            console.log('Attempting token refresh...');
            setRefreshAttempt();

            const tokens = await refreshToken(refreshTokenValue);
            storeTokens({
              accessToken: tokens.access_token,
              refreshToken: tokens.refresh_token,
              expiresIn: tokens.expires_in,
            });

            console.log('Token refresh successful');
            resolve(tokens.access_token);
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // Clear tokens and redirect to login on refresh failure
            clearTokens();
            window.location.href = '/login?error=session_expired';
            reject(refreshError);
          } finally {
            isRefreshing = false;
            refreshPromise = null;
          }
        });

        const newToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect
        clearTokens();
        window.location.href = '/login?error=authentication_failed';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

export default api;