import { PortalShell } from "@/components/portal/portal-shell";
import { getPortalProgressData } from "@/lib/db/dashboard";

export default async function PortalProgressPage() {
  const data = await getPortalProgressData();

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
    </PortalShell>
  );
}
