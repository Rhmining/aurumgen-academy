import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: "Kebijakan privasi AURUMGEN Academy untuk penggunaan portal, autentikasi, penyimpanan materi, dan interaksi AI-RUM.",
  path: "/privacy-policy"
});

const sections = [
  {
    title: "Data yang diproses",
    body:
      "AURUMGEN Academy memproses data akun, role pengguna, materi belajar, dokumen knowledge base, dan interaksi platform yang diperlukan untuk operasional portal siswa, orang tua, guru, dan admin internal."
  },
  {
    title: "Tujuan penggunaan data",
    body:
      "Data digunakan untuk autentikasi, personalisasi dashboard, pengelolaan materi, dukungan AI-RUM, audit aktivitas operasional, serta peningkatan mutu layanan akademik."
  },
  {
    title: "Penyimpanan dan akses",
    body:
      "Data platform dikelola melalui Supabase dan layanan pendukung yang digunakan untuk menjalankan aplikasi. Akses dibatasi berdasarkan peran dan kebijakan otorisasi yang relevan."
  },
  {
    title: "Tanggung jawab pengguna",
    body:
      "Pengguna bertanggung jawab menjaga kerahasiaan akun, memastikan unggahan materi sesuai hak penggunaan, dan tidak membagikan data sensitif di luar kebutuhan akademik yang sah."
  }
];

export default function PrivacyPolicyPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <span className="eyebrow">Privacy policy</span>
      <h1 className="mt-5 font-display text-5xl">Kebijakan privasi AURUMGEN Academy</h1>
      <p className="mt-5 max-w-3xl text-lg text-[rgb(var(--muted))]">
        Ringkasan ini menjelaskan bagaimana platform memproses data yang diperlukan untuk pengalaman belajar,
        kolaborasi guru, dan fitur AI internal.
      </p>
      <div className="mt-10 space-y-4">
        {sections.map((section) => (
          <article key={section.title} className="surface rounded-[1.75rem] p-6">
            <h2 className="font-display text-3xl">{section.title}</h2>
            <p className="mt-3 text-[rgb(var(--muted))]">{section.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
