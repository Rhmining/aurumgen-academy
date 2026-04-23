import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AirumPanel } from "@/components/airum/airum-panel";
import { Hero } from "@/components/public/hero";
import { IbCard } from "@/components/public/ib-card";
import { IgcseCard } from "@/components/public/igcse-card";
import { getDefaultRouteForRole } from "@/lib/auth/redirects";
import { getCurrentUserRole } from "@/lib/auth/get-current-user-role";
import { hasUniversalAccess } from "@/lib/auth/universal-access";
import { publicMetrics } from "@/lib/db/queries";
import { buildMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = buildMetadata({
  description: "AURUMGEN Academy membantu keluarga dan guru menjalankan jalur IGCSE, IB, dan university readiness dengan portal terintegrasi dan AI-RUM.",
  path: "/"
});

const trustSignals = [
  {
    title: "Untuk siswa",
    detail: "Target mingguan, drill, dan penjelasan konsep bisa dilihat dari portal yang sama dengan feedback AI-RUM."
  },
  {
    title: "Untuk orang tua",
    detail: "Ringkasan progres, fokus intervensi, dan ritme belajar dibuat lebih mudah dibaca tanpa harus menunggu laporan manual."
  },
  {
    title: "Untuk guru dan tim internal",
    detail: "Materi, bank soal, knowledge ingestion, dan audit operasional berada dalam satu workflow yang konsisten."
  }
];

const operatingModel = [
  "Assessment kebutuhan dan jalur akademik utama.",
  "Pemetaan ritme belajar yang cocok untuk siswa dan keluarga.",
  "Pelaksanaan pembelajaran dengan dukungan guru, materi, dan AI-RUM.",
  "Review progres dan penyesuaian intervensi secara berkala."
];

const faqItems = [
  {
    question: "Apakah AURUMGEN hanya untuk siswa sekolah internasional?",
    answer: "Fokus utama platform memang kuat di IGCSE, IB, dan university readiness, tetapi struktur pendampingannya juga cocok untuk siswa yang butuh ritme belajar lebih rapi dan komunikasi keluarga yang lebih jelas."
  },
  {
    question: "Apakah orang tua juga mendapat akses?",
    answer: "Ya. AURUMGEN dirancang sebagai sistem multi-role sehingga siswa, orang tua, dan guru bisa membaca konteks progres dari sudut pandang yang sesuai."
  },
  {
    question: "Apa fungsi AI-RUM di dalam platform?",
    answer: "AI-RUM membantu penjelasan konsep, quick drill, ringkasan progres, dan dukungan operasional berbasis knowledge base yang dipantau tim internal."
  }
];

export default async function HomePage() {
  const currentRole = await getCurrentUserRole();
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (currentRole) {
    if (hasUniversalAccess(user?.email)) {
      redirect("/account");
    }
    redirect(getDefaultRouteForRole(currentRole));
  }

  return (
    <>
      <Hero />
      <section className="mx-auto max-w-7xl px-6 pb-8">
        <div className="grid gap-4 md:grid-cols-3">
          {publicMetrics.map((metric) => (
            <article key={metric.label} className="surface rounded-[1.75rem] p-6">
              <p className="text-sm text-[rgb(var(--muted))]">{metric.label}</p>
              <p className="mt-4 font-display text-4xl">{metric.value}</p>
              <p className="mt-3 text-sm text-[rgb(var(--muted))]">{metric.detail}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-4 px-6 py-8 md:grid-cols-2">
        <IgcseCard />
        <IbCard />
      </section>
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-4 lg:grid-cols-3">
          {trustSignals.map((signal) => (
            <article key={signal.title} className="surface rounded-[1.75rem] p-6">
              <p className="eyebrow">{signal.title}</p>
              <p className="mt-4 text-[rgb(var(--muted))]">{signal.detail}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-4 px-6 py-8 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="surface rounded-[2rem] p-6 md:p-8">
          <span className="eyebrow">Cara kerja</span>
          <h2 className="mt-5 font-display text-4xl">Pendampingan yang bergerak dari diagnosis ke intervensi.</h2>
          <div className="mt-8 grid gap-4">
            {operatingModel.map((item, index) => (
              <div key={item} className="rounded-[1.5rem] border border-black/10 p-5">
                <p className="text-sm text-[rgb(var(--muted))]">Tahap {index + 1}</p>
                <p className="mt-2 text-lg">{item}</p>
              </div>
            ))}
          </div>
        </article>
        <article className="surface rounded-[2rem] p-6 md:p-8">
          <span className="eyebrow">Kenapa ini penting</span>
          <h2 className="mt-5 font-display text-4xl">Bukan sekadar tutor, tetapi sistem koordinasi belajar.</h2>
          <p className="mt-5 text-[rgb(var(--muted))]">
            Banyak keluarga kesulitan bukan hanya karena materi sulit, tetapi karena ritme belajar, ekspektasi, dan tindak lanjut tidak sinkron.
            AURUMGEN dibangun untuk menyatukan pembelajaran, pelaporan, dan bantuan AI dalam satu pengalaman yang lebih tenang dan terukur.
          </p>
          <div className="mt-8 rounded-[1.75rem] bg-black/5 p-5 dark:bg-white/5">
            <p className="text-sm font-semibold">Cocok untuk keluarga yang membutuhkan:</p>
            <div className="mt-4 space-y-3 text-sm text-[rgb(var(--muted))]">
              <p>Struktur belajar yang lebih rapi untuk jalur IGCSE atau IB.</p>
              <p>Komunikasi lintas siswa, orang tua, dan guru yang lebih konsisten.</p>
              <p>Dukungan AI yang tidak terlepas dari konteks materi dan operasional akademik.</p>
            </div>
          </div>
        </article>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-8 pb-20">
        <AirumPanel />
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="surface rounded-[2rem] p-6 md:p-8">
            <span className="eyebrow">FAQ</span>
            <div className="mt-6 space-y-4">
              {faqItems.map((item) => (
                <div key={item.question} className="rounded-[1.5rem] border border-black/10 p-5">
                  <h3 className="font-semibold">{item.question}</h3>
                  <p className="mt-3 text-sm text-[rgb(var(--muted))]">{item.answer}</p>
                </div>
              ))}
            </div>
          </article>
          <article className="surface rounded-[2rem] p-6 md:p-8">
            <span className="eyebrow">Langkah berikutnya</span>
            <h2 className="mt-5 font-display text-4xl">Mulai dari portal, lalu sesuaikan jalur yang paling relevan.</h2>
            <p className="mt-5 text-[rgb(var(--muted))]">
              Untuk saat ini, pintu masuk terbaik adalah membuat akun atau login ke platform. Dari sana, tim dapat mengarahkan pengalaman sesuai peran,
              kebutuhan siswa, dan fokus akademik yang sedang dijalani.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="/login" className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-white">
                Buka login / registrasi
              </a>
              <a href="/contact" className="rounded-full border border-black/10 px-6 py-3 text-sm font-medium">
                Lihat alur konsultasi
              </a>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
