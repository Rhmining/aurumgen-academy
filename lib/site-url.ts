const LOCALHOST_URL = "http://localhost:3000";

export function sanitizeRedirectPath(value: string | null | undefined, fallback = "/") {
  if (!value) return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//")) return fallback;
  return value;
}

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configuredUrl) {
    if (typeof window !== "undefined" && window.location.origin) {
      return window.location.origin;
    }

    return LOCALHOST_URL;
  }

  return configuredUrl.endsWith("/") ? configuredUrl.slice(0, -1) : configuredUrl;
}

export function buildAuthCallbackUrl(nextPath?: string | null) {
  const url = new URL("/api/auth/callback", getSiteUrl());
  const safeNextPath = sanitizeRedirectPath(nextPath, "");

  if (safeNextPath) {
    url.searchParams.set("next", safeNextPath);
  }

  return url.toString();
}
