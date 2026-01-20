import { useAuth } from "./use-auth";
import { canAccess, hasPermission } from "@/lib/utils/permissions";
import type { UserRole } from "@/types/auth";

export function usePermissions() {
  const { user } = useAuth();

  return {
    hasPermission: (requiredRole: UserRole) =>
      user ? hasPermission(user.role, requiredRole) : false,
    canAccess: (requiredRoles: UserRole[]) =>
      user ? canAccess(user.role, requiredRoles) : false,
    isSuperAdmin: user?.role === "super_admin",
    isAdmin: user?.role === "admin" || user?.role === "super_admin",
    isStaff: user?.role === "staff" || user?.role === "admin" || user?.role === "super_admin",
  };
}
