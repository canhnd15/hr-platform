import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase isn't configured, we let public pages through (they use the
  // demo fallback) but block admin routes with a clear message.
  if (!url || !anonKey) {
    if (request.nextUrl.pathname.startsWith("/admin")) {
      const dest = request.nextUrl.clone();
      dest.pathname = "/setup-required";
      return NextResponse.redirect(dest);
    }
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdmin = pathname.startsWith("/admin");
  const isAuthRoute = pathname === "/login" || pathname === "/signup";

  if (isAdmin && !user) {
    const dest = request.nextUrl.clone();
    dest.pathname = "/login";
    dest.searchParams.set("next", pathname);
    return NextResponse.redirect(dest);
  }

  if (isAuthRoute && user) {
    const dest = request.nextUrl.clone();
    dest.pathname = "/admin";
    dest.search = "";
    return NextResponse.redirect(dest);
  }

  return response;
}

export const config = {
  matcher: [
    // Run on everything except static assets and the Next.js internals.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
