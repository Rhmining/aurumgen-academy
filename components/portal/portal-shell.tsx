"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { AccountPanel } from "@/components/workspace/account-panel";

const sections = [
  { href: "/portal/student", label: "Student" },
  { href: "/portal/parent", label: "Parent" },
  { href: "/portal/materials", label: "Materials" },
  { href: "/portal/curriculum", label: "Curriculum" },
  { href: "/portal/progress", label: "Progress" }
];

export function PortalShell({
  title,
  description,
  children,
  sections: customSections
}: {
  title: string;
  description: string;
  children: ReactNode;
  sections?: Array<{ href: string; label: string }>;
}) {
  const pathname = usePathname();
  const navSections = customSections ?? sections;

  return (
    <div className="page-shell px-6 py-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="surface rounded-[2rem] p-5">
          <p className="eyebrow">Portal</p>
          <h1 className="mt-4 font-display text-3xl">{title}</h1>
          <p className="mt-3 text-sm text-[rgb(var(--muted))]">{description}</p>
          <div className="mt-8 space-y-2">
            {navSections.map((section) => {
              const isActive =
                section.href === "/portal/student" || section.href === "/portal/parent"
                  ? pathname === section.href
                  : pathname.startsWith(section.href);

              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className={`block rounded-2xl px-4 py-3 text-sm transition ${
                    isActive
                      ? "bg-[rgb(var(--accent-soft))] text-[rgb(var(--foreground))] shadow-[inset_0_0_0_1px_rgba(184,138,44,0.18)]"
                      : "text-[rgb(var(--muted))] hover:bg-black/5 hover:text-[rgb(var(--foreground))]"
                  }`}
                >
                  {section.label}
                </Link>
              );
            })}
          </div>
          <AccountPanel />
        </aside>
        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
