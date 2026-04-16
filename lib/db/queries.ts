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

export const teacherOverviewMetrics = [
  { label: "Kelas aktif hari ini", value: "6", detail: "3 IGCSE, 2 IB, 1 university prep" },
  { label: "Materi siap publish", value: "14", detail: "5 perlu review akhir sebelum portal" },
  { label: "Siswa perlu intervensi", value: "3", detail: "Turun performa dalam 7 hari terakhir" },
  { label: "Bank soal pekan ini", value: "28", detail: "12 draft dan 16 sudah live" }
];

export const teacherFocusTasks = [
  { title: "Finalisasi Biology Core Pack", detail: "Tambahkan rubric dan ubah visibility ke portal sebelum pukul 18.00.", href: "/teacher/materials" },
  { title: "Review sinyal Alya Prananda", detail: "Skor Math HL turun 12%. Perlu remedial plan dan drill tambahan.", href: "/teacher/students" },
  { title: "Publikasikan set soal Unit Review", detail: "Ada 4 soal dengan metadata belum lengkap.", href: "/teacher/question-bank" }
];

export const teacherWorkflowSummary = [
  { stage: "Draft materi", count: "5 item", note: "Menunggu deskripsi atau file final." },
  { stage: "Review soal", count: "4 set", note: "Perlu cek pathway, difficulty, dan answer key." },
  { stage: "Follow-up siswa", count: "3 siswa", note: "Jadwalkan intervensi atau kirim tugas penguatan." }
];

export const studentOverviewMetrics = [
  { label: "Mastery minggu ini", value: "84%", detail: "Naik 6 poin dari pekan lalu" },
  { label: "Study streak", value: "16 hari", detail: "Konsisten buka portal tiap hari" },
  { label: "Prioritas aktif", value: "5 item", detail: "3 materi dan 2 drill perlu diselesaikan" },
  { label: "Essay review", value: "2 masuk", detail: "1 waiting feedback, 1 siap revisi" }
];

export const studentPriorityQueue = [
  { title: "IGCSE Biology Chapter 3", type: "Materi inti", status: "Baca sebelum Jumat", href: "/portal/materials" },
  { title: "Math HL Drill Set 4", type: "Drill", status: "Perlu 20 menit remedial", href: "/portal/progress" },
  { title: "Personal Statement Reflection", type: "Writing", status: "Draft kedua due besok", href: "/portal/curriculum" }
];

export const studentMomentum = [
  { subject: "Biology", trend: "Naik", detail: "Quiz terakhir 88% dan retention membaik." },
  { subject: "Mathematics", trend: "Perlu ritme", detail: "Masih ada gap pada algebraic manipulation." },
  { subject: "English Writing", trend: "Stabil", detail: "Butuh latihan thesis clarity dan paragraph flow." }
];

export const studentWeeklyGoals = [
  "Selesaikan 3 drill inti tanpa skip pembahasan.",
  "Rangkum 2 materi dengan catatan sendiri untuk dibawa ke kelas.",
  "Gunakan AI-RUM minimal 1 kali untuk review konsep yang masih kabur."
];

export const aiKnowledgeMetrics = [
  { label: "Dokumen aktif", value: "128", detail: "97 processed, 21 reviewed, 10 masih antre" },
  { label: "Perlu ingestion", value: "7", detail: "Termasuk 2 dokumen baru dari teacher team" },
  { label: "Parser failed", value: "3", detail: "Perlu fallback manual atau upload ulang" },
  { label: "Prompt linked", value: "11", detail: "Sudah terhubung ke AI-RUM workflow" }
];

export const aiKnowledgeTriage = [
  { title: "University Pathway 2026.docx", issue: "Chunk count masih 0 setelah upload", owner: "Counselor", href: "/ai-knowledge/ingestion" },
  { title: "IGCSE Biology Core.pdf", issue: "Siap ingest tapi belum diproses batch terbaru", owner: "Teacher team", href: "/ai-knowledge/documents" },
  { title: "TOK Prompt Library.md", issue: "Prompt sudah linked, review kualitas retrieval belum selesai", owner: "AI Admin", href: "/ai-knowledge/pipeline" }
];

export const aiKnowledgeQualityChecks = [
  { title: "Review dokumen parser_failed", detail: "Pastikan fallback manual diberi note yang jelas." },
  { title: "Cek chunk terlalu pendek", detail: "Dokumen dengan chunk rendah berisiko retrieval lemah." },
  { title: "Audit source ownership", detail: "Setiap source perlu owner yang jelas untuk update berkala." }
];

export const developerOverviewCards = [
  { label: "Area kritis", value: "Health, logs, ingestion", detail: "Tiga panel ini paling cepat memberi sinyal issue." },
  { label: "Tindakan prioritas", value: "2 follow-up", detail: "Review failed extraction dan fallback rate AI-RUM." },
  { label: "Operasional hari ini", value: "Audit + model", detail: "Pastikan model config dan logs tetap sinkron." }
];

export const developerRunbook = [
  { title: "Jika failed extraction naik", detail: "Cek /developer/logs lalu bandingkan dengan queue di /ai-knowledge/ingestion.", href: "/developer/logs" },
  { title: "Jika answer quality turun", detail: "Lihat evaluator mode dan low score answers di analytics panel.", href: "/developer" },
  { title: "Jika model cost melonjak", detail: "Bandingkan usage model dan prompt path aktif.", href: "/developer/costs" }
];
