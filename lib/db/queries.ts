import type { DashboardMetric } from "@/lib/db/types";

export const publicMetrics: DashboardMetric[] = [
  { label: "Pembelajaran berlapis", value: "3 lapis", detail: "Siswa, orang tua, dan guru membaca progres dari konteks yang sama." },
  { label: "Respons belajar", value: "24/7", detail: "AI-RUM siap membantu eksplorasi konsep, ringkasan, dan drill." },
  { label: "Operasional internal", value: "Terhubung", detail: "Knowledge base, review queue, dan teacher workflow berjalan dalam satu platform." }
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
