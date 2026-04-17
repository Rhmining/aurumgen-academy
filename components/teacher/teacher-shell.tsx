"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AccountPanel } from "@/components/workspace/account-panel";

const sections = [
  { href: "/teacher", label: "Overview" },
  { href: "/teacher/materials", label: "Materials" },
  { href: "/teacher/question-bank", label: "Question Bank" },
  { href: "/teacher/curriculum", label: "Curriculum" },
  { href: "/teacher/students", label: "Students" },
  { href: "/teacher/airum-test", label: "AI-RUM Test" },
  { href: "/teacher/upload-flow", label: "Upload Flow" }
];

export function TeacherShell({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="page-shell px-6 py-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="surface rounded-[2rem] p-5">
          <p className="eyebrow">Teacher workspace</p>
          <h1 className="mt-4 font-display text-3xl">{title}</h1>
          <p className="mt-3 text-sm text-[rgb(var(--muted))]">{description}</p>
          <div className="mt-8 space-y-2">
            {sections.map((section) => {
              const isActive =
                section.href === "/teacher" ? pathname === section.href : pathname.startsWith(section.href);

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
