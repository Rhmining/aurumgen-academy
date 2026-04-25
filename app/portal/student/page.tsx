import Link from "next/link";
import { PortalShell } from "@/components/portal/portal-shell";
import { AirumPanel } from "@/components/airum/airum-panel";
import { getStudentDashboardData } from "@/lib/db/dashboard";

export default async function StudentPortalPage() {
  const data = await getStudentDashboardData();

  return (
    <PortalShell
      title="Student Portal"
      description="Lihat target minggu ini, materi prioritas, dan momentum belajar dalam satu tampilan."
      sections={[
        { href: "/portal/student", label: "Overview" },
        { href: "/portal/materials", label: "Materials" },
        { href: "/portal/curriculum", label: "Curriculum" },
        { href: "/portal/progress", label: "Progress" }
      ]}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric) => (
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
            {data.priorityQueue.map((item) => (
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
            {data.weeklyGoals.map((goal) => (
              <div key={goal} className="rounded-[1.5rem] bg-black/5 px-5 py-4 text-sm dark:bg-white/5">
                {goal}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="surface rounded-[2rem] p-6">
          <p className="eyebrow">Rencana sesi</p>
          <h2 className="mt-3 font-display text-3xl">Urutan belajar yang paling ringan dijalankan</h2>
          <div className="mt-6 space-y-4">
            {[
              {
                title: "1. Buka satu materi portal terbaru",
                detail: "Mulai dari materials untuk membaca topik terbaru sebelum bertanya ke AI-RUM.",
                href: "/portal/materials"
              },
              {
                title: "2. Cek progress snapshot terakhir",
                detail: "Lihat subject mana yang naik, stabil, atau butuh remedial sebelum lanjut latihan.",
                href: "/portal/progress"
              },
              {
                title: "3. Tanya AI-RUM dengan konteks yang spesifik",
                detail: "Gunakan quick prompt atau tulis pertanyaan berdasarkan materi yang baru dibaca.",
                href: "/portal/student"
              }
            ].map((step) => (
              <Link
                key={step.title}
                href={step.href}
                className="block rounded-[1.5rem] border border-black/5 p-5 transition hover:border-black/10 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
              >
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-[rgb(var(--muted))]">{step.detail}</p>
              </Link>
            ))}
          </div>
        </article>

        <article className="surface rounded-[2rem] p-6">
          <p className="eyebrow">Belajar lebih fokus</p>
          <h2 className="mt-3 font-display text-3xl">Cara memakai portal ini dengan efektif</h2>
          <div className="mt-6 space-y-3">
            {[
              "Mulai dari materi terbaru, lalu tulis satu pertanyaan ke AI-RUM berdasarkan bagian yang belum jelas.",
              "Kalau snapshot progres turun atau stagnan, buka progress center dulu sebelum pindah topik baru.",
              "Gunakan curriculum map untuk tahu apakah topik ini inti pathway atau hanya penguatan tambahan."
            ].map((tip) => (
              <div key={tip} className="rounded-[1.5rem] bg-black/5 px-5 py-4 text-sm dark:bg-white/5">
                {tip}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="surface rounded-[2rem] p-6">
          <p className="eyebrow">Activity snapshot</p>
          <h2 className="mt-3 font-display text-3xl">Data nyata dari penggunaanmu</h2>
          <div className="mt-6 space-y-4">
            {data.activity.map((item) => (
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
                href: "/portal/student",
                title: "Lanjutkan ke AI-RUM di halaman ini",
                detail: "Gunakan quick prompts di bawah untuk mengubah materi dan progres menjadi sesi tanya jawab."
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
