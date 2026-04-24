import { NextResponse } from "next/server";
import { applyOwnerScope, requireSupabaseUser } from "@/lib/api/route-helpers";
import { logOperationalEvent } from "@/lib/audit/log-operational-event";

export async function GET() {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase } = session;

  const [{ data: docs }, { data: citations }] = await Promise.all([
    supabase
      .from("ai_documents")
      .select("id, title, category, status, ingestion_status, extraction_status, extraction_method, extraction_note, storage_path, chunk_count, last_ingested_at, reviewed_at")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("airum_citations").select("document_id").limit(2000)
  ]);

  const citationCounts = (citations ?? []).reduce((acc, citation: { document_id: number }) => {
    acc.set(citation.document_id, (acc.get(citation.document_id) ?? 0) + 1);
    return acc;
  }, new Map<number, number>());

  const reviewItems = (docs ?? []).map((doc: { id: number; title: string; category: string; status: string; ingestion_status: string; extraction_status: string | null; extraction_method: string | null; extraction_note: string | null; storage_path: string | null; chunk_count: number | null; last_ingested_at: string | null; reviewed_at: string | null }) => {
    const flags: string[] = [];
    const citationsForDoc = citationCounts.get(doc.id) ?? 0;

    if (doc.ingestion_status === "failed") flags.push("ingestion_failed");
    if ((doc.chunk_count ?? 0) === 0) flags.push("no_chunks");
    if (doc.extraction_status === "parser_failed") flags.push("parser_failed");
    if (doc.status === "processed" && citationsForDoc === 0) flags.push("unused_in_answers");

    return {
      ...doc,
      citation_count: citationsForDoc,
      flags
    };
  }).filter((item: { flags: string[]; reviewed_at: string | null }) => item.flags.length > 0 && !item.reviewed_at);

  return NextResponse.json({ items: reviewItems });
}

export async function PATCH(request: Request) {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase, user, isSuperAccount } = session;
  const body = await request.json();
  const documentId = Number(body.documentId);
  const action = String(body.action ?? "");

  if (!Number.isFinite(documentId)) {
    return NextResponse.json({ error: "documentId tidak valid." }, { status: 400 });
  }

  if (action !== "mark_reviewed") {
    return NextResponse.json({ error: "Action review tidak dikenali." }, { status: 400 });
  }

  const reviewQuery = applyOwnerScope(
    supabase
      .from("ai_documents")
      .update({
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id
      })
      .eq("id", documentId),
    user.id,
    isSuperAccount
  );

  const { data, error } = await reviewQuery
    .select("id, reviewed_at")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Dokumen review tidak ditemukan." },
      { status: error?.code === "PGRST116" ? 404 : 400 }
    );
  }

  await logOperationalEvent(supabase, {
    actorId: user.id,
    action: "mark_reviewed",
    entityType: "ai_document",
    entityId: documentId,
    metadata: {
      reviewed_at: data.reviewed_at
    }
  });

  return NextResponse.json({
    ok: true,
    item: data
  });
}
