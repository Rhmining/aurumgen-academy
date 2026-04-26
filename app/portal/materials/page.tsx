import Link from "next/link";
import { PortalShell } from "@/components/portal/portal-shell";
import { StorageFileActions } from "@/components/data/storage-file-actions";
import { getPortalMaterialsData } from "@/lib/db/dashboard";

export default async function PortalMaterialsPage() {
  const data = await getPortalMaterialsData();

  return (
    <PortalShell
      title="Materials Library"
      description="Koleksi materi lintas pathway yang bisa diakses dari portal."
      sections={[
        { href: data.role === "parent" ? "/portal/parent" : "/portal/student", label: "Overview" },
        { href: "/portal/materials", label: "Materials" },
        { href: "/portal/curriculum", label: "Curriculum" },
        { href: "/portal/progress", label: "Progress" }
      ]}
    >
      <section className="grid gap-4 md:grid-cols-4">
        {data.bySubject.map((item) => (
          <article key={item.label} className="surface rounded-[1.75rem] p-6">
            <p className="text-sm text-[rgb(var(--muted))]">{item.label}</p>
            <p className="mt-4 font-display text-4xl">{item.value}</p>
            <p className="mt-3 text-sm text-[rgb(var(--muted))]">{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.featured.map((item) => (
          <article key={`${item.title}-${item.detail}`} className="surface rounded-[1.75rem] p-6">
            <h2 className="font-semibold">{item.title}</h2>
            <p className="mt-3 text-sm text-[rgb(var(--muted))]">{item.detail}</p>
            {item.description ? <p className="mt-3 text-sm text-[rgb(var(--muted))]">{item.description}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <StorageFileActions
                bucket="materials"
                path={item.storagePath}
                fileName={item.fileName}
                previewLabel="Buka materi"
                downloadLabel="Unduh"
              />
            </div>
            {!item.storagePath ? (
              <p className="mt-3 text-xs text-[rgb(var(--muted))]">
                Materi ini belum punya file terhubung. Gunakan ringkasan subject/pathway sebagai panduan diskusi sementara.
              </p>
            ) : null}
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <article className="surface rounded-[1.75rem] p-6">
          <p className="eyebrow">Cara memakai materials</p>
          <h2 className="mt-3 font-display text-3xl">Jangan hanya baca, ubah jadi sesi belajar</h2>
          <div className="mt-6 space-y-3">
            {[
              "Pilih satu materi yang paling baru, lalu catat konsep yang masih kabur.",
              "Setelah membaca, buka AI-RUM dan minta ringkasan atau latihan singkat dari topik itu.",
              "Kalau pathway dan subject-nya terasa berat, cek curriculum map untuk melihat konteks topiknya."
            ].map((tip) => (
              <div key={tip} className="rounded-[1.5rem] bg-black/5 px-5 py-4 text-sm dark:bg-white/5">
                {tip}
              </div>
            ))}
          </div>
        </article>

        <article className="surface rounded-[1.75rem] p-6">
          <p className="eyebrow">Langkah berikutnya</p>
          <h2 className="mt-3 font-display text-3xl">Masuk ke alur belajar yang nyambung</h2>
          <div className="mt-6 grid gap-3">
            {[
              {
                href: "/portal/progress",
                title: "Cek progress center",
                detail: "Pastikan materi yang Anda baca selaras dengan snapshot progres terbaru."
              },
              {
                href: "/portal/curriculum",
                title: "Buka curriculum map",
                detail: "Lihat apakah materi ini termasuk inti pathway atau penguatan tambahan."
              },
              {
                href: "/portal/student",
                title: "Tanya AI-RUM dari overview",
                detail: "Gunakan quick prompts untuk mengubah materi menjadi diskusi belajar yang lebih aktif."
              }
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="rounded-[1.5rem] border border-black/5 p-5 transition hover:border-black/10 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
              >
                <h3 className="font-semibold">{action.title}</h3>
                <p className="mt-2 text-sm text-[rgb(var(--muted))]">{action.detail}</p>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </PortalShell>
  );
}
