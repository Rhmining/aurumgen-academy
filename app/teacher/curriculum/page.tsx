 "use client";

import { TeacherShell } from "@/components/teacher/teacher-shell";
import { ResourceManager } from "@/components/data/resource-manager";
import type { CurriculumItemRecord } from "@/lib/db/types";

export default function TeacherCurriculumPage() {
  return (
    <TeacherShell title="Curriculum Planner" description="Rancang scope, sequence, dan target mastery setiap cohort.">
      <ResourceManager<CurriculumItemRecord>
        endpoint="/api/curriculum"
        title="Curriculum items"
        description="Kelola roadmap kurikulum per subject dan pathway agar portal curriculum selalu sinkron dengan rencana belajar."
        emptyState="Belum ada item kurikulum. Tambahkan item pertama dari panel kiri."
        fields={[
          { name: "title", label: "Judul item", placeholder: "Functions and Graphs" },
          { name: "subject", label: "Subject", placeholder: "Mathematics" },
          { name: "pathway", label: "Pathway", placeholder: "IGCSE / IB" }
        ]}
        renderSummary={(item) => ({
          title: item.title,
          detail: `${item.subject} • ${item.pathway}`
        })}
      />
    </TeacherShell>
  );
}
