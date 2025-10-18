// lib/api/users.ts
import { PaginationParams, ApiResponse } from '@/types/api';
import { User } from '@/types/user';
import api from '@/lib/axios';

interface BackendApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function fetchUsers(params: PaginationParams): Promise<ApiResponse<User>> {
  const response = await api.get<BackendApiResponse<{
    data: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>>('/api/v1/users', { params });

  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return {
    data: response.data.data.data,
    pagination: response.data.data.pagination,
  };
}

export async function createUser(userData: {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
}): Promise<User> {
  const response = await api.post<BackendApiResponse<User>>('/api/v1/auth/signup', userData);
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}

export async function updateUser(userId: string, userData: Partial<User>): Promise<User> {
  const response = await api.put<BackendApiResponse<User>>(`/api/v1/users/${userId}`, userData);
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}

export async function deleteUser(userId: string): Promise<void> {
  const response = await api.delete<BackendApiResponse<null>>(`/api/v1/users/${userId}`);
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }
}

export async function getUserProfile(): Promise<User> {
  const response = await api.get<BackendApiResponse<User>>('/api/v1/users/profile');
  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}