import Link from "next/link";
import { quickStats } from "@/lib/constants";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1.25fr_0.75fr]">
      <div className="space-y-8">
        <span className="eyebrow">AI-native academy platform</span>
        <div className="space-y-5">
          <h1 className="max-w-3xl font-display text-5xl leading-tight md:text-6xl">
            Belajar lebih terarah dengan <span className="text-gold">AI-RUM</span>, guru, dan dashboard keluarga dalam satu ekosistem.
          </h1>
          <p className="max-w-2xl text-lg text-[rgb(var(--muted))]">
            AURUMGEN Academy menyatukan pathway IGCSE, IB, dan kesiapan universitas dengan portal siswa,
            parent intelligence, teacher workflow, dan knowledge hub untuk AI internal.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/portal/student" className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-white">
            Masuk portal siswa
          </Link>
          <Link href="/teacher" className="rounded-full border border-black/10 px-6 py-3 text-sm font-medium">
            Buka dashboard guru
          </Link>
        </div>
      </div>

      <div className="surface rounded-[2rem] p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-[rgb(var(--muted))]">Snapshot hari ini</p>
            <h2 className="font-display text-3xl">Control tower belajar</h2>
          </div>
          <div className="rounded-2xl bg-gold/15 px-4 py-2 text-sm font-semibold text-gold">
            Live
          </div>
        </div>
        <div className="grid-cards">
          {quickStats.map((item) => (
            <div key={item.label} className="rounded-3xl border border-black/5 bg-white/60 p-5 dark:bg-white/5">
              <p className="text-sm text-[rgb(var(--muted))]">{item.label}</p>
              <p className="mt-3 font-display text-3xl">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
