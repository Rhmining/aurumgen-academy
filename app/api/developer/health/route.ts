import { NextResponse } from "next/server";
import { requireSupabaseUser } from "@/lib/api/route-helpers";
import { hasOpenAiEnv, hasSupabaseEnv } from "@/lib/supabase/env";
import { getSiteUrl } from "@/lib/site-url";

export async function GET() {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase, user } = session;

  const [{ count: documentCount }, { count: failedExtractionCount }, { count: failedIngestionCount }, { count: logCount }] =
    await Promise.all([
      supabase.from("ai_documents").select("*", { count: "exact", head: true }).eq("owner_id", user.id),
      supabase
        .from("ai_documents")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", user.id)
        .eq("extraction_status", "parser_failed"),
      supabase
        .from("ai_documents")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", user.id)
        .eq("ingestion_status", "failed"),
      supabase
        .from("operational_activity_logs")
        .select("*", { count: "exact", head: true })
        .eq("actor_id", user.id)
    ]);

  return NextResponse.json({
    env: {
      supabase: hasSupabaseEnv(),
      openai: hasOpenAiEnv(),
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? null,
      responsesModel: process.env.OPENAI_RESPONSES_MODEL ?? null,
      evaluatorModel: process.env.OPENAI_EVALUATOR_MODEL ?? null,
      embeddingModel: process.env.OPENAI_EMBEDDING_MODEL ?? null
    },
    summary: {
      documentCount: documentCount ?? 0,
      failedExtractionCount: failedExtractionCount ?? 0,
      failedIngestionCount: failedIngestionCount ?? 0,
      activityLogCount: logCount ?? 0
    },
    rateLimits: {
      aiRum: "20 requests / 5 minutes / user",
      upload: "30 uploads / 10 minutes / user",
      ingestion: "40 actions / 10 minutes / user"
    },
    urls: {
      resolvedSiteUrl: getSiteUrl(),
      authCallbackPath: "/api/auth/callback"
    }
  });
}
