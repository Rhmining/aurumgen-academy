import type { UserRole } from "@/lib/db/types";

export const protectedRouteGroups: Record<string, UserRole[]> = {
  "/portal": ["student", "parent"],
  "/portal/student": ["student"],
  "/portal/parent": ["parent"],
  "/teacher": ["teacher"],
  "/ai-knowledge": ["aiadmin"],
  "/developer": ["developer"]
};
