import { NextResponse } from "next/server";
import { requireSupabaseUser } from "@/lib/api/route-helpers";
import { logOperationalEvent } from "@/lib/audit/log-operational-event";

function normalizeVisibility(value: unknown) {
  const normalized = String(value ?? "private").trim().toLowerCase();

  if (normalized === "portal" || normalized === "published") {
    return normalized;
  }

  return "private";
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
  const materialId = Number(id);

  const { data: existing, error: existingError } = await supabase
    .from("materials")
    .select("*")
    .eq("id", materialId)
    .eq("owner_id", user.id)
    .single();

  if (existingError || !existing) {
    return NextResponse.json({ error: existingError?.message ?? "Material tidak ditemukan." }, { status: 404 });
  }

  const payload = {
    title: body.title !== undefined ? String(body.title) : existing.title,
    subject: body.subject !== undefined ? String(body.subject) : existing.subject,
    pathway: body.pathway !== undefined ? String(body.pathway) : existing.pathway,
    description: body.description !== undefined ? String(body.description) : existing.description,
    visibility: body.visibility !== undefined ? normalizeVisibility(body.visibility) : existing.visibility,
    storage_path:
      body.storage_path !== undefined
        ? (body.storage_path ? String(body.storage_path) : null)
        : existing.storage_path,
    file_name:
      body.file_name !== undefined
        ? (body.file_name ? String(body.file_name) : null)
        : existing.file_name,
    mime_type:
      body.mime_type !== undefined
        ? (body.mime_type ? String(body.mime_type) : null)
        : existing.mime_type,
    file_size:
      body.file_size !== undefined
        ? (body.file_size ? Number(body.file_size) : null)
        : existing.file_size
  };

  const { data, error } = await supabase
    .from("materials")
    .update(payload)
    .eq("id", materialId)
    .eq("owner_id", user.id)
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
    .eq("owner_id", user.id)
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
