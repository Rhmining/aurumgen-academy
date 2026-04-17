import type { UserRole } from "@/lib/db/types";
import { parseUserRole } from "@/lib/auth/get-user-role";

export async function resolveUserRole(
  supabase: any,
  user: { id: string; user_metadata?: Record<string, unknown> | null } | null
): Promise<UserRole> {
  const metadataRole = parseUserRole(
    typeof user?.user_metadata?.role === "string" ? user.user_metadata.role : null
  );

  if (!user) {
    return metadataRole;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return parseUserRole(profile?.role ?? metadataRole);
}
