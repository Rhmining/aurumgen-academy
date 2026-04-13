import { NextResponse } from "next/server";
import { requireSupabaseUser } from "@/lib/api/route-helpers";

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

  const { data, error } = await supabase
    .from("airum_sessions")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ item: data }, { status: 201 });
}
