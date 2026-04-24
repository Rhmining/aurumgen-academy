import { NextResponse } from "next/server";
import { applyOwnerScope, requireSupabaseUser } from "@/lib/api/route-helpers";
import { refreshDocumentChunkEmbeddings } from "@/lib/airum/document-chunks";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase, user, isSuperAccount } = session;
  const { id } = await params;
  const documentId = Number(id);

  if (!Number.isFinite(documentId)) {
    return NextResponse.json({ error: "Document id tidak valid." }, { status: 400 });
  }

  const documentQuery = applyOwnerScope(
    supabase
      .from("ai_documents")
      .select("id")
      .eq("id", documentId),
    user.id,
    isSuperAccount
  );

  const { data: document, error: documentError } = await documentQuery.single();

  if (documentError || !document) {
    return NextResponse.json(
      { error: documentError?.message ?? "Dokumen tidak ditemukan." },
      { status: 404 }
    );
  }

  const result = await refreshDocumentChunkEmbeddings(supabase, documentId);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
