import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPanel } from "@/components/auth/auth-panel";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Login",
  description: "Masuk ke AURUMGEN Academy sebagai siswa, orang tua, guru, AI admin, atau developer untuk mengakses portal yang sesuai.",
  path: "/login"
});

export default function LoginPage() {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-6 py-20 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-5">
        <span className="eyebrow">Multi-role access</span>
        <h1 className="font-display text-5xl">Masuk ke AURUMGEN Academy sesuai peran Anda.</h1>
        <p className="max-w-xl text-lg text-[rgb(var(--muted))]">
          Halaman ini sekarang siap dipakai untuk login dan registrasi Supabase berbasis role. Setelah masuk,
          pengguna diarahkan otomatis ke dashboard yang cocok.
        </p>
        <div className="rounded-[1.75rem] border border-black/10 bg-black/5 p-5 text-sm text-[rgb(var(--muted))] dark:bg-white/5">
          Untuk akses awal, gunakan peran yang memang sesuai dengan kebutuhan Anda. Role membantu platform menampilkan portal, materi,
          dan alur kerja yang paling relevan tanpa membuat pengalaman terasa penuh dan membingungkan.
        </div>
      </div>
      <Suspense fallback={<div className="surface rounded-[2rem] p-6">Memuat panel autentikasi...</div>}>
        <AuthPanel />
      </Suspense>
    </section>
  );
}
