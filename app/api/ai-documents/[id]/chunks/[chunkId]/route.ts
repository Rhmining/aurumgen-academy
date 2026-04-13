import { NextResponse } from "next/server";
import { requireSupabaseUser } from "@/lib/api/route-helpers";
import { createEmbedding, toPgVector } from "@/lib/airum/embeddings";
import { estimateTokens } from "@/lib/airum/chunk-text";
import { syncDocumentContentFromChunks } from "@/lib/airum/document-chunks";
import { logOperationalEvent } from "@/lib/audit/log-operational-event";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; chunkId: string }> }
) {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase, user } = session;
  const body = await request.json().catch(() => ({}));
  const { id, chunkId } = await params;
  const documentId = Number(id);
  const chunkRecordId = Number(chunkId);
  const content = String(body.content ?? "").trim();

  if (!Number.isFinite(documentId) || !Number.isFinite(chunkRecordId)) {
    return NextResponse.json({ error: "Document atau chunk id tidak valid." }, { status: 400 });
  }

  const { data: document, error: documentError } = await supabase
    .from("ai_documents")
    .select("id")
    .eq("id", documentId)
    .eq("owner_id", user.id)
    .single();

  if (documentError || !document) {
    return NextResponse.json(
      { error: documentError?.message ?? "Dokumen tidak ditemukan." },
      { status: 404 }
    );
  }

  let embedding: string | null = null;
  try {
    embedding = content ? toPgVector(await createEmbedding(content)) : null;
  } catch (embeddingError) {
    return NextResponse.json(
      {
        error:
          embeddingError instanceof Error
            ? embeddingError.message
            : "Gagal membuat embedding untuk chunk."
      },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("ai_document_chunks")
    .update({
      content,
      token_estimate: estimateTokens(content),
      embedding
    })
    .eq("id", chunkRecordId)
    .eq("document_id", documentId)
    .select("id, document_id, chunk_index, content, token_estimate")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Chunk tidak ditemukan." },
      { status: 404 }
    );
  }

  const syncResult = await syncDocumentContentFromChunks(supabase, documentId);
  if ("error" in syncResult) {
    return NextResponse.json({ error: syncResult.error }, { status: 400 });
  }

  await logOperationalEvent(supabase, {
    actorId: user.id,
    action: "edit_chunk",
    entityType: "ai_document_chunk",
    entityId: chunkRecordId,
    metadata: {
      document_id: documentId,
      chunk_index: data.chunk_index,
      token_estimate: data.token_estimate
    }
  });

  return NextResponse.json({
    ok: true,
    item: data
  });
}
