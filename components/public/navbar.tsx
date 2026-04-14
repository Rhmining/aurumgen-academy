"use client";

import Link from "next/link";
import { useTheme } from "@/components/providers/theme-provider";
import { BrandLogo } from "@/components/public/brand-logo";

const links = [
  { href: "/", label: "Beranda" },
  { href: "/programs", label: "Program" },
  { href: "/pathway", label: "Pathway" },
  { href: "/contact", label: "Konsultasi" },
  { href: "/login", label: "Login" }
];

export function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-[rgba(var(--background),0.78)] backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="min-w-0">
          <BrandLogo className="max-w-[220px]" markClassName="h-10 w-10" textClassName="truncate text-base md:text-lg" />
        </Link>
        <nav className="hidden gap-6 text-sm md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-[rgb(var(--muted))] transition hover:text-[rgb(var(--foreground))]">
              {link.label}
            </Link>
          ))}
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
