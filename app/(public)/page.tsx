import { AirumPanel } from "@/components/airum/airum-panel";
import { Hero } from "@/components/public/hero";
import { IbCard } from "@/components/public/ib-card";
import { IgcseCard } from "@/components/public/igcse-card";
import { publicMetrics } from "@/lib/db/queries";

export default function HomePage() {
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
      <section className="mx-auto max-w-7xl px-6 py-8 pb-20">
        <AirumPanel />
      </section>
    </>
  );
}
