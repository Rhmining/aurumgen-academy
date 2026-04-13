"use client";

import { useEffect, useState } from "react";

type Summary = {
  total: number;
  readyForIngestion: number;
  processing: number;
  failed: number;
  processed: number;
  reviewed: number;
};

export function PipelineOverview() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/ingestion", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Gagal memuat pipeline.");
        setSummary(payload.summary ?? null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Gagal memuat pipeline.");
      }
    }

    void load();
  }, []);

  const steps = [
    {
      title: "Source ingest",
      detail: `${summary?.total ?? 0} dokumen masuk registry`
    },
    {
      title: "Normalize",
      detail: `${summary?.readyForIngestion ?? 0} dokumen siap diproses`
    },
    {
      title: "Chunk",
      detail: `${summary?.processing ?? 0} dokumen sedang diproses`
    },
    {
      title: "Embed",
      detail: `${summary?.processed ?? 0} dokumen sudah embedded`
    },
    {
      title: "Serve",
      detail: `${summary?.reviewed ?? 0} dokumen sudah reviewed`
    }
  ];

  return (
    <section className="space-y-4">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {steps.map((step) => (
          <article key={step.title} className="surface rounded-[1.75rem] p-6">
            <h2 className="font-display text-2xl">{step.title}</h2>
            <p className="mt-3 text-sm text-[rgb(var(--muted))]">{step.detail}</p>
          </article>
        ))}
      </section>

      <article className="surface rounded-[1.75rem] p-6">
        <h2 className="font-display text-3xl">Operational Notes</h2>
        <div className="mt-4 space-y-2 text-sm text-[rgb(var(--muted))]">
          <p>Gunakan halaman Ingestion untuk memproses dokumen yang masih kosong chunk, failed, atau queued.</p>
          <p>Gunakan Source Registry untuk review dokumen yang belum dipakai atau gagal ingest.</p>
          <p>Gunakan Document Detail untuk edit chunk manual dan refresh embedding per dokumen.</p>
          <p>Gunakan AI-RUM QA untuk uji retrieval dan evaluator sebelum knowledge dipakai lebih luas.</p>
        </div>
      </article>

      {error ? <p className="text-sm text-coral">{error}</p> : null}
    </section>
  );
}
