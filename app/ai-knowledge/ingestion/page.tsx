import { AiKnowledgeShell } from "@/components/ai-knowledge/ai-knowledge-shell";
import { IngestionDashboard } from "@/components/ai-knowledge/ingestion-dashboard";

export default function AiKnowledgeIngestionPage() {
  return (
    <AiKnowledgeShell title="Ingestion Queue" description="Pantau chunking, embedding, dan indexing dokumen.">
      <IngestionDashboard />
    </AiKnowledgeShell>
  );
}
