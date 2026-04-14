import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Use",
  description: "Ketentuan penggunaan AURUMGEN Academy untuk akses portal, materi, akun, dan penggunaan AI-RUM.",
  path: "/terms"
});

const terms = [
  "Akses portal diberikan sesuai peran pengguna dan tidak boleh dipinjamkan ke pihak lain tanpa izin resmi.",
  "Materi, dokumen, dan knowledge assets yang diunggah ke platform harus memiliki hak penggunaan yang sah.",
  "AI-RUM berfungsi sebagai alat bantu belajar dan operasional, bukan pengganti keputusan akademik profesional sepenuhnya.",
  "AURUMGEN Academy berhak menyesuaikan fitur, kebijakan akses, dan struktur layanan demi keamanan dan kualitas layanan."
];

export default function TermsPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <span className="eyebrow">Terms of use</span>
      <h1 className="mt-5 font-display text-5xl">Ketentuan penggunaan platform</h1>
      <div className="mt-10 space-y-4">
        {terms.map((term, index) => (
          <article key={index} className="surface rounded-[1.75rem] p-6">
            <p className="text-sm text-[rgb(var(--muted))]">Ketentuan {index + 1}</p>
            <p className="mt-3 text-lg">{term}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
