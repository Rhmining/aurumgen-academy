import { chunkText } from "@/lib/airum/chunk-text";
import { createEmbedding, toPgVector } from "@/lib/airum/embeddings";

async function syncIngestionState(
  supabase: any,
  input: {
    documentId: number;
    ingestionStatus: "processing" | "failed" | "processed";
    status?: "draft" | "queued" | "processed" | "published";
    chunkCount?: number;
    lastIngestedAt?: string;
  }
) {
  const { data, error } = await supabase.rpc("set_ai_document_ingestion_state", {
    target_document_id: input.documentId,
    next_ingestion_status: input.ingestionStatus,
    next_status: input.status ?? null,
    next_chunk_count: typeof input.chunkCount === "number" ? input.chunkCount : null,
    next_last_ingested_at: input.lastIngestedAt ?? null
  });

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function ingestAiDocument(
  supabase: any,
  document: {
    id: number;
    content: string;
  }
) {
  const processingSync = await syncIngestionState(supabase, {
    documentId: document.id,
    ingestionStatus: "processing"
  });

  if (processingSync.error) {
    return { error: processingSync.error };
  }

  const chunks = chunkText(document.content ?? "");

  const { error: deleteError } = await supabase
    .from("ai_document_chunks")
    .delete()
    .eq("document_id", document.id);

  if (deleteError) {
    await syncIngestionState(supabase, {
      documentId: document.id,
      ingestionStatus: "failed"
    });

    return { error: deleteError.message };
  }

  if (chunks.length > 0) {
    const chunkPayload = await Promise.all(
      chunks.map(async (chunk) => {
        let embedding: string | null = null;

        try {
          embedding = toPgVector(await createEmbedding(chunk.content));
        } catch {
          embedding = null;
        }

        return {
          document_id: document.id,
          chunk_index: chunk.chunk_index,
          content: chunk.content,
          token_estimate: chunk.token_estimate,
          embedding
        };
      })
    );

    const { error: insertError } = await supabase
      .from("ai_document_chunks")
      .insert(chunkPayload);

    if (insertError) {
      await syncIngestionState(supabase, {
        documentId: document.id,
        ingestionStatus: "failed"
      });

      return { error: insertError.message };
    }
  }

  const finalizedSync = await syncIngestionState(supabase, {
    documentId: document.id,
    chunkCount: chunks.length,
    ingestionStatus: "processed",
    status: "processed",
    lastIngestedAt: new Date().toISOString()
  });

  if (finalizedSync.error) {
    return { error: finalizedSync.error };
  }

  return { chunkCount: chunks.length };
}
