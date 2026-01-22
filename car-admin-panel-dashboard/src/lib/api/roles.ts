import { apiClient } from "./axios";
import type { ApiResponse } from "@/types/api";

export interface Role {
  id: number;
  name: string; // Internal name / slug
  display_name: string; // Human readable name
  description?: string;
  is_default: boolean;
  is_super_admin: boolean;
  permissions?: string[];
  created_at?: string;
  updated_at?: string;
}

export type CreateRolePayload = Pick<
  Role,
  "name" | "display_name" | "description" | "is_default" | "is_super_admin"
>;
export type UpdateRolePayload = Partial<CreateRolePayload>;

export const rolesApi = {
  getAll: async (): Promise<Role[]> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await apiClient.get<any>("/admin/roles");
    console.log("Roles API Response Full:", response);

    // Handle different response structures
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (response.data?.roles && Array.isArray(response.data.roles)) {
      return response.data.roles;
    }

    return [];
  },

  getById: async (id: number): Promise<Role> => {
    const response = await apiClient.get<ApiResponse<Role>>(
      `/admin/roles/${id}`,
    );
    return response.data.data;
  },

  create: async (payload: CreateRolePayload): Promise<Role> => {
    const response = await apiClient.post<ApiResponse<Role>>(
      "/admin/roles",
      payload,
    );
    return response.data.data;
  },

  update: async (id: number, payload: UpdateRolePayload): Promise<Role> => {
    const response = await apiClient.put<ApiResponse<Role>>(
      `/admin/roles/${id}`,
      payload,
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/roles/${id}`);
  },
};
