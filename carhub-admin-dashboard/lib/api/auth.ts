// lib/api/auth.ts
import api from '@/lib/axios';
import { clearTokens } from '../auth';

interface BackendApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
  role?: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export async function login(credentials: LoginCredentials): Promise<TokenResponse> {
  const response = await api.post<BackendApiResponse<TokenResponse>>('/api/v1/auth/admin/login', credentials);
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}

export async function signup(userData: SignupData): Promise<TokenResponse> {
  const response = await api.post<BackendApiResponse<TokenResponse>>('/api/v1/auth/signup', userData);
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}

export async function refreshToken(refreshToken: string): Promise<TokenResponse> {
  // Prevent multiple refresh attempts
  const response = await api.post<BackendApiResponse<TokenResponse>>('/api/v1/auth/refresh', {
    refresh_token: refreshToken,
  }, {
    // Add timeout to prevent hanging requests
    timeout: 10000,
  });
  
  if (!response.data.success) {
    throw new Error(response.data.message || 'Token refresh failed');
  }

  return response.data.data;
}

export async function logout(): Promise<void> {
  try {
    // Attempt to call backend logout
    const response = await api.post<BackendApiResponse<null>>('/api/v1/users/logout', {}, {
      timeout: 5000, // Short timeout for logout
    });
    
    if (!response.data.success) {
      console.warn('Logout warning:', response.data.message);
    }
  } catch (error) {
    console.warn('Logout API call failed (proceeding with client cleanup):', error);
  } finally {
    // Always clear tokens on client side
    clearTokens();
  }
}

// Force logout function for edge cases
export function forceLogout(): void {
  clearTokens();
  window.location.href = '/login?error=forced_logout';
}
