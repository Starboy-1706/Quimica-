import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware de protección de rutas — primera barrera.
 * ------------------------------------------------------------------
 * - Todo lo bajo `/admin` (salvo `/admin/login`) exige cookie de sesión.
 * - Un usuario con sesión que visita el login se redirige al panel.
 *
 * La verificación definitiva de la sesión (vigencia, revocación y
 * cuenta activa) ocurre en el servidor: `src/app/admin/(panel)/layout.tsx`
 * y en cada Server Action mediante los guardas de `src/lib/auth/session`.
 */
const SESSION_COOKIE = "docencia_session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(
    request.cookies.get(SESSION_COOKIE)?.value,
  );
  const isLoginRoute = pathname.startsWith("/admin/login");

  if (isLoginRoute && hasSessionCookie) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (!isLoginRoute && !hasSessionCookie) {
    const loginUrl = new URL("/admin/login", request.url);
    if (pathname !== "/admin") {
      loginUrl.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
