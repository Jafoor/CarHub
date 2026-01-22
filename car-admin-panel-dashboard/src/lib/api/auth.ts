import { apiClient } from "./axios";
import { jwtDecode } from "jwt-decode";
import type {
  LoginCredentials,
  SignUpCredentials,
  AuthResponse,
  UserRole,
  DecodedToken,
} from "@/types/auth";
import type { ApiResponse } from "@/types/api";

type AuthTokensResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  roles: string[];
};

type ProfileResponse = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  email_verified: boolean;
  is_active: boolean;
};

export const authApi = {
  signIn: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthTokensResponse>>(
      "/admin/signin",
      credentials,
    );

    const data = response.data.data;

    // Decode the access token
    const decoded = jwtDecode<DecodedToken>(data.access_token);

    console.log("Decoded Token:", decoded); // Debugging

    // Normalize and map role
    let tokenRole =
      decoded.roles && decoded.roles.length > 0 ? decoded.roles[0] : "staff";

    // Handle case sensitivity and mapping
    tokenRole = tokenRole.toLowerCase().replace(" ", "_");

    // Use the normalized role directly as UserRole is now dynamic
    const primaryRole = tokenRole as UserRole;

    const user = {
      id: String(decoded.admin_id),
      adminId: decoded.admin_id,
      email: credentials.email, // Email is still from credentials as it might not be in token (or is it?)
      name: `${decoded.first_name} ${decoded.last_name}`,
      firstName: decoded.first_name,
      lastName: decoded.last_name,
      role: primaryRole,
      roles: decoded.roles,
    };

    return {
      user,
      tokens: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      },
    };
  },

  getProfile: async (): Promise<ProfileResponse> => {
    const response =
      await apiClient.get<ApiResponse<ProfileResponse>>("/profile");
    return response.data.data;
  },

  updateProfile: async (
    payload: Pick<ProfileResponse, "first_name" | "last_name"> & {
      phone?: string;
    },
  ): Promise<ProfileResponse> => {
    const response = await apiClient.put<ApiResponse<ProfileResponse>>(
      "/admin/profile",
      payload,
    );
    return response.data.data;
  },

  updatePassword: async (payload: {
    current_password: string;
    new_password: string;
  }): Promise<void> => {
    await apiClient.put("/admin/profile/password", payload);
  },

  signUp: async (credentials: SignUpCredentials): Promise<AuthResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          user: {
            id: "1",
            email: credentials.email,
            name: credentials.name,
            role: "staff",
          },
          tokens: {
            accessToken: "demo-access-token",
            refreshToken: "demo-refresh-token",
          },
        });
      }, 1000);
    });
  },

  signOut: async (): Promise<void> => {
    return Promise.resolve();
  },

  refreshToken: async (
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await apiClient.post<ApiResponse<AuthTokensResponse>>(
      "/admin/refresh",
      { refresh_token: refreshToken },
    );

    const data = response.data.data;

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };
  },
};
