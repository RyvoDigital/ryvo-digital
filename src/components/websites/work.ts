import type { FolderFile, FolderImage } from "@/components/ui/glass-folder-cards";

// Selected work: the two live client sites. Every picture is a real screenshot
// of the live site (Playwright, 1440 × 900 at 2x, 19 Oct 2026), and every file
// opens that page on the live site. Page names are the sites' own (Spanish).
// The words around them live in src/i18n/pages.ts (websites.work).

const shot = (name: string, w = 1600, h = 1000): FolderImage => ({
  avif: `/media/websites/${name}-v1-800.avif 800w, /media/websites/${name}-v1-1600.avif 1600w`,
  webp: `/media/websites/${name}-v1-800.webp 800w, /media/websites/${name}-v1-1600.webp 1600w`,
  src: `/media/websites/${name}-v1-800.webp`,
  width: w,
  height: h,
});

export type Case = {
  id: string;
  name: string;
  host: string;
  url: string;
  hero: FolderImage;
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
    files: [
      { name: "Inicio", meta: "/", image: shot("his-home"), href: H + "/", external: true },
      { name: "Classic", meta: "/clasica", image: shot("his-classic"), href: H + "/clasica", external: true },
      { name: "Urban", meta: "/urban", image: shot("his-urban"), href: H + "/urban", external: true },
      { name: "Nosotros", meta: "/#filosofia", image: shot("his-nosotros"), href: H + "/#filosofia", external: true },
    ],
  },
];
