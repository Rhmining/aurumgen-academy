import { NextResponse } from "next/server";
import { applyOwnerScope, requireSupabaseUser } from "@/lib/api/route-helpers";
import { logOperationalEvent } from "@/lib/audit/log-operational-event";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase, user, isSuperAccount } = session;
  const body = await request.json().catch(() => ({}));
  const { id } = await params;
  const documentId = Number(id);
  const action = String(body.action ?? "");

  if (!Number.isFinite(documentId)) {
    return NextResponse.json({ error: "Document id tidak valid." }, { status: 400 });
  }

  if (action !== "mark_manual_fallback") {
    return NextResponse.json({ error: "Action extraction tidak dikenali." }, { status: 400 });
  }

  const note = String(body.note ?? "").trim();

  const updateQuery = applyOwnerScope(
    supabase
      .from("ai_documents")
      .update({
        extraction_status: "manual_content",
        extraction_method: "manual_fallback",
        extraction_note: note || "Parser gagal, dokumen dialihkan ke fallback manual."
      })
      .eq("id", documentId),
    user.id,
    isSuperAccount
  );

  const { data, error } = await updateQuery
    .select("id, extraction_status, extraction_method, extraction_note")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Dokumen tidak ditemukan." },
      { status: error?.code === "PGRST116" ? 404 : 400 }
    );
  }

  await logOperationalEvent(supabase, {
    actorId: user.id,
    action: "mark_manual_fallback",
    entityType: "ai_document",
    entityId: documentId,
    metadata: {
      extraction_status: data.extraction_status,
      extraction_method: data.extraction_method
    }
  });

  return NextResponse.json({
    ok: true,
    item: data
  });
}
