import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_SLUG } from "@/lib/access";

const PROTECTED = ["/gallery", "/upload", "/direction", "/account"];
const ACCESS_PREFIX = `/access/${ACCESS_SLUG}`;

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED.includes(pathname) || pathname.startsWith("/project/");
  const isAuthRoute = pathname === ACCESS_PREFIX || pathname === `${ACCESS_PREFIX}/signup`;

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = ACCESS_PREFIX;
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/gallery";
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/gallery";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|auth/callback|api|.*\\.).*)"],
};
