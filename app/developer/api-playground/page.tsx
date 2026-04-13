import { DeveloperShell } from "@/components/developer/developer-shell";

export default function DeveloperApiPlaygroundPage() {
  const endpointGroups = [
    {
      title: "AI-RUM",
      routes: ["/api/ai-rum", "/api/ai-rum/sessions", "/api/ai-rum/analytics"],
      note: "Validasi chat, histori sesi, retrieval quality, dan analytics."
    },
    {
      title: "Knowledge",
      routes: ["/api/ai-documents", "/api/ai-documents/[id]/ingest", "/api/ai-knowledge/review"],
      note: "Uji CRUD dokumen, ingestion, review queue, dan pembaruan chunk."
    },
    {
      title: "Content Ops",
      routes: ["/api/materials", "/api/question-bank", "/api/upload", "/api/storage-link"],
      note: "Pastikan teacher workflow dan upload storage berjalan end-to-end."
    }
  ];

  const smokeTests = [
    "GET /api/developer/health untuk memastikan env dan summary sistem terbaca.",
    "POST /api/upload dengan file PDF/DOCX nyata untuk cek storage + extraction.",
    "POST /api/ai-documents lalu POST /api/ai-documents/[id]/ingest untuk verifikasi jalur knowledge.",
    "POST /api/ai-rum dengan pertanyaan yang harus mengutip dokumen agar retrieval dapat diinspeksi."
  ];

  return (
    <DeveloperShell title="API Playground" description="Sandbox internal untuk menguji route AI dan upload flow.">
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="surface rounded-[1.75rem] p-6">
          <p className="eyebrow">Live endpoints</p>
          <h2 className="mt-2 font-display text-3xl">Rute prioritas untuk smoke test</h2>
          <div className="mt-6 space-y-4">
            {endpointGroups.map((group) => (
              <div key={group.title} className="rounded-[1.5rem] border border-black/10 p-5 dark:border-white/10">
                <h3 className="font-display text-2xl">{group.title}</h3>
                <p className="mt-2 text-sm text-[rgb(var(--muted))]">{group.note}</p>
                <div className="mt-4 space-y-2">
                  {group.routes.map((route) => (
                    <p key={route} className="font-mono text-sm text-[rgb(var(--muted))]">
                      {route}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="surface rounded-[1.75rem] p-6">
          <p className="eyebrow">Suggested sequence</p>
          <h2 className="mt-2 font-display text-3xl">Urutan verifikasi manual</h2>
          <div className="mt-6 space-y-3 text-sm text-[rgb(var(--muted))]">
            {smokeTests.map((item) => (
              <p key={item} className="rounded-2xl bg-black/5 px-4 py-3 dark:bg-white/5">
                {item}
              </p>
            ))}
          </div>
          <pre className="mt-6 overflow-x-auto rounded-[1.5rem] bg-black px-4 py-4 text-xs text-white">
{`fetch("/api/developer/health", { cache: "no-store" })
  .then((response) => response.json())
  .then(console.log);`}
          </pre>
        </article>
      </section>
    </DeveloperShell>
  );
}
