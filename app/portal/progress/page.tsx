import { PortalShell } from "@/components/portal/portal-shell";

export default function PortalProgressPage() {
  return (
    <PortalShell title="Progress Center" description="Visual progress, drill completion, dan target remedial.">
      <section className="grid gap-4 md:grid-cols-2">
        <article className="surface rounded-[1.75rem] p-6">
          <h2 className="font-display text-3xl">Subject momentum</h2>
          <p className="mt-3 text-[rgb(var(--muted))]">Biology naik 14%, Mathematics stabil, English writing perlu penguatan.</p>
        </article>
        <article className="surface rounded-[1.75rem] p-6">
          <h2 className="font-display text-3xl">Target pekan ini</h2>
          <p className="mt-3 text-[rgb(var(--muted))]">Selesaikan 3 drill, 1 essay reflection, dan review 2 materi inti.</p>
        </article>
      </section>
    </PortalShell>
  );
}
