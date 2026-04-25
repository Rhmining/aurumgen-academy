import { NextResponse } from "next/server";
import { normalizeArrayInput, requireSupabaseUser } from "@/lib/api/route-helpers";
import { logOperationalEvent } from "@/lib/audit/log-operational-event";

function normalizeDifficulty(value: unknown) {
  const normalized = String(value ?? "medium").trim().toLowerCase();

  if (normalized === "easy" || normalized === "hard") {
    return normalized;
  }

  return "medium";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase, user } = session;
  const body = await request.json();
  const { id } = await params;
  const questionId = Number(id);

  const { data: existing, error: existingError } = await supabase
    .from("question_bank")
    .select("*")
    .eq("id", questionId)
    .eq("owner_id", user.id)
    .single();

  if (existingError || !existing) {
    return NextResponse.json(
      { error: existingError?.message ?? "Soal tidak ditemukan." },
      { status: 404 }
    );
  }

  const payload = {
    subject: body.subject !== undefined ? String(body.subject) : existing.subject,
    pathway: body.pathway !== undefined ? String(body.pathway) : existing.pathway,
    difficulty:
      body.difficulty !== undefined ? normalizeDifficulty(body.difficulty) : existing.difficulty,
    exam_board: body.exam_board !== undefined ? String(body.exam_board) : existing.exam_board,
    prompt: body.prompt !== undefined ? String(body.prompt) : existing.prompt,
    answer_key:
      body.answer_key !== undefined
        ? (body.answer_key ? String(body.answer_key) : "")
        : existing.answer_key,
    tags: body.tags !== undefined ? normalizeArrayInput(body.tags) : existing.tags
  };

  const { data, error } = await supabase
    .from("question_bank")
    .update(payload)
    .eq("id", questionId)
    .eq("owner_id", user.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logOperationalEvent(supabase, {
    actorId: user.id,
    action: "update_question_bank_item",
    entityType: "question_bank",
    entityId: data.id,
    metadata: {
      subject: data.subject,
      pathway: data.pathway,
      difficulty: data.difficulty,
      exam_board: data.exam_board,
      tags_count: Array.isArray(data.tags) ? data.tags.length : 0
    }
  });

  return NextResponse.json({ item: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase, user } = session;
  const { id } = await params;
  const questionId = Number(id);

  const { data: existing } = await supabase
    .from("question_bank")
    .select("id, subject, pathway, difficulty, exam_board, tags")
    .eq("id", questionId)
    .eq("owner_id", user.id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Soal tidak ditemukan." }, { status: 404 });
  }

  const { error } = await supabase
    .from("question_bank")
    .delete()
    .eq("id", questionId)
    .eq("owner_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logOperationalEvent(supabase, {
    actorId: user.id,
    action: "delete_question_bank_item",
    entityType: "question_bank",
    entityId: questionId,
    metadata: {
      subject: existing?.subject ?? null,
      pathway: existing?.pathway ?? null,
      difficulty: existing?.difficulty ?? null,
      exam_board: existing?.exam_board ?? null,
      tags_count: Array.isArray(existing?.tags) ? existing.tags.length : 0
    }
  });

  return NextResponse.json({ ok: true });
}
