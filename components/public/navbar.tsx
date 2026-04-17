"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { BrandLogo } from "@/components/public/brand-logo";
import { createClient } from "@/lib/supabase/browser";
import { getDefaultRouteForRole } from "@/lib/auth/redirects";
import { parseUserRole } from "@/lib/auth/get-user-role";
import type { UserRole } from "@/lib/db/types";

const links = [
  { href: "/", label: "Beranda" },
  { href: "/programs", label: "Program" },
  { href: "/pathway", label: "Pathway" },
  { href: "/contact", label: "Konsultasi" }
];

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [accountLink, setAccountLink] = useState<{ href: string; label: string }>({
    href: "/login",
    label: "Login"
  });

  useEffect(() => {
    const supabase = createClient();

    async function loadAuthLink() {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        setAccountLink({ href: "/login", label: "Login" });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      const role = parseUserRole(
        typeof profile?.role === "string"
          ? profile.role
          : typeof user.user_metadata?.role === "string"
            ? user.user_metadata.role
            : "student"
      );

      setAccountLink({
        href: getDefaultRouteForRole(role as UserRole),
        label: "Dashboard"
      });
    }

    void loadAuthLink();
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-[rgba(var(--background),0.78)] backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3.5">
        <Link href="/" className="shrink-0">
          <BrandLogo
            className="min-w-fit"
            markClassName="h-11 w-11 md:h-12 md:w-12"
            textClassName="min-w-fit"
          />
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-[rgb(var(--muted))] transition hover:text-[rgb(var(--foreground))]">
              {link.label}
            </Link>
          ))}
          <Link href={accountLink.href} className="text-[rgb(var(--muted))] transition hover:text-[rgb(var(--foreground))]">
            {accountLink.label}
          </Link>
        </nav>
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-full border border-black/10 px-3 py-2 text-sm"
        >
          {theme === "light" ? "Mode gelap" : "Mode terang"}
        </button>
      </div>
    </header>
  );
}
