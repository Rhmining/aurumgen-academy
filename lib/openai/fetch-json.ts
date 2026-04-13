type FetchOpenAiOptions = {
  path: string;
  body: Record<string, unknown>;
  timeoutMs?: number;
  retries?: number;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchOpenAiJson({
  path,
  body,
  timeoutMs = 30000,
  retries = 1
}: FetchOpenAiOptions) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY belum diatur.");
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`https://api.openai.com/v1${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = payload?.error?.message ?? "OpenAI API mengembalikan error.";
        const retryable = response.status === 429 || response.status >= 500;
        if (retryable && attempt < retries) {
          await sleep(400 * (attempt + 1));
          continue;
        }
        throw new Error(message);
      }

      return payload;
    } catch (error) {
      lastError =
        error instanceof Error
          ? error.name === "AbortError"
            ? new Error("Permintaan ke OpenAI timeout.")
            : error
          : new Error("Permintaan ke OpenAI gagal.");

      if (attempt < retries) {
        await sleep(400 * (attempt + 1));
        continue;
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError ?? new Error("Permintaan ke OpenAI gagal.");
}
