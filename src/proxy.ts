import { NextResponse, type NextRequest } from "next/server";
import { LOCALES, DEFAULT_LOCALE, type Locale } from "@/i18n/config";

// The bare domain sends each visitor once to their browser's language.
// Never by IP, and every page keeps a visible switcher.
export function proxy(request: NextRequest) {
  const header = request.headers.get("accept-language") ?? "";
  const wanted = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.slice(0, 2).toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q)
    .map((entry) => entry.lang)
    .find((lang): lang is Locale => (LOCALES as readonly string[]).includes(lang));

  return NextResponse.redirect(new URL(`/${wanted ?? DEFAULT_LOCALE}`, request.url), 307);
}

export const config = { matcher: "/" };
