"use client";

import { useEffect, useState } from "react";

type HealthPayload = {
  env: {
    supabase: boolean;
    openai: boolean;
    siteUrl: string | null;
    responsesModel: string | null;
    evaluatorModel: string | null;
    embeddingModel: string | null;
  };
  summary: {
    documentCount: number;
    failedExtractionCount: number;
    failedIngestionCount: number;
    activityLogCount: number;
  };
  rateLimits: {
    aiRum: string;
    upload: string;
    ingestion: string;
  };
  urls: {
    resolvedSiteUrl: string;
    authCallbackPath: string;
  };
};

export function SystemHealthPanel() {
  const [data, setData] = useState<HealthPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/developer/health", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Gagal memuat system health.");
        setData(payload);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Gagal memuat system health.");
      }
    }

    void load();
  }, []);

  return (
    <section className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Supabase Env", value: data?.env.supabase ? "Ready" : "Missing" },
          { label: "OpenAI Env", value: data?.env.openai ? "Ready" : "Missing" },
          { label: "Site URL", value: data?.env.siteUrl ? "Ready" : "Fallback" },
          { label: "Failed Extraction", value: String(data?.summary.failedExtractionCount ?? 0) },
          { label: "Failed Ingestion", value: String(data?.summary.failedIngestionCount ?? 0) }
        ].map((item) => (
          <article key={item.label} className="surface rounded-[1.75rem] p-6">
            <p className="text-sm text-[rgb(var(--muted))]">{item.label}</p>
            <p className="mt-4 font-display text-4xl">{item.value}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="surface rounded-[1.75rem] p-6">
          <h2 className="font-display text-3xl">Models</h2>
          <div className="mt-4 space-y-2 text-sm text-[rgb(var(--muted))]">
            <p>Responses: {data?.env.responsesModel ?? "-"}</p>
            <p>Evaluator: {data?.env.evaluatorModel ?? "-"}</p>
            <p>Embedding: {data?.env.embeddingModel ?? "-"}</p>
            <p>Documents: {data?.summary.documentCount ?? 0}</p>
            <p>Activity logs: {data?.summary.activityLogCount ?? 0}</p>
          </div>
        </article>

        <article className="surface rounded-[1.75rem] p-6">
          <h2 className="font-display text-3xl">Rate Limits</h2>
          <div className="mt-4 space-y-2 text-sm text-[rgb(var(--muted))]">
            <p>AI-RUM: {data?.rateLimits.aiRum ?? "-"}</p>
            <p>Upload: {data?.rateLimits.upload ?? "-"}</p>
            <p>Ingestion: {data?.rateLimits.ingestion ?? "-"}</p>
          </div>
        </article>

        <article className="surface rounded-[1.75rem] p-6">
          <h2 className="font-display text-3xl">URLs</h2>
          <div className="mt-4 space-y-2 text-sm text-[rgb(var(--muted))]">
            <p>Configured site URL: {data?.env.siteUrl ?? "-"}</p>
            <p>Resolved site URL: {data?.urls.resolvedSiteUrl ?? "-"}</p>
            <p>Auth callback: {data?.urls.authCallbackPath ?? "-"}</p>
          </div>
        </article>
      </div>

      {error ? <p className="text-sm text-coral">{error}</p> : null}
    </section>
  );
}
