import { AiKnowledgeShell } from "@/components/ai-knowledge/ai-knowledge-shell";
import { PipelineOverview } from "@/components/ai-knowledge/pipeline-overview";

export default function AiKnowledgePipelinePage() {
  return (
    <AiKnowledgeShell title="Knowledge Pipeline" description="Lihat pipeline end-to-end dari upload hingga retrieval.">
      <PipelineOverview />
    </AiKnowledgeShell>
  );
}
