import { NextResponse } from "next/server";
import { requireSupabaseUser } from "@/lib/api/route-helpers";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { logOperationalEvent } from "@/lib/audit/log-operational-event";
import { extractDocumentText } from "@/lib/storage/extract-document-text";

function normalizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "-").replace(/-+/g, "-");
}

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase, user } = session;
  const formData = await request.formData();
  const file = formData.get("file");
  const purpose = String(formData.get("purpose") ?? "materials");

  const rateLimit = enforceRateLimit({
    key: `upload:${user.id}`,
    max: 30,
    windowMs: 10 * 60 * 1000
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak upload. Coba lagi beberapa menit lagi." },
      { status: 429 }
    );
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return NextResponse.json({ error: "Ukuran file terlalu besar. Maksimal 10 MB." }, { status: 400 });
  }

  const bucket = purpose === "ai_documents" ? "ai-documents" : "materials";
  const safeName = normalizeFileName(file.name);
  const filePath = `${user.id}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const extraction = await extractDocumentText(file);

  await logOperationalEvent(supabase, {
    actorId: user.id,
    action: "upload_file",
    entityType: purpose === "ai_documents" ? "ai_document_file" : "material_file",
    entityId: filePath,
    metadata: {
      bucket,
      file_name: file.name,
      mime_type: file.type || "application/octet-stream",
      file_size: file.size,
      extraction_status: extraction.status,
      extraction_method: extraction.method
    }
  });

  return NextResponse.json({
    ok: true,
    bucket,
    storagePath: filePath,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    fileSize: file.size,
    extractedText: extraction.text,
    extractionSupported: extraction.supported,
    extractionStatus: extraction.status,
    extractionMethod: extraction.method,
    extractionNote: extraction.note
  });
}
