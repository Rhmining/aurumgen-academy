import { PortalShell } from "@/components/portal/portal-shell";
import { getPortalCurriculumData } from "@/lib/db/dashboard";

export default async function PortalCurriculumPage() {
  const data = await getPortalCurriculumData();

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
    </PortalShell>
  );
}
