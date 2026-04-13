export function buildSessionTitle(input: string) {
  const normalized = input.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "Percakapan Baru";
  }

  return normalized.length > 60 ? `${normalized.slice(0, 60)}...` : normalized;
}
