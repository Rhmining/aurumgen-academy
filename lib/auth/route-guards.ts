import type { UserRole } from "@/lib/db/types";

export const protectedRouteGroups: Record<string, UserRole[]> = {
  "/account": ["student", "parent", "teacher", "aiadmin", "developer"],
  "/portal": ["student", "parent"],
  "/portal/student": ["student"],
  "/portal/parent": ["parent"],
  "/teacher": ["teacher"],
  "/ai-knowledge": ["aiadmin"],
  "/developer": ["developer"]
};
