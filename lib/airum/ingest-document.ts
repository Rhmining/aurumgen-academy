import { chunkText } from "@/lib/airum/chunk-text";
import { createEmbedding, toPgVector } from "@/lib/airum/embeddings";

export async function ingestAiDocument(
  supabase: any,
  document: {
    id: number;
    content: string;
  }
) {
  await supabase
    .from("ai_documents")
    .update({ ingestion_status: "processing" })
    .eq("id", document.id);

  const chunks = chunkText(document.content ?? "");

  const { error: deleteError } = await supabase
    .from("ai_document_chunks")
    .delete()
    .eq("document_id", document.id);

  if (deleteError) {
    await supabase
      .from("ai_documents")
      .update({ ingestion_status: "failed" })
      .eq("id", document.id);

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
      await supabase
        .from("ai_documents")
        .update({ ingestion_status: "failed" })
        .eq("id", document.id);

      return { error: insertError.message };
    }
  }

  const { error: updateError } = await supabase
    .from("ai_documents")
    .update({
      chunk_count: chunks.length,
      ingestion_status: "processed",
      status: "processed",
      last_ingested_at: new Date().toISOString()
    })
    .eq("id", document.id);

  if (updateError) {
    return { error: updateError.message };
  }

  return { chunkCount: chunks.length };
}
