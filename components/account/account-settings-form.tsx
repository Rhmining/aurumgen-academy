"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import type { UserRole } from "@/lib/db/types";

function formatRole(role: UserRole) {
  if (role === "aiadmin") return "AI Admin";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function AccountSettingsForm({
  initialFullName,
  email,
  role
}: {
  initialFullName: string;
  email: string;
  role: UserRole;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialFullName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus(null);

    try {
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Sesi login Anda sudah berakhir. Silakan login kembali.");
      }

      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName.trim() })
        .eq("id", user.id);

      if (error) throw error;

      setStatus("Profil berhasil diperbarui.");
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Gagal memperbarui profil.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setChangingPassword(true);
    setStatus(null);

    try {
      if (newPassword.length < 6) {
        throw new Error("Password baru minimal 6 karakter.");
      }

      if (newPassword !== confirmNewPassword) {
        throw new Error("Konfirmasi password baru belum cocok.");
      }

      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user?.email) {
        throw new Error("Sesi login Anda sudah berakhir. Silakan login kembali.");
      }

      if (currentPassword) {
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword
        });

        if (verifyError) {
          throw new Error("Password saat ini tidak cocok.");
        }
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setStatus("Password berhasil diperbarui.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Gagal memperbarui password.");
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <article className="surface rounded-[2rem] p-6 md:p-8">
      <p className="eyebrow">Profile settings</p>
      <h2 className="mt-4 font-display text-3xl">Kelola akun aktif</h2>
      <p className="mt-3 max-w-2xl text-sm text-[rgb(var(--muted))]">
        Setelan ini dipakai lintas role. Anda bisa memperbarui identitas dasar akun tanpa meninggalkan workspace.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Nama lengkap</span>
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="w-full rounded-2xl border border-black/10 bg-transparent px-4 py-3"
            placeholder="Nama lengkap Anda"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.5rem] border border-black/5 p-5 dark:border-white/10">
            <p className="text-sm text-[rgb(var(--muted))]">Email</p>
            <p className="mt-2 text-lg font-semibold">{email}</p>
          </div>
          <div className="rounded-[1.5rem] border border-black/5 p-5 dark:border-white/10">
            <p className="text-sm text-[rgb(var(--muted))]">Role aktif</p>
            <p className="mt-2 text-lg font-semibold">{formatRole(role)}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2 md:flex-row">
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-ink px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan perubahan"}
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium transition hover:bg-black/5 disabled:opacity-60"
          >
            {signingOut ? "Keluar..." : "Logout"}
          </button>
        </div>
      </form>

      <div className="mt-8 border-t border-black/5 pt-8 dark:border-white/10">
        <h3 className="font-display text-2xl">Ganti password</h3>
        <p className="mt-3 max-w-2xl text-sm text-[rgb(var(--muted))]">
          Setelah login, Anda bisa mengubah password langsung dari sini. Isi password saat ini untuk verifikasi, lalu
          masukkan password baru.
        </p>

        <form onSubmit={handlePasswordChange} className="mt-6 grid gap-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Password saat ini</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-transparent px-4 py-3"
              placeholder="Isi password saat ini"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Password baru</span>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                minLength={6}
                className="w-full rounded-2xl border border-black/10 bg-transparent px-4 py-3"
                placeholder="Minimal 6 karakter"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">Konfirmasi password baru</span>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(event) => setConfirmNewPassword(event.target.value)}
                minLength={6}
                className="w-full rounded-2xl border border-black/10 bg-transparent px-4 py-3"
                placeholder="Ulangi password baru"
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 pt-2 md:flex-row">
            <button
              type="submit"
              disabled={changingPassword}
              className="rounded-2xl bg-ink px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {changingPassword ? "Menyimpan..." : "Update password"}
            </button>
          </div>
        </form>
      </div>

      {status ? <p className="mt-4 text-sm text-coral">{status}</p> : null}
    </article>
  );
}
