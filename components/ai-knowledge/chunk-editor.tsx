"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ChunkItem = {
  id: number;
  chunk_index: number;
  content: string;
  token_estimate: number;
};

export function ChunkEditor({
  documentId,
  initialChunks
}: {
  documentId: number;
  initialChunks: ChunkItem[];
}) {
  const router = useRouter();
  const [chunks, setChunks] = useState<ChunkItem[]>(initialChunks);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setChunks(initialChunks);
    setDrafts({});
  }, [initialChunks]);

  function getDraft(chunk: ChunkItem) {
    return drafts[chunk.id] ?? chunk.content;
  }

  async function saveChunk(chunk: ChunkItem) {
    setBusyKey(`save-${chunk.id}`);
    setError(null);
    setStatus(null);

    try {
      const response = await fetch(`/api/ai-documents/${documentId}/chunks/${chunk.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: getDraft(chunk)
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Gagal menyimpan chunk.");
      }

      setChunks((current) =>
        current.map((entry) => (entry.id === chunk.id ? { ...entry, ...payload.item } : entry))
      );
      setDrafts((current) => {
        const next = { ...current };
        delete next[chunk.id];
        return next;
      });
      setStatus(`Chunk #${chunk.chunk_index} berhasil diperbarui dan konten dokumen disinkronkan.`);
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Gagal menyimpan chunk.");
    } finally {
      setBusyKey(null);
    }
  }

  async function refreshEmbeddings() {
    setBusyKey("refresh-embeddings");
    setError(null);
    setStatus(null);

    try {
      const response = await fetch(`/api/ai-documents/${documentId}/embeddings`, {
        method: "POST"
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Refresh embedding gagal.");
      }

      const failureCount = Array.isArray(payload.failures) ? payload.failures.length : 0;
      setStatus(
        failureCount > 0
          ? `Embedding direfresh untuk ${payload.refreshedCount ?? 0} chunk, dengan ${failureCount} kegagalan.`
          : `Embedding berhasil direfresh untuk ${payload.refreshedCount ?? 0} chunk.`
      );
      router.refresh();
    } catch (refreshError) {
      setError(
        refreshError instanceof Error ? refreshError.message : "Refresh embedding gagal."
      );
    } finally {
      setBusyKey(null);
    }
  }

  if (chunks.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="surface rounded-[2rem] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-display text-3xl">Manual Chunk Editor</h3>
            <p className="mt-2 text-sm text-[rgb(var(--muted))]">
              Edit chunk satu per satu lalu simpan. Konten dokumen akan otomatis disusun ulang dari urutan chunk.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refreshEmbeddings()}
            disabled={busyKey === "refresh-embeddings"}
            className="rounded-full border border-black/10 px-4 py-2 text-sm disabled:opacity-60"
          >
            {busyKey === "refresh-embeddings" ? "Processing..." : "Refresh All Embeddings"}
          </button>
        </div>
      </div>

      {chunks.map((chunk) => {
        const draft = getDraft(chunk);
        const isDirty = draft !== chunk.content;

        return (
          <article key={chunk.id} id={`chunk-${chunk.chunk_index}`} className="surface rounded-[2rem] p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="font-semibold">Chunk #{chunk.chunk_index}</h3>
                <p className="mt-2 text-sm text-[rgb(var(--muted))]">
                  Est. token {chunk.token_estimate}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setDrafts((current) => {
                      const next = { ...current };
                      delete next[chunk.id];
                      return next;
                    })
                  }
                  disabled={!isDirty || busyKey === `save-${chunk.id}`}
                  className="rounded-full border border-black/10 px-4 py-2 text-sm disabled:opacity-60"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => void saveChunk(chunk)}
                  disabled={!isDirty || busyKey === `save-${chunk.id}`}
                  className="rounded-full border border-black/10 px-4 py-2 text-sm disabled:opacity-60"
                >
                  {busyKey === `save-${chunk.id}` ? "Saving..." : "Save Chunk"}
                </button>
              </div>
            </div>
            <textarea
              value={draft}
              onChange={(event) =>
                setDrafts((current) => ({
                  ...current,
                  [chunk.id]: event.target.value
                }))
              }
              className="mt-4 min-h-[220px] w-full rounded-3xl border border-black/10 bg-black/5 p-4 text-sm outline-none transition focus:border-black/20 dark:bg-white/5"
            />
          </article>
        );
      })}

      {error ? <p className="text-sm text-coral">{error}</p> : null}
      {status ? <p className="text-sm text-[rgb(var(--muted))]">{status}</p> : null}
    </section>
  );
}
