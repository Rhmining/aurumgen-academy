import { NextResponse } from "next/server";
import { formatSupabaseError, requireSupabaseUser } from "@/lib/api/route-helpers";
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

export async function GET() {
  try {
    const session = await requireSupabaseUser();
    if ("error" in session) return session.error;

    const { supabase } = session;
    const { data, error } = await supabase
      .from("ai_documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: formatSupabaseError(error, "ai_documents.get") }, { status: 400 });
    }

    return NextResponse.json({ items: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal mengambil AI documents." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSupabaseUser();
    if ("error" in session) return session.error;

    const { supabase, user } = session;
    const body = await request.json();
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
      ingestion_status: String(body.ingestion_status ?? "idle"),
      extraction_status: extraction.extraction_status,
      extraction_method: extraction.extraction_method,
      extraction_note: extraction.extraction_note,
      owner_id: user.id
    };

    const warnings: string[] = [];

    const { data: inserted, error: insertError } = await supabase
      .from("ai_documents")
      .insert(payload)
      .select("id")
      .single();

    if (insertError) {
      const message = insertError.message.includes("row-level security")
        ? `Akun Anda belum punya akses database untuk membuat AI documents. ${formatSupabaseError(insertError, "ai_documents.insert")}`
        : formatSupabaseError(insertError, "ai_documents.insert");

      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { data, error: readError } = await supabase
      .from("ai_documents")
      .select("*")
      .eq("id", inserted.id)
      .single();

    if (readError || !data) {
      return NextResponse.json(
        {
          error: formatSupabaseError(readError, "ai_documents.read_created"),
          documentId: inserted.id
        },
        { status: 400 }
      );
    }

    let ingestion: { chunkCount?: number; error?: string } | null = null;
    if (data.content && String(data.content).trim().length > 0) {
      ingestion = await ingestAiDocument(supabase, {
        id: data.id,
        content: data.content
      });

      if (ingestion?.error) {
        warnings.push(`ingestion: ${ingestion.error}`);
      }
    }

    const logResult = await logOperationalEvent(supabase, {
      actorId: user.id,
      action: "create_ai_document",
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

    if (!logResult.ok) {
      warnings.push(formatSupabaseError(logResult.error, "operational_activity_logs.insert"));
    }

    return NextResponse.json(
      {
        item: data,
        ingestion,
        warnings: warnings.length > 0 ? warnings : undefined
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal membuat AI document." },
      { status: 500 }
    );
  }
}
