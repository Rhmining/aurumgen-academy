import { PortalShell } from "@/components/portal/portal-shell";
import { getPortalCurriculumData } from "@/lib/db/dashboard";

export default async function PortalCurriculumPage() {
  const data = await getPortalCurriculumData();
  const overviewHref = data.role === "parent" ? "/portal/parent" : "/portal/student";

  return (
    <PortalShell
      title="Curriculum Map"
      description="Peta kurikulum yang memperjelas target belajar setiap fase."
      sections={[
        { href: data.role === "parent" ? "/portal/parent" : "/portal/student", label: "Overview" },
        { href: "/portal/materials", label: "Materials" },
        { href: "/portal/curriculum", label: "Curriculum" },
        { href: "/portal/progress", label: "Progress" }
      ]}
    >
      <section className="grid gap-4 md:grid-cols-4">
        {data.summary.map((item) => (
          <article key={item.label} className="surface rounded-[1.75rem] p-6">
            <p className="text-sm text-[rgb(var(--muted))]">{item.label}</p>
            <p className="mt-4 font-display text-4xl">{item.value}</p>
            <p className="mt-3 text-sm text-[rgb(var(--muted))]">{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {data.items.map((item) => (
          <article key={`${item.title}-${item.detail}`} className="surface rounded-[1.75rem] p-6">
            <h2 className="font-display text-2xl">{item.title}</h2>
            <p className="mt-3 text-[rgb(var(--muted))]">{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr_1fr]">
        {data.programTracks.map((track) => (
          <article key={track.title} className="surface rounded-[1.75rem] p-6">
            <p className="eyebrow">Program utama</p>
            <h2 className="mt-3 font-display text-3xl">{track.title}</h2>
            <p className="mt-3 text-[rgb(var(--muted))]">{track.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <article className="surface rounded-[1.75rem] p-6">
          <p className="eyebrow">Cara membaca curriculum</p>
          <h2 className="mt-3 font-display text-3xl">Gunakan map ini untuk tahu konteks topik</h2>
          <div className="mt-6 space-y-3">
            {[
              "Mulai dari item yang subject dan pathway-nya paling dekat dengan materi yang sedang Anda baca.",
              "Kalau sebuah topik terasa sulit, pakai curriculum map untuk melihat apakah itu topik inti atau penguatan tambahan.",
              "Setelah melihat map, lanjutkan ke AI-RUM dengan pertanyaan yang spesifik ke topik itu."
            ].map((tip) => (
              <div key={tip} className="rounded-[1.5rem] bg-black/5 px-5 py-4 text-sm dark:bg-white/5">
                {tip}
              </div>
            ))}
          </div>
        </article>

        <article className="surface rounded-[1.75rem] p-6">
          <p className="eyebrow">Arah berikutnya</p>
          <h2 className="mt-3 font-display text-3xl">Pindah ke area belajar yang paling nyambung</h2>
          <div className="mt-6 grid gap-3">
            {[
              {
                href: "/portal/materials",
                title: "Buka materials",
                detail: "Cari materi yang mendukung topik dalam curriculum map ini."
              },
              {
                href: "/portal/progress",
                title: "Cek progress",
                detail: "Pastikan topik yang sedang dipelajari sesuai dengan snapshot progres terbaru."
              },
              {
                href: overviewHref,
                title: data.role === "parent" ? "Kembali ke parent overview" : "Masuk ke AI-RUM",
                detail: "Tanyakan konsep yang masih belum jelas berdasarkan curriculum dan materials."
              }
            ].map((action) => (
              <article key={action.href} className="rounded-[1.5rem] border border-black/5 p-5 dark:border-white/10">
                <h3 className="font-semibold">{action.title}</h3>
                <p className="mt-2 text-sm text-[rgb(var(--muted))]">{action.detail}</p>
              </article>
            ))}
          </div>
        </article>
      </section>
    </PortalShell>
  );
}
