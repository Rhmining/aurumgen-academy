import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Academic Pathway",
  description: "Lihat bagaimana AURUMGEN Academy memetakan jalur IGCSE, IB, dan university readiness dari diagnosis hingga review berkala.",
  path: "/pathway"
});

const pathways = [
  {
    title: "IGCSE Pathway",
    body: "Penguatan core subject, disiplin konsep, dan kesiapan transisi ke level berikutnya melalui target mingguan yang lebih terukur."
  },
  {
    title: "IB Pathway",
    body: "Pembelajaran inquiry, writing, dan assessment berstandar global dengan dukungan refleksi yang lebih rutin dan terstruktur."
  },
  {
    title: "University Pathway",
    body: "Pilihan target kampus, timeline aplikasi, dan kesiapan profil dibaca sebagai proses panjang yang perlu sinkron antara siswa dan keluarga."
  }
];

const checkpoints = [
  "Diagnosis kebutuhan, level, dan ritme belajar.",
  "Penyusunan jalur program dan target prioritas.",
  "Pelaksanaan sesi, review, dan adaptive feedback.",
  "Revisi strategi berdasarkan progres dan kebutuhan berikutnya."
];

export default function PathwayPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <span className="eyebrow">Academic pathway</span>
      <h1 className="mt-5 max-w-4xl font-display text-5xl">Jalur belajar yang bisa dibaca siswa, orang tua, dan guru dengan bahasa yang sama.</h1>
      <p className="mt-5 max-w-3xl text-lg text-[rgb(var(--muted))]">
        AURUMGEN tidak memosisikan pathway sebagai label kosong, tetapi sebagai peta kerja untuk menentukan ritme belajar, jenis intervensi, dan bentuk review yang relevan.
      </p>
      <div className="mt-10 space-y-4">
        {pathways.map((pathway) => (
          <article key={pathway.title} className="surface rounded-[1.75rem] p-6">
            <h2 className="font-display text-3xl">{pathway.title}</h2>
            <p className="mt-3 text-lg text-[rgb(var(--muted))]">{pathway.body}</p>
          </article>
        ))}
      </div>
      <div className="mt-10 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="surface rounded-[2rem] p-6 md:p-8">
          <h2 className="font-display text-3xl">Checkpoint pendampingan</h2>
          <div className="mt-6 space-y-4">
            {checkpoints.map((checkpoint, index) => (
              <div key={checkpoint} className="rounded-[1.5rem] border border-black/10 p-5">
                <p className="text-sm text-[rgb(var(--muted))]">Checkpoint {index + 1}</p>
                <p className="mt-2">{checkpoint}</p>
              </div>
            ))}
          </div>
        </article>
        <article className="surface rounded-[2rem] p-6 md:p-8">
          <h2 className="font-display text-3xl">Akhirnya, semua kembali ke keterbacaan progres.</h2>
          <p className="mt-5 text-[rgb(var(--muted))]">
            Jalur terbaik bukan yang paling ramai, tetapi yang paling mudah dipantau, dievaluasi, dan disesuaikan bersama. Karena itu,
            pathway di AURUMGEN selalu dihubungkan ke akses portal, intervensi guru, dan dukungan AI-RUM.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/programs" className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-white">
              Lihat program
            </Link>
            <Link href="/login" className="rounded-full border border-black/10 px-6 py-3 text-sm font-medium">
              Masuk ke platform
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
