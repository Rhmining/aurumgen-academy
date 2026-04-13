import type { UserRole } from "@/lib/db/types";
import { createEmbedding, toPgVector } from "@/lib/airum/embeddings";

function extractSearchTerms(text: string) {
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((term) => term.length >= 4)
    )
  ).slice(0, 6);
}

function buildKeywordOrClause(terms: string[]) {
  return terms
    .map((term) => `content.ilike.%${term.replace(/[%_,]/g, "")}%`)
    .join(",");
}

function makeSnippet(content: string, max = 160) {
  const normalized = content.replace(/\s+/g, " ").trim();
  return normalized.length > max ? `${normalized.slice(0, max)}...` : normalized;
}

export async function retrieveKnowledgeChunks(
  supabase: any,
  query: string,
  role: UserRole
) {
  if (!query.trim()) {
    return {
      retrievalNote: "Pertanyaan kosong, retrieval dilewati.",
      chunks: [],
      sources: []
    };
  }

  try {
    const embedding = toPgVector(await createEmbedding(query));
    const terms = extractSearchTerms(query);

    const vectorPromise = supabase.rpc("match_ai_document_chunks", {
      query_embedding: embedding,
      match_count: 8,
      filter_category: role === "student" || role === "parent" ? "knowledge" : null
    });

    let keywordQuery = supabase
      .from("ai_document_chunks")
      .select("id,document_id,chunk_index,content,token_estimate,ai_documents!inner(id,title,category,status,ingestion_status)")
      .eq("ai_documents.status", "processed")
      .eq("ai_documents.ingestion_status", "processed")
      .limit(8);

    if (role === "student" || role === "parent") {
      keywordQuery = keywordQuery.eq("ai_documents.category", "knowledge");
    }

    if (terms.length > 0) {
      keywordQuery = keywordQuery.or(buildKeywordOrClause(terms));
    }

    const [{ data: vectorData, error: vectorError }, { data: keywordData, error: keywordError }] =
      await Promise.all([vectorPromise, keywordQuery]);

    if (vectorError && keywordError) {
      return {
        retrievalNote: vectorError.message,
        chunks: [],
        sources: []
      };
    }

    const ranked = new Map<
      string,
      {
        document_id: number;
        chunk_index: number;
        content: string;
        title?: string;
        category?: string;
        similarity?: number;
        retrieval_method: "vector" | "keyword" | "hybrid";
        score: number;
      }
    >();

    (vectorData ?? []).forEach(
      (chunk: {
        document_id: number;
        chunk_index: number;
        content: string;
        title?: string;
        category?: string;
        similarity?: number;
      }) => {
        const key = `${chunk.document_id}-${chunk.chunk_index}`;
        ranked.set(key, {
          ...chunk,
          retrieval_method: "vector",
          score: Number(chunk.similarity ?? 0)
        });
      }
    );

    (keywordData ?? []).forEach(
      (chunk: {
        document_id: number;
        chunk_index: number;
        content: string;
        ai_documents?: { title?: string; category?: string };
      }) => {
        const key = `${chunk.document_id}-${chunk.chunk_index}`;
        const keywordScore =
          terms.length > 0
            ? terms.reduce(
                (sum, term) => sum + (chunk.content.toLowerCase().includes(term) ? 1 : 0),
                0
              ) / terms.length
            : 0;
        const existing = ranked.get(key);

        if (existing) {
          ranked.set(key, {
            ...existing,
            title: existing.title ?? chunk.ai_documents?.title,
            category: existing.category ?? chunk.ai_documents?.category,
            retrieval_method: "hybrid",
            score: existing.score + keywordScore * 0.35
          });
        } else {
          ranked.set(key, {
            document_id: chunk.document_id,
            chunk_index: chunk.chunk_index,
            content: chunk.content,
            title: chunk.ai_documents?.title,
            category: chunk.ai_documents?.category,
            retrieval_method: "keyword",
            score: keywordScore
          });
        }
      }
    );

    const filteredChunks = Array.from(ranked.values())
      .sort((left, right) => right.score - left.score)
      .slice(0, 4);

    return {
      retrievalNote:
        filteredChunks.length > 0
          ? `Menggunakan ${filteredChunks.length} knowledge chunk hasil hybrid retrieval.`
          : "Tidak ada knowledge chunk relevan.",
      chunks: filteredChunks,
      sources: filteredChunks.map(
        (chunk: {
          document_id: number;
          chunk_index: number;
          title?: string;
          category?: string;
          similarity?: number;
          retrieval_method: "vector" | "keyword" | "hybrid";
          content: string;
        }) => ({
          documentId: chunk.document_id,
          chunkIndex: chunk.chunk_index,
          title: chunk.title ?? `Document ${chunk.document_id}`,
          category: chunk.category ?? "knowledge",
          similarity: chunk.similarity ?? 0,
          retrievalMethod: chunk.retrieval_method,
          snippet: makeSnippet(chunk.content)
        })
      )
    };
  } catch (error) {
    return {
      retrievalNote: error instanceof Error ? error.message : "Retrieval gagal.",
      chunks: [],
      sources: []
    };
  }
}
