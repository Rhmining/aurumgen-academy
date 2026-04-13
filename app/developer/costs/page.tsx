import { DeveloperShell } from "@/components/developer/developer-shell";

export default function DeveloperCostsPage() {
  const controls = [
    "Pisahkan model utama, evaluator, dan embedding supaya beban mahal tidak dipakai untuk semua tugas.",
    "Gunakan retrieval yang ketat dan chunk relevan agar konteks yang dikirim ke model tetap pendek.",
    "Audit log sekarang mencatat create/update/delete pada dokumen, materi, dan bank soal untuk investigasi biaya serta misuse.",
    "Rate limit dasar sudah aktif untuk AI-RUM, upload, dan ingestion; pertimbangkan store terdistribusi sebelum traffic besar."
  ];

  const preLaunchChecks = [
    "Bandingkan respons AI-RUM pada pertanyaan panjang vs singkat untuk melihat konsumsi token dan kualitas jawaban.",
    "Uji batch ingestion 10-20 dokumen agar terlihat apakah spike penggunaan model masih bisa diterima.",
    "Pantau log parser_failed dan ingestion_failed karena retry manual yang berulang sering jadi sumber biaya tersembunyi.",
    "Tambahkan monitoring eksternal segera setelah deploy supaya lonjakan error tidak berubah menjadi lonjakan biaya."
  ];

  return (
    <DeveloperShell title="Cost Control" description="Pantau biaya model, token, dan anomali penggunaan.">
      <section className="grid gap-4 md:grid-cols-2">
        <article className="surface rounded-[1.75rem] p-6">
          <p className="eyebrow">Guardrails</p>
          <h2 className="mt-2 font-display text-3xl">Kontrol biaya yang sudah ada</h2>
          <div className="mt-5 space-y-3 text-sm text-[rgb(var(--muted))]">
            {controls.map((item) => (
              <p key={item} className="rounded-2xl bg-black/5 px-4 py-3 dark:bg-white/5">
                {item}
              </p>
            ))}
          </div>
        </article>
        <article className="surface rounded-[1.75rem] p-6">
          <p className="eyebrow">Before launch</p>
          <h2 className="mt-2 font-display text-3xl">Checklist verifikasi biaya</h2>
          <div className="mt-5 space-y-3 text-sm text-[rgb(var(--muted))]">
            {preLaunchChecks.map((item) => (
              <p key={item} className="rounded-2xl bg-black/5 px-4 py-3 dark:bg-white/5">
                {item}
              </p>
            ))}
          </div>
        </article>
      </section>
    </DeveloperShell>
  );
}
