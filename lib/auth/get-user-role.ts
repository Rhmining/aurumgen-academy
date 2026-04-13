import type { UserRole } from "@/lib/db/types";

export function getUserRole(email?: string | null): UserRole {
  if (!email) {
    return "student";
  }

  if (email.includes("teacher")) return "teacher";
  if (email.includes("parent")) return "parent";
  if (email.includes("ai")) return "aiadmin";
  if (email.includes("dev")) return "developer";
  return "student";
}

export function parseUserRole(value?: string | null): UserRole {
  if (value === "student" || value === "parent" || value === "teacher" || value === "aiadmin" || value === "developer") {
    return value;
  }

  return "student";
}
