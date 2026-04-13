"use client";

import { useEffect, useState } from "react";

type LogItem = {
  id: number;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

function stringifyMetadata(metadata: Record<string, unknown>) {
  const entries = Object.entries(metadata ?? {}).filter(([, value]) => value != null && value !== "");
  if (entries.length === 0) return null;
  return entries
    .slice(0, 4)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(" • ");
}

export function OperationsLogPanel() {
  const [items, setItems] = useState<LogItem[]>([]);
  const [actionFilter, setActionFilter] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (actionFilter) params.set("action", actionFilter);
        if (entityTypeFilter) params.set("entityType", entityTypeFilter);
        if (search.trim()) params.set("search", search.trim());

        const response = await fetch(`/api/operations/logs?${params.toString()}`, { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Gagal memuat activity log.");
        setItems(payload.items ?? []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Gagal memuat activity log.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [actionFilter, entityTypeFilter, search]);

  return (
    <section className="space-y-4">
      <section className="surface rounded-[1.75rem] p-6">
        <div className="grid gap-3 md:grid-cols-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari action atau entity..."
            className="rounded-2xl border border-black/10 bg-transparent px-4 py-3 text-sm"
          />
          <input
            value={actionFilter}
            onChange={(event) => setActionFilter(event.target.value)}
            placeholder="Filter action, mis. reingest_document"
            className="rounded-2xl border border-black/10 bg-transparent px-4 py-3 text-sm"
          />
          <input
            value={entityTypeFilter}
            onChange={(event) => setEntityTypeFilter(event.target.value)}
            placeholder="Filter entity, mis. ai_document"
            className="rounded-2xl border border-black/10 bg-transparent px-4 py-3 text-sm"
          />
        </div>
      </section>
      {loading ? (
        <article className="surface rounded-[1.75rem] p-6 text-sm text-[rgb(var(--muted))]">
          Memuat activity log...
        </article>
      ) : items.length === 0 && (actionFilter || entityTypeFilter || search.trim()) ? (
        <article className="surface rounded-[1.75rem] p-6 text-sm text-[rgb(var(--muted))]">
          Tidak ada activity log yang cocok dengan filter saat ini.
        </article>
      ) : items.length === 0 ? (
        <article className="surface rounded-[1.75rem] p-6 text-sm text-[rgb(var(--muted))]">
          Belum ada activity log untuk user ini.
        </article>
      ) : (
        items.map((item) => (
          <article key={item.id} className="surface rounded-[1.75rem] p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="font-semibold">{item.action}</h2>
                <p className="mt-2 text-sm text-[rgb(var(--muted))]">
                  {item.entity_type} • {item.entity_id}
                </p>
                {stringifyMetadata(item.metadata) ? (
                  <p className="mt-2 text-sm text-[rgb(var(--muted))]">
                    {stringifyMetadata(item.metadata)}
                  </p>
                ) : null}
              </div>
              <p className="text-sm text-[rgb(var(--muted))]">
                {new Date(item.created_at).toLocaleString("id-ID")}
              </p>
            </div>
          </article>
        ))
      )}
      {error ? <p className="text-sm text-coral">{error}</p> : null}
    </section>
  );
}
