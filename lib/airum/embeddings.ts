import { fetchOpenAiJson } from "@/lib/openai/fetch-json";

const embeddingModel = process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";

export async function createEmbedding(input: string) {
  const payload = await fetchOpenAiJson({
    path: "/embeddings",
    body: {
      model: embeddingModel,
      input
    },
    timeoutMs: 30000,
    retries: 1
  });

  const vector = payload?.data?.[0]?.embedding;
  if (!Array.isArray(vector)) {
    throw new Error("Embedding tidak tersedia.");
  }

  return vector as number[];
}

export function toPgVector(vector: number[]) {
  return `[${vector.join(",")}]`;
}
