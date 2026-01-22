import { apiClient } from "./axios";
import type { ApiResponse } from "@/types/api";

export interface AdminUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role_id?: number;
  roles?: Array<{
    id: number;
    name: string;
    display_name: string;
    is_super_admin: boolean;
  }>;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAdminPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  password: string;
  role_ids: number[];
}

export interface UpdateAdminPayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_active?: boolean;
  role_ids?: number[];
}

export interface AdminListParams {
  page?: number;
  limit?: number;
  search?: string;
  email?: string;
  phone?: string;
  is_active?: boolean;
  role_id?: number;
}

export interface AdminListResponse {
  data: AdminUser[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export const adminsApi = {
  getAll: async (params?: AdminListParams): Promise<AdminListResponse> => {
    const response = await apiClient.get<ApiResponse<AdminListResponse>>(
      "/admin/users",
      {
        params,
      },
    );
    return response.data.data;
  },

  create: async (payload: CreateAdminPayload): Promise<AdminUser> => {
    const response = await apiClient.post<ApiResponse<AdminUser>>(
      "/admin/users",
      payload,
    );
    return response.data.data;
  },

  update: async (id: number, payload: UpdateAdminPayload): Promise<AdminUser> => {
    // Backend API uses PUT for update
    const response = await apiClient.put<ApiResponse<AdminUser>>(
      `/admin/users/${id}`,
      payload,
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/users/${id}`);
  },
};
