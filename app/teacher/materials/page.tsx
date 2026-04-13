"use client";

import { TeacherShell } from "@/components/teacher/teacher-shell";
import { ResourceManager } from "@/components/data/resource-manager";
import { StorageUploadPanel } from "@/components/data/storage-upload-panel";
import { StorageFileActions } from "@/components/data/storage-file-actions";
import type { MaterialRecord } from "@/lib/db/types";

export default function TeacherMaterialsPage() {
  return (
    <TeacherShell title="Teacher Materials" description="Upload, kategorikan, dan publikasikan materi ke portal siswa.">
      <ResourceManager<MaterialRecord>
        endpoint="/api/materials"
        title="Material pipeline"
        description="CRUD awal untuk materials sudah aktif via Supabase route handler."
        emptyState="Belum ada materi. Tambahkan item pertama dari panel kiri."
        initialForm={{
          visibility: "private",
          storage_path: "",
          file_name: "",
          mime_type: "",
          file_size: ""
        }}
        fields={[
          { name: "title", label: "Judul materi", placeholder: "IGCSE Biology Chapter 3" },
          { name: "subject", label: "Subject", placeholder: "Biology" },
          { name: "pathway", label: "Pathway", placeholder: "IGCSE" },
          { name: "visibility", label: "Visibility", placeholder: "private / portal / published" },
          { name: "description", label: "Deskripsi", type: "textarea", placeholder: "Ringkasan isi materi" }
        ]}
        renderFormExtras={({ form, setField }) => (
          <>
            <StorageUploadPanel
              purpose="materials"
              onUploaded={(result) => {
                setField("storage_path", result.storagePath);
                setField("file_name", result.fileName);
                setField("mime_type", result.mimeType);
                setField("file_size", String(result.fileSize));
              }}
            />
            {form.storage_path ? (
              <div className="rounded-2xl bg-black/5 px-4 py-3 text-sm dark:bg-white/5">
                File tersimpan: <span className="font-medium">{form.file_name || form.storage_path}</span>
              </div>
            ) : null}
          </>
        )}
        renderSummary={(item) => ({
          title: `${item.title} • ${item.subject}`,
          detail: `${item.pathway} • ${item.visibility}${item.file_name ? ` • File: ${item.file_name}` : ""}${item.description ? ` • ${item.description}` : ""}`
        })}
        renderItemActions={({ item }) => (
          <StorageFileActions bucket="materials" path={item.storage_path} />
        )}
      />
    </TeacherShell>
  );
}
