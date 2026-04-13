import { NextResponse } from "next/server";
import { requireSupabaseUser } from "@/lib/api/route-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase, user } = session;
  const { id } = await params;

  const [{ data: chatSession, error: sessionError }, { data: messages, error: messageError }] =
    await Promise.all([
      supabase.from("airum_sessions").select("*").eq("id", id).eq("owner_id", user.id).single(),
      supabase.from("airum_messages").select("*").eq("session_id", id).order("created_at", { ascending: true })
    ]);

  if (sessionError || !chatSession) {
    return NextResponse.json({ error: sessionError?.message ?? "Session tidak ditemukan." }, { status: 404 });
  }

  if (messageError) {
    return NextResponse.json({ error: messageError.message }, { status: 400 });
  }

  const assistantIds = (messages ?? [])
    .filter((message: { role: string }) => message.role === "assistant")
    .map((message: { id: string }) => message.id);

  const { data: citations, error: citationError } = assistantIds.length
    ? await supabase
        .from("airum_citations")
        .select("*")
        .in("message_id", assistantIds)
        .order("id", { ascending: true })
    : { data: [], error: null };

  if (citationError) {
    return NextResponse.json({ error: citationError.message }, { status: 400 });
  }

  return NextResponse.json({
    item: chatSession,
    messages: messages ?? [],
    citations: citations ?? []
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase, user } = session;
  const body = await request.json().catch(() => ({}));
  const { id } = await params;
  const title = String(body.title ?? "Percakapan Baru").trim().slice(0, 120);

  const { data, error } = await supabase
    .from("airum_sessions")
    .update({ title: title || "Percakapan Baru" })
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

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

  const { error } = await supabase
    .from("airum_sessions")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
