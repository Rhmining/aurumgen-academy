import { NextResponse } from "next/server";
import { requireSupabaseUser } from "@/lib/api/route-helpers";

export async function GET(request: Request) {
  try {
    const session = await requireSupabaseUser();
    if ("error" in session) return session.error;

    const { supabase } = session;
    const { searchParams } = new URL(request.url);
    const bucket = searchParams.get("bucket");
    const path = searchParams.get("path");
    const download = searchParams.get("download");

    if (!bucket || !path) {
      return NextResponse.json({ error: "Bucket atau path belum lengkap." }, { status: 400 });
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60, {
        download: download === "1"
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal membuat signed URL." },
      { status: 500 }
    );
  }
}
