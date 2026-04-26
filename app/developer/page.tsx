import Link from "next/link";
import { DeveloperShell } from "@/components/developer/developer-shell";
import { AirumAnalyticsPanel } from "@/components/developer/airum-analytics-panel";
import { SystemHealthPanel } from "@/components/developer/system-health-panel";
import { getDeveloperDashboardData } from "@/lib/db/dashboard";

export default async function DeveloperPage() {
  const data = await getDeveloperDashboardData();

  return (
    <DeveloperShell
      title="Developer Overview"
      description="Observability, model governance, dan tindakan prioritas platform AURUMGEN."
    >
      <section className="grid gap-4 md:grid-cols-3">
        {data.metrics.map((item) => (
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
            {data.runbook.map((item) => (
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
            {data.shortcuts.map((action) => (
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

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <article className="surface rounded-[2rem] p-6">
          <p className="eyebrow">Recent signals</p>
          <h2 className="mt-3 font-display text-3xl">Perubahan terbaru yang layak dipantau</h2>
          <div className="mt-6 space-y-4">
            {data.recentSignals.map((signal) => (
              <Link
                key={`${signal.title}-${signal.detail}`}
                href={signal.href}
                className="block rounded-[1.5rem] border border-black/5 p-5 transition hover:border-black/10 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
              >
                <h3 className="font-semibold">{signal.title}</h3>
                <p className="mt-2 text-sm text-[rgb(var(--muted))]">{signal.detail}</p>
              </Link>
            ))}
          </div>
        </article>

        <article className="surface rounded-[2rem] p-6">
          <p className="eyebrow">Operational notes</p>
          <h2 className="mt-3 font-display text-3xl">Checklist cepat untuk jaga platform tetap sehat</h2>
          <div className="mt-6 space-y-3">
            {[
              "Cocokkan resource growth dengan dashboard teacher dan portal untuk memastikan data live mengalir end-to-end.",
              "Kalau ada AI doc failed atau parser_failed, cocokkan ingestion, logs, dan route response agar error tidak tersembunyi.",
              "Pantau perubahan materials dan question bank setelah deploy untuk memastikan policy/RLS production tetap sinkron."
            ].map((note) => (
              <div key={note} className="rounded-[1.5rem] bg-black/5 p-5 text-sm text-[rgb(var(--muted))] dark:bg-white/5">
                {note}
              </div>
            ))}
          </div>
        </article>
      </section>

      <SystemHealthPanel />
      <AirumAnalyticsPanel />
    </DeveloperShell>
  );
}
