import { UserRole } from "@/types/auth";

export const hasPermission = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const roleHierarchy: Record<UserRole, number> = {
    super_admin: 3,
    admin: 2,
    staff: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

export const canAccess = (userRole: UserRole, requiredRoles: UserRole[]): boolean => {
  return requiredRoles.some((role) => hasPermission(userRole, role));
};
