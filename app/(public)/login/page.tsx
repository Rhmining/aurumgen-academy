import { Suspense } from "react";
import { AuthPanel } from "@/components/auth/auth-panel";

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
      </div>
      <Suspense fallback={<div className="surface rounded-[2rem] p-6">Memuat panel autentikasi...</div>}>
        <AuthPanel />
      </Suspense>
    </section>
  );
}
