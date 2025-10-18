// types/user.ts
export interface User {
  id: number; // Changed from string to number to match your API
  full_name: string;
  email: string;
  phone: string;
  role: string;
  is_verified?: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface UserCreateInput {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
}

export interface UserUpdateInput {
  full_name?: string;
  email?: string;
  phone?: string;
  role?: string;
}