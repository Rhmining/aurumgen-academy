import Link from "next/link";
import { TeacherShell } from "@/components/teacher/teacher-shell";
import {
  teacherFocusTasks,
  teacherOverviewMetrics,
  teacherSignals,
  teacherWorkflowSummary
} from "@/lib/db/queries";

export default function TeacherDashboardPage() {
  return (
    <TeacherShell
      title="Teacher Dashboard"
      description="Pantau kelas, materi, soal, dan siswa yang perlu perhatian tanpa berpindah terlalu jauh."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {teacherOverviewMetrics.map((metric) => (
          <article key={metric.label} className="surface rounded-[1.75rem] p-6">
            <p className="text-sm text-[rgb(var(--muted))]">{metric.label}</p>
            <p className="mt-4 font-display text-4xl">{metric.value}</p>
            <p className="mt-3 text-sm text-[rgb(var(--muted))]">{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="surface rounded-[2rem] p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Fokus hari ini</p>
              <h2 className="mt-3 font-display text-3xl">Tiga tindakan yang paling berdampak</h2>
            </div>
            <Link href="/teacher/materials" className="text-sm font-semibold text-[rgb(var(--foreground))] underline-offset-4 hover:underline">
              Buka workspace teacher
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {teacherFocusTasks.map((task, index) => (
              <Link
                key={task.title}
                href={task.href}
                className="block rounded-[1.5rem] border border-black/5 p-5 transition hover:border-black/10 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[rgb(var(--muted))]">Prioritas {index + 1}</p>
                <h3 className="mt-3 text-xl font-semibold">{task.title}</h3>
                <p className="mt-2 text-sm text-[rgb(var(--muted))]">{task.detail}</p>
              </Link>
            ))}
          </div>
        </article>

        <article className="surface rounded-[2rem] p-6">
          <p className="eyebrow">Workflow ringkas</p>
          <h2 className="mt-3 font-display text-3xl">Apa yang masih tertahan</h2>
          <div className="mt-6 space-y-4">
            {teacherWorkflowSummary.map((item) => (
              <div key={item.stage} className="rounded-[1.5rem] bg-black/5 p-5 dark:bg-white/5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{item.stage}</h3>
                    <p className="mt-2 text-sm text-[rgb(var(--muted))]">{item.note}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-[rgb(var(--foreground))] dark:bg-black/30">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="surface rounded-[2rem] p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Sinyal siswa</p>
              <h2 className="mt-3 font-display text-3xl">Intervensi dan momentum belajar</h2>
            </div>
            <Link href="/teacher/students" className="text-sm font-semibold underline-offset-4 hover:underline">
              Lihat semua
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {teacherSignals.map((signal) => (
              <div
                key={signal.student}
                className="flex flex-col gap-4 rounded-[1.5rem] border border-black/5 p-5 md:flex-row md:items-center md:justify-between dark:border-white/10"
              >
                <div>
                  <p className="text-sm text-[rgb(var(--muted))]">{signal.subject}</p>
                  <h3 className="mt-2 text-xl font-semibold">{signal.student}</h3>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="rounded-full bg-[rgb(var(--accent-soft))] px-3 py-1 font-semibold text-[rgb(var(--foreground))]">
                    {signal.status}
                  </span>
                  <span className="text-[rgb(var(--muted))]">Trend {signal.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="surface rounded-[2rem] p-6">
          <p className="eyebrow">Quick actions</p>
          <h2 className="mt-3 font-display text-3xl">Masuk ke alur kerja utama</h2>
          <div className="mt-6 grid gap-3">
            {[
              {
                href: "/teacher/materials",
                title: "Upload dan publish materi",
                detail: "Masuk ke material pipeline untuk file, metadata, dan visibility."
              },
              {
                href: "/teacher/question-bank",
                title: "Lengkapi question bank",
                detail: "Pastikan set soal punya pathway, level, dan answer key yang benar."
              },
              {
                href: "/teacher/upload-flow",
                title: "Cek upload flow",
                detail: "Verifikasi file upload dan sinkronisasi storage sebelum kelas dimulai."
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
    </TeacherShell>
  );
}
