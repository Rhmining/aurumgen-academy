"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { getDefaultRouteForRole } from "@/lib/auth/redirects";
import { parseUserRole } from "@/lib/auth/get-user-role";
import { hasUniversalAccess } from "@/lib/auth/universal-access";
import type { UserRole } from "@/lib/db/types";
import { buildAuthCallbackUrl, sanitizeRedirectPath } from "@/lib/site-url";

const roleOptions: Array<{ value: UserRole; label: string }> = [
  { value: "student", label: "Student" },
  { value: "parent", label: "Parent" },
  { value: "teacher", label: "Teacher" },
  { value: "aiadmin", label: "AI Admin" },
  { value: "developer", label: "Developer" }
];

export function AuthPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextTarget = sanitizeRedirectPath(searchParams.get("next"));
  const errorMessage = searchParams.get("error");
  const resetSuccess = searchParams.get("reset") === "success";

  const [mode, setMode] = useState<"signin" | "signup" | "recovery">("signin");
  const [role, setRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const destination = useMemo(
    () => nextTarget || getDefaultRouteForRole(role),
    [nextTarget, role]
  );

  useEffect(() => {
    const supabase = createClient();

    function checkRecoveryState() {
      if (typeof window === "undefined") return;
      const hash = window.location.hash;
      if (hash.includes("type=recovery")) {
        setMode("recovery");
        setStatus("Masukkan password baru Anda untuk menyelesaikan reset.");
      }
    }

    checkRecoveryState();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("recovery");
        setStatus("Masukkan password baru Anda untuk menyelesaikan reset.");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    const supabase = createClient();

    try {
      if (mode === "recovery") {
        if (password.length < 6) {
          throw new Error("Password baru minimal 6 karakter.");
        }

        if (password !== confirmPassword) {
          throw new Error("Konfirmasi password belum cocok.");
        }

        const { error } = await supabase.auth.updateUser({
          password
        });

        if (error) throw error;

        setStatus("Password baru berhasil disimpan. Silakan login dengan password tersebut.");
        setPassword("");
        setConfirmPassword("");
        setMode("signin");
        router.replace("/login?reset=success");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: buildAuthCallbackUrl(destination),
            data: {
              full_name: fullName,
              role
            }
          }
        });

        if (error) throw error;
        setStatus("Akun berhasil dibuat. Jika konfirmasi email aktif, cek inbox Anda lalu login.");
        setMode("signin");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();

        const resolvedRole = parseUserRole(
          typeof profile?.role === "string"
            ? profile.role
            : typeof data.user.user_metadata?.role === "string"
              ? data.user.user_metadata.role
              : role
        );

        const intendedRole = hasUniversalAccess(data.user.email) ? role : resolvedRole;

        router.push(sanitizeRedirectPath(nextTarget, getDefaultRouteForRole(intendedRole)));
        router.refresh();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Autentikasi gagal.";
      setStatus(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setStatus("Isi email dulu, lalu klik lupa password lagi.");
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login`
      });

      if (error) throw error;
      setStatus("Email reset password sudah dikirim. Buka inbox Anda lalu klik link yang masuk.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal mengirim email reset password.";
      setStatus(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="surface rounded-[2rem] p-6 md:p-8">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            setMode("signin");
            setStatus(null);
          }}
          className={`rounded-full px-4 py-2 text-sm ${mode === "signin" ? "bg-ink text-white" : "border border-black/10"}`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setStatus(null);
          }}
          className={`rounded-full px-4 py-2 text-sm ${mode === "signup" ? "bg-ink text-white" : "border border-black/10"}`}
        >
          Daftar
        </button>
        {mode === "recovery" ? (
          <span className="rounded-full bg-ink px-4 py-2 text-sm text-white">Reset password</span>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {mode === "signup" ? (
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Nama lengkap</span>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
              className="w-full rounded-2xl border border-black/10 bg-transparent px-4 py-3"
              placeholder="Nama Anda"
            />
          </label>
        ) : null}

        {mode !== "recovery" ? (
          <>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Role</span>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as UserRole)}
                className="w-full rounded-2xl border border-black/10 bg-transparent px-4 py-3"
              >
                {roleOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-2xl border border-black/10 bg-transparent px-4 py-3"
                placeholder="nama@email.com"
              />
            </label>
          </>
        ) : null}

        <label className="block">
          <span className="mb-2 block text-sm font-medium">
            {mode === "recovery" ? "Password baru" : "Password"}
          </span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            className="w-full rounded-2xl border border-black/10 bg-transparent px-4 py-3"
            placeholder="Minimal 6 karakter"
          />
        </label>

        {mode === "recovery" ? (
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Konfirmasi password baru</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={6}
              className="w-full rounded-2xl border border-black/10 bg-transparent px-4 py-3"
              placeholder="Ulangi password baru"
            />
          </label>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-ink px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {isSubmitting
            ? "Memproses..."
            : mode === "signin"
              ? "Login"
              : mode === "signup"
                ? "Buat akun"
                : "Simpan password baru"}
        </button>
      </form>

      {mode !== "recovery" ? (
        <div className="mt-4 rounded-2xl bg-black/5 px-4 py-3 text-sm dark:bg-white/5">
          Tujuan setelah login: <span className="font-medium">{destination}</span>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl bg-black/5 px-4 py-3 text-sm dark:bg-white/5">
          Halaman ini sekarang sedang berada di mode recovery. Setelah password baru tersimpan, Anda bisa login normal lagi.
        </div>
      )}

      {mode === "signin" ? (
        <button
          type="button"
          onClick={handleForgotPassword}
          disabled={isSubmitting}
          className="mt-4 text-sm font-medium text-[rgb(var(--foreground))] underline-offset-4 hover:underline disabled:opacity-60"
        >
          Lupa password?
        </button>
      ) : null}

      {status || errorMessage || resetSuccess ? (
        <p className="mt-4 text-sm text-coral">
          {status ?? (resetSuccess ? "Password berhasil direset. Silakan login dengan password baru." : "Akses role Anda tidak cocok dengan halaman tujuan.")}
        </p>
      ) : null}
    </section>
  );
}
