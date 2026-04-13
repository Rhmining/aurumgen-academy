import { cache } from "react";
import { parseUserRole } from "@/lib/auth/get-user-role";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/db/types";

export const getCurrentUserRole = cache(async (): Promise<UserRole | null> => {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const metadataRole = parseUserRole(
    typeof user.user_metadata?.role === "string" ? user.user_metadata.role : null
  );

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return parseUserRole(profile?.role ?? metadataRole);
});
