import { fetchOpenAiJson } from "@/lib/openai/fetch-json";
import { extractOpenAiOutputText } from "@/lib/openai/extract-output-text";

type Source = {
  title?: string;
  category?: string;
  retrievalMethod?: string;
  snippet?: string;
  similarity?: number;
};

type EvaluationResult = {
  retrievalScore: number;
  answerScore: number;
  avgSimilarity: number | null;
  sourceCount: number;
  flags: string[];
  evaluatorMode: "heuristic" | "llm";
  evaluatorModel: string | null;
  notes: string | null;
};

function clampScore(value: unknown) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(1, numeric));
}

function tryParseJsonObject(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function evaluateAirumResponseHeuristic(answer: string, sources: Source[]): EvaluationResult {
  const answerLength = answer.trim().length;
  const sourceCount = sources.length;
  const avgSimilarity = sourceCount
    ? sources.reduce((sum, source) => sum + Number(source.similarity ?? 0), 0) / sourceCount
    : 0;

  const retrievalScore = Math.max(0, Math.min(1, avgSimilarity * 0.7 + Math.min(sourceCount, 4) * 0.075));
  const answerScore = Math.max(0, Math.min(1, (answerLength >= 240 ? 0.5 : answerLength / 480) + retrievalScore * 0.5));

  const flags: string[] = [];
  if (sourceCount === 0) flags.push("no_sources");
  if (avgSimilarity < 0.45) flags.push("low_similarity");
  if (answerLength < 120) flags.push("short_answer");

  return {
    retrievalScore,
    answerScore,
    avgSimilarity: sourceCount ? avgSimilarity : null,
    sourceCount,
    flags,
    evaluatorMode: "heuristic",
    evaluatorModel: null,
    notes: "Fallback heuristic evaluation."
  };
}

export async function evaluateAirumResponse(
  question: string,
  answer: string,
  sources: Source[]
): Promise<EvaluationResult> {
  const heuristic = evaluateAirumResponseHeuristic(answer, sources);

  if (!process.env.OPENAI_API_KEY) {
    return heuristic;
  }

  const evaluatorModel =
    process.env.OPENAI_EVALUATOR_MODEL ??
    process.env.OPENAI_RESPONSES_MODEL ??
    "gpt-5-mini";

  const sourceSummary = sources.length
    ? sources
        .map((source, index) =>
          [
            `Source ${index + 1}`,
            source.title ? `title=${source.title}` : null,
            source.category ? `category=${source.category}` : null,
            source.retrievalMethod ? `method=${source.retrievalMethod}` : null,
            typeof source.similarity === "number" ? `similarity=${source.similarity.toFixed(3)}` : null,
            source.snippet ? `snippet=${source.snippet}` : null
          ]
            .filter(Boolean)
            .join(" | ")
        )
        .join("\n")
    : "No retrieval sources.";

  try {
    const payload = await fetchOpenAiJson({
      path: "/responses",
      body: {
        model: evaluatorModel,
        instructions:
          "You are grading an educational assistant response for retrieval quality and answer quality. Return JSON only with keys retrievalScore, answerScore, flags, notes. Scores must be numbers from 0 to 1. flags must be an array of short snake_case strings. notes must be a short sentence.",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `Question:\n${question || "(empty)"}\n\nAssistant answer:\n${answer || "(empty)"}\n\nRetrieved sources:\n${sourceSummary}\n\nScoring guide:\n- retrievalScore judges whether the retrieved sources are relevant and sufficient for the answer.\n- answerScore judges factual grounding, usefulness, and completeness.\n- Use flags like no_sources, low_similarity, weak_grounding, incomplete_answer, possible_hallucination, concise_but_ok when appropriate.\nReturn JSON only.`
              }
            ]
          }
        ]
      },
      timeoutMs: 30000,
      retries: 1
    });

    const parsed = tryParseJsonObject(extractOpenAiOutputText(payload));
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Output evaluator tidak bisa diparse.");
    }

    const flags = Array.isArray((parsed as { flags?: unknown[] }).flags)
      ? (parsed as { flags?: unknown[] }).flags!.map(String).filter(Boolean)
      : heuristic.flags;

    return {
      retrievalScore: clampScore((parsed as { retrievalScore?: unknown }).retrievalScore),
      answerScore: clampScore((parsed as { answerScore?: unknown }).answerScore),
      avgSimilarity: heuristic.avgSimilarity,
      sourceCount: heuristic.sourceCount,
      flags,
      evaluatorMode: "llm",
      evaluatorModel,
      notes:
        typeof (parsed as { notes?: unknown }).notes === "string"
          ? (parsed as { notes?: string }).notes ?? null
          : null
    };
  } catch {
    return {
      ...heuristic,
      flags: Array.from(new Set([...heuristic.flags, "judge_fallback"])),
      notes: "LLM evaluation unavailable, fallback heuristic used."
    };
  }
}
