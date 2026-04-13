import { DeveloperShell } from "@/components/developer/developer-shell";

export default function DeveloperPipelinePage() {
  const stages = [
    {
      name: "Public + Portal UI",
      detail: "Next.js App Router menyajikan halaman public, portal siswa/orang tua, teacher workspace, dan console internal."
    },
    {
      name: "Auth + Role Guard",
      detail: "Supabase Auth, metadata role, middleware, dan route guards mengarahkan user ke modul yang sesuai."
    },
    {
      name: "Content + Storage",
      detail: "Upload file masuk ke Supabase Storage, metadata dicatat ke materials atau ai_documents, lalu extraction dijalankan."
    },
    {
      name: "Knowledge Pipeline",
      detail: "Dokumen dipecah menjadi chunk, dibuat embedding, masuk ke ai_document_chunks, lalu siap dipakai retrieval."
    },
    {
      name: "AI-RUM Runtime",
      detail: "Responses API menerima pertanyaan, mengambil konteks hasil retrieval, menghasilkan jawaban, lalu evaluator menilai kualitas."
    },
    {
      name: "Observability",
      detail: "Developer health, analytics, review queue, dan operational activity logs membantu audit dan triage insiden."
    }
  ];

  return (
    <DeveloperShell title="System Pipeline" description="Topologi layanan dari frontend, API layer, Supabase, hingga AI.">
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4">
          {stages.map((stage, index) => (
            <article key={stage.name} className="surface rounded-[1.75rem] p-6">
              <p className="text-sm text-[rgb(var(--muted))]">Stage {index + 1}</p>
              <h2 className="mt-2 font-display text-2xl">{stage.name}</h2>
              <p className="mt-3 text-sm text-[rgb(var(--muted))]">{stage.detail}</p>
            </article>
          ))}
        </div>

        <article className="surface rounded-[1.75rem] p-6">
          <p className="eyebrow">Weak points to watch</p>
          <h2 className="mt-2 font-display text-3xl">Area yang masih perlu penjagaan saat live</h2>
          <div className="mt-6 space-y-3 text-sm text-[rgb(var(--muted))]">
            {[
              "Scanned PDF belum punya OCR, jadi dokumen hasil scan masih perlu fallback manual.",
              "Rate limit masih in-memory; pada deployment multi-instance perlu store terpusat.",
              "Belum ada worker async terpisah untuk extraction dan ingestion berat.",
              "Monitoring eksternal dan alerting masih perlu dipasang di environment production."
            ].map((item) => (
              <p key={item} className="rounded-2xl bg-black/5 px-4 py-3 dark:bg-white/5">
                {item}
              </p>
            ))}
          </div>
        </article>
      </section>
    </DeveloperShell>
  );
}
