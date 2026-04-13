"use client";

import { useEffect, useState } from "react";

type AnalyticsPayload = {
  summary: {
    sessionCount: number;
    messageCount: number;
    retrievalHitRate: number;
    processedKnowledgeDocs: number;
    avgRetrievalScore: number;
    avgAnswerScore: number;
    fallbackRate: number;
  };
  popularQuestions: Array<{ question: string; count: number }>;
  topDocuments: Array<{ documentId: number; title: string; category: string; count: number }>;
  retrievalMethods: Array<{ method: string; count: number }>;
  extractionStatuses: Array<{ status: string; count: number }>;
  evaluatorModes: Array<{ mode: string; count: number }>;
  lowQualityMessages: Array<{ preview: string; answerScore: number; flags: string[]; evaluatorMode: string; notes?: string | null }>;
};

export function AirumAnalyticsPanel() {
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/ai-rum/analytics', { cache: 'no-store' });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? 'Gagal memuat analytics.');
        setData(payload);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Gagal memuat analytics.');
      }
    }

    void load();
  }, []);

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-7">
        {[
          { title: 'Sessions', value: data?.summary.sessionCount ?? 0 },
          { title: 'Messages', value: data?.summary.messageCount ?? 0 },
          { title: 'Hit-rate', value: `${((data?.summary.retrievalHitRate ?? 0) * 100).toFixed(0)}%` },
          { title: 'Processed docs', value: data?.summary.processedKnowledgeDocs ?? 0 },
          { title: 'Avg retrieval', value: `${((data?.summary.avgRetrievalScore ?? 0) * 100).toFixed(0)}%` },
          { title: 'Avg answer', value: `${((data?.summary.avgAnswerScore ?? 0) * 100).toFixed(0)}%` },
          { title: 'Judge fallback', value: `${((data?.summary.fallbackRate ?? 0) * 100).toFixed(0)}%` }
        ].map((item) => (
          <article key={item.title} className="surface rounded-[1.75rem] p-6">
            <p className="text-sm text-[rgb(var(--muted))]">{item.title}</p>
            <p className="mt-4 font-display text-4xl">{item.value}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <article className="surface rounded-[1.75rem] p-6">
          <h2 className="font-display text-3xl">Pertanyaan Populer</h2>
          <div className="mt-4 space-y-3">
            {(data?.popularQuestions ?? []).map((item) => (
              <div key={item.question} className="rounded-2xl bg-black/5 px-4 py-3 text-sm dark:bg-white/5">
                {item.question} • {item.count}x
              </div>
            ))}
          </div>
        </article>

        <article className="surface rounded-[1.75rem] p-6">
          <h2 className="font-display text-3xl">Dokumen Tersering Disitir</h2>
          <div className="mt-4 space-y-3">
            {(data?.topDocuments ?? []).map((item) => (
              <a key={item.documentId} href={`/ai-knowledge/documents/${item.documentId}`} className="block rounded-2xl bg-black/5 px-4 py-3 text-sm dark:bg-white/5">
                {item.title} • {item.count} citations
              </a>
            ))}
          </div>
        </article>

        <article className="surface rounded-[1.75rem] p-6">
          <h2 className="font-display text-3xl">Metode Retrieval</h2>
          <div className="mt-4 space-y-3">
            {(data?.retrievalMethods ?? []).map((item) => (
              <div key={item.method} className="rounded-2xl bg-black/5 px-4 py-3 text-sm dark:bg-white/5">
                {item.method} • {item.count}
              </div>
            ))}
          </div>
        </article>

        <article className="surface rounded-[1.75rem] p-6">
          <h2 className="font-display text-3xl">Evaluator Modes</h2>
          <div className="mt-4 space-y-3">
            {(data?.evaluatorModes ?? []).map((item) => (
              <div key={item.mode} className="rounded-2xl bg-black/5 px-4 py-3 text-sm dark:bg-white/5">
                {item.mode} • {item.count}
              </div>
            ))}
          </div>
        </article>

        <article className="surface rounded-[1.75rem] p-6">
          <h2 className="font-display text-3xl">Extraction Status</h2>
          <div className="mt-4 space-y-3">
            {(data?.extractionStatuses ?? []).map((item) => (
              <div key={item.status} className="rounded-2xl bg-black/5 px-4 py-3 text-sm dark:bg-white/5">
                {item.status} • {item.count}
              </div>
            ))}
          </div>
        </article>

        <article className="surface rounded-[1.75rem] p-6">
          <h2 className="font-display text-3xl">Low Score Answers</h2>
          <div className="mt-4 space-y-3">
            {(data?.lowQualityMessages ?? []).map((item, index) => (
              <div key={index} className="rounded-2xl bg-black/5 px-4 py-3 text-sm dark:bg-white/5">
                {item.preview} • {(item.answerScore * 100).toFixed(0)}%
                {item.flags.length ? <div className="mt-2 text-xs text-[rgb(var(--muted))]">{item.flags.join(', ')}</div> : null}
                <div className="mt-2 text-xs text-[rgb(var(--muted))]">Mode: {item.evaluatorMode}</div>
                {item.notes ? <div className="mt-2 text-xs text-[rgb(var(--muted))]">{item.notes}</div> : null}
              </div>
            ))}
          </div>
        </article>
      </div>

      {error ? <p className="text-sm text-coral">{error}</p> : null}
    </section>
  );
}
