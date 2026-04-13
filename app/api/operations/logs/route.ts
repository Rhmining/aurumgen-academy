import { NextResponse } from "next/server";
import { requireSupabaseUser } from "@/lib/api/route-helpers";
import { logOperationalEvent } from "@/lib/audit/log-operational-event";

export async function GET(request: Request) {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase, user } = session;
  const requestUrl = new URL(request.url);
  const action = requestUrl.searchParams.get("action");
  const entityType = requestUrl.searchParams.get("entityType");
  const search = requestUrl.searchParams.get("search");

  let query = supabase
    .from("operational_activity_logs")
    .select("id, action, entity_type, entity_id, metadata, created_at")
    .eq("actor_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (action) {
    query = query.eq("action", action);
  }

  if (entityType) {
    query = query.eq("entity_type", entityType);
  }

  if (search) {
    query = query.or(`action.ilike.%${search}%,entity_type.ilike.%${search}%,entity_id.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: Request) {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase, user } = session;
  const body = await request.json().catch(() => ({}));
  const action = String(body.action ?? "").trim();
  const entityType = String(body.entityType ?? "").trim();
  const entityId = String(body.entityId ?? "").trim();
  const metadata =
    body.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata)
      ? (body.metadata as Record<string, unknown>)
      : {};

  if (!action || !entityType || !entityId) {
    return NextResponse.json(
      { error: "action, entityType, dan entityId wajib diisi." },
      { status: 400 }
    );
  }

  await logOperationalEvent(supabase, {
    actorId: user.id,
    action,
    entityType,
    entityId,
    metadata
  });

  return NextResponse.json({ ok: true });
}
