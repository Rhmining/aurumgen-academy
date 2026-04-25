import { NextResponse } from "next/server";
import { requireSupabaseUser, normalizeArrayInput } from "@/lib/api/route-helpers";
import { logOperationalEvent } from "@/lib/audit/log-operational-event";

function normalizeDifficulty(value: unknown) {
  const normalized = String(value ?? "medium").trim().toLowerCase();

  if (normalized === "easy" || normalized === "hard") {
    return normalized;
  }

  return "medium";
}

export async function GET() {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase, user } = session;
  const { data, error } = await supabase
    .from("question_bank")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: Request) {
  const session = await requireSupabaseUser();
  if ("error" in session) return session.error;

  const { supabase, user } = session;
  const body = await request.json();

  const payload = {
    subject: String(body.subject ?? "General"),
    pathway: String(body.pathway ?? "IGCSE"),
    difficulty: normalizeDifficulty(body.difficulty),
    exam_board: String(body.exam_board ?? "IGCSE"),
    prompt: String(body.prompt ?? ""),
    answer_key: String(body.answer_key ?? ""),
    tags: normalizeArrayInput(body.tags),
    owner_id: user.id
  };

  const { data, error } = await supabase
    .from("question_bank")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logOperationalEvent(supabase, {
    actorId: user.id,
    action: "create_question_bank_item",
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

  return NextResponse.json({ item: data }, { status: 201 });
}
