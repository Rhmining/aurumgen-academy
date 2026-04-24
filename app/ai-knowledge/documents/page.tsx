"use client";

import { AiKnowledgeShell } from "@/components/ai-knowledge/ai-knowledge-shell";
import { ResourceManager } from "@/components/data/resource-manager";
import { StorageUploadPanel } from "@/components/data/storage-upload-panel";
import { StorageFileActions } from "@/components/data/storage-file-actions";
import { IngestDocumentButton } from "@/components/data/ingest-document-button";
import { DocumentDetailLink } from "@/components/data/document-detail-link";
import type { AiDocumentRecord } from "@/lib/db/types";

function inferTitleFromFileName(fileName: string) {
  return fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function AiKnowledgeDocumentsPage() {
  return (
    <AiKnowledgeShell title="Documents" description="Kelola dokumen sumber, kategori, dan status kesiapan retrieval.">
      <ResourceManager<AiDocumentRecord>
        endpoint="/api/ai-documents"
        title="Knowledge documents"
        description="CRUD awal untuk dokumen AI aktif dengan status pipeline dan konten teks."
        emptyState="Belum ada dokumen AI. Tambahkan dokumen pertama dari panel kiri."
        initialForm={{
          source_type: "manual",
          status: "draft",
          storage_path: "",
          file_name: "",
          mime_type: "",
          file_size: "",
          extraction_status: "manual_content",
          extraction_method: "manual",
          extraction_note: ""
        }}
        fields={[
          { name: "title", label: "Judul dokumen", placeholder: "IGCSE Biology Core Notes" },
          { name: "category", label: "Kategori", placeholder: "knowledge" },
          { name: "source_type", label: "Source type", placeholder: "manual / upload / sync" },
          { name: "status", label: "Status", placeholder: "draft / queued / processed / published" },
          { name: "content", label: "Konten", type: "textarea", placeholder: "Masukkan isi dokumen atau ringkasannya" }
        ]}
        renderFormExtras={({ form, setField }) => (
          <>
            <StorageUploadPanel
              purpose="ai_documents"
              onUploaded={(result) => {
                setField("storage_path", result.storagePath);
                setField("file_name", result.fileName);
                setField("mime_type", result.mimeType);
                setField("file_size", String(result.fileSize));
                setField("category", "knowledge");
                setField("source_type", "upload");
                if (!form.title?.trim()) {
                  setField("title", inferTitleFromFileName(result.fileName));
                }
                if (result.extractedText) {
                  setField("content", result.extractedText);
                  setField("ingestion_status", "queued");
                  setField("status", "queued");
                }
                if (result.extractionStatus) {
                  setField("extraction_status", result.extractionStatus);
                }
                if (result.extractionMethod) {
                  setField("extraction_method", result.extractionMethod);
                }
                setField("extraction_note", result.extractionNote ?? "");
                if (!result.extractedText) {
                  setField("ingestion_status", "idle");
                  setField("status", "draft");
                }
              }}
            />
            {form.storage_path ? (
              <div className="rounded-2xl bg-black/5 px-4 py-3 text-sm dark:bg-white/5">
                File sumber: <span className="font-medium">{form.file_name || form.storage_path}</span>
              </div>
            ) : null}
          </>
        )}
        renderSummary={(item) => ({
          title: `${item.title} • ${item.status}`,
          detail: `${item.category} • ${item.source_type}${item.file_name ? ` • File: ${item.file_name}` : ""} • Extraction: ${item.extraction_status ?? "manual_content"}${item.extraction_method ? `/${item.extraction_method}` : ""} • Chunks: ${item.chunk_count ?? 0} • ${item.content.slice(0, 110)}`
        })}
        renderItemActions={({ item, refresh, setStatus }) => (
          <>
            <DocumentDetailLink documentId={item.id} />
            <StorageFileActions bucket="ai-documents" path={item.storage_path} />
            <IngestDocumentButton
              documentId={item.id}
              onDone={async (message) => {
                setStatus(message);
                await refresh();
              }}
            />
          </>
        )}
      />
    </AiKnowledgeShell>
  );
}
