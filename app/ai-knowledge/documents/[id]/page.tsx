import Link from "next/link";
import { notFound } from "next/navigation";
import { AiKnowledgeShell } from "@/components/ai-knowledge/ai-knowledge-shell";
import { ChunkEditor } from "@/components/ai-knowledge/chunk-editor";
import { createClient } from "@/lib/supabase/server";

export default async function AiDocumentDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;
  const documentId = Number(id);

  const [{ data: document, error: documentError }, { data: chunks, error: chunksError }] =
    await Promise.all([
      supabase.from("ai_documents").select("*").eq("id", documentId).maybeSingle(),
      supabase
        .from("ai_document_chunks")
        .select("*")
        .eq("document_id", documentId)
        .order("chunk_index", { ascending: true })
    ]);

  if (documentError || !document) {
    notFound();
  }

  if (chunksError) {
    throw new Error(chunksError.message);
  }

  return (
    <AiKnowledgeShell
      title="Document Detail"
      description="Lihat metadata dokumen dan chunk hasil ingestion satu per satu."
    >
      <section className="surface rounded-[2rem] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="eyebrow">Knowledge Document</p>
            <h2 className="mt-4 font-display text-4xl">{document.title}</h2>
            <p className="mt-3 text-[rgb(var(--muted))]">
              {document.category} • {document.source_type} • Status: {document.status}
            </p>
            <p className="mt-2 text-sm text-[rgb(var(--muted))]">
              Ingestion: {document.ingestion_status ?? "idle"} • Chunks: {document.chunk_count ?? 0}
            </p>
            <p className="mt-2 text-sm text-[rgb(var(--muted))]">
              Extraction: {document.extraction_status ?? "manual_content"}
              {document.extraction_method ? ` • Method: ${document.extraction_method}` : ""}
            </p>
            {document.extraction_note ? (
              <p className="mt-2 text-sm text-[rgb(var(--muted))]">
                Note: {document.extraction_note}
              </p>
            ) : null}
          </div>
          <Link
            href="/ai-knowledge/documents"
            className="rounded-full border border-black/10 px-4 py-2 text-sm"
          >
            Kembali
          </Link>
        </div>
      </section>

      <section className="surface rounded-[2rem] p-6">
        <h3 className="font-display text-3xl">Source Content</h3>
        <pre className="mt-4 overflow-auto whitespace-pre-wrap rounded-3xl bg-black/5 p-4 text-sm dark:bg-white/5">
          {document.content || "Belum ada content."}
        </pre>
      </section>

      {(chunks ?? []).length > 0 ? (
        <section className="surface rounded-[2rem] p-6">
          <div className="flex flex-wrap gap-2">
            {(chunks ?? []).map((chunk: { id: number; chunk_index: number }) => (
              <a
                key={chunk.id}
                href={`#chunk-${chunk.chunk_index}`}
                className="rounded-full border border-black/10 px-4 py-2 text-sm"
              >
                Chunk #{chunk.chunk_index}
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {(chunks ?? []).length === 0 ? (
        <section className="space-y-4">
          <article className="surface rounded-[2rem] p-6 text-sm text-[rgb(var(--muted))]">
            Belum ada chunks. Jalankan ingestion dari halaman documents.
          </article>
        </section>
      ) : (
        <ChunkEditor
          documentId={document.id}
          initialChunks={(chunks ?? []).map((chunk: { id: number; chunk_index: number; content: string; token_estimate: number }) => ({
            id: chunk.id,
            chunk_index: chunk.chunk_index,
            content: chunk.content,
            token_estimate: chunk.token_estimate
          }))}
        />
      )}
    </AiKnowledgeShell>
  );
}
