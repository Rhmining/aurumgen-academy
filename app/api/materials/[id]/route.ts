import { NextResponse } from "next/server";
import { requireSupabaseUser } from "@/lib/api/route-helpers";
import { logOperationalEvent } from "@/lib/audit/log-operational-event";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase, user } = session;
  const body = await request.json();
  const { id } = await params;

  const payload = {
    title: String(body.title ?? ""),
    subject: String(body.subject ?? "General"),
    pathway: String(body.pathway ?? "IGCSE"),
    description: String(body.description ?? ""),
    visibility: String(body.visibility ?? "private"),
    storage_path: body.storage_path ? String(body.storage_path) : null,
    file_name: body.file_name ? String(body.file_name) : null,
    mime_type: body.mime_type ? String(body.mime_type) : null,
    file_size: body.file_size ? Number(body.file_size) : null
  };

  const { data, error } = await supabase
    .from("materials")
    .update(payload)
    .eq("id", Number(id))
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logOperationalEvent(supabase, {
    actorId: user.id,
    action: "update_material",
    entityType: "material",
    entityId: data.id,
    metadata: {
      title: data.title,
      subject: data.subject,
      pathway: data.pathway,
      visibility: data.visibility
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
  const materialId = Number(id);

  const { data: existing } = await supabase
    .from("materials")
    .select("id, title, subject, pathway, visibility")
    .eq("id", materialId)
    .single();

  const { error } = await supabase
    .from("materials")
    .delete()
    .eq("id", materialId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logOperationalEvent(supabase, {
    actorId: user.id,
    action: "delete_material",
    entityType: "material",
    entityId: materialId,
    metadata: {
      title: existing?.title ?? null,
      subject: existing?.subject ?? null,
      pathway: existing?.pathway ?? null,
      visibility: existing?.visibility ?? null
    }
  });

  return NextResponse.json({ ok: true });
}
