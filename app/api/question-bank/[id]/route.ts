import { NextResponse } from "next/server";
import { normalizeArrayInput, requireSupabaseUser } from "@/lib/api/route-helpers";
import { logOperationalEvent } from "@/lib/audit/log-operational-event";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase, user } = session;
  const body = await request.json();
  const { id } = await params;

  const payload = {
    subject: String(body.subject ?? "General"),
    pathway: String(body.pathway ?? "IGCSE"),
    difficulty: String(body.difficulty ?? "medium"),
    exam_board: String(body.exam_board ?? "IGCSE"),
    prompt: String(body.prompt ?? ""),
    answer_key: String(body.answer_key ?? ""),
    tags: normalizeArrayInput(body.tags)
  };

  const { data, error } = await supabase
    .from("question_bank")
    .update(payload)
    .eq("id", Number(id))
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
    .single();

  const { error } = await supabase
    .from("question_bank")
    .delete()
    .eq("id", questionId);

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
