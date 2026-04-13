import { DeveloperShell } from "@/components/developer/developer-shell";
import { hasOpenAiEnv } from "@/lib/supabase/env";

export default function DeveloperModelsPage() {
  const modelRows = [
    {
      label: "Responses",
      value: process.env.OPENAI_RESPONSES_MODEL ?? "Belum diatur",
      purpose: "Jawaban utama AI-RUM untuk chat, guidance, dan retrieval-aware response."
    },
    {
      label: "Evaluator",
      value: process.env.OPENAI_EVALUATOR_MODEL ?? "Belum diatur",
      purpose: "Menilai kualitas jawaban, retrieval coverage, dan fallback heuristik."
    },
    {
      label: "Embeddings",
      value: process.env.OPENAI_EMBEDDING_MODEL ?? "Belum diatur",
      purpose: "Membangun representasi chunk untuk semantic retrieval di knowledge base."
    }
  ];

  return (
    <DeveloperShell title="Model Settings" description="Kelola model, fallback, dan routing AI-RUM per use case.">
      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <article className="surface rounded-[1.75rem] p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="eyebrow">Configured models</p>
              <h2 className="mt-2 font-display text-3xl">Registry aktif dari environment</h2>
            </div>
            <span className="rounded-full bg-black/5 px-4 py-2 text-sm text-[rgb(var(--muted))] dark:bg-white/10">
              {hasOpenAiEnv() ? "OpenAI ready" : "OpenAI env missing"}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {modelRows.map((item) => (
              <div key={item.label} className="rounded-[1.5rem] border border-black/10 p-5 dark:border-white/10">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-[rgb(var(--muted))]">{item.label}</p>
                    <p className="mt-2 font-mono text-sm">{item.value}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-[rgb(var(--muted))]">{item.purpose}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="surface rounded-[1.75rem] p-6">
          <p className="eyebrow">Launch checklist</p>
          <h2 className="mt-2 font-display text-3xl">Model governance</h2>
          <div className="mt-6 space-y-4 text-sm text-[rgb(var(--muted))]">
            <p>Pastikan tiga env model terisi di staging dan production agar chat, evaluasi, dan embeddings tidak diam-diam fallback ke kondisi kosong.</p>
            <p>Gunakan model evaluator yang lebih ringan dari model utama untuk menjaga biaya review otomatis tetap stabil saat traffic naik.</p>
            <p>Setelah mengganti model embedding, lakukan re-embed seluruh dokumen agar vector index tidak tercampur antar generasi model.</p>
            <p>Sebelum tayang, verifikasi satu sesi AI-RUM nyata untuk memastikan retrieval, evaluator, dan session history berjalan pada model yang sama dengan konfigurasi live.</p>
          </div>
        </article>
      </section>
    </DeveloperShell>
  );
}
