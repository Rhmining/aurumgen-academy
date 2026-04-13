"use client";

import { useEffect, useState } from "react";
import { StorageFileActions } from "@/components/data/storage-file-actions";

type IngestionSummary = {
  total: number;
  readyForIngestion: number;
  processing: number;
  failed: number;
  processed: number;
  reviewed: number;
  parserFailed: number;
  parserSucceeded: number;
  manualContent: number;
};

type IngestionItem = {
  id: number;
  title: string;
  category: string;
  status: string;
  ingestion_status: string;
  extraction_status: string;
  extraction_method: string | null;
  extraction_note: string | null;
  storage_path: string | null;
  chunk_count: number;
  reviewed_at: string | null;
  last_ingested_at: string | null;
};

export function IngestionDashboard() {
  const [summary, setSummary] = useState<IngestionSummary | null>(null);
  const [queue, setQueue] = useState<IngestionItem[]>([]);
  const [recent, setRecent] = useState<IngestionItem[]>([]);
  const [filter, setFilter] = useState<"all" | "parser_failed" | "manual_content" | "pending_ingestion">("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/ingestion", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Gagal memuat ingestion queue.");
      setSummary(payload.summary ?? null);
      setQueue(payload.queue ?? []);
      setRecent(payload.recent ?? []);
      setSelectedIds((current) =>
        current.filter((id) => (payload.queue ?? []).some((item: IngestionItem) => item.id === id))
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Gagal memuat ingestion queue.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function triggerDocument(documentId: number) {
    setBusyKey(`doc-${documentId}`);
    setStatus(null);
    setError(null);
    try {
      const response = await fetch("/api/ingestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ingest_document", documentId })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Ingestion gagal.");
      setStatus(`Ingestion selesai untuk dokumen #${documentId}: ${payload.chunkCount ?? 0} chunk dibuat.`);
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Ingestion gagal.");
    } finally {
      setBusyKey(null);
    }
  }

  async function triggerPending() {
    setBusyKey("pending");
    setStatus(null);
    setError(null);
    try {
      const response = await fetch("/api/ingestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ingest_pending" })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Batch ingestion gagal.");
      const failureCount = Array.isArray(payload.failures) ? payload.failures.length : 0;
      setStatus(
        failureCount > 0
          ? `Batch ingestion memproses ${payload.processedCount ?? 0} dokumen dengan ${failureCount} kegagalan.`
          : `Batch ingestion berhasil memproses ${payload.processedCount ?? 0} dokumen.`
      );
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Batch ingestion gagal.");
    } finally {
      setBusyKey(null);
    }
  }

  async function markManualFallback(documentId: number) {
    setBusyKey(`fallback-${documentId}`);
    setStatus(null);
    setError(null);

    try {
      const response = await fetch(`/api/ai-documents/${documentId}/extraction`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_manual_fallback" })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Gagal menandai manual fallback.");
      setStatus(`Dokumen #${documentId} ditandai sebagai manual fallback.`);
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Gagal menandai manual fallback.");
    } finally {
      setBusyKey(null);
    }
  }

  async function bulkReingest() {
    const targets = filteredQueue.filter((item) => selectedIds.includes(item.id));
    if (targets.length === 0) return;

    setBusyKey("bulk-reingest");
    setStatus(null);
    setError(null);

    let successCount = 0;
    const failures: string[] = [];

    for (const item of targets) {
      try {
        const response = await fetch("/api/ingestion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "ingest_document", documentId: item.id })
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
        action: "bulk_reingest_ingestion_queue",
        entityType: "ai_document_batch",
        entityId: `ingestion-${Date.now()}`,
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

  async function bulkManualFallback() {
    const targets = filteredQueue.filter(
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "mark_manual_fallback" })
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
        action: "bulk_manual_fallback_ingestion_queue",
        entityType: "ai_document_batch",
        entityId: `ingestion-${Date.now()}`,
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

  const cards = [
    { label: "Total docs", value: summary?.total ?? 0 },
    { label: "Ready", value: summary?.readyForIngestion ?? 0 },
    { label: "Processing", value: summary?.processing ?? 0 },
    { label: "Failed", value: summary?.failed ?? 0 },
    { label: "Processed", value: summary?.processed ?? 0 },
    { label: "Reviewed", value: summary?.reviewed ?? 0 },
    { label: "Parser failed", value: summary?.parserFailed ?? 0 },
    { label: "Manual content", value: summary?.manualContent ?? 0 }
  ];

  const filteredQueue = queue.filter((item) => {
    if (filter === "all") return true;
    if (filter === "parser_failed") return item.extraction_status === "parser_failed";
    if (filter === "manual_content") return item.extraction_status === "manual_content";
    return item.ingestion_status === "failed" || item.ingestion_status === "queued" || item.chunk_count === 0;
  });
  const visibleIds = filteredQueue.map((item) => item.id);
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

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-8">
        {cards.map((card) => (
          <article key={card.label} className="surface rounded-[1.75rem] p-6">
            <p className="text-sm text-[rgb(var(--muted))]">{card.label}</p>
            <p className="mt-4 font-display text-4xl">{card.value}</p>
          </article>
        ))}
      </div>

      <section className="surface rounded-[2rem] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-3xl">Queue Actions</h2>
            <p className="mt-2 text-sm text-[rgb(var(--muted))]">
              Jalankan ingestion per dokumen atau proses semua item yang masih pending/failed.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void triggerPending()}
            disabled={busyKey === "pending"}
            className="rounded-full border border-black/10 px-4 py-2 text-sm disabled:opacity-60"
          >
            {busyKey === "pending" ? "Processing..." : "Ingest Pending Docs"}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { key: "all", label: `Semua (${queue.length})` },
            { key: "parser_failed", label: `Parser Failed (${queue.filter((item) => item.extraction_status === "parser_failed").length})` },
            { key: "manual_content", label: `Manual Content (${queue.filter((item) => item.extraction_status === "manual_content").length})` },
            { key: "pending_ingestion", label: `Pending Ingestion (${queue.filter((item) => item.ingestion_status === "failed" || item.ingestion_status === "queued" || item.chunk_count === 0).length})` }
          ].map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setFilter(option.key as "all" | "parser_failed" | "manual_content" | "pending_ingestion")}
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
            onClick={() => void bulkReingest()}
            disabled={selectedIds.length === 0 || busyKey === "bulk-reingest"}
            className="rounded-full border border-black/10 px-4 py-2 text-sm disabled:opacity-60"
          >
            {busyKey === "bulk-reingest" ? "Processing..." : `Re-ingest Selected (${selectedIds.length})`}
          </button>
          <button
            type="button"
            onClick={() => void bulkManualFallback()}
            disabled={
              selectedIds.filter((id) =>
                filteredQueue.some((item) => item.id === id && item.extraction_status === "parser_failed")
              ).length === 0 || busyKey === "bulk-fallback"
            }
            className="rounded-full border border-black/10 px-4 py-2 text-sm disabled:opacity-60"
          >
            {busyKey === "bulk-fallback" ? "Processing..." : "Mark Selected Manual Fallback"}
          </button>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="surface rounded-[2rem] p-6">
          <h2 className="font-display text-3xl">Needs Attention</h2>
          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="rounded-2xl bg-black/5 px-4 py-3 text-sm text-[rgb(var(--muted))] dark:bg-white/5">
                Memuat ingestion queue...
              </div>
            ) : filteredQueue.length === 0 && queue.length > 0 ? (
              <div className="rounded-2xl bg-black/5 px-4 py-3 text-sm text-[rgb(var(--muted))] dark:bg-white/5">
                Tidak ada dokumen yang cocok dengan filter saat ini.
              </div>
            ) : filteredQueue.length === 0 ? (
              <div className="rounded-2xl bg-black/5 px-4 py-3 text-sm text-[rgb(var(--muted))] dark:bg-white/5">
                Tidak ada dokumen yang butuh tindakan ingestion saat ini.
              </div>
            ) : (
              filteredQueue.map((item) => (
                <div key={item.id} className="rounded-2xl bg-black/5 px-4 py-4 text-sm dark:bg-white/5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <label className="mb-2 flex items-center gap-3 text-xs text-[rgb(var(--muted))]">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                        />
                        Pilih dokumen ini
                      </label>
                      <div className="font-medium">{item.title}</div>
                      <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                        {item.category} • status {item.status} • ingestion {item.ingestion_status} • chunks {item.chunk_count}
                      </div>
                      <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                        Extraction: {item.extraction_status}{item.extraction_method ? ` • ${item.extraction_method}` : ""}
                      </div>
                      {item.extraction_note ? (
                        <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                          Note: {item.extraction_note}
                        </div>
                      ) : null}
                      <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                        Last ingested: {item.last_ingested_at ? new Date(item.last_ingested_at).toLocaleString("id-ID") : "belum pernah"}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a href={`/ai-knowledge/documents/${item.id}`} className="rounded-full border border-black/10 px-3 py-1.5 text-xs">
                        Buka
                      </a>
                      <button
                        type="button"
                        onClick={() => void triggerDocument(item.id)}
                        disabled={busyKey === `doc-${item.id}`}
                        className="rounded-full border border-black/10 px-3 py-1.5 text-xs disabled:opacity-60"
                      >
                        {busyKey === `doc-${item.id}` ? "Processing..." : "Ingest"}
                      </button>
                      <StorageFileActions
                        bucket="ai-documents"
                        path={item.storage_path}
                        previewLabel="Open File"
                        downloadLabel="Download File"
                      />
                      {item.extraction_status === "parser_failed" ? (
                        <button
                          type="button"
                          onClick={() => void markManualFallback(item.id)}
                          disabled={busyKey === `fallback-${item.id}`}
                          className="rounded-full border border-black/10 px-3 py-1.5 text-xs disabled:opacity-60"
                        >
                          {busyKey === `fallback-${item.id}` ? "Saving..." : "Mark Manual Fallback"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="surface rounded-[2rem] p-6">
          <h2 className="font-display text-3xl">Recent Documents</h2>
          <div className="mt-4 space-y-3">
            {recent.map((item) => (
              <a
                key={item.id}
                href={`/ai-knowledge/documents/${item.id}`}
                className="block rounded-2xl bg-black/5 px-4 py-4 text-sm transition hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10"
              >
                <div className="font-medium">{item.title}</div>
                <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                  {item.category} • {item.ingestion_status} • chunks {item.chunk_count}
                </div>
                <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                  Extraction: {item.extraction_status}{item.extraction_method ? ` • ${item.extraction_method}` : ""}
                </div>
              </a>
            ))}
          </div>
        </article>
      </section>

      {error ? <p className="text-sm text-coral">{error}</p> : null}
      {status ? <p className="text-sm text-[rgb(var(--muted))]">{status}</p> : null}
    </section>
  );
}
