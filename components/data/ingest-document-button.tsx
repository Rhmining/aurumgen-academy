"use client";

import { useState } from "react";
import { readJsonResponse } from "@/lib/api/read-json-response";

export function IngestDocumentButton({
  documentId,
  onDone
}: {
  documentId: number;
  onDone: (message: string) => Promise<void> | void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick() {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/ai-documents/${documentId}/ingest`, {
        method: "POST"
      });
      const payload = await readJsonResponse(response);

      await onDone(`Ingestion selesai: ${payload.chunkCount} chunk dibuat.`);
    } catch (error) {
      await onDone(error instanceof Error ? error.message : "Ingestion gagal.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={isSubmitting}
      className="rounded-full border border-black/10 px-4 py-2 text-sm disabled:opacity-60"
    >
      {isSubmitting ? "Processing..." : "Ingest"}
    </button>
  );
}
