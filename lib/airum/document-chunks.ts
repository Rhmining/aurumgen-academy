import { createEmbedding, toPgVector } from "@/lib/airum/embeddings";
import { estimateTokens } from "@/lib/airum/chunk-text";

export async function syncDocumentContentFromChunks(supabase: any, documentId: number) {
  const { data: chunks, error } = await supabase
    .from("ai_document_chunks")
    .select("content")
    .eq("document_id", documentId)
    .order("chunk_index", { ascending: true });

  if (error) {
    return { error: error.message };
  }

  const content = (chunks ?? [])
    .map((chunk: { content?: string | null }) => String(chunk.content ?? "").trim())
    .filter(Boolean)
    .join("\n\n");

  const { error: updateError } = await supabase
    .from("ai_documents")
    .update({
      content,
      chunk_count: (chunks ?? []).length,
      ingestion_status: "processed",
      status: "processed",
      extraction_status: "manual_content",
      extraction_method: "chunk_editor",
      extraction_note: "Konten disusun ulang dari manual chunk editor."
    })
    .eq("id", documentId);

  if (updateError) {
    return { error: updateError.message };
  }

  return { ok: true, content };
}

export async function refreshDocumentChunkEmbeddings(supabase: any, documentId: number) {
  const { data: chunks, error } = await supabase
    .from("ai_document_chunks")
    .select("id, content")
    .eq("document_id", documentId)
    .order("chunk_index", { ascending: true });

  if (error) {
    return { error: error.message };
  }

  let refreshedCount = 0;
  const failures: { chunkId: number; message: string }[] = [];

  for (const chunk of chunks ?? []) {
    try {
      const embedding = toPgVector(await createEmbedding(String(chunk.content ?? "")));
      const { error: updateError } = await supabase
        .from("ai_document_chunks")
        .update({
          embedding,
          token_estimate: estimateTokens(String(chunk.content ?? ""))
        })
        .eq("id", chunk.id)
        .eq("document_id", documentId);

      if (updateError) {
        failures.push({ chunkId: chunk.id, message: updateError.message });
        continue;
      }

      refreshedCount += 1;
    } catch (embeddingError) {
      failures.push({
        chunkId: chunk.id,
        message: embeddingError instanceof Error ? embeddingError.message : "Refresh embedding gagal."
      });
    }
  }

  const { error: documentUpdateError } = await supabase
    .from("ai_documents")
    .update({
      ingestion_status: failures.length > 0 ? "failed" : "processed"
    })
    .eq("id", documentId);

  if (documentUpdateError) {
    return { error: documentUpdateError.message };
  }

  return {
    ok: failures.length === 0,
    refreshedCount,
    failures
  };
}
