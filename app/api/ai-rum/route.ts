import { NextResponse } from "next/server";
import { buildContext } from "@/lib/airum/build-context";
import { buildSystemPrompt } from "@/lib/airum/build-system-prompt";
import { hasOpenAiEnv } from "@/lib/supabase/env";
import type { AirumMessage } from "@/lib/airum/types";
import { createClient } from "@/lib/supabase/server";
import { retrieveKnowledgeChunks } from "@/lib/knowledge/retrieve-chunks";
import type { UserRole } from "@/lib/db/types";
import { buildSessionTitle } from "@/lib/airum/session-title";
import { evaluateAirumResponse } from "@/lib/airum/evaluate-response";
import { fetchOpenAiJson } from "@/lib/openai/fetch-json";
import { enforceRateLimit } from "@/lib/api/rate-limit";

type RetrievalSource = {
  documentId: number;
  chunkIndex: number;
  title: string;
  category: string;
  similarity?: number;
  retrievalMethod?: string;
  snippet?: string;
};

async function ensureSession(
  supabase: any,
  ownerId: string,
  role: UserRole,
  sessionId: string | null,
  latestUserMessage: string
) {
  if (sessionId) return sessionId;

  const { data, error } = await supabase
    .from("airum_sessions")
    .insert({ owner_id: ownerId, role, title: buildSessionTitle(latestUserMessage) })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const role = (typeof body.role === "string" ? body.role : "student") as UserRole;
  const messages = Array.isArray(body.messages) ? (body.messages as AirumMessage[]).slice(-20) : [];
  const requestedSessionId = typeof body.sessionId === "string" ? body.sessionId : null;

  if (!hasOpenAiEnv()) {
    return NextResponse.json({ error: "OPENAI_API_KEY belum diatur di .env.local." }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) {
    return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
  }

  const rateLimit = enforceRateLimit({
    key: `ai-rum:${user.id}`,
    max: 20,
    windowMs: 5 * 60 * 1000
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan AI-RUM. Coba lagi sebentar." },
      { status: 429 }
    );
  }

  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
  if (!latestUserMessage.trim()) {
    return NextResponse.json({ error: "Pesan user tidak boleh kosong." }, { status: 400 });
  }
  if (latestUserMessage.length > 4000) {
    return NextResponse.json({ error: "Pesan user terlalu panjang. Maksimal 4000 karakter." }, { status: 400 });
  }

  const sessionId = await ensureSession(supabase, user.id, role, requestedSessionId, latestUserMessage);

  const retrieval = await retrieveKnowledgeChunks(supabase, latestUserMessage, role);
  const retrievalPrompt = retrieval.chunks.length > 0
    ? `\n\nGunakan knowledge internal berikut bila relevan:\n${retrieval.chunks.map((chunk: { chunk_index: number; content: string; title?: string }, index: number) => `[Sumber ${index + 1}] ${chunk.title ?? "Dokumen"} / chunk ${chunk.chunk_index}\n${chunk.content}`).join("\n\n")}`
    : "";

  const payload = await fetchOpenAiJson({
    path: "/responses",
    body: {
      model: process.env.OPENAI_RESPONSES_MODEL ?? "gpt-5",
      instructions: `${buildSystemPrompt(role)}${retrievalPrompt}\n\nJika menggunakan knowledge internal, sebutkan secara ringkas bahwa jawaban didukung knowledge base AURUMGEN.`,
      input: messages.map((message) => ({
        role: message.role,
        content: [{ type: "input_text", text: message.content }]
      }))
    },
    timeoutMs: 45000,
    retries: 1
  });

  const outputText = payload.output_text ?? "";

  const { data: userMessageRow, error: userMessageError } = await supabase
    .from("airum_messages")
    .insert({ session_id: sessionId, role: "user", content: latestUserMessage })
    .select("id")
    .single();
  if (userMessageError) return NextResponse.json({ error: userMessageError.message }, { status: 400 });

  const { data: assistantMessageRow, error: assistantMessageError } = await supabase
    .from("airum_messages")
    .insert({ session_id: sessionId, role: "assistant", content: outputText })
    .select("id")
    .single();
  if (assistantMessageError) return NextResponse.json({ error: assistantMessageError.message }, { status: 400 });

  const sources = Array.isArray(retrieval.sources) ? (retrieval.sources as RetrievalSource[]) : [];
  if (sources.length > 0) {
    const { error: citationError } = await supabase.from("airum_citations").insert(
      sources.map((source) => ({
        message_id: assistantMessageRow.id,
        document_id: source.documentId,
        chunk_index: source.chunkIndex,
        title: source.title,
        category: source.category,
        similarity: source.similarity ?? null,
        retrieval_method: source.retrievalMethod ?? null,
        snippet: source.snippet ?? null
      }))
    );
    if (citationError) return NextResponse.json({ error: citationError.message }, { status: 400 });
  }

  const evaluation = await evaluateAirumResponse(latestUserMessage, outputText, sources);
  const { error: evaluationError } = await supabase.from("airum_evaluations").insert({
    message_id: assistantMessageRow.id,
    retrieval_score: evaluation.retrievalScore,
    answer_score: evaluation.answerScore,
    source_count: evaluation.sourceCount,
    avg_similarity: evaluation.avgSimilarity,
    flags: evaluation.flags,
    evaluator_mode: evaluation.evaluatorMode,
    evaluator_model: evaluation.evaluatorModel,
    notes: evaluation.notes
  });
  if (evaluationError) return NextResponse.json({ error: evaluationError.message }, { status: 400 });

  await supabase.from("airum_sessions").update({ title: buildSessionTitle(latestUserMessage), role }).eq("id", sessionId);

  return NextResponse.json({
    ok: true,
    sessionId,
    userMessageId: userMessageRow.id,
    assistantMessageId: assistantMessageRow.id,
    evaluation,
    context: buildContext("ai-rum", { retrievalNote: retrieval.retrievalNote, sources: retrieval.sources }),
    responseId: payload.id ?? null,
    outputText,
    systemPrompt: buildSystemPrompt(role),
    sources: retrieval.sources
  });
}
