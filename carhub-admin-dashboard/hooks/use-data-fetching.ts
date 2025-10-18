// hooks/use-data-fetching.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { PaginationParams, PaginationMeta, ApiResponse } from '@/types/api';

interface UseDataFetchingProps<T> {
  fetchFunction: (params: PaginationParams) => Promise<ApiResponse<T>>;
  initialParams?: Partial<PaginationParams>;
}

export function useDataFetching<T>({ 
  fetchFunction, 
  initialParams = {} 
}: UseDataFetchingProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [params, setParams] = useState<PaginationParams>({
    page: 1,
    limit: 10,
    ...initialParams,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response: ApiResponse<T> = await fetchFunction(params);
      setData(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateParams = (newParams: Partial<PaginationParams>) => {
    setParams(prev => ({ ...prev, ...newParams, page: 1 })); // Reset to page 1 when filters change
  };

  const setPage = (page: number) => {
    setParams(prev => ({ ...prev, page }));
  };

  const setLimit = (limit: number) => {
    setParams(prev => ({ ...prev, limit, page: 1 }));
  };

  const setSearch = (search: string) => {
    setParams(prev => ({ ...prev, search, page: 1 }));
  };

  return {
    data,
    pagination,
    params,
    loading,
    error,
    refetch: fetchData,
    updateParams,
    setPage,
    setLimit,
    setSearch,
  };
}