import { TeacherShell } from "@/components/teacher/teacher-shell";
import { createClient } from "@/lib/supabase/server";

export default async function TeacherUploadFlowPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const [allMaterials, filesUploaded, portalReady, stillPrivate, latestUploads] = user
    ? await Promise.all([
        supabase.from("materials").select("*", { count: "exact", head: true }).eq("owner_id", user.id),
        supabase
          .from("materials")
          .select("*", { count: "exact", head: true })
          .eq("owner_id", user.id)
          .not("storage_path", "is", null),
        supabase
          .from("materials")
          .select("*", { count: "exact", head: true })
          .eq("owner_id", user.id)
          .in("visibility", ["portal", "published"]),
        supabase
          .from("materials")
          .select("*", { count: "exact", head: true })
          .eq("owner_id", user.id)
          .eq("visibility", "private"),
        supabase
          .from("materials")
          .select("title, subject, pathway, visibility, file_name, storage_path, created_at")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5)
      ])
    : [
        { count: 0 },
        { count: 0 },
        { count: 0 },
        { count: 0 },
        { data: [] as Array<Record<string, string | null>> }
      ];

  return (
    <TeacherShell title="Upload Flow" description="Pantau alur upload materi dari guru menuju knowledge base dan portal.">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Total items",
            value: String(allMaterials.count ?? 0),
            detail: "Semua material milik Anda."
          },
          {
            title: "Sudah upload file",
            value: String(filesUploaded.count ?? 0),
            detail: "Material dengan storage_path terisi."
          },
          {
            title: "Siap portal",
            value: String(portalReady.count ?? 0),
            detail: "Visibility portal atau published."
          },
          {
            title: "Masih private",
            value: String(stillPrivate.count ?? 0),
            detail: "Butuh review sebelum dibuka ke siswa."
          }
        ].map((step) => (
          <article key={step.title} className="surface rounded-[1.75rem] p-6">
            <p className="text-sm text-[rgb(var(--muted))]">{step.title}</p>
            <h2 className="mt-4 font-display text-4xl">{step.value}</h2>
            <p className="mt-3 text-sm text-[rgb(var(--muted))]">{step.detail}</p>
          </article>
        ))}
      </section>

      <section className="surface rounded-[1.75rem] p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Recent uploads</p>
            <h2 className="mt-3 font-display text-3xl">Material terakhir yang Anda sentuh</h2>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {(latestUploads.data ?? []).length === 0 ? (
            <p className="text-sm text-[rgb(var(--muted))]">
              Belum ada material untuk ditampilkan. Mulai dari halaman materials untuk upload item pertama.
            </p>
          ) : (
            (latestUploads.data ?? []).map((item) => (
              <div
                key={`${item.title}-${item.created_at}`}
                className="rounded-[1.5rem] border border-black/5 p-5 dark:border-white/10"
              >
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-[rgb(var(--muted))]">
                  {item.subject} • {item.pathway} • {item.visibility}
                </p>
                <p className="mt-2 text-sm text-[rgb(var(--muted))]">
                  {item.file_name || item.storage_path || "Belum ada file terhubung"}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </TeacherShell>
  );
}
