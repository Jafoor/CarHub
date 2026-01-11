import { PaginationParams, ApiResponse } from '@/types/api';
import api from '@/lib/axios';

export interface Showroom {
  id: number;
  owner_id: number;
  owner: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  name: string;
  description?: string;
  logo_url?: string;
  cover_photo_url?: string;
  phone: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  address: string;
  division_id: number;
  division: {
    id: number;
    name: string;
    bn_name?: string;
  };
  district_id: number;
  district: {
    id: number;
    name: string;
    bn_name?: string;
  };
  zip_code?: string;
  opening_hours?: any;
  verified: boolean;
  rating: number;
  total_reviews: number;
  services?: any;
  social_links?: any;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface ShowroomCreateInput {
  owner_id: number;
  name: string;
  description?: string;
  logo_url?: string;
  cover_photo_url?: string;
  phone: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  address: string;
  division_id: number;
  district_id: number;
  zip_code?: string;
  opening_hours?: any;
  services?: any;
  social_links?: any;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface ShowroomUpdateInput {
  name?: string;
  description?: string;
  logo_url?: string;
  cover_photo_url?: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  division_id?: number;
  district_id?: number;
  zip_code?: string;
  opening_hours?: any;
  services?: any;
  social_links?: any;
  status?: 'active' | 'inactive' | 'suspended';
}

interface BackendApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function fetchShowrooms(params: PaginationParams & { 
  search?: string;
  division_id?: number;
  district_id?: number;
  verified_only?: boolean;
}): Promise<ApiResponse<Showroom>> {
  const response = await api.get<BackendApiResponse<{
    data: Showroom[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>>('/api/v1/showrooms', { params });

  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return {
    data: response.data.data.data,
    pagination: response.data.data.pagination,
  };
}

export async function fetchAllShowrooms(): Promise<Showroom[]> {
  const response = await api.get<BackendApiResponse<Showroom[]>>('/api/v1/showrooms/all');
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}

export async function fetchUserShowrooms(userId: number): Promise<Showroom[]> {
  const response = await api.get<BackendApiResponse<Showroom[]>>(`/api/v1/showrooms/user/${userId}`);
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}

export async function fetchShowroom(id: number): Promise<Showroom> {
  const response = await api.get<BackendApiResponse<Showroom>>(`/api/v1/showrooms/${id}`);
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}

export async function createShowroom(data: ShowroomCreateInput): Promise<Showroom> {
  const response = await api.post<BackendApiResponse<Showroom>>('/api/v1/showrooms', data);
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}

export async function updateShowroom(id: number, data: ShowroomUpdateInput): Promise<Showroom> {
  const response = await api.put<BackendApiResponse<Showroom>>(`/api/v1/showrooms/${id}`, data);
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}

export async function deleteShowroom(id: number): Promise<void> {
  const response = await api.delete<BackendApiResponse<null>>(`/api/v1/showrooms/${id}`);
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }
}

export async function toggleShowroomVerification(id: number, verified: boolean): Promise<Showroom> {
  const response = await api.patch<BackendApiResponse<Showroom>>(`/api/v1/showrooms/${id}/verification`, { verified });
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}

export async function updateShowroomStatus(id: number, status: string): Promise<Showroom> {
  const response = await api.patch<BackendApiResponse<Showroom>>(`/api/v1/showrooms/${id}/status`, { status });
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}