import { NextResponse } from "next/server";
import { requireSupabaseUser } from "@/lib/api/route-helpers";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { ingestAiDocument } from "@/lib/airum/ingest-document";
import { logOperationalEvent } from "@/lib/audit/log-operational-event";

type IngestionDoc = {
  id: number;
  title: string;
  category: string;
  status: string;
  ingestion_status: string | null;
  extraction_status: string | null;
  extraction_method: string | null;
  extraction_note: string | null;
  storage_path: string | null;
  chunk_count: number | null;
  reviewed_at: string | null;
  last_ingested_at: string | null;
  created_at: string;
  owner_id: string;
  content: string;
};

export async function GET() {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase, user } = session;
  const { data, error } = await supabase
    .from("ai_documents")
    .select("id, title, category, status, ingestion_status, extraction_status, extraction_method, extraction_note, storage_path, chunk_count, reviewed_at, last_ingested_at, created_at, owner_id, content")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const docs = (data ?? []) as IngestionDoc[];
  const queue = docs.filter((doc) =>
    doc.ingestion_status === "queued" ||
    doc.ingestion_status === "processing" ||
    doc.ingestion_status === "failed" ||
    ((doc.chunk_count ?? 0) === 0 && doc.content.trim().length > 0)
  );

  return NextResponse.json({
    summary: {
      total: docs.length,
      readyForIngestion: docs.filter((doc) => doc.content.trim().length > 0 && (doc.chunk_count ?? 0) === 0).length,
      processing: docs.filter((doc) => doc.ingestion_status === "processing").length,
      failed: docs.filter((doc) => doc.ingestion_status === "failed").length,
      processed: docs.filter((doc) => doc.ingestion_status === "processed").length,
      reviewed: docs.filter((doc) => Boolean(doc.reviewed_at)).length,
      parserFailed: docs.filter((doc) => doc.extraction_status === "parser_failed").length,
      parserSucceeded: docs.filter((doc) => doc.extraction_status === "parser_succeeded").length,
      manualContent: docs.filter((doc) => doc.extraction_status === "manual_content").length
    },
    queue: queue.map((doc) => ({
      id: doc.id,
      title: doc.title,
      category: doc.category,
      status: doc.status,
      ingestion_status: doc.ingestion_status ?? "idle",
      extraction_status: doc.extraction_status ?? "manual_content",
      extraction_method: doc.extraction_method,
      extraction_note: doc.extraction_note,
      storage_path: doc.storage_path,
      chunk_count: doc.chunk_count ?? 0,
      reviewed_at: doc.reviewed_at,
      last_ingested_at: doc.last_ingested_at
    })),
    recent: docs.slice(0, 12).map((doc) => ({
      id: doc.id,
      title: doc.title,
      category: doc.category,
      status: doc.status,
      ingestion_status: doc.ingestion_status ?? "idle",
      extraction_status: doc.extraction_status ?? "manual_content",
      extraction_method: doc.extraction_method,
      extraction_note: doc.extraction_note,
      storage_path: doc.storage_path,
      chunk_count: doc.chunk_count ?? 0,
      reviewed_at: doc.reviewed_at,
      last_ingested_at: doc.last_ingested_at
    }))
  });
}

export async function POST(request: Request) {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase, user } = session;
  const body = await request.json().catch(() => ({}));
  const action = String(body.action ?? "ingest_document");
  const documentId = Number(body.documentId);

  const rateLimit = enforceRateLimit({
    key: `ingestion:${user.id}`,
    max: 40,
    windowMs: 10 * 60 * 1000
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak aksi ingestion. Coba lagi beberapa menit lagi." },
      { status: 429 }
    );
  }

  if (action === "ingest_pending") {
    const { data, error } = await supabase
      .from("ai_documents")
      .select("id, content")
      .eq("owner_id", user.id)
      .or("ingestion_status.eq.failed,ingestion_status.eq.queued,chunk_count.eq.0")
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    let processedCount = 0;
    const failures: { documentId: number; message: string }[] = [];

    for (const doc of data ?? []) {
      const result = await ingestAiDocument(supabase, {
        id: doc.id,
        content: typeof doc.content === "string" ? doc.content : ""
      });
      if (result.error) {
        failures.push({ documentId: doc.id, message: result.error });
      } else {
        processedCount += 1;
      }
    }

    await logOperationalEvent(supabase, {
      actorId: user.id,
      action: "batch_ingest_pending",
      entityType: "ai_document_batch",
      entityId: `pending-${Date.now()}`,
      metadata: {
        processed_count: processedCount,
        failure_count: failures.length
      }
    });

    return NextResponse.json({
      ok: failures.length === 0,
      processedCount,
      failures
    });
  }

  if (!Number.isFinite(documentId)) {
    return NextResponse.json({ error: "documentId tidak valid." }, { status: 400 });
  }

  const { data: document, error: readError } = await supabase
    .from("ai_documents")
    .select("id, content")
    .eq("id", documentId)
    .eq("owner_id", user.id)
    .single();

  if (readError || !document) {
    return NextResponse.json({ error: readError?.message ?? "Dokumen tidak ditemukan." }, { status: 404 });
  }

  const result = await ingestAiDocument(supabase, {
    id: document.id,
    content: typeof document.content === "string" ? document.content : ""
  });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await logOperationalEvent(supabase, {
    actorId: user.id,
    action: "ingest_document_from_queue",
    entityType: "ai_document",
    entityId: document.id,
    metadata: {
      chunk_count: result.chunkCount ?? 0
    }
  });

  return NextResponse.json({
    ok: true,
    documentId: document.id,
    chunkCount: result.chunkCount ?? 0
  });
}
