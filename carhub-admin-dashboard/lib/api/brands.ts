import { PaginationParams, ApiResponse } from '@/types/api';
import api from '@/lib/axios';

export interface Brand {
  id: number;
  name: string;
  vehicle_type_id: number;
  vehicle_type: {
    id: number;
    name: string;
    image?: string;
  };
  image?: string;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface BrandCreateInput {
  name: string;
  vehicle_type_id: number;
  image?: string;
  is_active: boolean;
  description?: string;
}

export interface BrandUpdateInput {
  name?: string;
  vehicle_type_id?: number;
  image?: string;
  is_active?: boolean;
  description?: string;
}

interface BackendApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function fetchBrands(params: PaginationParams & { 
  search?: string;
  vehicle_type_id?: number;
}): Promise<ApiResponse<Brand>> {
  const response = await api.get<BackendApiResponse<{
    data: Brand[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>>('/api/v1/brands', { params });

  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return {
    data: response.data.data.data,
    pagination: response.data.data.pagination,
  };
}

export async function fetchAllBrands(): Promise<Brand[]> {
  const response = await api.get<BackendApiResponse<Brand[]>>('/api/v1/brands/all');
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}

export async function fetchBrandsByVehicleType(vehicleTypeId: number): Promise<Brand[]> {
  const response = await api.get<BackendApiResponse<Brand[]>>(`/api/v1/brands/vehicle-type/${vehicleTypeId}`);
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}

export async function fetchBrand(id: number): Promise<Brand> {
  const response = await api.get<BackendApiResponse<Brand>>(`/api/v1/brands/${id}`);
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}

export async function createBrand(data: BrandCreateInput): Promise<Brand> {
  const response = await api.post<BackendApiResponse<Brand>>('/api/v1/brands', data);
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}

export async function updateBrand(id: number, data: BrandUpdateInput): Promise<Brand> {
  const response = await api.put<BackendApiResponse<Brand>>(`/api/v1/brands/${id}`, data);
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}

export async function deleteBrand(id: number): Promise<void> {
  const response = await api.delete<BackendApiResponse<null>>(`/api/v1/brands/${id}`);
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }
}