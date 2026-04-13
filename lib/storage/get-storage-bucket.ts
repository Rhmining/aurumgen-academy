export function getStorageBucketFromPurpose(purpose: string) {
  return purpose === "ai_documents" ? "ai-documents" : "materials";
}

export function getStorageBucketFromPathname(pathname: string) {
  if (pathname.includes("ai-documents")) return "ai-documents";
  return "materials";
}
