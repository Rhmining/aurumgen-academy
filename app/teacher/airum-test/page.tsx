import { TeacherShell } from "@/components/teacher/teacher-shell";
import { AirumPanel } from "@/components/airum/airum-panel";

export default function TeacherAirumTestPage() {
  return (
    <TeacherShell title="AI-RUM Testing" description="Sandbox guru untuk menguji prompt dan tone assistant.">
      <AirumPanel role="teacher" />
    </TeacherShell>
  );
}
