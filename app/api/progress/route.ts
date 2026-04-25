import { NextResponse } from "next/server";
import { requireSupabaseUser } from "@/lib/api/route-helpers";
import { logOperationalEvent } from "@/lib/audit/log-operational-event";

function normalizeScore(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }

  return Math.max(0, Math.min(100, numeric));
}

export async function GET() {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase, user } = session;
  const { data, error } = await supabase
    .from("progress_snapshots")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const profileIds = Array.from(new Set((data ?? []).map((item) => item.profile_id).filter(Boolean)));

  const { data: profiles } = profileIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", profileIds)
    : { data: [] as Array<{ id: string; full_name: string | null }> };

  const nameByProfileId = new Map((profiles ?? []).map((item) => [item.id, item.full_name ?? item.id]));

  const items = (data ?? []).map((item) => ({
    ...item,
    student_name: nameByProfileId.get(item.profile_id) ?? item.profile_id
  }));

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase, user } = session;
  const body = await request.json();

  const payload = {
    profile_id: String(body.profile_id ?? ""),
    score: normalizeScore(body.score),
    subject: String(body.subject ?? "General"),
    notes: body.notes ? String(body.notes) : null,
    owner_id: user.id
  };

  const { data, error } = await supabase
    .from("progress_snapshots")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logOperationalEvent(supabase, {
    actorId: user.id,
    action: "create_progress_snapshot",
    entityType: "progress_snapshot",
    entityId: data.id,
    metadata: {
      profile_id: data.profile_id,
      subject: data.subject ?? null,
      score: data.score ?? null
    }
  });

  return NextResponse.json({ item: data }, { status: 201 });
}
