import type { UserRole } from "@/lib/db/types";

export const defaultRouteByRole: Record<UserRole, string> = {
  student: "/portal/student",
  parent: "/portal/parent",
  teacher: "/teacher",
  aiadmin: "/ai-knowledge",
  developer: "/developer"
};

export function getDefaultRouteForRole(role: UserRole) {
  return defaultRouteByRole[role];
}
