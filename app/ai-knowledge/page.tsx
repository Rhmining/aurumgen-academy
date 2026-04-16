import Link from "next/link";
import { AiKnowledgeShell } from "@/components/ai-knowledge/ai-knowledge-shell";
import {
  aiKnowledgeMetrics,
  aiKnowledgeQualityChecks,
  aiKnowledgeQueue,
  aiKnowledgeTriage
} from "@/lib/db/queries";

export default function AiKnowledgePage() {
  return (
    <AiKnowledgeShell
      title="Knowledge Overview"
      description="Prioritaskan ingestion, review kualitas, dan kesiapan retrieval untuk AI-RUM."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {aiKnowledgeMetrics.map((metric) => (
          <article key={metric.label} className="surface rounded-[1.75rem] p-6">
            <p className="text-sm text-[rgb(var(--muted))]">{metric.label}</p>
            <p className="mt-4 font-display text-4xl">{metric.value}</p>
            <p className="mt-3 text-sm text-[rgb(var(--muted))]">{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="surface rounded-[2rem] p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Triage queue</p>
              <h2 className="mt-3 font-display text-3xl">Dokumen yang perlu ditangani lebih dulu</h2>
            </div>
            <Link href="/ai-knowledge/ingestion" className="text-sm font-semibold underline-offset-4 hover:underline">
              Buka ingestion queue
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {aiKnowledgeTriage.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="block rounded-[1.5rem] border border-black/5 p-5 transition hover:border-black/10 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm text-[rgb(var(--muted))]">{item.issue}</p>
                  </div>
                  <span className="rounded-full bg-[rgb(var(--accent-soft))] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
                    review
                  </span>
                </div>
                <p className="mt-3 text-sm text-[rgb(var(--muted))]">Owner: {item.owner}</p>
              </Link>
            ))}
          </div>
        </article>

        <article className="surface rounded-[2rem] p-6">
          <p className="eyebrow">Quality checks</p>
          <h2 className="mt-3 font-display text-3xl">Checklist harian AI admin</h2>
          <div className="mt-6 space-y-3">
            {aiKnowledgeQualityChecks.map((item) => (
              <div key={item.title} className="rounded-[1.5rem] bg-black/5 p-5 dark:bg-white/5">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-[rgb(var(--muted))]">{item.detail}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
        <article className="surface rounded-[2rem] p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Queue snapshot</p>
              <h2 className="mt-3 font-display text-3xl">Status owner dan readiness saat ini</h2>
            </div>
            <Link href="/ai-knowledge/documents" className="text-sm font-semibold underline-offset-4 hover:underline">
              Kelola dokumen
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {aiKnowledgeQueue.map((item) => (
              <article key={item.name} className="rounded-[1.5rem] border border-black/5 p-5 dark:border-white/10">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="mt-3 text-sm text-[rgb(var(--muted))]">{item.state}</p>
                <p className="mt-4 text-sm">Owner: {item.owner}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="surface rounded-[2rem] p-6">
          <p className="eyebrow">Quick actions</p>
          <h2 className="mt-3 font-display text-3xl">Masuk ke workflow inti</h2>
          <div className="mt-6 grid gap-3">
            {[
              {
                href: "/ai-knowledge/documents",
                title: "Review source documents",
                detail: "Periksa metadata, source type, extraction note, dan chunk count."
              },
              {
                href: "/ai-knowledge/ingestion",
                title: "Pantau ingestion batch",
                detail: "Cek dokumen queued, failed, atau parser_failed sebelum retrieval dipakai."
              },
              {
                href: "/ai-knowledge/pipeline",
                title: "Audit retrieval pipeline",
                detail: "Pastikan prompt dan evaluasi selaras dengan knowledge terbaru."
              }
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="rounded-[1.5rem] border border-black/5 p-5 transition hover:border-black/10 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
              >
                <h3 className="font-semibold">{action.title}</h3>
                <p className="mt-2 text-sm text-[rgb(var(--muted))]">{action.detail}</p>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </AiKnowledgeShell>
  );
}
