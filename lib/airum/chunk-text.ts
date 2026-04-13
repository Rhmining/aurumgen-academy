export type TextChunk = {
  chunk_index: number;
  content: string;
  token_estimate: number;
};

export function estimateTokens(text: string) {
  return Math.ceil(text.length / 4);
}

export function chunkText(source: string, maxChars = 1200): TextChunk[] {
  const normalized = source.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const blocks = normalized
    .split(/\n\s*\n/g)
    .map((part) => part.trim())
    .filter(Boolean);

  const chunks: TextChunk[] = [];
  let current = "";

  function pushCurrent() {
    const trimmed = current.trim();
    if (!trimmed) return;
    chunks.push({
      chunk_index: chunks.length,
      content: trimmed,
      token_estimate: estimateTokens(trimmed)
    });
    current = "";
  }

  for (const block of blocks) {
    if ((current + "\n\n" + block).trim().length > maxChars) {
      pushCurrent();
    }

    if (block.length > maxChars) {
      for (let start = 0; start < block.length; start += maxChars) {
        const slice = block.slice(start, start + maxChars).trim();
        if (slice) {
          chunks.push({
            chunk_index: chunks.length,
            content: slice,
            token_estimate: estimateTokens(slice)
          });
        }
      }
      current = "";
      continue;
    }

    current = current ? `${current}\n\n${block}` : block;
  }

  pushCurrent();
  return chunks;
}
