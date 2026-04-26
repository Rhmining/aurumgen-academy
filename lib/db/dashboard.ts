import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { resolveUserRole } from "@/lib/auth/resolve-role";
import type { UserRole } from "@/lib/db/types";

type TeacherDashboardData = {
  metrics: Array<{ label: string; value: string; detail: string }>;
  focusTasks: Array<{ title: string; detail: string; href: string }>;
  workflow: Array<{ stage: string; count: string; note: string }>;
  recentResources: Array<{ title: string; detail: string; href: string; badge: string }>;
};

type StudentDashboardData = {
  metrics: Array<{ label: string; value: string; detail: string }>;
  priorityQueue: Array<{ title: string; type: string; status: string; href: string }>;
  weeklyGoals: string[];
  activity: Array<{ subject: string; trend: string; detail: string }>;
};

type ParentDashboardData = {
  metrics: Array<{ label: string; value: string; detail: string }>;
  highlights: Array<{ title: string; body: string; href: string }>;
  recentSignals: Array<{ title: string; detail: string }>;
  helperSteps: Array<{ title: string; detail: string; href: string }>;
};

type PortalMaterialsData = {
  role: UserRole;
  featured: Array<{
    title: string;
    detail: string;
    description: string | null;
    storagePath: string | null;
    fileName: string | null;
  }>;
  bySubject: Array<{ label: string; value: string; detail: string }>;
};

type PortalProgressData = {
  role: UserRole;
  metrics: Array<{ label: string; value: string; detail: string }>;
  timeline: Array<{ title: string; detail: string }>;
};

type PortalCurriculumData = {
  role: UserRole;
  items: Array<{ title: string; detail: string }>;
  summary: Array<{ label: string; value: string; detail: string }>;
  programTracks: Array<{ title: string; detail: string }>;
};

type TeacherStudentsData = {
  metrics: Array<{ label: string; value: string; detail: string }>;
  signals: Array<{ student: string; subject: string; status: string; trend: string; detail: string }>;
};

type AiKnowledgeDashboardData = {
  metrics: Array<{ label: string; value: string; detail: string }>;
  triage: Array<{ title: string; issue: string; owner: string; href: string }>;
  qualityChecks: Array<{ title: string; detail: string }>;
  queueSnapshot: Array<{ name: string; state: string; owner: string }>;
};

type DeveloperDashboardData = {
  metrics: Array<{ label: string; value: string; detail: string }>;
  runbook: Array<{ title: string; detail: string; href: string }>;
  shortcuts: Array<{ href: string; title: string; detail: string }>;
  recentSignals: Array<{ title: string; detail: string; href: string }>;
};

function formatCount(value: number | null | undefined) {
  return String(value ?? 0);
}

function hoursAgo(isoString: string | null | undefined) {
  if (!isoString) return null;
  const timestamp = new Date(isoString).getTime();
  if (Number.isNaN(timestamp)) return null;
  const diffMs = Date.now() - timestamp;
  const diffHours = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));
  if (diffHours < 24) return `${diffHours} jam lalu`;
  const diffDays = Math.max(1, Math.round(diffHours / 24));
  return `${diffDays} hari lalu`;
}

async function getAuthedSupabase() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return { supabase, user };
}

async function getAuthedRole() {
  const { supabase, user } = await getAuthedSupabase();
  const role = await resolveUserRole(supabase, user);
  return { supabase, user, role };
}

export const getTeacherDashboardData = cache(async (): Promise<TeacherDashboardData> => {
  const { supabase, user } = await getAuthedSupabase();
  if (!user) {
    return { metrics: [], focusTasks: [], workflow: [], recentResources: [] };
  }

  const lastWeekIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    materialsCount,
    publishedMaterialsCount,
    privateMaterialsCount,
    questionBankCount,
    questionBankMissingKeyCount,
    progressSnapshotsCount,
    trackedStudentsCount,
    recentActivityCount,
    latestMaterials,
    latestQuestionSets,
    latestProgressSnapshots
  ] = await Promise.all([
    supabase.from("materials").select("*", { count: "exact", head: true }).eq("owner_id", user.id),
    supabase
      .from("materials")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", user.id)
      .in("visibility", ["portal", "published"]),
    supabase
      .from("materials")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", user.id)
      .eq("visibility", "private"),
    supabase.from("question_bank").select("*", { count: "exact", head: true }).eq("owner_id", user.id),
    supabase
      .from("question_bank")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", user.id)
      .is("answer_key", null),
    supabase.from("progress_snapshots").select("*", { count: "exact", head: true }).eq("owner_id", user.id),
    supabase
      .from("progress_snapshots")
      .select("profile_id", { count: "exact", head: true })
      .eq("owner_id", user.id),
    supabase
      .from("operational_activity_logs")
      .select("*", { count: "exact", head: true })
      .eq("actor_id", user.id)
      .gte("created_at", lastWeekIso),
    supabase
      .from("materials")
      .select("id, title, subject, pathway, visibility, created_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("question_bank")
      .select("id, subject, pathway, difficulty, created_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("progress_snapshots")
      .select("id, profile_id, subject, score, created_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3)
  ]);

  const metrics = [
    {
      label: "Materi milik Anda",
      value: formatCount(materialsCount.count),
      detail: `${formatCount(publishedMaterialsCount.count)} sudah portal/published`
    },
    {
      label: "Materi masih private",
      value: formatCount(privateMaterialsCount.count),
      detail: "Siap dipromosikan setelah metadata final."
    },
    {
      label: "Question bank",
      value: formatCount(questionBankCount.count),
      detail: `${formatCount(questionBankMissingKeyCount.count)} item belum punya answer key`
    },
    {
      label: "Progress snapshots",
      value: formatCount(progressSnapshotsCount.count),
      detail: `${formatCount(trackedStudentsCount.count)} siswa sudah punya jejak progres`
    },
    {
      label: "Aktivitas 7 hari",
      value: formatCount(recentActivityCount.count),
      detail: "Diambil dari audit log akun teacher Anda."
    }
  ];

  const focusTasks = [
    {
      title:
        (privateMaterialsCount.count ?? 0) > 0
          ? `Publikasikan ${privateMaterialsCount.count} materi private`
          : "Semua materi utama sudah terbuka",
      detail:
        (privateMaterialsCount.count ?? 0) > 0
          ? "Masuk ke materials untuk mengubah visibility ke portal atau published."
          : "Lanjutkan ke quality pass untuk memastikan deskripsi dan file tetap rapi.",
      href: "/teacher/materials"
    },
    {
      title:
        (questionBankMissingKeyCount.count ?? 0) > 0
          ? `Lengkapi ${questionBankMissingKeyCount.count} answer key`
          : "Question bank inti sudah lengkap",
      detail:
        (questionBankMissingKeyCount.count ?? 0) > 0
          ? "Set soal tanpa answer key memperlambat review dan publish."
          : "Fokus berikutnya adalah menambah variasi difficulty dan exam board.",
      href: "/teacher/question-bank"
    },
    {
      title:
        (progressSnapshotsCount.count ?? 0) > 0
          ? `Review ${progressSnapshotsCount.count} progress snapshot terbaru`
          : "Isi progress snapshot pertama untuk siswa",
      detail:
        (progressSnapshotsCount.count ?? 0) > 0
          ? "Gunakan tracker progress untuk menjaga portal student dan parent tetap relevan."
          : "Setelah materi dan soal siap, isi satu snapshot skor agar dashboard siswa langsung punya sinyal nyata.",
      href: "/teacher/progress"
    }
  ];

  const workflow = [
    {
      stage: "Draft materi",
      count: `${formatCount(privateMaterialsCount.count)} item`,
      note: "Diambil dari materials dengan visibility private."
    },
    {
      stage: "Question bank perlu kelengkapan",
      count: `${formatCount(questionBankMissingKeyCount.count)} item`,
      note: "Berdasarkan item tanpa answer key."
    },
    {
      stage: "Progress snapshot aktif",
      count: `${formatCount(progressSnapshotsCount.count)} item`,
      note: "Dipakai langsung oleh portal progress untuk student dan parent."
    }
  ];

  const recentResources = [
    ...(latestMaterials.data ?? []).map((item) => ({
      title: item.title,
      detail: `${item.subject} • ${item.pathway ?? "-"} • ${item.visibility} • ${hoursAgo(item.created_at) ?? "baru"}`,
      href: "/teacher/materials",
      badge: "Material"
    })),
    ...(latestQuestionSets.data ?? []).map((item) => ({
      title: `${item.subject} • ${item.difficulty}`,
      detail: `${item.pathway ?? "-"} • dibuat ${hoursAgo(item.created_at) ?? "baru"}`,
      href: "/teacher/question-bank",
      badge: "Question"
    })),
    ...(latestProgressSnapshots.data ?? []).map((item) => ({
      title: `${item.subject ?? "General"} • skor ${item.score ?? "-"}`,
      detail: `${item.profile_id} • ${hoursAgo(item.created_at) ?? "baru"}`,
      href: "/teacher/progress",
      badge: "Progress"
    }))
  ].slice(0, 4);

  return { metrics, focusTasks, workflow, recentResources };
});

export const getStudentDashboardData = cache(async (): Promise<StudentDashboardData> => {
  const { supabase, user } = await getAuthedSupabase();
  if (!user) {
    return { metrics: [], priorityQueue: [], weeklyGoals: [], activity: [] };
  }

  const lastWeekIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [materialsCount, latestMaterials, sessions, activityLogs] = await Promise.all([
    supabase
      .from("materials")
      .select("*", { count: "exact", head: true })
      .in("visibility", ["portal", "published"]),
    supabase
      .from("materials")
      .select("title, subject, pathway, visibility, created_at")
      .in("visibility", ["portal", "published"])
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("airum_sessions")
      .select("id, title, updated_at")
      .eq("owner_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(3),
    supabase
      .from("operational_activity_logs")
      .select("action, entity_type, entity_id, created_at")
      .eq("actor_id", user.id)
      .gte("created_at", lastWeekIso)
      .order("created_at", { ascending: false })
      .limit(3)
  ]);

  const sessionIds = (sessions.data ?? []).map((item) => item.id);
  const messagesCount = sessionIds.length
    ? await supabase
        .from("airum_messages")
        .select("*", { count: "exact", head: true })
        .in("session_id", sessionIds)
    : { count: 0 };

  const metrics = [
    {
      label: "Materi tersedia",
      value: formatCount(materialsCount.count),
      detail: "Semua materi dengan visibility portal atau published."
    },
    {
      label: "Sesi AI-RUM",
      value: formatCount(sessions.data?.length ?? 0),
      detail: "Sesi terbaru Anda diambil langsung dari Supabase."
    },
    {
      label: "Pesan AI-RUM",
      value: formatCount(messagesCount.count),
      detail: "Mengukur seberapa aktif Anda memakai pendamping belajar."
    },
    {
      label: "Aktivitas 7 hari",
      value: formatCount(activityLogs.data?.length ?? 0),
      detail: "Berasal dari audit log akun student Anda."
    }
  ];

  const priorityQueue = (latestMaterials.data ?? []).map((item, index) => ({
    title: item.title,
    type: `${item.subject} • ${item.pathway ?? "General"}`,
    status:
      index === 0
        ? `Materi terbaru • ${hoursAgo(item.created_at) ?? "baru"}`
        : `${item.visibility} • ${hoursAgo(item.created_at) ?? "baru"}`,
    href: "/portal/materials"
  }));

  const weeklyGoals = [
    (materialsCount.count ?? 0) > 0
      ? `Buka minimal 3 dari ${materialsCount.count} materi yang sudah tersedia di portal.`
      : "Mulai isi portal dengan materi dari teacher agar ritme belajar terbentuk.",
    (sessions.data?.length ?? 0) > 0
      ? `Lanjutkan sesi AI-RUM terbaru Anda dan ubah jawaban yang masih menggantung menjadi ringkasan belajar.`
      : "Mulai sesi AI-RUM pertama untuk mengecek konsep yang masih belum jelas.",
    (activityLogs.data?.length ?? 0) > 0
      ? "Jaga konsistensi login dan review materi agar jejak belajar minggu ini tidak putus."
      : "Bangun ritme belajar mingguan dengan satu login, satu materi, dan satu pertanyaan ke AI-RUM."
  ];

  const activity = [
    ...(sessions.data ?? []).map((item) => ({
      subject: item.title || "Sesi AI-RUM",
      trend: "AI-RUM",
      detail: `Terakhir diperbarui ${hoursAgo(item.updated_at) ?? "baru"}.`
    })),
    ...(activityLogs.data ?? []).map((item) => ({
      subject: `${item.action}`,
      trend: item.entity_type,
      detail: `Entity ${item.entity_id} • ${hoursAgo(item.created_at) ?? "baru"}.`
    }))
  ].slice(0, 3);

  return { metrics, priorityQueue, weeklyGoals, activity };
});

export const getParentDashboardData = cache(async (): Promise<ParentDashboardData> => {
  const { supabase, user } = await getAuthedSupabase();
  if (!user) {
    return { metrics: [], highlights: [], recentSignals: [], helperSteps: [] };
  }

  const lastWeekIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [materialsCount, latestMaterials, activityLogs, sessions] = await Promise.all([
    supabase
      .from("materials")
      .select("*", { count: "exact", head: true })
      .in("visibility", ["portal", "published"]),
    supabase
      .from("materials")
      .select("title, subject, pathway, created_at")
      .in("visibility", ["portal", "published"])
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("operational_activity_logs")
      .select("action, entity_type, entity_id, created_at")
      .eq("actor_id", user.id)
      .gte("created_at", lastWeekIso)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("airum_sessions")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id)
  ]);

  const metrics = [
    {
      label: "Materi yang bisa dipantau",
      value: formatCount(materialsCount.count),
      detail: "Jumlah materi portal/published yang bisa dibaca keluarga."
    },
    {
      label: "Aktivitas akun 7 hari",
      value: formatCount(activityLogs.data?.length ?? 0),
      detail: "Membantu memastikan parent portal benar-benar ikut dipakai."
    },
    {
      label: "Sesi AI-RUM akun",
      value: formatCount(sessions.count),
      detail: "Jika parent memakai sesi sendiri untuk memahami materi atau konteks belajar."
    }
  ];

  const highlights = [
    {
      title:
        (latestMaterials.data ?? []).length > 0
          ? "Baca materi terbaru yang sudah dibuka ke portal"
          : "Belum ada materi portal terbaru",
      body:
        (latestMaterials.data ?? []).length > 0
          ? `${latestMaterials.data?.[0]?.title ?? "Materi terbaru"} sudah tersedia untuk dibaca dari sudut pandang keluarga.`
          : "Begitu teacher mempublikasikan materi, parent portal akan mulai terasa lebih hidup.",
      href: "/portal/materials"
    },
    {
      title:
        (activityLogs.data?.length ?? 0) > 0
          ? "Lanjutkan ritme monitoring minggu ini"
          : "Bangun rutinitas monitoring awal",
      body:
        (activityLogs.data?.length ?? 0) > 0
          ? `Sudah ada ${activityLogs.data?.length ?? 0} aktivitas parent tercatat dalam 7 hari terakhir.`
          : "Mulai dari materials dan progress center agar konteks akademik keluarga tetap sinkron.",
      href: "/portal/progress"
    },
    {
      title: "Gunakan portal sebagai alat diskusi rumah",
      body: "Parent portal paling berguna saat dipakai untuk membaca sinyal progres lalu menindaklanjuti dengan percakapan yang tenang dan terarah.",
      href: "/portal/parent"
    }
  ];

  const recentSignals = [
    ...(latestMaterials.data ?? []).map((item) => ({
      title: item.title,
      detail: `${item.subject} • ${item.pathway ?? "-"} • ${hoursAgo(item.created_at) ?? "baru"}`
    })),
    ...(activityLogs.data ?? []).map((log) => ({
      title: log.action,
      detail: `${log.entity_type} • ${log.entity_id} • ${hoursAgo(log.created_at) ?? "baru"}`
    }))
  ].slice(0, 4);

  const helperSteps = [
    {
      title: "1. Buka progress center lebih dulu",
      detail: "Lihat snapshot terbaru sebelum berdiskusi soal materi atau target remedial.",
      href: "/portal/progress"
    },
    {
      title: "2. Baca satu materi yang sedang aktif",
      detail: "Gunakan materials untuk memahami konteks akademik yang sedang dikerjakan anak.",
      href: "/portal/materials"
    },
    {
      title: "3. Gunakan AI-RUM untuk merangkum",
      detail: "Setelah paham progress dan materi, minta ringkasan atau pertanyaan diskusi dari portal utama.",
      href: "/portal/parent"
    }
  ];

  return { metrics, highlights, recentSignals, helperSteps };
});

export const getPortalMaterialsData = cache(async (): Promise<PortalMaterialsData> => {
  const { supabase, user, role } = await getAuthedRole();
  if (!user) {
    return { role, featured: [], bySubject: [] };
  }

  const { data: materials } = await supabase
    .from("materials")
    .select("title, subject, pathway, visibility, description, storage_path, file_name, created_at")
    .in("visibility", ["portal", "published"])
    .order("created_at", { ascending: false })
    .limit(12);

  const featured = (materials ?? []).slice(0, 6).map((item) => ({
    title: item.title,
    detail: [item.subject, item.pathway ?? "-", item.visibility, hoursAgo(item.created_at) ?? "baru"]
      .filter(Boolean)
      .join(" • "),
    description: item.description ?? null,
    storagePath: item.storage_path ?? null,
    fileName: item.file_name ?? null
  }));

  const bySubjectMap = new Map<string, number>();
  for (const item of materials ?? []) {
    bySubjectMap.set(item.subject, (bySubjectMap.get(item.subject) ?? 0) + 1);
  }

  const bySubject = Array.from(bySubjectMap.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)
    .map(([label, value]) => ({
      label,
      value: String(value),
      detail: "Materi portal/published yang siap dibaca."
    }));

  return { role, featured, bySubject };
});

export const getPortalProgressData = cache(async (): Promise<PortalProgressData> => {
  const { supabase, user, role } = await getAuthedRole();
  if (!user) {
    return { role, metrics: [], timeline: [] };
  }

  const lastMonthIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const [snapshots, sessions, logs] = await Promise.all([
    supabase
      .from("progress_snapshots")
      .select("score, subject, notes, created_at")
      .eq("profile_id", user.id)
      .gte("created_at", lastMonthIso)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("airum_sessions")
      .select("title, updated_at")
      .eq("owner_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(3),
    supabase
      .from("operational_activity_logs")
      .select("action, entity_type, created_at")
      .eq("actor_id", user.id)
      .gte("created_at", lastMonthIso)
      .order("created_at", { ascending: false })
      .limit(5)
  ]);

  const scores = (snapshots.data ?? [])
    .map((item) => Number(item.score))
    .filter((value) => Number.isFinite(value));
  const latestScore = scores[0] ?? null;
  const averageScore = scores.length
    ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length)
    : null;

  const metrics = [
    {
      label: "Snapshot progres",
      value: formatCount(scores.length),
      detail: "Diambil dari progress_snapshots 30 hari terakhir."
    },
    {
      label: "Skor terbaru",
      value: latestScore !== null ? String(Math.round(latestScore)) : "-",
      detail: "Nilai snapshot terbaru untuk akun ini."
    },
    {
      label: "Rata-rata 30 hari",
      value: averageScore !== null ? String(averageScore) : "-",
      detail: "Membantu melihat kestabilan progres."
    },
    {
      label: "Sesi AI-RUM aktif",
      value: formatCount(sessions.data?.length ?? 0),
      detail: "Percakapan belajar yang bisa dilanjutkan."
    }
  ];

  const timeline = [
    ...(snapshots.data ?? []).map((item) => ({
      title: `${item.subject ?? "General"} • skor ${item.score ?? "-"}`,
      detail: `${hoursAgo(item.created_at) ?? "baru"} • ${item.notes || "progress_snapshots"}`
    })),
    ...(sessions.data ?? []).map((item) => ({
      title: item.title || "Sesi AI-RUM",
      detail: `${hoursAgo(item.updated_at) ?? "baru"} • AI-RUM`
    })),
    ...(logs.data ?? []).map((item) => ({
      title: item.action,
      detail: `${item.entity_type} • ${hoursAgo(item.created_at) ?? "baru"}`
    }))
  ].slice(0, 6);

  return { role, metrics, timeline };
});

export const getPortalCurriculumData = cache(async (): Promise<PortalCurriculumData> => {
  const { supabase, user, role } = await getAuthedRole();
  if (!user) {
    return { role, items: [], summary: [], programTracks: [] };
  }

  const [curriculumItems, materials] = await Promise.all([
    supabase
      .from("curriculum_items")
      .select("title, pathway, subject, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("materials")
      .select("subject, pathway")
      .in("visibility", ["portal", "published"])
      .limit(50)
  ]);

  const items = (curriculumItems.data ?? []).map((item) => ({
    title: item.title,
    detail: `${item.subject} • ${item.pathway} • ${hoursAgo(item.created_at) ?? "baru"}`
  }));

  const pathwayMap = new Map<string, number>();
  for (const item of materials.data ?? []) {
    const key = item.pathway ?? "General";
    pathwayMap.set(key, (pathwayMap.get(key) ?? 0) + 1);
  }

  const summary = Array.from(pathwayMap.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)
    .map(([label, value]) => ({
      label,
      value: String(value),
      detail: "Jumlah materi yang mendukung pathway ini."
    }));

  const programTracks = [
    {
      title: "IGCSE Core Pathway",
      detail: "Fondasi konsep, latihan terstruktur, dan materi inti untuk transisi belajar yang stabil."
    },
    {
      title: "IB Progression Track",
      detail: "Ritme belajar yang lebih analitis dengan fokus konsep, refleksi, dan jawaban yang argumentatif."
    },
    {
      title: "AURUMGEN Learning Cycle",
      detail: "Baca materi, cek progress, lalu pakai AI-RUM untuk memperjelas konsep dan menutup gap belajar."
    }
  ];

  return { role, items, summary, programTracks };
});

export const getTeacherStudentsData = cache(async (): Promise<TeacherStudentsData> => {
  const { supabase, user } = await getAuthedSupabase();
  if (!user) {
    return { metrics: [], signals: [] };
  }

  const [{ data: students }, { data: snapshots }, { data: sessions }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "student")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("progress_snapshots")
      .select("profile_id, score, created_at")
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("airum_sessions")
      .select("owner_id, updated_at")
      .eq("role", "student")
      .order("updated_at", { ascending: false })
      .limit(20)
  ]);

  const snapshotsByProfile = new Map<string, Array<{ score: number | null; created_at: string }>>();
  for (const item of snapshots ?? []) {
    const bucket = snapshotsByProfile.get(item.profile_id) ?? [];
    bucket.push({ score: item.score, created_at: item.created_at });
    snapshotsByProfile.set(item.profile_id, bucket);
  }

  const latestSessionByOwner = new Map<string, string>();
  for (const item of sessions ?? []) {
    if (!latestSessionByOwner.has(item.owner_id)) {
      latestSessionByOwner.set(item.owner_id, item.updated_at);
    }
  }

  const signals = (students ?? []).map((student) => {
    const studentSnapshots = snapshotsByProfile.get(student.id) ?? [];
    const latestScore = studentSnapshots[0]?.score;
    const previousScore = studentSnapshots[1]?.score;
    const delta =
      latestScore !== null && latestScore !== undefined && previousScore !== null && previousScore !== undefined
        ? Number(latestScore) - Number(previousScore)
        : null;

    const status =
      delta === null
        ? "Belum cukup data"
        : delta >= 5
          ? "Naik"
          : delta <= -5
            ? "Perlu intervensi"
            : "Stabil";

    const trend =
      delta === null
        ? "0%"
        : `${delta > 0 ? "+" : ""}${Math.round(delta)}%`;

    return {
      student: student.full_name,
      subject: latestScore !== null && latestScore !== undefined ? `Skor terbaru ${Math.round(Number(latestScore))}` : "Belum ada snapshot",
      status,
      trend,
      detail: `Snapshot ${studentSnapshots.length} • AI-RUM ${latestSessionByOwner.has(student.id) ? hoursAgo(latestSessionByOwner.get(student.id)) : "belum ada sesi"}`
    };
  });

  const metrics = [
    {
      label: "Student profiles",
      value: formatCount(students?.length ?? 0),
      detail: "Profil student yang terbaca dari Supabase."
    },
    {
      label: "Snapshot progres",
      value: formatCount(snapshots?.length ?? 0),
      detail: "Sumber sinyal performa terbaru."
    },
    {
      label: "Student AI-RUM sessions",
      value: formatCount(sessions?.length ?? 0),
      detail: "Menunjukkan aktivitas pendamping belajar."
    }
  ];

  return { metrics, signals };
});

export const getAiKnowledgeDashboardData = cache(async (): Promise<AiKnowledgeDashboardData> => {
  const { supabase, user } = await getAuthedSupabase();
  if (!user) {
    return { metrics: [], triage: [], qualityChecks: [], queueSnapshot: [] };
  }

  const [allDocsCount, reviewedCount, parserFailedCount, queuedDocs, recentDocs] = await Promise.all([
    supabase.from("ai_documents").select("*", { count: "exact", head: true }),
    supabase.from("ai_documents").select("*", { count: "exact", head: true }).not("reviewed_at", "is", null),
    supabase
      .from("ai_documents")
      .select("*", { count: "exact", head: true })
      .eq("extraction_status", "parser_failed"),
    supabase
      .from("ai_documents")
      .select(
        "id, title, status, ingestion_status, extraction_status, extraction_note, chunk_count, owner_id, file_name"
      )
      .or("ingestion_status.eq.queued,ingestion_status.eq.failed,extraction_status.eq.parser_failed,chunk_count.eq.0")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("ai_documents")
      .select("title, status, ingestion_status, extraction_status, file_name, created_at, owner_id")
      .order("created_at", { ascending: false })
      .limit(3)
  ]);

  const pendingCount = (queuedDocs.data ?? []).length;
  const processedCount = (recentDocs.data ?? []).filter(
    (item) => item.ingestion_status === "processed" || item.status === "processed" || item.status === "published"
  ).length;

  const metrics = [
    {
      label: "Dokumen aktif",
      value: formatCount(allDocsCount.count),
      detail: `${formatCount(reviewedCount.count)} sudah direview`
    },
    {
      label: "Perlu triage",
      value: formatCount(pendingCount),
      detail: "Queued, failed, parser_failed, atau chunk_count nol."
    },
    {
      label: "Parser failed",
      value: formatCount(parserFailedCount.count),
      detail: "Perlu fallback manual atau upload ulang."
    },
    {
      label: "Snapshot processed",
      value: formatCount(processedCount),
      detail: "Dilihat dari dokumen terbaru yang sudah processed/published."
    }
  ];

  const triage = (queuedDocs.data ?? []).map((item) => ({
    title: item.title,
    issue: [
      item.ingestion_status ? `ingestion ${item.ingestion_status}` : null,
      item.extraction_status ? `extraction ${item.extraction_status}` : null,
      typeof item.chunk_count === "number" ? `chunks ${item.chunk_count}` : null
    ]
      .filter(Boolean)
      .join(" • "),
    owner: item.owner_id,
    href: item.ingestion_status === "queued" || item.ingestion_status === "failed" ? "/ai-knowledge/ingestion" : "/ai-knowledge/documents"
  }));

  const qualityChecks = [
    {
      title: `Review ${formatCount(parserFailedCount.count)} parser_failed docs`,
      detail: "Pastikan extraction note cukup jelas sebelum memutuskan manual fallback."
    },
    {
      title: `Triage ${formatCount(pendingCount)} dokumen bermasalah`,
      detail: "Queue ini dibaca langsung dari ai_documents dengan kondisi queued, failed, atau chunk_count nol."
    },
    {
      title: `Pantau ${formatCount(reviewedCount.count)} dokumen reviewed`,
      detail: "Gunakan angka ini untuk memastikan review coverage terus naik."
    }
  ];

  const queueSnapshot = (recentDocs.data ?? []).map((item) => ({
    name: item.file_name || item.title,
    state: [item.status, item.ingestion_status, item.extraction_status].filter(Boolean).join(" • "),
    owner: item.owner_id
  }));

  return { metrics, triage, qualityChecks, queueSnapshot };
});

export const getDeveloperDashboardData = cache(async (): Promise<DeveloperDashboardData> => {
  const { supabase, user } = await getAuthedSupabase();
  if (!user) {
    return { metrics: [], runbook: [], shortcuts: [], recentSignals: [] };
  }

  const lastWeekIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [materialsCount, questionBankCount, aiDocsCount, failedAiDocsCount, ownLogs, recentMaterials, recentDocs] = await Promise.all([
    supabase.from("materials").select("*", { count: "exact", head: true }),
    supabase.from("question_bank").select("*", { count: "exact", head: true }),
    supabase.from("ai_documents").select("*", { count: "exact", head: true }),
    supabase
      .from("ai_documents")
      .select("*", { count: "exact", head: true })
      .or("ingestion_status.eq.failed,extraction_status.eq.parser_failed"),
    supabase
      .from("operational_activity_logs")
      .select("action, entity_type, entity_id, created_at")
      .eq("actor_id", user.id)
      .gte("created_at", lastWeekIso)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("materials")
      .select("title, subject, visibility, created_at")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("ai_documents")
      .select("title, status, ingestion_status, created_at")
      .order("created_at", { ascending: false })
      .limit(3)
  ]);

  const metrics = [
    {
      label: "Resources",
      value: `${formatCount(materialsCount.count)} / ${formatCount(questionBankCount.count)}`,
      detail: "Materials dan question bank yang terbaca sistem."
    },
    {
      label: "AI documents",
      value: formatCount(aiDocsCount.count),
      detail: `${formatCount(failedAiDocsCount.count)} doc butuh perhatian`
    },
    {
      label: "Aktivitas Anda",
      value: formatCount(ownLogs.data?.length ?? 0),
      detail: "Audit log 7 hari terakhir milik akun developer ini."
    }
  ];

  const runbook = [
    {
      title:
        (failedAiDocsCount.count ?? 0) > 0
          ? `Ada ${failedAiDocsCount.count} AI doc bermasalah`
          : "Tidak ada AI doc gagal di query overview",
      detail:
        (failedAiDocsCount.count ?? 0) > 0
          ? "Mulai dari logs, lalu cocokkan dengan ingestion queue untuk melihat parser_failed atau ingestion failed."
          : "Tetap cek pipeline jika ada gejala di dashboard lain.",
      href: "/developer/logs"
    },
    {
      title: `Resource footprint ${formatCount(materialsCount.count)} materials / ${formatCount(questionBankCount.count)} question sets`,
      detail: "Cek apakah pertumbuhan resource sudah tercermin di knowledge dan analytics.",
      href: "/developer/pipeline"
    },
    {
      title:
        (ownLogs.data?.length ?? 0) > 0
          ? `Aktivitas terbaru: ${ownLogs.data?.[0]?.action ?? "log"}`
          : "Belum ada log developer minggu ini",
      detail:
        (ownLogs.data?.length ?? 0) > 0
          ? `${ownLogs.data?.[0]?.entity_type ?? "-"} • ${ownLogs.data?.[0]?.entity_id ?? "-"} • ${hoursAgo(
              ownLogs.data?.[0]?.created_at
            ) ?? "baru"}`
          : "Begitu ada aksi developer yang tercatat, overview ini akan ikut bergerak.",
      href: "/developer/logs"
    }
  ];

  const shortcuts = [
    {
      href: "/developer/models",
      title: "Audit model config",
      detail: "Pastikan responses, evaluator, dan embedding model tetap sinkron dengan environment."
    },
    {
      href: "/developer/costs",
      title: "Pantau biaya",
      detail: `Gunakan bersamaan dengan ${formatCount(aiDocsCount.count)} AI documents dan AI-RUM analytics untuk membaca exposure.`
    },
    {
      href: "/developer/pipeline",
      title: "Periksa pipeline",
      detail: `${formatCount(failedAiDocsCount.count)} sinyal masalah AI doc terbaca dari overview ini.`
    }
  ];

  const recentSignals = [
    ...(recentMaterials.data ?? []).map((item) => ({
      title: item.title,
      detail: `${item.subject} • ${item.visibility} • ${hoursAgo(item.created_at) ?? "baru"}`,
      href: "/developer/pipeline"
    })),
    ...(recentDocs.data ?? []).map((item) => ({
      title: item.title,
      detail: `${item.status} • ${item.ingestion_status ?? "-"} • ${hoursAgo(item.created_at) ?? "baru"}`,
      href: "/developer/logs"
    }))
  ].slice(0, 4);

  return { metrics, runbook, shortcuts, recentSignals };
});
