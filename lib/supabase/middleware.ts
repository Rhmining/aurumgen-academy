import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getDefaultRouteForRole } from "@/lib/auth/redirects";
import { resolveUserRole } from "@/lib/auth/resolve-role";
import { protectedRouteGroups } from "@/lib/auth/route-guards";
import { hasUniversalAccess } from "@/lib/auth/universal-access";
import type { UserRole } from "@/lib/db/types";

type CookieWrite = {
  name: string;
  value: string;
  options: Record<string, unknown>;
};

function findAllowedRoles(pathname: string): UserRole[] | null {
  const matches = Object.entries(protectedRouteGroups)
    .filter(([prefix]) => pathname.startsWith(prefix))
    .sort((left, right) => right[0].length - left[0].length);

  return matches[0]?.[1] ?? null;
}

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "public-anon-key",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieWrite[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as never)
          );
        }
      }
    }
  );

  const allowedRoles = findAllowedRoles(request.nextUrl.pathname);
  if (!allowedRoles) {
    return response;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasUniversalAccess(user.email)) {
    return response;
  }

  const role = await resolveUserRole(supabase, user);

  if (!allowedRoles.includes(role)) {
    return NextResponse.redirect(new URL(getDefaultRouteForRole(role), request.url));
  }

  return response;
}
