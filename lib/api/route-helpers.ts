import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { hasUniversalAccess } from "@/lib/auth/universal-access";

export function formatSupabaseError(error: any, stage?: string) {
  const parts = [
    stage ? `[${stage}]` : null,
    error?.message ?? "Supabase error"
  ];

  if (error?.code) {
    parts.push(`code=${error.code}`);
  }

  if (error?.details) {
    parts.push(`details=${error.details}`);
  }

  if (error?.hint) {
    parts.push(`hint=${error.hint}`);
  }

  return parts.filter(Boolean).join(" | ");
}

export async function requireSupabaseUser() {
  if (!hasSupabaseEnv()) {
    return {
      error: NextResponse.json(
        { error: "Environment Supabase belum diatur. Isi .env.local terlebih dahulu." },
        { status: 503 }
      )
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError) {
    return {
      error: NextResponse.json(
        { error: formatSupabaseError(userError, "auth.getUser") },
        { status: 401 }
      )
    };
  }

  if (!user) {
    return {
      error: NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 })
    };
  }

  return {
    supabase,
    user,
    isSuperAccount: hasUniversalAccess(user.email)
  };
}

export function applyOwnerScope(
  query: any,
  ownerId: string,
  bypassOwnerScope = false
) {
  if (bypassOwnerScope) {
    return query;
  }

  return query.eq("owner_id", ownerId);
}

export function normalizeArrayInput(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}
