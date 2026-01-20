import { UserRole } from "@/types/auth";

export const roleAccess: Record<string, UserRole[]> = {
  ROLE_CONTROL: ["super_admin", "admin"],
  ROLES_PAGE: ["super_admin"],
};
