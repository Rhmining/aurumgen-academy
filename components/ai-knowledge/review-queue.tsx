"use client";

import { useEffect, useState } from "react";
import { StorageFileActions } from "@/components/data/storage-file-actions";

type ReviewItem = {
  id: number;
  title: string;
  category: string;
  status: string;
  ingestion_status: string;
  extraction_status: string | null;
  extraction_method: string | null;
  extraction_note: string | null;
  storage_path: string | null;
  chunk_count: number | null;
  citation_count: number;
  flags: string[];
  last_ingested_at: string | null;
};

export function ReviewQueue() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [filter, setFilter] = useState<"all" | "parser_failed" | "no_chunks" | "unused_in_answers">("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/ai-knowledge/review", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Gagal memuat review queue.");
      setItems(payload.items ?? []);
      setSelectedIds((current) =>
        current.filter((id) => (payload.items ?? []).some((item: ReviewItem) => item.id === id))
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Gagal memuat review queue.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    return item.flags.includes(filter);
  });
  const visibleIds = filteredItems.map((item) => item.id);
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.includes(id)).length;

  function toggleItemSelection(id: number) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]
    );
  }

  function toggleVisibleSelection() {
    setSelectedIds((current) => {
      const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => current.includes(id));
      if (allVisibleSelected) {
        return current.filter((id) => !visibleIds.includes(id));
      }
      return Array.from(new Set([...current, ...visibleIds]));
    });
  }

  async function handleReingest(item: ReviewItem) {
    setBusyKey(`ingest-${item.id}`);
    setStatus(null);

    try {
      const response = await fetch(`/api/ai-documents/${item.id}/ingest`, {
        method: "POST"
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Ingestion gagal.");

      setStatus(`Ingestion ${item.title} selesai: ${payload.chunkCount ?? 0} chunk dibuat.`);
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Ingestion gagal.");
    } finally {
      setBusyKey(null);
    }
  }

  async function handleMarkReviewed(item: ReviewItem) {
    setBusyKey(`review-${item.id}`);
    setStatus(null);

    try {
      const response = await fetch("/api/ai-knowledge/review", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "mark_reviewed",
          documentId: item.id
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Gagal menandai review.");

      setStatus(`${item.title} ditandai sebagai reviewed.`);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Gagal menandai review.");
    } finally {
      setBusyKey(null);
    }
  }

  async function handleManualFallback(item: ReviewItem) {
    setBusyKey(`fallback-${item.id}`);
    setStatus(null);
    setError(null);

    try {
      const response = await fetch(`/api/ai-documents/${item.id}/extraction`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "mark_manual_fallback"
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Gagal menandai manual fallback.");

      setStatus(`${item.title} ditandai sebagai manual fallback.`);
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Gagal menandai manual fallback.");
    } finally {
      setBusyKey(null);
    }
  }

  async function handleBulkReingest() {
    const targets = filteredItems.filter((item) => selectedIds.includes(item.id));
    if (targets.length === 0) return;

    setBusyKey("bulk-reingest");
    setStatus(null);
    setError(null);

    let successCount = 0;
    const failures: string[] = [];

    for (const item of targets) {
      try {
        const response = await fetch(`/api/ai-documents/${item.id}/ingest`, {
          method: "POST"
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Ingestion gagal.");
        successCount += 1;
      } catch (bulkError) {
        failures.push(`${item.title}: ${bulkError instanceof Error ? bulkError.message : "Ingestion gagal."}`);
      }
    }

    setStatus(
      failures.length > 0
        ? `Bulk re-ingest berhasil untuk ${successCount} dokumen, ${failures.length} gagal.`
        : `Bulk re-ingest berhasil untuk ${successCount} dokumen.`
    );
    await fetch("/api/operations/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "bulk_reingest_review_queue",
        entityType: "ai_document_batch",
        entityId: `review-${Date.now()}`,
        metadata: {
          selected_count: targets.length,
          success_count: successCount,
          failure_count: failures.length
        }
      })
    }).catch(() => undefined);
    setError(failures.length > 0 ? failures.slice(0, 3).join(" | ") : null);
    setSelectedIds([]);
    await load();
    setBusyKey(null);
  }

  async function handleBulkManualFallback() {
    const targets = filteredItems.filter(
      (item) => selectedIds.includes(item.id) && item.extraction_status === "parser_failed"
    );
    if (targets.length === 0) return;

    setBusyKey("bulk-fallback");
    setStatus(null);
    setError(null);

    let successCount = 0;
    const failures: string[] = [];

    for (const item of targets) {
      try {
        const response = await fetch(`/api/ai-documents/${item.id}/extraction`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            action: "mark_manual_fallback"
          })
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Manual fallback gagal.");
        successCount += 1;
      } catch (bulkError) {
        failures.push(`${item.title}: ${bulkError instanceof Error ? bulkError.message : "Manual fallback gagal."}`);
      }
    }

    setStatus(
      failures.length > 0
        ? `Bulk manual fallback berhasil untuk ${successCount} dokumen, ${failures.length} gagal.`
        : `Bulk manual fallback berhasil untuk ${successCount} dokumen.`
    );
    await fetch("/api/operations/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "bulk_manual_fallback_review_queue",
        entityType: "ai_document_batch",
        entityId: `review-${Date.now()}`,
        metadata: {
          selected_count: targets.length,
          success_count: successCount,
          failure_count: failures.length
        }
      })
    }).catch(() => undefined);
    setError(failures.length > 0 ? failures.slice(0, 3).join(" | ") : null);
    setSelectedIds([]);
    await load();
    setBusyKey(null);
  }

  async function handleBulkMarkReviewed() {
    const targets = filteredItems.filter((item) => selectedIds.includes(item.id));
    if (targets.length === 0) return;

    setBusyKey("bulk-review");
    setStatus(null);
    setError(null);

    let successCount = 0;
    const failures: string[] = [];

    for (const item of targets) {
      try {
        const response = await fetch("/api/ai-knowledge/review", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            action: "mark_reviewed",
            documentId: item.id
          })
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Mark reviewed gagal.");
        successCount += 1;
      } catch (bulkError) {
        failures.push(`${item.title}: ${bulkError instanceof Error ? bulkError.message : "Mark reviewed gagal."}`);
      }
    }

    setStatus(
      failures.length > 0
        ? `Bulk mark reviewed berhasil untuk ${successCount} dokumen, ${failures.length} gagal.`
        : `Bulk mark reviewed berhasil untuk ${successCount} dokumen.`
    );
    await fetch("/api/operations/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "bulk_mark_reviewed",
        entityType: "ai_document_batch",
        entityId: `review-${Date.now()}`,
        metadata: {
          selected_count: targets.length,
          success_count: successCount,
          failure_count: failures.length
        }
      })
    }).catch(() => undefined);
    setError(failures.length > 0 ? failures.slice(0, 3).join(" | ") : null);
    setSelectedIds([]);
    await load();
    setBusyKey(null);
  }

  return (
    <section className="space-y-4">
      <div className="surface rounded-[1.75rem] p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: `Semua (${items.length})` },
            { key: "parser_failed", label: `Parser Failed (${items.filter((item) => item.flags.includes("parser_failed")).length})` },
            { key: "no_chunks", label: `No Chunks (${items.filter((item) => item.flags.includes("no_chunks")).length})` },
            { key: "unused_in_answers", label: `Unused (${items.filter((item) => item.flags.includes("unused_in_answers")).length})` }
          ].map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setFilter(option.key as "all" | "parser_failed" | "no_chunks" | "unused_in_answers")}
              className={`rounded-full border px-4 py-2 text-sm ${
                filter === option.key ? "border-ink bg-black/5 dark:bg-white/5" : "border-black/10"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={toggleVisibleSelection}
            className="rounded-full border border-black/10 px-4 py-2 text-sm"
          >
            {selectedVisibleCount === visibleIds.length && visibleIds.length > 0 ? "Unselect Visible" : "Select Visible"}
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedIds([]);
              setStatus(null);
            }}
            disabled={selectedIds.length === 0}
            className="rounded-full border border-black/10 px-4 py-2 text-sm disabled:opacity-60"
          >
            Clear Selection
          </button>
          <button
            type="button"
            onClick={() => void handleBulkReingest()}
            disabled={selectedIds.length === 0 || busyKey === "bulk-reingest"}
            className="rounded-full border border-black/10 px-4 py-2 text-sm disabled:opacity-60"
          >
            {busyKey === "bulk-reingest" ? "Processing..." : `Re-ingest Selected (${selectedIds.length})`}
          </button>
          <button
            type="button"
            onClick={() => void handleBulkManualFallback()}
            disabled={
              selectedIds.filter((id) =>
                filteredItems.some((item) => item.id === id && item.extraction_status === "parser_failed")
              ).length === 0 || busyKey === "bulk-fallback"
            }
            className="rounded-full border border-black/10 px-4 py-2 text-sm disabled:opacity-60"
          >
            {busyKey === "bulk-fallback" ? "Processing..." : "Mark Selected Manual Fallback"}
          </button>
          <button
            type="button"
            onClick={() => void handleBulkMarkReviewed()}
            disabled={selectedIds.length === 0 || busyKey === "bulk-review"}
            className="rounded-full border border-black/10 px-4 py-2 text-sm disabled:opacity-60"
          >
            {busyKey === "bulk-review" ? "Processing..." : "Mark Selected Reviewed"}
          </button>
        </div>
      </div>

      {loading ? (
        <article className="surface rounded-[1.75rem] p-6 text-sm text-[rgb(var(--muted))]">
          Memuat review queue...
        </article>
      ) : filteredItems.length === 0 && items.length > 0 ? (
        <article className="surface rounded-[1.75rem] p-6 text-sm text-[rgb(var(--muted))]">
          Tidak ada dokumen yang cocok dengan filter saat ini.
        </article>
      ) : filteredItems.length === 0 ? (
        <article className="surface rounded-[1.75rem] p-6 text-sm text-[rgb(var(--muted))]">
          Tidak ada dokumen yang perlu direview saat ini.
        </article>
      ) : (
        filteredItems.map((item) => (
          <article key={item.id} className="surface rounded-[1.75rem] p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <label className="mb-3 flex items-center gap-3 text-sm text-[rgb(var(--muted))]">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => toggleItemSelection(item.id)}
                  />
                  Pilih dokumen ini
                </label>
                <h2 className="font-display text-3xl">{item.title}</h2>
                <p className="mt-2 text-sm text-[rgb(var(--muted))]">
                  {item.category} • status {item.status} • ingestion {item.ingestion_status}
                </p>
                <p className="mt-2 text-sm text-[rgb(var(--muted))]">
                  Extraction: {item.extraction_status ?? "manual_content"}
                  {item.extraction_method ? ` • ${item.extraction_method}` : ""}
                </p>
                {item.extraction_note ? (
                  <p className="mt-2 text-sm text-[rgb(var(--muted))]">
                    Note: {item.extraction_note}
                  </p>
                ) : null}
                <p className="mt-2 text-sm text-[rgb(var(--muted))]">
                  Chunks: {item.chunk_count ?? 0} • Citations: {item.citation_count}
                </p>
                <p className="mt-2 text-sm text-[rgb(var(--muted))]">
                  Last ingested: {item.last_ingested_at ? new Date(item.last_ingested_at).toLocaleString() : "belum pernah"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.flags.map((flag) => (
                    <span key={flag} className="rounded-full bg-black/5 px-3 py-1 text-xs dark:bg-white/5">
                      {flag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 md:justify-end">
                <a
                  href={`/ai-knowledge/documents/${item.id}`}
                  className="rounded-full border border-black/10 px-4 py-2 text-sm"
                >
                  Review Dokumen
                </a>
                <a
                  href={`/ai-knowledge/documents/${item.id}${(item.chunk_count ?? 0) > 0 ? "#chunk-0" : ""}`}
                  className="rounded-full border border-black/10 px-4 py-2 text-sm"
                >
                  Open Chunks
                </a>
                <StorageFileActions
                  bucket="ai-documents"
                  path={item.storage_path}
                  previewLabel="Open File"
                  downloadLabel="Download File"
                />
                <button
                  type="button"
                  onClick={() => void handleReingest(item)}
                  disabled={busyKey === `ingest-${item.id}`}
                  className="rounded-full border border-black/10 px-4 py-2 text-sm disabled:opacity-60"
                >
                  {busyKey === `ingest-${item.id}` ? "Processing..." : "Re-ingest"}
                </button>
                {item.extraction_status === "parser_failed" ? (
                  <button
                    type="button"
                    onClick={() => void handleManualFallback(item)}
                    disabled={busyKey === `fallback-${item.id}`}
                    className="rounded-full border border-black/10 px-4 py-2 text-sm disabled:opacity-60"
                  >
                    {busyKey === `fallback-${item.id}` ? "Saving..." : "Mark Manual Fallback"}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => void handleMarkReviewed(item)}
                  disabled={busyKey === `review-${item.id}`}
                  className="rounded-full border border-black/10 px-4 py-2 text-sm disabled:opacity-60"
                >
                  {busyKey === `review-${item.id}` ? "Saving..." : "Mark Reviewed"}
                </button>
              </div>
            </div>
          </article>
        ))
      )}
      {error ? <p className="text-sm text-coral">{error}</p> : null}
      {status ? <p className="text-sm text-[rgb(var(--muted))]">{status}</p> : null}
    </section>
  );
}
