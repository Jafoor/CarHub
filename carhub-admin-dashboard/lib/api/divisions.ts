import { PaginationParams, ApiResponse } from '@/types/api';
import api from '@/lib/axios';

export interface Division {
  id: number;
  name: string;
  bn_name?: string;
  lat?: number;
  lon?: number;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface DivisionCreateInput {
  name: string;
  bn_name?: string;
  lat?: number;
  lon?: number;
  is_active: boolean;
  priority: number;
}

export interface DivisionUpdateInput {
  name?: string;
  bn_name?: string;
  lat?: number;
  lon?: number;
  is_active?: boolean;
  priority?: number;
}

interface BackendApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function fetchDivisions(params: PaginationParams & { search?: string }): Promise<ApiResponse<Division>> {
  const response = await api.get<BackendApiResponse<{
    data: Division[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>>('/api/v1/divisions', { params });

  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return {
    data: response.data.data.data,
    pagination: response.data.data.pagination,
  };
}

export async function fetchAllDivisions(): Promise<Division[]> {
  const response = await api.get<BackendApiResponse<Division[]>>('/api/v1/divisions/all');
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}

export async function fetchDivision(id: number): Promise<Division> {
  const response = await api.get<BackendApiResponse<Division>>(`/api/v1/divisions/${id}`);
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}

export async function createDivision(data: DivisionCreateInput): Promise<Division> {
  const response = await api.post<BackendApiResponse<Division>>('/api/v1/divisions', data);
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}

export async function updateDivision(id: number, data: DivisionUpdateInput): Promise<Division> {
  const response = await api.put<BackendApiResponse<Division>>(`/api/v1/divisions/${id}`, data);
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}

export async function deleteDivision(id: number): Promise<void> {
  const response = await api.delete<BackendApiResponse<null>>(`/api/v1/divisions/${id}`);
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }
}