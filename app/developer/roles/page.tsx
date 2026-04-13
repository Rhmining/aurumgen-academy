import { DeveloperShell } from "@/components/developer/developer-shell";
import { roles } from "@/lib/constants";

export default function DeveloperRolesPage() {
  const accessMap: Record<(typeof roles)[number], string[]> = {
    student: ["/portal/student", "/portal/materials", "/portal/curriculum", "/portal/progress"],
    parent: ["/portal/parent", "/portal/progress", "/portal/materials"],
    teacher: ["/teacher", "/teacher/materials", "/teacher/question-bank", "/teacher/curriculum", "/teacher/students", "/teacher/airum-test"],
    aiadmin: ["/ai-knowledge", "/ai-knowledge/documents", "/ai-knowledge/ingestion", "/ai-knowledge/pipeline", "/ai-knowledge/prompts"],
    developer: ["/developer", "/developer/logs", "/developer/models", "/developer/pipeline", "/developer/api-playground"]
  };

  return (
    <DeveloperShell title="Role Access" description="Peta hak akses antar modul dan rute.">
      <section className="grid-cards">
        {roles.map((role) => (
          <article key={role} className="surface rounded-[1.75rem] p-6">
            <h2 className="font-display text-2xl">{role}</h2>
            <div className="mt-4 space-y-2">
              {accessMap[role].map((route) => (
                <p key={route} className="rounded-2xl bg-black/5 px-4 py-3 text-sm text-[rgb(var(--muted))] dark:bg-white/5">
                  {route}
                </p>
              ))}
            </div>
          </article>
        ))}
      </section>
    </DeveloperShell>
  );
}
