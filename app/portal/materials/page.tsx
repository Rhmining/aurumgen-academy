import { PortalShell } from "@/components/portal/portal-shell";

export default function PortalMaterialsPage() {
  return (
    <PortalShell title="Materials Library" description="Koleksi materi lintas pathway yang bisa diakses dari portal.">
      <section className="grid-cards">
        {["IGCSE Chemistry Notes", "IB Economics Essay Pack", "University Personal Statement Kit"].map((item) => (
          <article key={item} className="surface rounded-[1.75rem] p-6">
            <h2 className="font-semibold">{item}</h2>
          </article>
        ))}
      </section>
    </PortalShell>
  );
}
