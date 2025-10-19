import { PaginationParams, ApiResponse } from '@/types/api';
import api from '@/lib/axios';

export interface District {
  id: number;
  division_id: number;
  division: {
    id: number;
    name: string;
    bn_name?: string;
  };
  name: string;
  bn_name?: string;
  lat?: number;
  lon?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DistrictCreateInput {
  name: string;
  division_id: number;
  bn_name?: string;
  lat?: number;
  lon?: number;
  is_active: boolean;
}

export interface DistrictUpdateInput {
  name?: string;
  division_id?: number;
  bn_name?: string;
  lat?: number;
  lon?: number;
  is_active?: boolean;
}

interface BackendApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function fetchDistricts(params: PaginationParams & { 
  search?: string;
  division_id?: number;
}): Promise<ApiResponse<District>> {
  const response = await api.get<BackendApiResponse<{
    data: District[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>>('/api/v1/districts', { params });

  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return {
    data: response.data.data.data,
    pagination: response.data.data.pagination,
  };
}

export async function fetchAllDistricts(): Promise<District[]> {
  const response = await api.get<BackendApiResponse<District[]>>('/api/v1/districts/all');
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}

export async function fetchDistrictsByDivision(divisionId: number): Promise<District[]> {
  const response = await api.get<BackendApiResponse<District[]>>(`/api/v1/districts/division/${divisionId}`);
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}

export async function fetchDistrict(id: number): Promise<District> {
  const response = await api.get<BackendApiResponse<District>>(`/api/v1/districts/${id}`);
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}

export async function createDistrict(data: DistrictCreateInput): Promise<District> {
  const response = await api.post<BackendApiResponse<District>>('/api/v1/districts', data);
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}

export async function updateDistrict(id: number, data: DistrictUpdateInput): Promise<District> {
  const response = await api.put<BackendApiResponse<District>>(`/api/v1/districts/${id}`, data);
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}

export async function deleteDistrict(id: number): Promise<void> {
  const response = await api.delete<BackendApiResponse<null>>(`/api/v1/districts/${id}`);
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }
}