import { DeveloperShell } from "@/components/developer/developer-shell";
import { AirumAnalyticsPanel } from "@/components/developer/airum-analytics-panel";
import { SystemHealthPanel } from "@/components/developer/system-health-panel";

export default function DeveloperPage() {
  return (
    <DeveloperShell title="Developer Overview" description="Observability dan pengaturan platform AURUMGEN Academy.">
      <SystemHealthPanel />
      <AirumAnalyticsPanel />
    </DeveloperShell>
  );
}
