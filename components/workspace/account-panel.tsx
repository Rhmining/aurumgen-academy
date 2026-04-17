"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import type { UserRole } from "@/lib/db/types";

type AccountState = {
  fullName: string | null;
  email: string | null;
  role: UserRole | null;
};

function formatRole(role: UserRole | null) {
  if (!role) return "Authenticated user";
  if (role === "aiadmin") return "AI Admin";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function AccountPanel() {
  const router = useRouter();
  const [account, setAccount] = useState<AccountState>({
    fullName: null,
    email: null,
    role: null
  });
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function loadAccount() {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .maybeSingle();

      setAccount({
        fullName: typeof profile?.full_name === "string" ? profile.full_name : null,
        email: user.email ?? null,
        role: (typeof profile?.role === "string" ? profile.role : user.user_metadata?.role ?? null) as UserRole | null
      });
    }

    void loadAccount();
  }, []);

  async function handleLogout() {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="mt-8 rounded-[1.75rem] border border-black/5 bg-black/5 p-4 dark:border-white/10 dark:bg-white/5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--muted))]">Akun</p>
      <h2 className="mt-3 font-semibold text-[rgb(var(--foreground))]">
        {account.fullName || account.email || "User aktif"}
      </h2>
      <p className="mt-1 text-sm text-[rgb(var(--muted))]">{formatRole(account.role)}</p>
      {account.email ? <p className="mt-1 text-sm text-[rgb(var(--muted))]">{account.email}</p> : null}

      <div className="mt-4 grid gap-2">
        <Link
          href="/account"
          className="rounded-2xl border border-black/10 px-4 py-3 text-sm font-medium transition hover:bg-white dark:border-white/10 dark:hover:bg-black/20"
        >
          Profile
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isSigningOut}
          className="rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {isSigningOut ? "Keluar..." : "Logout"}
        </button>
      </div>
    </div>
  );
}
