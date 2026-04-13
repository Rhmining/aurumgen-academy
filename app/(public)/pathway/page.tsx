const pathways = [
  "Pathway IGCSE untuk penguatan core subject dan kesiapan transisi.",
  "Pathway IB untuk pembelajaran inquiry, writing, dan assessment berstandar global.",
  "Pathway universitas untuk pilihan target kampus, timeline aplikasi, dan kesiapan profil."
];

export default function PathwayPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <span className="eyebrow">Academic pathway</span>
      <h1 className="mt-5 font-display text-5xl">Jalur belajar yang bisa dibaca siswa, orang tua, dan guru dengan bahasa yang sama.</h1>
      <div className="mt-10 space-y-4">
        {pathways.map((pathway) => (
          <article key={pathway} className="surface rounded-[1.75rem] p-6 text-lg">
            {pathway}
          </article>
        ))}
      </div>
    </section>
  );
}
