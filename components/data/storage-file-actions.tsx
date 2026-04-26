"use client";

import { useState } from "react";
import { readJsonResponse } from "@/lib/api/read-json-response";

type StorageFileActionsProps = {
  bucket: string;
  path: string | null | undefined;
  fileName?: string | null | undefined;
  mimeType?: string | null | undefined;
  previewLabel?: string;
  downloadLabel?: string;
};

const officeExtensions = new Set([
  "doc",
  "docx",
  "ppt",
  "pptx",
  "xls",
  "xlsx"
]);

export function StorageFileActions({
  bucket,
  path,
  fileName,
  mimeType,
  previewLabel = "Preview",
  downloadLabel = "Download"
}: StorageFileActionsProps) {
  const [status, setStatus] = useState<string | null>(null);

  if (!path) return null;
  const safePath = path ?? "";

  function resolveExtension() {
    const source = fileName || safePath;
    const parts = source.split(".");
    return parts.length > 1 ? parts.at(-1)?.toLowerCase() ?? "" : "";
  }

  function buildPreviewTarget(signedUrl: string) {
    const extension = resolveExtension();
    const normalizedMime = String(mimeType ?? "").toLowerCase();

    if (officeExtensions.has(extension)) {
      return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(signedUrl)}`;
    }

    if (
      extension === "pdf" ||
      extension === "txt" ||
      extension === "md" ||
      extension === "html" ||
      extension === "json" ||
      normalizedMime.startsWith("image/") ||
      normalizedMime.startsWith("text/")
    ) {
      return signedUrl;
    }

    return signedUrl;
  }

  async function openLink(download: boolean) {
    setStatus(null);
    try {
      const response = await fetch(
        `/api/storage-link?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(safePath)}&download=${download ? "1" : "0"}`
      );
      const payload = await readJsonResponse(response);
      const signedUrl = String(payload.signedUrl ?? "");

      if (!signedUrl) {
        throw new Error("Signed URL tidak tersedia.");
      }

      const targetUrl = download ? signedUrl : buildPreviewTarget(signedUrl);
      window.open(targetUrl, "_blank", "noopener,noreferrer");
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
