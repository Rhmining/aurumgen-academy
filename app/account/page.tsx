import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, created_at")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <section className="page-shell px-6 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <article className="surface rounded-[2rem] p-6 md:p-8">
          <p className="eyebrow">Account</p>
          <h1 className="mt-4 font-display text-4xl">Profil akun aktif</h1>
          <p className="mt-3 max-w-2xl text-sm text-[rgb(var(--muted))]">
            Halaman ini merangkum identitas akun yang sedang login. Ini juga menjadi titik masuk yang aman untuk
            pengembangan pengaturan profil berikutnya.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-black/5 p-5 dark:border-white/10">
              <p className="text-sm text-[rgb(var(--muted))]">Nama lengkap</p>
              <p className="mt-2 text-lg font-semibold">{profile?.full_name ?? "Belum diisi"}</p>
            </div>
            <div className="rounded-[1.5rem] border border-black/5 p-5 dark:border-white/10">
              <p className="text-sm text-[rgb(var(--muted))]">Email</p>
              <p className="mt-2 text-lg font-semibold">{user.email ?? "-"}</p>
            </div>
            <div className="rounded-[1.5rem] border border-black/5 p-5 dark:border-white/10">
              <p className="text-sm text-[rgb(var(--muted))]">Role</p>
              <p className="mt-2 text-lg font-semibold">{profile?.role ?? "student"}</p>
            </div>
            <div className="rounded-[1.5rem] border border-black/5 p-5 dark:border-white/10">
              <p className="text-sm text-[rgb(var(--muted))]">Akun dibuat</p>
              <p className="mt-2 text-lg font-semibold">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("id-ID") : "-"}
              </p>
            </div>
          </div>
        </article>

        <article className="surface rounded-[2rem] p-6 md:p-8">
          <h2 className="font-display text-3xl">Langkah berikutnya</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Link
              href="/login"
              className="rounded-[1.5rem] border border-black/5 p-5 transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
            >
              <h3 className="font-semibold">Ganti akun</h3>
              <p className="mt-2 text-sm text-[rgb(var(--muted))]">Gunakan logout dari sidebar lalu login kembali dengan role lain.</p>
            </Link>
            <div className="rounded-[1.5rem] border border-black/5 p-5 dark:border-white/10">
              <h3 className="font-semibold">Profile settings</h3>
              <p className="mt-2 text-sm text-[rgb(var(--muted))]">Edit profil lanjutan seperti avatar dan preferensi siap ditambahkan dari halaman ini berikutnya.</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
