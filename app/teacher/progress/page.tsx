import { TeacherShell } from "@/components/teacher/teacher-shell";
import { ProgressManager } from "@/components/teacher/progress-manager";
import { createClient } from "@/lib/supabase/server";

export default async function TeacherProgressPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: students } = user
    ? await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "student")
        .order("full_name", { ascending: true })
        .limit(100)
    : { data: [] as Array<{ id: string; full_name: string | null }> };

  const studentOptions = (students ?? []).map((student) => ({
    value: student.id,
    label: student.full_name || student.id
  }));

  return (
    <TeacherShell
      title="Progress Tracker"
      description="Isi snapshot skor dan catatan singkat per siswa agar portal progress tetap relevan dan hidup."
    >
      <ProgressManager studentOptions={studentOptions} />
    </TeacherShell>
  );
}
