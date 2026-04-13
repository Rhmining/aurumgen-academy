import { PortalShell } from "@/components/portal/portal-shell";

export default function PortalCurriculumPage() {
  return (
    <PortalShell title="Curriculum Map" description="Peta kurikulum yang memperjelas target belajar setiap fase.">
      <section className="surface rounded-[1.75rem] p-6">
        <h2 className="font-display text-3xl">Roadmap semester</h2>
        <p className="mt-3 text-[rgb(var(--muted))]">
          Tampilkan milestones mingguan, keterkaitan materi, dan checkpoint evaluasi agar semua pihak melihat arah yang sama.
        </p>
      </section>
    </PortalShell>
  );
}
