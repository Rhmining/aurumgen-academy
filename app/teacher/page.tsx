import { TeacherShell } from "@/components/teacher/teacher-shell";
import { teacherSignals } from "@/lib/db/queries";

export default function TeacherDashboardPage() {
  return (
    <TeacherShell title="Teacher Dashboard" description="Control tower untuk materi, soal, dan sinyal intervensi siswa.">
      <section className="grid gap-4 md:grid-cols-3">
        {teacherSignals.map((signal) => (
          <article key={signal.student} className="surface rounded-[1.75rem] p-6">
            <p className="text-sm text-[rgb(var(--muted))]">{signal.subject}</p>
            <h2 className="mt-3 font-display text-3xl">{signal.student}</h2>
            <p className="mt-3">{signal.status}</p>
            <p className="mt-2 text-sm text-[rgb(var(--muted))]">Trend {signal.trend}</p>
          </article>
        ))}
      </section>
    </TeacherShell>
  );
}
