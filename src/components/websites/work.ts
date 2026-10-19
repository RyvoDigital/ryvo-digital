import type { FolderFile, FolderImage } from "@/components/ui/glass-folder-cards";
import type { Locale } from "@/i18n/config";

// Selected work: the two live client sites. Every picture is a real screenshot
// of the live site (Playwright, 1440 × 900 at 2x, 19 Oct 2026), and every file
// opens that page on the live site. Page names are the sites' own (Spanish).

const shot = (name: string, w = 1600, h = 1000): FolderImage => ({
  avif: `/media/websites/${name}-v1-800.avif 800w, /media/websites/${name}-v1-1600.avif 1600w`,
  webp: `/media/websites/${name}-v1-800.webp 800w, /media/websites/${name}-v1-1600.webp 1600w`,
  src: `/media/websites/${name}-v1-800.webp`,
  width: w,
  height: h,
});

export const phoneShot = (name: string): FolderImage => ({
  avif: `/media/websites/${name}-v1-390.avif 390w, /media/websites/${name}-v1-780.avif 780w`,
  webp: `/media/websites/${name}-v1-390.webp 390w, /media/websites/${name}-v1-780.webp 780w`,
  src: `/media/websites/${name}-v1-390.webp`,
  width: 780,
  height: 1688,
});

export type Case = {
  id: string;
  name: string;
  host: string;
  url: string;
  hero: FolderImage;
  phone: FolderImage;
  files: FolderFile[];
};

const S = "https://www.sastreriamanuelfernandez.com";
const H = "https://www.hisbarberia.com";

export const CASES: Case[] = [
  {
    id: "sastreria",
    name: "Sastrería Manuel Fernández",
    host: "sastreriamanuelfernandez.com",
    url: S,
    hero: shot("sastreria-home"),
    phone: phoneShot("sastreria-home-phone"),
    files: [
      { name: "La Sastrería", meta: "/la-sastreria", image: shot("sastreria-la-sastreria"), href: S + "/la-sastreria", external: true },
      { name: "Bodas y Ceremonia", meta: "/bodas", image: shot("sastreria-bodas"), href: S + "/bodas-y-ceremonia", external: true },
      { name: "Servicios", meta: "/servicios", image: shot("sastreria-servicios"), href: S + "/servicios", external: true },
      { name: "Curso Artesanal", meta: "/cursos", image: shot("sastreria-curso"), href: S + "/cursos", external: true },
    ],
  },
  {
    id: "his",
    name: "HIS Barbería",
    host: "hisbarberia.com",
    url: H,
    hero: shot("his-home"),
    phone: phoneShot("his-home-phone"),
    files: [
      { name: "Inicio", meta: "/", image: shot("his-home"), href: H + "/", external: true },
      { name: "Classic", meta: "/clasica", image: shot("his-classic"), href: H + "/clasica", external: true },
      { name: "Urban", meta: "/urban", image: shot("his-urban"), href: H + "/urban", external: true },
      { name: "Nosotros", meta: "/#filosofia", image: shot("his-nosotros"), href: H + "/#filosofia", external: true },
    ],
  },
];

// New labels for this section (round 1: for Manuel's approval; they move to
// src/i18n/pages.ts in round 2). Only what the sites themselves state.
// `did` is Manuel's own example line and must be confirmed per client.
export const WORK_COPY: Record<Locale, {
  label: string;
  title: [string, string];
  sub: string;
  did: string;
  visit: string;
  pages: string;
  hint: string;
  lines: Record<string, string>;
  words: { open: string; close: string; items: (n: number) => string; newTab: string };
}> = {
  en: {
    label: "SELECTED WORK",
    title: ["Two live sites.", "Open the folders."],
    sub: "Real pages from real clients, live today. Choose one to open it on the client's own site.",
    did: "Design · Development · Maintenance",
    visit: "Visit the live site",
    pages: "Pages",
    hint: "Open the folder · choose a page",
    lines: {
      sastreria: "A bespoke tailor in Madrid.",
      his: "A barbershop in Madrid, in two spaces: Classic and Urban.",
    },
    words: { open: "Open", close: "Close", items: (n) => n + (n === 1 ? " page" : " pages"), newTab: "opens in a new tab" },
  },
  pt: {
    label: "TRABALHO SELECIONADO",
    title: ["Dois sites no ar.", "Abra as pastas."],
    sub: "Páginas reais de clientes reais, no ar hoje. Escolha uma para a abrir no site do próprio cliente.",
    did: "Design · Desenvolvimento · Manutenção",
    visit: "Ver o site",
    pages: "Páginas",
    hint: "Abra a pasta · escolha uma página",
    lines: {
      sastreria: "Uma alfaiataria por medida em Madrid.",
      his: "Uma barbearia em Madrid, em dois espaços: Classic e Urban.",
    },
    words: { open: "Abrir", close: "Fechar", items: (n) => n + (n === 1 ? " página" : " páginas"), newTab: "abre num novo separador" },
  },
  es: {
    label: "TRABAJO SELECCIONADO",
    title: ["Dos webs en línea.", "Abre las carpetas."],
    sub: "Páginas reales de clientes reales, en línea hoy. Elige una para abrirla en la web del propio cliente.",
    did: "Diseño · Desarrollo · Mantenimiento",
    visit: "Ver la web",
    pages: "Páginas",
    hint: "Abre la carpeta · elige una página",
    lines: {
      sastreria: "Una sastrería a medida en Madrid.",
      his: "Una barbería en Madrid, en dos espacios: Classic y Urban.",
    },
    words: { open: "Abrir", close: "Cerrar", items: (n) => n + (n === 1 ? " página" : " páginas"), newTab: "se abre en una pestaña nueva" },
  },
};
