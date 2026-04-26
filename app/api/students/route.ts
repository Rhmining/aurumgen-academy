import { NextResponse } from "next/server";
import { requireSupabaseUser } from "@/lib/api/route-helpers";
import { logOperationalEvent } from "@/lib/audit/log-operational-event";

function normalizeStage(value: unknown) {
  const normalized = String(value ?? "active").trim().toLowerCase();
  if (normalized === "lead" || normalized === "paused" || normalized === "alumni") {
    return normalized;
  }
  return "active";
}

function normalizeEmail(value: unknown) {
  const email = String(value ?? "").trim().toLowerCase();
  return email || null;
}

export async function GET() {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase, user } = session;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, email, pathway, stage, guardian_name, guardian_email, mentor_notes, teacher_owner_id, created_at")
    .eq("role", "student")
    .eq("teacher_owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const studentIds = (data ?? []).map((item) => item.id);

  const [{ data: snapshots }, { data: sessions }] = await Promise.all([
    studentIds.length
      ? supabase
          .from("progress_snapshots")
          .select("profile_id, score, created_at")
          .in("profile_id", studentIds)
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as Array<{ profile_id: string; score: number | null; created_at: string }> }),
    studentIds.length
      ? supabase
          .from("airum_sessions")
          .select("owner_id, updated_at")
          .eq("role", "student")
          .in("owner_id", studentIds)
          .order("updated_at", { ascending: false })
      : Promise.resolve({ data: [] as Array<{ owner_id: string; updated_at: string }> })
  ]);

  const snapshotCountByStudent = new Map<string, number>();
  const latestScoreByStudent = new Map<string, number | null>();
  for (const item of snapshots ?? []) {
    snapshotCountByStudent.set(item.profile_id, (snapshotCountByStudent.get(item.profile_id) ?? 0) + 1);
    if (!latestScoreByStudent.has(item.profile_id)) {
      latestScoreByStudent.set(item.profile_id, item.score ?? null);
    }
  }

  const latestSessionByStudent = new Map<string, string>();
  for (const item of sessions ?? []) {
    if (!latestSessionByStudent.has(item.owner_id)) {
      latestSessionByStudent.set(item.owner_id, item.updated_at);
    }
  }

  const items = (data ?? []).map((item) => ({
    ...item,
    snapshot_count: snapshotCountByStudent.get(item.id) ?? 0,
    latest_score: latestScoreByStudent.get(item.id) ?? null,
    latest_session_at: latestSessionByStudent.get(item.id) ?? null
  }));

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase, user } = session;
  const body = await request.json();

  const payload = {
    id: crypto.randomUUID(),
    full_name: String(body.full_name ?? "").trim(),
    role: "student",
    email: normalizeEmail(body.email),
    pathway: String(body.pathway ?? "IGCSE").trim() || "IGCSE",
    stage: normalizeStage(body.stage),
    guardian_name: body.guardian_name ? String(body.guardian_name).trim() : null,
    guardian_email: normalizeEmail(body.guardian_email),
    mentor_notes: body.mentor_notes ? String(body.mentor_notes).trim() : null,
    teacher_owner_id: user.id
  };

  if (!payload.full_name) {
    return NextResponse.json({ error: "Nama student wajib diisi." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert(payload)
    .select("id, full_name, role, email, pathway, stage, guardian_name, guardian_email, mentor_notes, teacher_owner_id, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logOperationalEvent(supabase, {
    actorId: user.id,
    action: "create_student_profile",
    entityType: "profile",
    entityId: data.id,
    metadata: {
      full_name: data.full_name,
      pathway: data.pathway ?? null,
      stage: data.stage ?? null,
      guardian_email: data.guardian_email ?? null
    }
  });

  return NextResponse.json({ item: data }, { status: 201 });
}
