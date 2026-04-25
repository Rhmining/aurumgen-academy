import { NextResponse } from "next/server";
import { requireSupabaseUser } from "@/lib/api/route-helpers";
import { logOperationalEvent } from "@/lib/audit/log-operational-event";

function normalizeScore(value: unknown, fallback: number | null) {
  if (value === undefined) {
    return fallback;
  }

  if (value === null || value === "") {
    return null;
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  return Math.max(0, Math.min(100, numeric));
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase, user } = session;
  const body = await request.json();
  const { id } = await params;
  const snapshotId = Number(id);

  const { data: existing, error: existingError } = await supabase
    .from("progress_snapshots")
    .select("*")
    .eq("id", snapshotId)
    .eq("owner_id", user.id)
    .single();

  if (existingError || !existing) {
    return NextResponse.json(
      { error: existingError?.message ?? "Snapshot progress tidak ditemukan." },
      { status: 404 }
    );
  }

  const payload = {
    profile_id: body.profile_id !== undefined ? String(body.profile_id) : existing.profile_id,
    score: normalizeScore(body.score, existing.score),
    subject: body.subject !== undefined ? String(body.subject) : existing.subject,
    notes:
      body.notes !== undefined
        ? (body.notes ? String(body.notes) : null)
        : existing.notes
  };

  const { data, error } = await supabase
    .from("progress_snapshots")
    .update(payload)
    .eq("id", snapshotId)
    .eq("owner_id", user.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logOperationalEvent(supabase, {
    actorId: user.id,
    action: "update_progress_snapshot",
    entityType: "progress_snapshot",
    entityId: data.id,
    metadata: {
      profile_id: data.profile_id,
      subject: data.subject ?? null,
      score: data.score ?? null
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
  const snapshotId = Number(id);

  const { data: existing } = await supabase
    .from("progress_snapshots")
    .select("id, profile_id, subject, score")
    .eq("id", snapshotId)
    .eq("owner_id", user.id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Snapshot progress tidak ditemukan." }, { status: 404 });
  }

  const { error } = await supabase
    .from("progress_snapshots")
    .delete()
    .eq("id", snapshotId)
    .eq("owner_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logOperationalEvent(supabase, {
    actorId: user.id,
    action: "delete_progress_snapshot",
    entityType: "progress_snapshot",
    entityId: snapshotId,
    metadata: {
      profile_id: existing.profile_id,
      subject: existing.subject ?? null,
      score: existing.score ?? null
    }
  });

  return NextResponse.json({ ok: true });
}
