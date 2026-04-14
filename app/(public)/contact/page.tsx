import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Konsultasi Awal",
  description: "Mulai percakapan awal untuk memilih jalur belajar, ritme pendampingan, dan kebutuhan keluarga di AURUMGEN Academy.",
  path: "/contact"
});

const consultationSteps = [
  "Cerita singkat tentang kelas, target akademik, dan tantangan belajar saat ini.",
  "Pilih fokus utama: IGCSE, IB, university readiness, atau kombinasi parent support dan AI-RUM.",
  "Tim AURUMGEN mengarahkan Anda ke jalur program dan akses portal yang paling relevan."
];

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="surface rounded-[2rem] p-6 md:p-8">
          <span className="eyebrow">Konsultasi awal</span>
          <h1 className="mt-5 font-display text-5xl">Mulai dari jalur belajar yang tepat, bukan sekadar kelas tambahan.</h1>
          <p className="mt-5 max-w-2xl text-lg text-[rgb(var(--muted))]">
            Halaman ini membantu keluarga memahami alur awal sebelum masuk ke portal AURUMGEN. Untuk tahap ini,
            percakapan dapat dimulai melalui akun platform agar kebutuhan siswa, orang tua, dan guru terekam rapi.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/login" className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-white">
              Buka login / registrasi
            </Link>
            <Link href="/programs" className="rounded-full border border-black/10 px-6 py-3 text-sm font-medium">
              Lihat detail program
            </Link>
          </div>
        </article>

        <article className="surface rounded-[2rem] p-6 md:p-8">
          <p className="text-sm font-semibold">Alur singkat</p>
          <div className="mt-5 space-y-4">
            {consultationSteps.map((step, index) => (
              <div key={step} className="rounded-[1.5rem] border border-black/10 p-5">
                <p className="text-sm text-[rgb(var(--muted))]">Langkah {index + 1}</p>
                <p className="mt-2">{step}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
