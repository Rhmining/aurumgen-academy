export function buildContext(section: string, extras?: Record<string, unknown>) {
  return {
    section,
    timestamp: new Date().toISOString(),
    focus: "AURUMGEN Academy dashboard context",
    ...extras
  };
}
