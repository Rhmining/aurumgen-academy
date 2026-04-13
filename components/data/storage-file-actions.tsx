"use client";

import { useState } from "react";

type StorageFileActionsProps = {
  bucket: string;
  path: string | null | undefined;
  previewLabel?: string;
  downloadLabel?: string;
};

export function StorageFileActions({
  bucket,
  path,
  previewLabel = "Preview",
  downloadLabel = "Download"
}: StorageFileActionsProps) {
  const [status, setStatus] = useState<string | null>(null);

  if (!path) return null;
  const safePath = path ?? "";

  async function openLink(download: boolean) {
    setStatus(null);
    try {
      const response = await fetch(
        `/api/storage-link?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(safePath)}&download=${download ? "1" : "0"}`
      );
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Gagal membuat signed URL.");
      }

      window.open(payload.signedUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Aksi file gagal.");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void openLink(false)}
        className="rounded-full border border-black/10 px-4 py-2 text-sm"
      >
        {previewLabel}
      </button>
      <button
        type="button"
        onClick={() => void openLink(true)}
        className="rounded-full border border-black/10 px-4 py-2 text-sm"
      >
        {downloadLabel}
      </button>
      {status ? <p className="w-full text-xs text-coral">{status}</p> : null}
    </>
  );
}
