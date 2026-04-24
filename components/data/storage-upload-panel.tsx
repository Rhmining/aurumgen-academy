"use client";

import { ChangeEvent, useState } from "react";

type StorageUploadPanelProps = {
  purpose: "materials" | "ai_documents";
  onUploaded: (result: {
    storagePath: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    extractedText?: string | null;
    extractionSupported?: boolean;
    extractionStatus?: "parser_succeeded" | "parser_failed" | "manual_content";
    extractionMethod?: string | null;
    extractionNote?: string | null;
  }) => void;
};

export function StorageUploadPanel({
  purpose,
  onUploaded
}: StorageUploadPanelProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatus(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("purpose", purpose);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      const responseText = await response.text();
      let payload: Record<string, unknown> | null = null;

      try {
        payload = responseText ? JSON.parse(responseText) : null;
      } catch {
        payload = null;
      }

      if (!response.ok) {
        if (payload?.error && typeof payload.error === "string") {
          throw new Error(payload.error);
        }

        if (responseText.includes("<!DOCTYPE")) {
          throw new Error("Server mengembalikan halaman error HTML. Coba refresh lalu upload ulang.");
        }

        throw new Error("Upload gagal.");
      }

      if (!payload) {
        throw new Error("Respons upload tidak valid.");
      }

      onUploaded({
        storagePath: String(payload.storagePath ?? ""),
        fileName: String(payload.fileName ?? file.name),
        mimeType: String(payload.mimeType ?? (file.type || "application/octet-stream")),
        fileSize: Number(payload.fileSize ?? file.size),
        extractedText: typeof payload.extractedText === "string" ? payload.extractedText : null,
        extractionSupported: Boolean(payload.extractionSupported),
        extractionStatus:
          payload.extractionStatus === "parser_succeeded" ||
          payload.extractionStatus === "parser_failed" ||
          payload.extractionStatus === "manual_content"
            ? payload.extractionStatus
            : undefined,
        extractionMethod: typeof payload.extractionMethod === "string" ? payload.extractionMethod : null,
        extractionNote: typeof payload.extractionNote === "string" ? payload.extractionNote : null
      });
      setStatus(
        payload.extractionNote
          ? `File ${payload.fileName} berhasil diunggah. ${payload.extractionNote}`
          : payload.extractionSupported
            ? `File ${payload.fileName} berhasil diunggah dan teks berhasil diekstrak${payload.extractionMethod ? ` via ${payload.extractionMethod}` : ""}.`
            : `File ${payload.fileName} berhasil diunggah.`
      );
      event.target.value = "";
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload gagal.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-black/15 p-4">
      <label className="block">
        <span className="mb-2 block text-sm font-medium">Upload file ke Storage</span>
        <input
          type="file"
          onChange={handleFileChange}
          disabled={isUploading}
          className="block w-full text-sm"
        />
      </label>
      <p className="mt-2 text-xs text-[rgb(var(--muted))]">
        File akan diunggah ke bucket Supabase sesuai jenis data dan user aktif. Ekstraksi teks otomatis saat ini mendukung text, md, txt, json, csv, tsv, html, xml, docx, dan pdf teks biasa.
      </p>
      {status ? <p className="mt-3 text-sm text-coral">{status}</p> : null}
    </div>
  );
}
