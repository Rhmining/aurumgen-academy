import { cache } from "react";
import { resolveUserRole } from "@/lib/auth/resolve-role";
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

  return resolveUserRole(supabase, user);
});
