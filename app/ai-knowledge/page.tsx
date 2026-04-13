import { AiKnowledgeShell } from "@/components/ai-knowledge/ai-knowledge-shell";
import { aiKnowledgeQueue } from "@/lib/db/queries";

export default function AiKnowledgePage() {
  return (
    <AiKnowledgeShell title="Knowledge Overview" description="Sumber pengetahuan untuk AI-RUM dan workflow ingestion.">
      <section className="grid gap-4 md:grid-cols-3">
        {aiKnowledgeQueue.map((item) => (
          <article key={item.name} className="surface rounded-[1.75rem] p-6">
            <h2 className="font-semibold">{item.name}</h2>
            <p className="mt-3 text-sm text-[rgb(var(--muted))]">{item.state}</p>
            <p className="mt-2 text-sm">Owner: {item.owner}</p>
          </article>
        ))}
      </section>
    </AiKnowledgeShell>
  );
}
