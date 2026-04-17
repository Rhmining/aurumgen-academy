import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDefaultRouteForRole } from "@/lib/auth/redirects";
import { resolveUserRole } from "@/lib/auth/resolve-role";
import { sanitizeRedirectPath } from "@/lib/site-url";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = sanitizeRedirectPath(requestUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);

    const {
      data: { user }
    } = await supabase.auth.getUser();

    const role = await resolveUserRole(supabase, user);

    return NextResponse.redirect(new URL(next || getDefaultRouteForRole(role), request.url));
  }

  return NextResponse.redirect(new URL("/login", request.url));
}
