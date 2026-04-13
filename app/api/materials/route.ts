import { NextResponse } from "next/server";
import { requireSupabaseUser } from "@/lib/api/route-helpers";
import { logOperationalEvent } from "@/lib/audit/log-operational-event";

export async function GET() {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase } = session;
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: Request) {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase, user } = session;
  const body = await request.json();

  const payload = {
    title: String(body.title ?? ""),
    subject: String(body.subject ?? "General"),
    pathway: String(body.pathway ?? "IGCSE"),
    description: String(body.description ?? ""),
    visibility: String(body.visibility ?? "private"),
    storage_path: body.storage_path ? String(body.storage_path) : null,
    file_name: body.file_name ? String(body.file_name) : null,
    mime_type: body.mime_type ? String(body.mime_type) : null,
    file_size: body.file_size ? Number(body.file_size) : null,
    owner_id: user.id
  };

  const { data, error } = await supabase
    .from("materials")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logOperationalEvent(supabase, {
    actorId: user.id,
    action: "create_material",
    entityType: "material",
    entityId: data.id,
    metadata: {
      title: data.title,
      subject: data.subject,
      pathway: data.pathway,
      visibility: data.visibility
    }
  });

  return NextResponse.json({ item: data }, { status: 201 });
}
