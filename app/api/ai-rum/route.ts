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
import { formatSupabaseError, requireSupabaseUser } from "@/lib/api/route-helpers";

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

  const { data, error } = await supabase.rpc("create_airum_session", {
    p_owner_id: ownerId,
    p_role: role,
    p_title: buildSessionTitle(latestUserMessage)
  });

  if (error) throw new Error(formatSupabaseError(error, "airum.ensureSession"));
  if (typeof data !== "string" || !data) {
    throw new Error("AIRUM gagal membuat session baru.");
  }

  return data;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const role = (typeof body.role === "string" ? body.role : "student") as UserRole;
    const messages = Array.isArray(body.messages) ? (body.messages as AirumMessage[]).slice(-20) : [];
    const requestedSessionId = typeof body.sessionId === "string" ? body.sessionId : null;

    if (!hasOpenAiEnv()) {
      return NextResponse.json({ error: "OPENAI_API_KEY belum diatur di .env.local." }, { status: 503 });
    }

    const session = await requireSupabaseUser();
    if ("error" in session) return session.error;

    const { supabase, user } = session;
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
    const sources = Array.isArray(retrieval.sources) ? (retrieval.sources as RetrievalSource[]) : [];
    const evaluation = await evaluateAirumResponse(latestUserMessage, outputText, sources);
    const { data: recordData, error: recordError } = await supabase.rpc("record_airum_turn", {
      p_session_id: sessionId,
      p_role: role,
      p_title: buildSessionTitle(latestUserMessage),
      p_user_message: latestUserMessage,
      p_assistant_message: outputText,
      p_citations: sources,
      p_evaluation: {
        retrievalScore: evaluation.retrievalScore,
        answerScore: evaluation.answerScore,
        sourceCount: evaluation.sourceCount,
        avgSimilarity: evaluation.avgSimilarity,
        flags: evaluation.flags,
        evaluatorMode: evaluation.evaluatorMode,
        evaluatorModel: evaluation.evaluatorModel,
        notes: evaluation.notes
      }
    });

    if (recordError) {
      throw new Error(formatSupabaseError(recordError, "airum.recordTurn"));
    }

    const userMessageId =
      recordData && typeof recordData === "object" && typeof (recordData as { user_message_id?: unknown }).user_message_id === "string"
        ? ((recordData as { user_message_id: string }).user_message_id)
        : null;
    const assistantMessageId =
      recordData && typeof recordData === "object" && typeof (recordData as { assistant_message_id?: unknown }).assistant_message_id === "string"
        ? ((recordData as { assistant_message_id: string }).assistant_message_id)
        : null;

    return NextResponse.json({
      ok: true,
      sessionId,
      userMessageId,
      assistantMessageId,
      evaluation,
      context: buildContext("ai-rum", { retrievalNote: retrieval.retrievalNote, sources: retrieval.sources }),
      responseId: payload.id ?? null,
      outputText,
      systemPrompt: buildSystemPrompt(role),
      sources: retrieval.sources
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI-RUM sedang tidak tersedia.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
