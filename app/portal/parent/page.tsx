import Link from "next/link";
import { PortalShell } from "@/components/portal/portal-shell";
import { getParentDashboardData } from "@/lib/db/dashboard";

export default async function ParentPortalPage() {
  const data = await getParentDashboardData();

  return (
    <PortalShell
      title="Parent Portal"
      description="Ringkasan progres keluarga yang lebih mudah dibaca, ditindaklanjuti, dan disinkronkan dengan teacher workflow."
      sections={[
        { href: "/portal/parent", label: "Overview" },
        { href: "/portal/materials", label: "Materials" },
        { href: "/portal/curriculum", label: "Curriculum" },
        { href: "/portal/progress", label: "Progress" }
      ]}
    >
      <section className="grid gap-4 md:grid-cols-3">
        {data.metrics.map((metric) => (
          <article key={metric.label} className="surface rounded-[1.75rem] p-6">
            <p className="text-sm text-[rgb(var(--muted))]">{metric.label}</p>
            <p className="mt-4 font-display text-4xl">{metric.value}</p>
            <p className="mt-3 text-sm text-[rgb(var(--muted))]">{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="surface rounded-[2rem] p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Fokus keluarga</p>
              <h2 className="mt-3 font-display text-3xl">Tiga hal yang paling berguna untuk ditindaklanjuti</h2>
            </div>
            <Link href="/portal/progress" className="text-sm font-semibold underline-offset-4 hover:underline">
              Buka progress
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {data.highlights.map((item, index) => (
              <Link
                key={item.title}
                href={item.href}
                className="block rounded-[1.5rem] border border-black/5 p-5 transition hover:border-black/10 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[rgb(var(--muted))]">Prioritas {index + 1}</p>
                <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-[rgb(var(--muted))]">{item.body}</p>
              </Link>
            ))}
          </div>
        </article>

        <article className="surface rounded-[2rem] p-6">
          <p className="eyebrow">Sinyal terbaru</p>
          <h2 className="mt-3 font-display text-3xl">Apa yang baru terjadi di akun ini</h2>
          <div className="mt-6 space-y-3">
            {data.recentSignals.length ? (
              data.recentSignals.map((item) => (
                <div key={`${item.title}-${item.detail}`} className="rounded-[1.5rem] bg-black/5 p-5 dark:bg-white/5">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-[rgb(var(--muted))]">{item.detail}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.5rem] bg-black/5 p-5 text-sm text-[rgb(var(--muted))] dark:bg-white/5">
                Belum ada sinyal terbaru. Begitu materials, progress, atau aktivitas akun bertambah, ringkasan parent akan ikut bergerak.
              </div>
            )}
          </div>
        </article>
      </section>
    </PortalShell>
  );
}
