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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase, user } = session;
  const { id } = await params;
  const body = await request.json();

  const { data: existing, error: existingError } = await supabase
    .from("profiles")
    .select("id, full_name, role, email, pathway, stage, guardian_name, guardian_email, mentor_notes, teacher_owner_id, created_at")
    .eq("id", id)
    .eq("role", "student")
    .eq("teacher_owner_id", user.id)
    .single();

  if (existingError || !existing) {
    return NextResponse.json({ error: existingError?.message ?? "Student tidak ditemukan." }, { status: 404 });
  }

  const payload = {
    full_name: body.full_name !== undefined ? String(body.full_name).trim() : existing.full_name,
    email: body.email !== undefined ? normalizeEmail(body.email) : existing.email,
    pathway: body.pathway !== undefined ? String(body.pathway).trim() || "IGCSE" : existing.pathway,
    stage: body.stage !== undefined ? normalizeStage(body.stage) : existing.stage,
    guardian_name: body.guardian_name !== undefined ? (body.guardian_name ? String(body.guardian_name).trim() : null) : existing.guardian_name,
    guardian_email: body.guardian_email !== undefined ? normalizeEmail(body.guardian_email) : existing.guardian_email,
    mentor_notes: body.mentor_notes !== undefined ? (body.mentor_notes ? String(body.mentor_notes).trim() : null) : existing.mentor_notes
  };

  if (!payload.full_name) {
    return NextResponse.json({ error: "Nama student wajib diisi." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", id)
    .eq("role", "student")
    .eq("teacher_owner_id", user.id)
    .select("id, full_name, role, email, pathway, stage, guardian_name, guardian_email, mentor_notes, teacher_owner_id, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logOperationalEvent(supabase, {
    actorId: user.id,
    action: "update_student_profile",
    entityType: "profile",
    entityId: data.id,
    metadata: {
      full_name: data.full_name,
      pathway: data.pathway ?? null,
      stage: data.stage ?? null,
      guardian_email: data.guardian_email ?? null
    }
  });

  return NextResponse.json({ item: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase, user } = session;
  const { id } = await params;

  const { data: existing, error: existingError } = await supabase
    .from("profiles")
    .select("id, full_name, pathway, stage, guardian_email")
    .eq("id", id)
    .eq("role", "student")
    .eq("teacher_owner_id", user.id)
    .single();

  if (existingError || !existing) {
    return NextResponse.json({ error: existingError?.message ?? "Student tidak ditemukan." }, { status: 404 });
  }

  const { count: snapshotCount } = await supabase
    .from("progress_snapshots")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", id)
    .eq("owner_id", user.id);

  if ((snapshotCount ?? 0) > 0) {
    return NextResponse.json(
      { error: "Student ini sudah punya progress snapshot. Hapus snapshot dulu atau ubah status student." },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", id)
    .eq("role", "student")
    .eq("teacher_owner_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logOperationalEvent(supabase, {
    actorId: user.id,
    action: "delete_student_profile",
    entityType: "profile",
    entityId: existing.id,
    metadata: {
      full_name: existing.full_name,
      pathway: existing.pathway ?? null,
      stage: existing.stage ?? null,
      guardian_email: existing.guardian_email ?? null
    }
  });

  return NextResponse.json({ ok: true });
}
