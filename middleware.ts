import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_COOKIE,
  localeFromAcceptLanguage,
  PRIVACY_PATHS,
} from "./src/i18n/config";

/** `/` -> `/fr` or `/en` by cookie, then Accept-Language, then French (SPEC §4). */
function redirectToLocale(request: NextRequest): NextResponse {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale)
    ? cookieLocale
    : (localeFromAcceptLanguage(request.headers.get("accept-language")) ?? DEFAULT_LOCALE);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}`;
  return NextResponse.redirect(url, 307);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/") return redirectToLocale(request);

  // French privacy slug is canonical; the route folder is `privacy`.
  if (pathname === PRIVACY_PATHS.fr) {
    const url = request.nextUrl.clone();
    url.pathname = "/fr/privacy";
    return NextResponse.rewrite(url);
  }
  if (pathname === "/fr/privacy" || pathname === "/en/confidentialite") {
    const url = request.nextUrl.clone();
    url.pathname = pathname.startsWith("/fr") ? PRIVACY_PATHS.fr : PRIVACY_PATHS.en;
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/fr/:path*", "/en/:path*"],
};
