import { requireSupabaseUser } from "@/lib/api/route-helpers";

function isPreviewableMaterial(role: string, visibility: string | null, ownerId: string | null, userId: string) {
  if (ownerId === userId && (role === "teacher" || role === "developer")) {
    return true;
  }

  if (role === "student" || role === "parent") {
    return visibility === "portal" || visibility === "published";
  }

  return visibility === "portal" || visibility === "published";
}

export async function GET(request: Request) {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase, user } = session;
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return new Response("Path material belum lengkap.", { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = typeof profile?.role === "string" ? profile.role : "student";

  const { data: material, error: materialError } = await supabase
    .from("materials")
    .select("storage_path, file_name, mime_type, visibility, owner_id")
    .eq("storage_path", path)
    .maybeSingle();

  if (materialError || !material) {
    return new Response("Material tidak ditemukan.", { status: 404 });
  }

  if (!isPreviewableMaterial(role, material.visibility, material.owner_id, user.id)) {
    return new Response("Anda tidak punya akses untuk membuka material ini.", { status: 403 });
  }

  const { data: fileData, error: downloadError } = await supabase.storage
    .from("materials")
    .download(path);

  if (downloadError || !fileData) {
    return new Response(downloadError?.message ?? "Gagal mengambil file material.", { status: 400 });
  }

  const extension = (material.file_name ?? path).split(".").at(-1)?.toLowerCase() ?? "";
  const mimeType = material.mime_type || (extension === "html" ? "text/html; charset=utf-8" : "application/octet-stream");

  return new Response(fileData, {
    status: 200,
    headers: {
      "Content-Type": mimeType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(material.file_name ?? "material")}"`,
      "Cache-Control": "private, max-age=60"
    }
  });
}
