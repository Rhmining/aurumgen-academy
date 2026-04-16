import Link from "next/link";
import { PortalShell } from "@/components/portal/portal-shell";
import { AirumPanel } from "@/components/airum/airum-panel";
import {
  studentMomentum,
  studentOverviewMetrics,
  studentPriorityQueue,
  studentWeeklyGoals
} from "@/lib/db/queries";

export default function StudentPortalPage() {
  return (
    <PortalShell
      title="Student Portal"
      description="Lihat target minggu ini, materi prioritas, dan momentum belajar dalam satu tampilan."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {studentOverviewMetrics.map((metric) => (
          <article key={metric.label} className="surface rounded-[1.75rem] p-6">
            <p className="text-sm text-[rgb(var(--muted))]">{metric.label}</p>
            <p className="mt-4 font-display text-4xl">{metric.value}</p>
            <p className="mt-3 text-sm text-[rgb(var(--muted))]">{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="surface rounded-[2rem] p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Prioritas aktif</p>
              <h2 className="mt-3 font-display text-3xl">Kerjakan ini lebih dulu</h2>
            </div>
            <Link href="/portal/progress" className="text-sm font-semibold underline-offset-4 hover:underline">
              Buka progress
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {studentPriorityQueue.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="block rounded-[1.5rem] border border-black/5 p-5 transition hover:border-black/10 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-[rgb(var(--muted))]">{item.type}</p>
                    <h3 className="mt-2 text-xl font-semibold">{item.title}</h3>
                  </div>
                  <span className="rounded-full bg-[rgb(var(--accent-soft))] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
                    aktif
                  </span>
                </div>
                <p className="mt-3 text-sm text-[rgb(var(--muted))]">{item.status}</p>
              </Link>
            ))}
          </div>
        </article>

        <article className="surface rounded-[2rem] p-6">
          <p className="eyebrow">Target minggu ini</p>
          <h2 className="mt-3 font-display text-3xl">Ritme yang perlu dijaga</h2>
          <div className="mt-6 space-y-3">
            {studentWeeklyGoals.map((goal) => (
              <div key={goal} className="rounded-[1.5rem] bg-black/5 px-5 py-4 text-sm dark:bg-white/5">
                {goal}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="surface rounded-[2rem] p-6">
          <p className="eyebrow">Momentum subject</p>
          <h2 className="mt-3 font-display text-3xl">Baca arah progresmu</h2>
          <div className="mt-6 space-y-4">
            {studentMomentum.map((item) => (
              <div key={item.subject} className="rounded-[1.5rem] border border-black/5 p-5 dark:border-white/10">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold">{item.subject}</h3>
                  <span className="text-sm text-[rgb(var(--muted))]">{item.trend}</span>
                </div>
                <p className="mt-3 text-sm text-[rgb(var(--muted))]">{item.detail}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="surface rounded-[2rem] p-6">
          <p className="eyebrow">Langkah cepat</p>
          <h2 className="mt-3 font-display text-3xl">Masuk ke area belajar utama</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {[
              {
                href: "/portal/materials",
                title: "Buka materials library",
                detail: "Cari materi inti yang perlu dibaca sebelum kelas berikutnya."
              },
              {
                href: "/portal/curriculum",
                title: "Lihat curriculum map",
                detail: "Pahami posisi topic yang sedang dikerjakan di jalur belajar."
              },
              {
                href: "/portal/progress",
                title: "Review progress center",
                detail: "Pantau subject mana yang naik, stabil, atau butuh remedial."
              },
              {
                href: "/portal/parent",
                title: "Lihat parent-facing update",
                detail: "Pastikan narasi progres tetap sinkron dengan keluarga."
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

      <AirumPanel role="student" />
    </PortalShell>
  );
}
