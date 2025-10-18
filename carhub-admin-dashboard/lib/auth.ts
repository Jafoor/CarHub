// lib/auth.ts
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Token storage keys
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken', 
  TOKEN_EXPIRY: 'tokenExpiry',
  LAST_REFRESH_ATTEMPT: 'lastRefreshAttempt',
  USER_DATA: 'userData',
} as const;

export const storeTokens = (tokens: AuthTokens) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, tokens.accessToken);
      localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, tokens.refreshToken);
      localStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, (Date.now() + tokens.expiresIn * 1000).toString());
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }
};

export const getAccessToken = (): string | null => {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }
  return null;
};

export const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  }
  return null;
};

export const clearTokens = (): void => {
  if (typeof window !== 'undefined') {
    try {
      // Remove all authentication-related items
      localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(TOKEN_KEYS.TOKEN_EXPIRY);
      localStorage.removeItem(TOKEN_KEYS.LAST_REFRESH_ATTEMPT);
      localStorage.removeItem(TOKEN_KEYS.USER_DATA);
      
      // Also clear sessionStorage if used
      sessionStorage.clear();
      
      console.log('All tokens cleared successfully');
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }
};

export const isTokenExpired = (): boolean => {
  if (typeof window !== 'undefined') {
    try {
      const expiry = localStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRY);
      if (!expiry) return true;
      return Date.now() >= parseInt(expiry);
    } catch (error) {
      console.error('Failed to check token expiry:', error);
      return true;
    }
  }
  return true;
};

export const canRefresh = (): boolean => {
  if (typeof window !== 'undefined') {
    try {
      const lastAttempt = localStorage.getItem(TOKEN_KEYS.LAST_REFRESH_ATTEMPT);
      if (lastAttempt) {
        // Only allow refresh once every 30 seconds to prevent loops
        return Date.now() - parseInt(lastAttempt) > 30000;
      }
      return true;
    } catch (error) {
      console.error('Failed to check refresh capability:', error);
      return false;
    }
  }
  return false;
};

export const setRefreshAttempt = (): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(TOKEN_KEYS.LAST_REFRESH_ATTEMPT, Date.now().toString());
    } catch (error) {
      console.error('Failed to set refresh attempt:', error);
    }
  }
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken() && !isTokenExpired();
};

// Additional helper functions
export const storeUserData = (userData: any): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  }
};

export const getUserData = (): any => {
  if (typeof window !== 'undefined') {
    try {
      const userData = localStorage.getItem(TOKEN_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  }
  return null;
};

export const clearUserData = (): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(TOKEN_KEYS.USER_DATA);
    } catch (error) {
      console.error('Failed to clear user data:', error);
    }
  }
};

// Comprehensive cleanup function
export const clearAllAuthData = (): void => {
  clearTokens();
  clearUserData();
};