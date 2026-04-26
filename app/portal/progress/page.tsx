import Link from "next/link";
import { PortalShell } from "@/components/portal/portal-shell";
import { getPortalProgressData } from "@/lib/db/dashboard";

export default async function PortalProgressPage() {
  const data = await getPortalProgressData();
  const overviewHref = data.role === "parent" ? "/portal/parent" : "/portal/student";

  return (
    <PortalShell
      title="Progress Center"
      description="Visual progress, drill completion, dan target remedial."
      sections={[
        { href: data.role === "parent" ? "/portal/parent" : "/portal/student", label: "Overview" },
        { href: "/portal/materials", label: "Materials" },
        { href: "/portal/curriculum", label: "Curriculum" },
        { href: "/portal/progress", label: "Progress" }
      ]}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((item) => (
          <article key={item.label} className="surface rounded-[1.75rem] p-6">
            <p className="text-sm text-[rgb(var(--muted))]">{item.label}</p>
            <p className="mt-4 font-display text-4xl">{item.value}</p>
            <p className="mt-3 text-sm text-[rgb(var(--muted))]">{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {data.timeline.map((item) => (
          <article key={`${item.title}-${item.detail}`} className="surface rounded-[1.75rem] p-6">
            <h2 className="font-display text-2xl">{item.title}</h2>
            <p className="mt-3 text-[rgb(var(--muted))]">{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <article className="surface rounded-[1.75rem] p-6">
          <p className="eyebrow">Apa berikutnya</p>
          <h2 className="mt-3 font-display text-3xl">Gunakan progress untuk ambil keputusan belajar</h2>
          <div className="mt-6 space-y-3">
            {[
              "Kalau snapshot terbaru naik, lanjutkan ke materi berikutnya dengan ritme yang sama.",
              "Kalau snapshot terbaru stagnan, baca ulang satu materi inti lalu minta penjelasan ulang ke AI-RUM.",
              "Kalau ada note remedial, jadikan itu fokus utama sebelum pindah ke topik baru."
            ].map((tip) => (
              <div key={tip} className="rounded-[1.5rem] bg-black/5 px-5 py-4 text-sm dark:bg-white/5">
                {tip}
              </div>
            ))}
          </div>
        </article>

        <article className="surface rounded-[1.75rem] p-6">
          <p className="eyebrow">Langkah cepat</p>
          <h2 className="mt-3 font-display text-3xl">Pindah ke area yang paling relevan</h2>
          <div className="mt-6 grid gap-3">
            {[
              {
                href: "/portal/materials",
                title: "Review materials lagi",
                detail: "Buka materi terbaru yang paling dekat dengan snapshot progres Anda."
              },
              {
                href: "/portal/curriculum",
                title: "Cek curriculum map",
                detail: "Pastikan Anda paham posisi topik yang sedang naik atau turun."
              },
              {
                href: overviewHref,
                title: data.role === "parent" ? "Kembali ke parent overview" : "Buka AI-RUM di overview",
                detail: "Gunakan note progress terbaru sebagai prompt diskusi belajar."
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
    </PortalShell>
  );
}
