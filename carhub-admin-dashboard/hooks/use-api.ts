// hooks/use-api.ts
import { useCallback } from 'react';
import { clearTokens } from '@/lib/auth';

export function useApi() {
  const handleApiError = useCallback((error: any) => {
    // Don't redirect if it's a 401 from refresh endpoint
    if (error.response?.status === 401 && 
        !error.config?.url?.includes('/auth/refresh')) {
      clearTokens();
      window.location.href = '/login';
    }
    
    throw error;
  }, []);

  const apiCall = useCallback(async <T>(
    fn: () => Promise<T>
  ): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      return handleApiError(error);
    }
  }, [handleApiError]);

  return { apiCall };
}