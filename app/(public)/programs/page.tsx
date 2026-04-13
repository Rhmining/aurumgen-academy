const programs = [
  { title: "IGCSE Intensive", detail: "Fondasi konsep, drill mingguan, dan pemetaan gap akademik." },
  { title: "IB Excellence", detail: "Coaching HL/SL, analytical writing, dan strategi internal assessment." },
  { title: "University Readiness", detail: "Pathway planning, shortlist kampus, dan komunikasi orang tua." }
];

export default function ProgramsPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <span className="eyebrow">Program AURUMGEN</span>
      <h1 className="mt-5 max-w-3xl font-display text-5xl">Rangkaian program yang menyatukan akademik, mentoring, dan AI.</h1>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {programs.map((program) => (
          <article key={program.title} className="surface rounded-[1.75rem] p-6">
            <h2 className="font-display text-3xl">{program.title}</h2>
            <p className="mt-3 text-[rgb(var(--muted))]">{program.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
