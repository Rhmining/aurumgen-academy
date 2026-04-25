import { PortalShell } from "@/components/portal/portal-shell";
import { getPortalMaterialsData } from "@/lib/db/dashboard";

export default async function PortalMaterialsPage() {
  const data = await getPortalMaterialsData();

  return (
    <PortalShell
      title="Materials Library"
      description="Koleksi materi lintas pathway yang bisa diakses dari portal."
      sections={[
        { href: data.role === "parent" ? "/portal/parent" : "/portal/student", label: "Overview" },
        { href: "/portal/materials", label: "Materials" },
        { href: "/portal/curriculum", label: "Curriculum" },
        { href: "/portal/progress", label: "Progress" }
      ]}
    >
      <section className="grid gap-4 md:grid-cols-4">
        {data.bySubject.map((item) => (
          <article key={item.label} className="surface rounded-[1.75rem] p-6">
            <p className="text-sm text-[rgb(var(--muted))]">{item.label}</p>
            <p className="mt-4 font-display text-4xl">{item.value}</p>
            <p className="mt-3 text-sm text-[rgb(var(--muted))]">{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.featured.map((item) => (
          <article key={`${item.title}-${item.detail}`} className="surface rounded-[1.75rem] p-6">
            <h2 className="font-semibold">{item.title}</h2>
            <p className="mt-3 text-sm text-[rgb(var(--muted))]">{item.detail}</p>
          </article>
        ))}
      </section>
    </PortalShell>
  );
}
