import { NextResponse } from "next/server";
import { requireSupabaseUser } from "@/lib/api/route-helpers";
import { ingestAiDocument } from "@/lib/airum/ingest-document";
import { logOperationalEvent } from "@/lib/audit/log-operational-event";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase, user } = session;
  const { id } = await params;
  const documentId = Number(id);

  const { data: document, error: readError } = await supabase
    .from("ai_documents")
    .select("*")
    .eq("id", documentId)
    .eq("owner_id", user.id)
    .single();

  if (readError || !document) {
    return NextResponse.json({ error: readError?.message ?? "Dokumen tidak ditemukan." }, { status: 404 });
  }

  const result = await ingestAiDocument(supabase, {
    id: documentId,
    content: typeof document.content === "string" ? document.content : ""
  });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await logOperationalEvent(supabase, {
    actorId: user.id,
    action: "reingest_document",
    entityType: "ai_document",
    entityId: documentId,
    metadata: {
      chunk_count: result.chunkCount ?? 0
    }
  });

  return NextResponse.json({
    ok: true,
    documentId,
    chunkCount: result.chunkCount ?? 0
  });
}
