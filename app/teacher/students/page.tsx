import { TeacherShell } from "@/components/teacher/teacher-shell";
import { StudentManager } from "@/components/teacher/student-manager";
import { getTeacherStudentsData } from "@/lib/db/dashboard";

export default async function TeacherStudentsPage() {
  const data = await getTeacherStudentsData();

  return (
    <TeacherShell title="Student Workspace" description="Tambahkan student, simpan konteks guardian, lalu baca sinyal progres untuk menentukan intervensi prioritas.">
      <section className="grid gap-4 md:grid-cols-3">
        {data.metrics.map((metric) => (
          <article key={metric.label} className="surface rounded-[1.75rem] p-6">
            <p className="text-sm text-[rgb(var(--muted))]">{metric.label}</p>
            <p className="mt-4 font-display text-4xl">{metric.value}</p>
            <p className="mt-3 text-sm text-[rgb(var(--muted))]">{metric.detail}</p>
          </article>
        ))}
      </section>

      <StudentManager />

      <section className="surface rounded-[1.75rem] p-6">
        <div className="mb-4">
          <h2 className="font-display text-2xl">Signal board</h2>
          <p className="mt-2 text-sm text-[rgb(var(--muted))]">
            Begitu student mulai punya snapshot atau aktivitas AI-RUM, sinyal di bawah akan membantu Anda melihat siapa yang perlu intervensi lebih dulu.
          </p>
        </div>
        <div className="space-y-4">
          {data.signals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/10 p-4 text-sm text-[rgb(var(--muted))] dark:border-white/10">
              Belum ada student yang terdaftar. Tambahkan student dari panel kiri, lalu mulai isi progress snapshot agar signal board ini ikut hidup.
            </div>
          ) : (
            data.signals.map((signal) => (
              <div key={signal.student} className="flex flex-col justify-between gap-2 rounded-2xl border border-black/5 p-4 md:flex-row dark:border-white/10">
                <div>
                  <h2 className="font-semibold">{signal.student}</h2>
                  <p className="text-sm text-[rgb(var(--muted))]">{signal.subject}</p>
                  <p className="mt-2 text-sm text-[rgb(var(--muted))]">{signal.detail}</p>
                </div>
                <div className="text-sm">{signal.status} • {signal.trend}</div>
              </div>
            ))
          )}
        </div>
      </section>
    </TeacherShell>
  );
}
