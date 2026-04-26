import Link from "next/link";
import { PortalShell } from "@/components/portal/portal-shell";
import { AirumPanel } from "@/components/airum/airum-panel";
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

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <article className="surface rounded-[2rem] p-6">
          <p className="eyebrow">Langkah pendampingan</p>
          <h2 className="mt-3 font-display text-3xl">Urutan paling sederhana untuk mendampingi minggu ini</h2>
          <div className="mt-6 space-y-4">
            {data.helperSteps.map((step) => (
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
          <p className="eyebrow">Cara memakai portal</p>
          <h2 className="mt-3 font-display text-3xl">Supaya parent portal terasa membantu, bukan membingungkan</h2>
          <div className="mt-6 space-y-3">
            {[
              "Mulai dari progress center agar diskusi keluarga bertumpu pada sinyal nyata, bukan asumsi.",
              "Gunakan materials untuk memahami konteks subject sebelum memberi masukan atau dorongan belajar.",
              "Kalau butuh bantuan merangkum, masuk ke overview parent lalu pakai AI-RUM untuk menyusun percakapan yang lebih tenang."
            ].map((tip) => (
              <div key={tip} className="rounded-[1.5rem] bg-black/5 p-5 text-sm text-[rgb(var(--muted))] dark:bg-white/5">
                {tip}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="surface rounded-[2rem] p-6">
          <p className="eyebrow">Pendampingan yang elegan</p>
          <h2 className="mt-3 font-display text-3xl">Gunakan parent portal sebagai ruang membaca konteks, bukan ruang mengontrol</h2>
          <div className="mt-6 space-y-3">
            {[
              "Baca progress dulu, lalu materials, baru ajak anak berdiskusi dengan pertanyaan yang lembut dan spesifik.",
              "Gunakan curriculum map untuk memahami posisi topik, agar ekspektasi keluarga tetap realistis.",
              "Kalau perlu ringkasan singkat, pakai AI-RUM mode parent untuk menyusun briefing belajar di rumah."
            ].map((tip) => (
              <div key={tip} className="rounded-[1.5rem] bg-black/5 p-5 text-sm text-[rgb(var(--muted))] dark:bg-white/5">
                {tip}
              </div>
            ))}
          </div>
        </article>

        <article className="surface rounded-[2rem] p-6">
          <p className="eyebrow">Arah percakapan</p>
          <h2 className="mt-3 font-display text-3xl">Tiga jenis diskusi rumah yang paling membantu</h2>
          <div className="mt-6 grid gap-3">
            {[
              {
                title: "Apa topik yang paling terasa berat minggu ini?",
                detail: "Mulai dari perasaan dan hambatan, bukan langsung dari nilai."
              },
              {
                title: "Materi mana yang paling perlu dibuka ulang?",
                detail: "Gunakan daftar materials untuk menunjuk satu fokus yang realistis."
              },
              {
                title: "Bantuan seperti apa yang paling dibutuhkan?",
                detail: "Pakai AI-RUM untuk merangkum opsi: penjelasan ulang, latihan, atau pacing ulang."
              }
            ].map((item) => (
              <div key={item.title} className="rounded-[1.5rem] border border-black/5 p-5 dark:border-white/10">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-[rgb(var(--muted))]">{item.detail}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <AirumPanel role="parent" />
    </PortalShell>
  );
}
