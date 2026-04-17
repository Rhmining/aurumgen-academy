import type { UserRole } from "@/lib/db/types";
import { getDefaultRouteForRole } from "@/lib/auth/redirects";

type WorkspaceLink = {
  href: string;
  title: string;
  detail: string;
};

type WorkspaceConfig = {
  heading: string;
  links: WorkspaceLink[];
};

export const workspaceConfigByRole: Record<UserRole, WorkspaceConfig> = {
  student: {
    heading: "Student workspace",
    links: [
      {
        href: getDefaultRouteForRole("student"),
        title: "Kembali ke student portal",
        detail: "Lanjutkan target mingguan, materi prioritas, dan sesi AI-RUM Anda."
      },
      {
        href: "/portal/materials",
        title: "Buka materials",
        detail: "Masuk ke materi terbaru yang sudah dibuka ke portal."
      },
      {
        href: "/portal/progress",
        title: "Lihat progress",
        detail: "Pantau ritme belajar dan fokus remedial yang sedang berjalan."
      }
    ]
  },
  parent: {
    heading: "Parent workspace",
    links: [
      {
        href: getDefaultRouteForRole("parent"),
        title: "Kembali ke parent portal",
        detail: "Baca ringkasan progres dan rekomendasi pendampingan anak."
      },
      {
        href: "/portal/progress",
        title: "Lihat progress center",
        detail: "Masuk ke sinyal progres yang sama dengan yang dipakai student."
      },
      {
        href: "/portal/materials",
        title: "Lihat materials",
        detail: "Pahami materi yang sedang dipelajari agar diskusi di rumah lebih nyambung."
      }
    ]
  },
  teacher: {
    heading: "Teacher workspace",
    links: [
      {
        href: getDefaultRouteForRole("teacher"),
        title: "Kembali ke teacher dashboard",
        detail: "Lanjutkan prioritas publish materi, soal, dan intervensi siswa."
      },
      {
        href: "/teacher/materials",
        title: "Kelola materials",
        detail: "Upload, rapikan metadata, lalu publish ke portal siswa."
      },
      {
        href: "/teacher/question-bank",
        title: "Buka question bank",
        detail: "Lengkapi answer key dan difficulty agar review lebih cepat."
      }
    ]
  },
  aiadmin: {
    heading: "AI admin workspace",
    links: [
      {
        href: getDefaultRouteForRole("aiadmin"),
        title: "Kembali ke knowledge overview",
        detail: "Lanjutkan triage dokumen, review kualitas, dan kesiapan retrieval."
      },
      {
        href: "/ai-knowledge/documents",
        title: "Kelola dokumen AI",
        detail: "Periksa metadata, extraction note, dan chunk count."
      },
      {
        href: "/ai-knowledge/ingestion",
        title: "Pantau ingestion",
        detail: "Cek dokumen queued, failed, atau parser_failed."
      }
    ]
  },
  developer: {
    heading: "Developer workspace",
    links: [
      {
        href: getDefaultRouteForRole("developer"),
        title: "Kembali ke developer overview",
        detail: "Masuk lagi ke observability, health, dan analytics panel."
      },
      {
        href: "/developer/logs",
        title: "Buka audit logs",
        detail: "Periksa request penting, error, dan aktivitas terbaru."
      },
      {
        href: "/developer/pipeline",
        title: "Audit pipeline",
        detail: "Review alur ingestion, retrieval, evaluator, dan fallback."
      }
    ]
  }
};

export function getWorkspaceConfig(role: UserRole) {
  return workspaceConfigByRole[role];
}
