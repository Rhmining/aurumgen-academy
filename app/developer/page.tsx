import Link from "next/link";
import { DeveloperShell } from "@/components/developer/developer-shell";
import { AirumAnalyticsPanel } from "@/components/developer/airum-analytics-panel";
import { SystemHealthPanel } from "@/components/developer/system-health-panel";
import { developerOverviewCards, developerRunbook } from "@/lib/db/queries";

export default function DeveloperPage() {
  return (
    <DeveloperShell
      title="Developer Overview"
      description="Observability, model governance, dan tindakan prioritas platform AURUMGEN."
    >
      <section className="grid gap-4 md:grid-cols-3">
        {developerOverviewCards.map((item) => (
          <article key={item.label} className="surface rounded-[1.75rem] p-6">
            <p className="text-sm text-[rgb(var(--muted))]">{item.label}</p>
            <p className="mt-4 font-display text-3xl">{item.value}</p>
            <p className="mt-3 text-sm text-[rgb(var(--muted))]">{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="surface rounded-[2rem] p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Runbook cepat</p>
              <h2 className="mt-3 font-display text-3xl">Kalau ada issue, mulai dari sini</h2>
            </div>
            <Link href="/developer/logs" className="text-sm font-semibold underline-offset-4 hover:underline">
              Buka logs
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {developerRunbook.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="block rounded-[1.5rem] border border-black/5 p-5 transition hover:border-black/10 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
              >
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-[rgb(var(--muted))]">{item.detail}</p>
              </Link>
            ))}
          </div>
        </article>

        <article className="surface rounded-[2rem] p-6">
          <p className="eyebrow">Shortcuts</p>
          <h2 className="mt-3 font-display text-3xl">Area yang paling sering dibuka</h2>
          <div className="mt-6 grid gap-3">
            {[
              {
                href: "/developer/models",
                title: "Audit model config",
                detail: "Pastikan responses, evaluator, dan embedding model sesuai environment live."
              },
              {
                href: "/developer/costs",
                title: "Pantau biaya",
                detail: "Baca cost exposure dan cari area prompt atau model yang perlu dihemat."
              },
              {
                href: "/developer/pipeline",
                title: "Periksa pipeline",
                detail: "Cek alur ingestion, retrieval, evaluator, dan fallback."
              }
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="rounded-[1.5rem] border border-black/5 p-5 transition hover:border-black/10 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
              >
                <h3 className="font-semibold">{action.title}</h3>
                <p className="mt-2 text-sm text-[rgb(var(--muted))]">{action.detail}</p>
              </Link>
            ))}
          </div>
        </article>
      </section>

      <SystemHealthPanel />
      <AirumAnalyticsPanel />
    </DeveloperShell>
  );
}
