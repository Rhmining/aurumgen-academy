import { TeacherShell } from "@/components/teacher/teacher-shell";

export default function TeacherUploadFlowPage() {
  return (
    <TeacherShell title="Upload Flow" description="Pantau alur upload materi dari guru menuju knowledge base dan portal.">
      <section className="grid-cards">
        {["Upload", "Metadata tagging", "Review", "Publish"].map((step) => (
          <article key={step} className="surface rounded-[1.75rem] p-6">
            <h2 className="font-display text-2xl">{step}</h2>
          </article>
        ))}
      </section>
    </TeacherShell>
  );
}
