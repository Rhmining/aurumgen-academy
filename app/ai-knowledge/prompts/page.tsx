import { AiKnowledgeShell } from "@/components/ai-knowledge/ai-knowledge-shell";

export default function AiKnowledgePromptsPage() {
  return (
    <AiKnowledgeShell title="Prompt Rules" description="Atur guardrails, persona, dan instruksi sistem AI-RUM.">
      <section className="surface rounded-[1.75rem] p-6">
        <p className="text-[rgb(var(--muted))]">Prompt registry siap dihubungkan ke versi prompt dan evaluasi per role.</p>
      </section>
    </AiKnowledgeShell>
  );
}
