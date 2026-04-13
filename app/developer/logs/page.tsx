import { DeveloperShell } from "@/components/developer/developer-shell";
import { OperationsLogPanel } from "@/components/developer/operations-log-panel";

export default function DeveloperLogsPage() {
  return (
    <DeveloperShell title="Logs" description="Audit trail request, error, dan observability aplikasi.">
      <OperationsLogPanel />
    </DeveloperShell>
  );
}
