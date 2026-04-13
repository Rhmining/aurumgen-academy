import { PortalShell } from "@/components/portal/portal-shell";

const cards = [
  { title: "Ringkasan minggu ini", body: "Anak Anda konsisten di Biology dan butuh penguatan pada algebra word problems." },
  { title: "Rekomendasi tindakan", body: "Tambahkan 2 sesi drill 20 menit dan review error log pada akhir pekan." },
  { title: "Mood belajar", body: "Stabil, dengan engagement terbaik pada sesi yang dipandu AI-RUM." }
];

export default function ParentPortalPage() {
  return (
    <PortalShell
      title="Parent Portal"
      description="Laporan kemajuan yang mudah dibaca, tanpa kehilangan konteks akademik."
    >
      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <article key={card.title} className="surface rounded-[1.75rem] p-6">
            <h2 className="font-display text-2xl">{card.title}</h2>
            <p className="mt-3 text-[rgb(var(--muted))]">{card.body}</p>
          </article>
        ))}
      </section>
    </PortalShell>
  );
}
