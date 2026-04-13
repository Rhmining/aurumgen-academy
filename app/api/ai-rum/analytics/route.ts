import { NextResponse } from "next/server";
import { requireSupabaseUser } from "@/lib/api/route-helpers";

export async function GET() {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase, user } = session;

  const [{ data: sessions }, { data: messages }, { data: citations }, { data: docs }, { data: evaluations }] = await Promise.all([
    supabase.from("airum_sessions").select("id, owner_id").eq("owner_id", user.id),
    supabase
      .from("airum_messages")
      .select("id, session_id, role, content, created_at, airum_sessions!inner(owner_id)")
      .eq("airum_sessions.owner_id", user.id),
    supabase.from("airum_citations").select("id, message_id, document_id, title, category, retrieval_method").limit(1000),
    supabase.from("ai_documents").select("id, title, category, chunk_count, status, ingestion_status, extraction_status").limit(200),
    supabase.from("airum_evaluations").select("id, message_id, retrieval_score, answer_score, flags, evaluator_mode, notes").limit(1000)
  ]);

  const sessionIds = new Set((sessions ?? []).map((item: { id: string }) => item.id));
  const ownedMessages = (messages ?? []).filter((message: { session_id: string }) => sessionIds.has(message.session_id));
  const ownedMessageIds = new Set(ownedMessages.map((message: { id: string }) => message.id));
  const ownedCitations = (citations ?? []).filter((citation: { message_id: string }) => ownedMessageIds.has(citation.message_id));
  const ownedEvaluations = (evaluations ?? []).filter((evaluation: { message_id: string }) => ownedMessageIds.has(evaluation.message_id));

  const userMessages = ownedMessages.filter((message: { role: string }) => message.role === "user");
  const assistantMessages = ownedMessages.filter((message: { role: string }) => message.role === "assistant");

  const popularQuestions = Array.from(
    userMessages.reduce((acc, message: { content: string }) => {
      const key = message.content.trim();
      if (!key) return acc;
      acc.set(key, (acc.get(key) ?? 0) + 1);
      return acc;
    }, new Map<string, number>())
  ).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([question, count]) => ({ question, count }));

  const citedAssistantMessageIds = new Set(ownedCitations.map((citation: { message_id: string }) => citation.message_id));
  const retrievalHitRate = assistantMessages.length ? citedAssistantMessageIds.size / assistantMessages.length : 0;

  const topDocuments = Array.from(
    ownedCitations.reduce((acc, citation: { document_id: number; title: string; category: string }) => {
      const key = citation.document_id;
      const current = acc.get(key) ?? { documentId: key, title: citation.title, category: citation.category, count: 0 };
      current.count += 1;
      acc.set(key, current);
      return acc;
    }, new Map<number, { documentId: number; title: string; category: string; count: number }>())
  ).map((entry) => entry[1]).sort((a, b) => b.count - a.count).slice(0, 5);

  const retrievalMethods = Array.from(
    ownedCitations.reduce((acc, citation: { retrieval_method: string | null }) => {
      const key = citation.retrieval_method ?? "unknown";
      acc.set(key, (acc.get(key) ?? 0) + 1);
      return acc;
    }, new Map<string, number>())
  ).map(([method, count]) => ({ method, count }));

  const processedDocs = (docs ?? []).filter((doc: { status?: string; ingestion_status?: string }) => doc.status === "processed" && doc.ingestion_status === "processed");
  const extractionStatuses = Array.from(
    (docs ?? []).reduce((acc, doc: { extraction_status?: string | null }) => {
      const key = doc.extraction_status ?? "unknown";
      acc.set(key, (acc.get(key) ?? 0) + 1);
      return acc;
    }, new Map<string, number>())
  ).map(([status, count]) => ({ status, count }));

  const avgRetrievalScore = ownedEvaluations.length
    ? ownedEvaluations.reduce((sum, item: { retrieval_score: number | null }) => sum + Number(item.retrieval_score ?? 0), 0) / ownedEvaluations.length
    : 0;
  const avgAnswerScore = ownedEvaluations.length
    ? ownedEvaluations.reduce((sum, item: { answer_score: number | null }) => sum + Number(item.answer_score ?? 0), 0) / ownedEvaluations.length
    : 0;

  const evaluatorModes = Array.from(
    ownedEvaluations.reduce((acc, item: { evaluator_mode?: string | null }) => {
      const key = item.evaluator_mode ?? "unknown";
      acc.set(key, (acc.get(key) ?? 0) + 1);
      return acc;
    }, new Map<string, number>())
  ).map(([mode, count]) => ({ mode, count }));

  const fallbackCount = ownedEvaluations.filter((item: { flags?: string[] | null }) =>
    Array.isArray(item.flags) && item.flags.includes("judge_fallback")
  ).length;
  const fallbackRate = ownedEvaluations.length ? fallbackCount / ownedEvaluations.length : 0;

  const lowQualityMessages = assistantMessages
    .map((message: { id: string; content: string }) => ({
      messageId: message.id,
      content: message.content,
      evaluation: ownedEvaluations.find((item: { message_id: string }) => item.message_id === message.id)
    }))
    .filter((item: { evaluation?: { answer_score?: number | null } }) => Number(item.evaluation?.answer_score ?? 0) < 0.55)
    .slice(0, 5)
    .map((item: { content: string; evaluation?: { answer_score?: number | null; flags?: string[] | null; evaluator_mode?: string | null; notes?: string | null } }) => ({
      preview: item.content.slice(0, 140),
      answerScore: Number(item.evaluation?.answer_score ?? 0),
      flags: item.evaluation?.flags ?? [],
      evaluatorMode: item.evaluation?.evaluator_mode ?? "unknown",
      notes: item.evaluation?.notes ?? null
    }));

  return NextResponse.json({
    summary: {
      sessionCount: (sessions ?? []).length,
      messageCount: ownedMessages.length,
      retrievalHitRate,
      processedKnowledgeDocs: processedDocs.length,
      avgRetrievalScore,
      avgAnswerScore,
      fallbackRate
    },
    popularQuestions,
    topDocuments,
    retrievalMethods,
    extractionStatuses,
    evaluatorModes,
    lowQualityMessages
  });
}
