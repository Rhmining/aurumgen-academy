import { PortalShell } from "@/components/portal/portal-shell";
import { AirumPanel } from "@/components/airum/airum-panel";

export default function StudentPortalPage() {
  return (
    <PortalShell
      title="Student Portal"
      description="Progress belajar, materi prioritas, dan rekomendasi dari AI-RUM."
    >
      <section className="grid gap-4 md:grid-cols-3">
        {["Mastery score", "Study streak", "Upcoming drills"].map((item, index) => (
          <article key={item} className="surface rounded-[1.75rem] p-6">
            <p className="text-sm text-[rgb(var(--muted))]">{item}</p>
            <p className="mt-4 font-display text-4xl">{["84%", "16 hari", "5 set"][index]}</p>
          </article>
        ))}
      </section>
      <AirumPanel role="student" />
    </PortalShell>
  );
}
