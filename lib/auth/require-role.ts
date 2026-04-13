import { redirect } from "next/navigation";
import type { UserRole } from "@/lib/db/types";

export function requireRole(currentRole: UserRole, allowedRoles: UserRole[]) {
  if (!allowedRoles.includes(currentRole)) {
    redirect("/login");
  }
}
