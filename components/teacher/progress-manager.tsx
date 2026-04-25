"use client";

import { ResourceManager } from "@/components/data/resource-manager";
import type { ProgressSnapshotRecord } from "@/lib/db/types";

type TeacherProgressRecord = ProgressSnapshotRecord & {
  student_name?: string;
};

export function ProgressManager({
  studentOptions
}: {
  studentOptions: Array<{ label: string; value: string }>;
}) {
  return (
    <ResourceManager<TeacherProgressRecord>
      endpoint="/api/progress"
      title="Progress snapshots"
      description="Catat snapshot skor singkat per siswa agar portal student dan parent selalu punya sinyal progres terbaru."
      emptyState="Belum ada snapshot progres. Tambahkan data pertama dari panel kiri."
      initialForm={{
        profile_id: studentOptions[0]?.value ?? "",
        subject: "General",
        score: "",
        notes: ""
      }}
      fields={[
        { name: "profile_id", label: "Student", type: "select", options: studentOptions },
        { name: "subject", label: "Subject", placeholder: "Biology" },
        { name: "score", label: "Score", placeholder: "0 - 100" },
        { name: "notes", label: "Notes", type: "textarea", placeholder: "Catatan singkat progres, remedial, atau pencapaian." }
      ]}
      renderSummary={(item) => ({
        title: `${item.student_name ?? item.profile_id} • ${item.subject ?? "General"}`,
        detail: `Skor: ${item.score ?? "-"}${item.notes ? ` • ${item.notes}` : ""}`
      })}
    />
  );
}
