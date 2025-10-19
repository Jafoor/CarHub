import { PaginationParams, ApiResponse } from '@/types/api';
import api from '@/lib/axios';

export interface VehicleType {
  id: number;
  name: string;
  image?: string;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface VehicleTypeCreateInput {
  name: string;
  image?: string;
  is_active: boolean;
  priority: number;
}

export interface VehicleTypeUpdateInput {
  name?: string;
  image?: string;
  is_active?: boolean;
  priority?: number;
}

interface BackendApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function fetchVehicleTypes(params: PaginationParams & { search?: string }): Promise<ApiResponse<VehicleType>> {
  const response = await api.get<BackendApiResponse<{
    data: VehicleType[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>>('/api/v1/vehicle-types', { params });

  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return {
    data: response.data.data.data,
    pagination: response.data.data.pagination,
  };
}

export async function fetchAllVehicleTypes(): Promise<VehicleType[]> {
  const response = await api.get<BackendApiResponse<VehicleType[]>>('/api/v1/vehicle-types/all');
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}

export async function fetchVehicleType(id: number): Promise<VehicleType> {
  const response = await api.get<BackendApiResponse<VehicleType>>(`/api/v1/vehicle-types/${id}`);
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}

export async function createVehicleType(data: VehicleTypeCreateInput): Promise<VehicleType> {
  const response = await api.post<BackendApiResponse<VehicleType>>('/api/v1/vehicle-types', data);
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}

export async function updateVehicleType(id: number, data: VehicleTypeUpdateInput): Promise<VehicleType> {
  const response = await api.put<BackendApiResponse<VehicleType>>(`/api/v1/vehicle-types/${id}`, data);
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}

export async function deleteVehicleType(id: number): Promise<void> {
  const response = await api.delete<BackendApiResponse<null>>(`/api/v1/vehicle-types/${id}`);
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }
}