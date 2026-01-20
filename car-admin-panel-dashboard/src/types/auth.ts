export type UserRole = "super_admin" | "admin" | "staff" | string;

export interface User {
  id: string;
  adminId?: number;
  email: string;
  name: string;
  role: UserRole;
  roles?: string[];
  permissions?: string[];
  firstName?: string;
  lastName?: string;
  phone?: string;
  emailVerified?: boolean;
  isActive?: boolean;
}

export interface DecodedToken {
  admin_id: number;
  first_name: string;
  last_name: string;
  roles: string[];
  exp: number;
  iat: number;
  // Add other fields if present in the token
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
