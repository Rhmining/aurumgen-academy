import { TeacherShell } from "@/components/teacher/teacher-shell";
import { getTeacherStudentsData } from "@/lib/db/dashboard";

export default async function TeacherStudentsPage() {
  const data = await getTeacherStudentsData();

  return (
    <TeacherShell title="Student Signals" description="Baca pola performa siswa dan tentukan intervensi prioritas.">
      <section className="grid gap-4 md:grid-cols-3">
        {data.metrics.map((metric) => (
          <article key={metric.label} className="surface rounded-[1.75rem] p-6">
            <p className="text-sm text-[rgb(var(--muted))]">{metric.label}</p>
            <p className="mt-4 font-display text-4xl">{metric.value}</p>
            <p className="mt-3 text-sm text-[rgb(var(--muted))]">{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="surface rounded-[1.75rem] p-6">
        <div className="space-y-4">
          {data.signals.map((signal) => (
            <div key={signal.student} className="flex flex-col justify-between gap-2 rounded-2xl border border-black/5 p-4 md:flex-row dark:border-white/10">
              <div>
                <h2 className="font-semibold">{signal.student}</h2>
                <p className="text-sm text-[rgb(var(--muted))]">{signal.subject}</p>
                <p className="mt-2 text-sm text-[rgb(var(--muted))]">{signal.detail}</p>
              </div>
              <div className="text-sm">{signal.status} • {signal.trend}</div>
            </div>
          ))}
        </div>
      </section>
    </TeacherShell>
  );
}
