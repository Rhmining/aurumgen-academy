import { TeacherShell } from "@/components/teacher/teacher-shell";
import { teacherSignals } from "@/lib/db/queries";

export default function TeacherStudentsPage() {
  return (
    <TeacherShell title="Student Signals" description="Baca pola performa siswa dan tentukan intervensi prioritas.">
      <section className="surface rounded-[1.75rem] p-6">
        <div className="space-y-4">
          {teacherSignals.map((signal) => (
            <div key={signal.student} className="flex flex-col justify-between gap-2 rounded-2xl border border-black/5 p-4 md:flex-row dark:border-white/10">
              <div>
                <h2 className="font-semibold">{signal.student}</h2>
                <p className="text-sm text-[rgb(var(--muted))]">{signal.subject}</p>
              </div>
              <div className="text-sm">{signal.status} • {signal.trend}</div>
            </div>
          ))}
        </div>
      </section>
    </TeacherShell>
  );
}
