import { AiKnowledgeShell } from "@/components/ai-knowledge/ai-knowledge-shell";
import { ReviewQueue } from "@/components/ai-knowledge/review-queue";

export default function AiKnowledgeSourcesPage() {
  return (
    <AiKnowledgeShell title="Source Registry" description="Review workflow untuk dokumen knowledge yang perlu perhatian tim internal.">
      <ReviewQueue />
    </AiKnowledgeShell>
  );
}
