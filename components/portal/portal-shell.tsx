import Link from "next/link";
import { ReactNode } from "react";

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
  children
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="page-shell px-6 py-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="surface rounded-[2rem] p-5">
          <p className="eyebrow">Portal</p>
          <h1 className="mt-4 font-display text-3xl">{title}</h1>
          <p className="mt-3 text-sm text-[rgb(var(--muted))]">{description}</p>
          <div className="mt-8 space-y-2">
            {sections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="block rounded-2xl px-4 py-3 text-sm text-[rgb(var(--muted))] transition hover:bg-black/5 hover:text-[rgb(var(--foreground))]"
              >
                {section.label}
              </Link>
            ))}
          </div>
        </aside>
        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
