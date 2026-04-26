"use client";

import Link from "next/link";
import { ResourceManager } from "@/components/data/resource-manager";
import type { StudentDirectoryRecord } from "@/lib/db/types";

export function StudentManager() {
  return (
    <ResourceManager<StudentDirectoryRecord>
      endpoint="/api/students"
      title="Student directory"
      description="Tambah student yang Anda dampingi, simpan email/guardian, lalu arahkan langsung ke tracker progress. Ini menjadi pusat kerja teacher untuk menyiapkan portal yang hidup."
      emptyState="Belum ada student. Tambahkan student pertama dari panel kiri."
      initialForm={{
        pathway: "IGCSE",
        stage: "active",
        email: "",
        guardian_name: "",
        guardian_email: "",
        mentor_notes: ""
      }}
      fields={[
        { name: "full_name", label: "Nama student", placeholder: "Alya Prananda" },
        { name: "email", label: "Email student", placeholder: "student@email.com" },
        { name: "pathway", label: "Pathway", placeholder: "IGCSE / IB" },
        {
          name: "stage",
          label: "Stage",
          type: "select",
          options: [
            { label: "Active", value: "active" },
            { label: "Lead", value: "lead" },
            { label: "Paused", value: "paused" },
            { label: "Alumni", value: "alumni" }
          ]
        },
        { name: "guardian_name", label: "Nama parent/guardian", placeholder: "Nama orang tua / wali" },
        { name: "guardian_email", label: "Email parent/guardian", placeholder: "parent@email.com" },
        { name: "mentor_notes", label: "Catatan mentor", type: "textarea", placeholder: "Kebutuhan belajar, target, atau konteks pendampingan." }
      ]}
      renderSummary={(item) => ({
        title: `${item.full_name} • ${item.pathway ?? "General"}`,
        detail: `${item.stage ?? "active"}${item.email ? ` • ${item.email}` : ""}${item.guardian_name ? ` • Guardian: ${item.guardian_name}` : ""}${item.snapshot_count !== undefined ? ` • Snapshot: ${item.snapshot_count}` : ""}${item.latest_score !== null && item.latest_score !== undefined ? ` • Skor terbaru: ${Math.round(Number(item.latest_score))}` : ""}${item.mentor_notes ? ` • ${item.mentor_notes}` : ""}`
      })}
      renderItemActions={({ item }) => (
        <Link
          href={`/teacher/progress?student=${item.id}`}
          className="rounded-full border border-black/10 px-4 py-2 text-sm"
        >
          Isi progress
        </Link>
      )}
    />
  );
}
