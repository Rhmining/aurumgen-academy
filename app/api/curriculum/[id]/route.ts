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
  const itemId = Number(id);

  const { data: existing, error: existingError } = await supabase
    .from("curriculum_items")
    .select("*")
    .eq("id", itemId)
    .eq("owner_id", user.id)
    .single();

  if (existingError || !existing) {
    return NextResponse.json(
      { error: existingError?.message ?? "Item kurikulum tidak ditemukan." },
      { status: 404 }
    );
  }

  const payload = {
    title: body.title !== undefined ? String(body.title) : existing.title,
    pathway: body.pathway !== undefined ? String(body.pathway) : existing.pathway,
    subject: body.subject !== undefined ? String(body.subject) : existing.subject
  };

  const { data, error } = await supabase
    .from("curriculum_items")
    .update(payload)
    .eq("id", itemId)
    .eq("owner_id", user.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logOperationalEvent(supabase, {
    actorId: user.id,
    action: "update_curriculum_item",
    entityType: "curriculum_item",
    entityId: data.id,
    metadata: {
      title: data.title,
      pathway: data.pathway,
      subject: data.subject
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
  const itemId = Number(id);

  const { data: existing } = await supabase
    .from("curriculum_items")
    .select("id, title, pathway, subject")
    .eq("id", itemId)
    .eq("owner_id", user.id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Item kurikulum tidak ditemukan." }, { status: 404 });
  }

  const { error } = await supabase
    .from("curriculum_items")
    .delete()
    .eq("id", itemId)
    .eq("owner_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logOperationalEvent(supabase, {
    actorId: user.id,
    action: "delete_curriculum_item",
    entityType: "curriculum_item",
    entityId: itemId,
    metadata: {
      title: existing.title,
      pathway: existing.pathway,
      subject: existing.subject
    }
  });

  return NextResponse.json({ ok: true });
}
