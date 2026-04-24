import { NextResponse } from "next/server";
import { formatSupabaseError, requireSupabaseUser } from "@/lib/api/route-helpers";

export async function GET() {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase, user } = session;
  const { data, error } = await supabase
    .from("airum_sessions")
    .select("*")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(20);

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
  const title = String(body.title ?? "Percakapan Baru").trim().slice(0, 120);

  const payload = {
    owner_id: user.id,
    role: String(body.role ?? "student"),
    title: title || "Percakapan Baru"
  };

  const { data: sessionId, error } = await supabase.rpc("create_airum_session", {
    p_owner_id: payload.owner_id,
    p_role: payload.role,
    p_title: payload.title
  });

  if (error) {
    return NextResponse.json({ error: formatSupabaseError(error, "airum.sessions.create") }, { status: 400 });
  }

  const { data, error: fetchError } = await supabase
    .from("airum_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("owner_id", user.id)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: formatSupabaseError(fetchError, "airum.sessions.fetch") }, { status: 400 });
  }

  return NextResponse.json({ item: data }, { status: 201 });
}
