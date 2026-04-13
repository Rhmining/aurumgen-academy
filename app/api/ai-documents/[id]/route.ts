import { NextResponse } from "next/server";
import { requireSupabaseUser } from "@/lib/api/route-helpers";
import { ingestAiDocument } from "@/lib/airum/ingest-document";
import { logOperationalEvent } from "@/lib/audit/log-operational-event";

function inferExtractionFields(body: Record<string, unknown>) {
  const content = String(body.content ?? "").trim();
  const sourceType = String(body.source_type ?? "manual");
  const storagePath = body.storage_path ? String(body.storage_path) : null;
  const providedStatus = body.extraction_status ? String(body.extraction_status) : null;
  const providedMethod = body.extraction_method ? String(body.extraction_method) : null;
  const providedNote = body.extraction_note ? String(body.extraction_note) : null;

  if (providedStatus === "parser_succeeded" || providedStatus === "parser_failed" || providedStatus === "manual_content") {
    return {
      extraction_status: providedStatus,
      extraction_method: providedMethod,
      extraction_note: providedNote
    };
  }

  if (sourceType === "manual" || (!storagePath && content)) {
    return {
      extraction_status: "manual_content",
      extraction_method: "manual",
      extraction_note: providedNote
    };
  }

  if (storagePath && !content) {
    return {
      extraction_status: "parser_failed",
      extraction_method: providedMethod,
      extraction_note: providedNote ?? "File terunggah tetapi belum menghasilkan teks yang bisa dipakai."
    };
  }

  return {
    extraction_status: "manual_content",
    extraction_method: providedMethod,
    extraction_note: providedNote
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase } = session;
  const { id } = await params;
  const documentId = Number(id);

  const [{ data: document, error: documentError }, { data: chunks, error: chunksError }] =
    await Promise.all([
      supabase.from("ai_documents").select("*").eq("id", documentId).single(),
      supabase
        .from("ai_document_chunks")
        .select("*")
        .eq("document_id", documentId)
        .order("chunk_index", { ascending: true })
    ]);

  if (documentError || !document) {
    return NextResponse.json(
      { error: documentError?.message ?? "Dokumen tidak ditemukan." },
      { status: 404 }
    );
  }

  if (chunksError) {
    return NextResponse.json({ error: chunksError.message }, { status: 400 });
  }

  return NextResponse.json({
    item: document,
    chunks: chunks ?? []
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase, user } = session;
  const body = await request.json();
  const { id } = await params;
  const extraction = inferExtractionFields(body as Record<string, unknown>);

  const payload = {
    title: String(body.title ?? ""),
    category: String(body.category ?? "knowledge"),
    source_type: String(body.source_type ?? "manual"),
    content: String(body.content ?? ""),
    status: String(body.status ?? "draft"),
    storage_path: body.storage_path ? String(body.storage_path) : null,
    file_name: body.file_name ? String(body.file_name) : null,
    mime_type: body.mime_type ? String(body.mime_type) : null,
    file_size: body.file_size ? Number(body.file_size) : null,
    extraction_status: extraction.extraction_status,
    extraction_method: extraction.extraction_method,
    extraction_note: extraction.extraction_note
  };

  const { data, error } = await supabase
    .from("ai_documents")
    .update(payload)
    .eq("id", Number(id))
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  let ingestion: { chunkCount?: number; error?: string } | null = null;
  if (data.content && String(data.content).trim().length > 0) {
    ingestion = await ingestAiDocument(supabase, {
      id: data.id,
      content: data.content
    });
  }

  await logOperationalEvent(supabase, {
    actorId: user.id,
    action: "update_ai_document",
    entityType: "ai_document",
    entityId: data.id,
    metadata: {
      title: data.title,
      category: data.category,
      status: data.status,
      source_type: data.source_type,
      extraction_status: data.extraction_status,
      ingestion_chunk_count: ingestion?.chunkCount ?? 0,
      ingestion_error: ingestion?.error ?? null
    }
  });

  return NextResponse.json({ item: data, ingestion });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase, user } = session;
  const { id } = await params;
  const documentId = Number(id);

  const { data: existing } = await supabase
    .from("ai_documents")
    .select("id, title, category, storage_path")
    .eq("id", documentId)
    .single();

  const { error } = await supabase
    .from("ai_documents")
    .delete()
    .eq("id", documentId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logOperationalEvent(supabase, {
    actorId: user.id,
    action: "delete_ai_document",
    entityType: "ai_document",
    entityId: documentId,
    metadata: {
      title: existing?.title ?? null,
      category: existing?.category ?? null,
      storage_path: existing?.storage_path ?? null
    }
  });

  return NextResponse.json({ ok: true });
}
