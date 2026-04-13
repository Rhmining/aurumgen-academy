import { AiKnowledgeShell } from "@/components/ai-knowledge/ai-knowledge-shell";
import { AirumPanel } from "@/components/airum/airum-panel";

export default function AiKnowledgeAirumTestPage() {
  return (
    <AiKnowledgeShell title="AI-RUM QA" description="Uji kualitas jawaban AI terhadap dokumen dan prompt terbaru.">
      <AirumPanel role="aiadmin" />
    </AiKnowledgeShell>
  );
}
