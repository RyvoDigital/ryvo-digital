"use client";

import { usePathname } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import NotFoundView from "@/components/pages/NotFoundView";

// not-found receives no params: the language is the path's first segment.
export default function LangNotFound() {
  const first = usePathname()?.split("/")[1] ?? "";
  const lang: Locale = isLocale(first) ? first : "en";
  return (
    <>
      <title>{lang === "pt" ? "Página não encontrada · Ryvo Digital" : lang === "es" ? "Página no encontrada · Ryvo Digital" : "Page not found · Ryvo Digital"}</title>
      <NotFoundView lang={lang} />
    </>
  );
}
