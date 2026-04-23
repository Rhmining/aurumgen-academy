import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountSettingsForm } from "@/components/account/account-settings-form";
import { createClient } from "@/lib/supabase/server";
import { getDefaultRouteForRole } from "@/lib/auth/redirects";
import { getWorkspaceConfig } from "@/lib/account/workspace-links";
import { parseUserRole } from "@/lib/auth/get-user-role";
import { hasUniversalAccess } from "@/lib/auth/universal-access";
import { defaultRouteByRole } from "@/lib/auth/redirects";

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

  const role = parseUserRole(
    typeof profile?.role === "string"
      ? profile.role
      : typeof user.user_metadata?.role === "string"
        ? user.user_metadata.role
        : "student"
  );

  const workspace = getWorkspaceConfig(role);
  const dashboardHref = getDefaultRouteForRole(role);
  const universalAccess = hasUniversalAccess(user.email);

  const { data: recentLogs } = await supabase
    .from("operational_activity_logs")
    .select("action, entity_type, entity_id, created_at")
    .eq("actor_id", user.id)
    .order("created_at", { ascending: false })
    .limit(4);

  return (
    <section className="page-shell px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <article className="surface rounded-[2rem] p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Account</p>
              <h1 className="mt-4 font-display text-4xl">Akun {role} yang lebih fungsional</h1>
              <p className="mt-3 max-w-2xl text-sm text-[rgb(var(--muted))]">
                Halaman ini sekarang menjadi home base akun untuk semua role. Dari sini Anda bisa mengubah profil,
                kembali ke workspace utama, dan membaca aktivitas akun terbaru.
              </p>
            </div>
            <Link
              href={dashboardHref}
              className="rounded-full border border-black/10 px-5 py-3 text-sm font-medium transition hover:bg-black/5"
            >
              Kembali ke dashboard
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-black/5 p-5 dark:border-white/10">
              <p className="text-sm text-[rgb(var(--muted))]">Nama lengkap</p>
              <p className="mt-2 text-lg font-semibold">{profile?.full_name ?? "Belum diisi"}</p>
            </div>
            <div className="rounded-[1.5rem] border border-black/5 p-5 dark:border-white/10">
              <p className="text-sm text-[rgb(var(--muted))]">Email</p>
              <p className="mt-2 text-lg font-semibold">{user.email ?? "-"}</p>
            </div>
            <div className="rounded-[1.5rem] border border-black/5 p-5 dark:border-white/10">
              <p className="text-sm text-[rgb(var(--muted))]">{universalAccess ? "Akses" : "Akun dibuat"}</p>
              <p className="mt-2 text-lg font-semibold">
                {universalAccess
                  ? "Semua role aktif"
                  : profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString("id-ID")
                    : "-"}
              </p>
            </div>
          </div>
        </article>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <AccountSettingsForm
            initialFullName={profile?.full_name ?? ""}
            email={user.email ?? "-"}
            role={role}
          />

          <div className="space-y-6">
            <article className="surface rounded-[2rem] p-6 md:p-8">
              <p className="eyebrow">{universalAccess ? "All workspaces" : workspace.heading}</p>
              <h2 className="mt-4 font-display text-3xl">
                {universalAccess ? "Pilih dashboard role yang ingin dibuka" : "Shortcut yang relevan untuk role Anda"}
              </h2>
              <div className="mt-6 grid gap-3">
                {(universalAccess
                  ? Object.entries(defaultRouteByRole).map(([roleKey, href]) => ({
                      href,
                      title: `Masuk sebagai ${roleKey}`,
                      detail: `Buka dashboard ${roleKey} dengan akun universal access yang sama.`
                    }))
                  : workspace.links
                ).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-[1.5rem] border border-black/5 p-5 transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
                  >
                    <h3 className="font-semibold">{link.title}</h3>
                    <p className="mt-2 text-sm text-[rgb(var(--muted))]">{link.detail}</p>
                  </Link>
                ))}
              </div>
            </article>

            <article className="surface rounded-[2rem] p-6 md:p-8">
              <p className="eyebrow">Recent activity</p>
              <h2 className="mt-4 font-display text-3xl">Jejak aktivitas akun</h2>
              <div className="mt-6 space-y-3">
                {(recentLogs ?? []).length ? (
                  recentLogs?.map((log) => (
                    <div key={`${log.action}-${log.created_at}`} className="rounded-[1.5rem] bg-black/5 p-5 text-sm dark:bg-white/5">
                      <p className="font-semibold">{log.action}</p>
                      <p className="mt-2 text-[rgb(var(--muted))]">
                        {log.entity_type} • {log.entity_id}
                      </p>
                      <p className="mt-2 text-[rgb(var(--muted))]">
                        {new Date(log.created_at).toLocaleString("id-ID")}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.5rem] bg-black/5 p-5 text-sm text-[rgb(var(--muted))] dark:bg-white/5">
                    Belum ada aktivitas tercatat untuk akun ini. Begitu Anda mulai memakai workspace, log terbaru akan muncul di sini.
                  </div>
                )}
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
