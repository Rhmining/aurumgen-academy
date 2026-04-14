import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Programs",
  description: "Detail program AURUMGEN Academy untuk IGCSE, IB, dan university readiness dengan dukungan guru, parent alignment, dan AI-RUM.",
  path: "/programs"
});

const programs = [
  {
    title: "IGCSE Intensive",
    detail: "Fondasi konsep, drill mingguan, dan pemetaan gap akademik.",
    fit: "Untuk siswa yang butuh disiplin konsep, pemulihan gap, dan ritme latihan yang konsisten.",
    outputs: ["Core concept mapping", "Structured weekly drill", "Progress notes untuk keluarga"]
  },
  {
    title: "IB Excellence",
    detail: "Coaching HL/SL, analytical writing, dan strategi internal assessment.",
    fit: "Untuk siswa yang memerlukan keseimbangan antara analytical depth, writing quality, dan exam performance.",
    outputs: ["HL/SL support", "Essay and IA feedback", "Subject-specific reflection cycle"]
  },
  {
    title: "University Readiness",
    detail: "Pathway planning, shortlist kampus, dan komunikasi orang tua.",
    fit: "Untuk keluarga yang ingin menata pilihan kampus, timeline aplikasi, dan kesiapan profil secara terkoordinasi.",
    outputs: ["Roadmap aplikasi", "Target campus framing", "Parent alignment checkpoints"]
  }
];

export default function ProgramsPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <span className="eyebrow">Program AURUMGEN</span>
      <h1 className="mt-5 max-w-4xl font-display text-5xl">Rangkaian program yang menyatukan akademik, mentoring, dan AI dalam satu sistem pendampingan.</h1>
      <p className="mt-5 max-w-3xl text-lg text-[rgb(var(--muted))]">
        Setiap program dirancang untuk menjawab fase belajar yang berbeda. Fokusnya bukan hanya konten akademik, tetapi juga ritme belajar,
        kualitas umpan balik, dan keterbacaan progres oleh keluarga.
      </p>
      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {programs.map((program) => (
          <article key={program.title} className="surface rounded-[1.75rem] p-6">
            <h2 className="font-display text-3xl">{program.title}</h2>
            <p className="mt-3 text-[rgb(var(--muted))]">{program.detail}</p>
            <p className="mt-5 text-sm font-semibold">Cocok untuk</p>
            <p className="mt-2 text-sm text-[rgb(var(--muted))]">{program.fit}</p>
            <div className="mt-5 space-y-2">
              {program.outputs.map((output) => (
                <p key={output} className="rounded-2xl bg-black/5 px-4 py-3 text-sm dark:bg-white/5">
                  {output}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>
      <div className="mt-10 rounded-[2rem] border border-black/10 bg-black/5 p-6 dark:bg-white/5">
        <h2 className="font-display text-3xl">Mulai dari program, lanjut ke portal yang sesuai.</h2>
        <p className="mt-3 max-w-3xl text-[rgb(var(--muted))]">
          Setelah kebutuhan utama dipetakan, akses platform dapat diarahkan ke peran siswa, orang tua, guru, atau admin internal sesuai kebutuhan operasional.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link href="/pathway" className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-white">
            Lihat academic pathway
          </Link>
          <Link href="/contact" className="rounded-full border border-black/10 px-6 py-3 text-sm font-medium">
            Buka konsultasi awal
          </Link>
        </div>
      </div>
    </section>
  );
}
