"use client";

import { FormEvent, useMemo, useState } from "react";
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

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [role, setRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const destination = useMemo(
    () => nextTarget || getDefaultRouteForRole(role),
    [nextTarget, role]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    const supabase = createClient();

    try {
      if (mode === "signup") {
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

  return (
    <section className="surface rounded-[2rem] p-6 md:p-8">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`rounded-full px-4 py-2 text-sm ${mode === "signin" ? "bg-ink text-white" : "border border-black/10"}`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`rounded-full px-4 py-2 text-sm ${mode === "signup" ? "bg-ink text-white" : "border border-black/10"}`}
        >
          Daftar
        </button>
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

        <label className="block">
          <span className="mb-2 block text-sm font-medium">Password</span>
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-ink px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {isSubmitting ? "Memproses..." : mode === "signin" ? "Login" : "Buat akun"}
        </button>
      </form>

      <div className="mt-4 rounded-2xl bg-black/5 px-4 py-3 text-sm dark:bg-white/5">
        Tujuan setelah login: <span className="font-medium">{destination}</span>
      </div>

      {status || errorMessage ? (
        <p className="mt-4 text-sm text-coral">{status ?? "Akses role Anda tidak cocok dengan halaman tujuan."}</p>
      ) : null}
    </section>
  );
}
