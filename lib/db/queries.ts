import type { DashboardMetric } from "@/lib/db/types";

export const publicMetrics: DashboardMetric[] = [
  { label: "Lesson intelligence", value: "92%", detail: "Saran adaptif untuk jalur IGCSE dan IB." },
  { label: "Weekly mastery", value: "18 jam", detail: "Waktu belajar aktif yang terpantau." },
  { label: "AI feedback cycle", value: "< 2 menit", detail: "Respon AI-RUM untuk refleksi siswa." }
];

export const teacherSignals = [
  { student: "Alya Prananda", subject: "Math HL", status: "Perlu intervensi", trend: "-12%" },
  { student: "Raka Adiwijaya", subject: "Biology IGCSE", status: "Stabil", trend: "+4%" },
  { student: "Nadira Yasin", subject: "English A", status: "Naik cepat", trend: "+18%" }
];

export const aiKnowledgeQueue = [
  { name: "IGCSE Biology Core.pdf", state: "Ready for ingestion", owner: "Teacher team" },
  { name: "University Pathway 2026.docx", state: "Needs chunking", owner: "Counselor" },
  { name: "IB TOK Prompt Library.md", state: "Prompt linked", owner: "AI Admin" }
];
