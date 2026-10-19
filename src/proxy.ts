import { NextResponse, type NextRequest } from "next/server";
import { LOCALES, DEFAULT_LOCALE, type Locale } from "@/i18n/config";

// The visitor's language, once, from the browser's Accept-Language (never by
// IP; every page keeps a visible switcher), defaulting to English.
function language(request: NextRequest): Locale {
  const header = request.headers.get("accept-language") ?? "";
  return header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.slice(0, 2).toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q)
    .map((entry) => entry.lang)
    .find((lang): lang is Locale => (LOCALES as readonly string[]).includes(lang)) ?? DEFAULT_LOCALE;
}

// The old single-language legal pages (the live site's /privacy-policy and
// /terms-of-service, which Meta's business verification points at), with or
// without a trailing slash: permanently to the visitor's language version.
const LEGAL = new Set(["/privacy-policy", "/terms-of-service"]);

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname.replace(/\/+$/, "") || "/";
  const lang = language(request);
  if (LEGAL.has(path)) return NextResponse.redirect(new URL(`/${lang}${path}`, request.url), 308);
  // The bare domain: each visitor to their browser's language.
  return NextResponse.redirect(new URL(`/${lang}`, request.url), 307);
}

export const config = { matcher: ["/", "/privacy-policy", "/privacy-policy/", "/terms-of-service", "/terms-of-service/"] };
