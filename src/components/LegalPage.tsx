import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";

export const COMPANY = {
  name: "PEDRO SEIXAS VALE - CONSULTORIA, LDA",
  nipc: "513853847",
  address: "Rua Tomás da Fonseca, N 26, Edifício 3, 5º Esq, 1600-256 Lisboa, Portugal",
  email: "hello@ryvodigital.com",
};

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14">
      <h2
        className="font-display font-bold text-white text-xl md:text-2xl"
        style={{ letterSpacing: "-0.02em" }}
      >
        {title}
      </h2>
      <div className="mt-5 space-y-4 font-sans text-base text-white/60 [&_a]:text-white [&_a]:underline [&_a]:underline-offset-4 [&_li]:pl-1 [&_strong]:font-medium [&_strong]:text-white/85 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}

export default function LegalPage({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <main>
      {/* Fade behind the transparent fixed navbar so scrolling text doesn't collide with it */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-40 h-28 bg-gradient-to-b from-[#080808] via-[#080808]/90 to-transparent"
      />
      <Navbar linkPrefix="/" />
      <article className="mx-auto max-w-3xl px-8 pb-24 pt-40 md:pt-48" style={{ lineHeight: 1.7 }}>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
          Last updated · {lastUpdated}
        </p>
        <h1
          className="mt-6 font-display font-black text-white leading-none"
          style={{ fontSize: "clamp(40px, 6vw, 72px)", letterSpacing: "-0.02em" }}
        >
          {title}
        </h1>
        {children}
      </article>
      <FooterSection linkPrefix="/" />
    </main>
  );
}
