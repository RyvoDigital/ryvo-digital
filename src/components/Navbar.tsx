"use client";

const navLinks = [
  { label: "Home", href: "#" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6">
      {/* Logo */}
      <span className="font-display font-bold text-white text-lg tracking-widest">
        RYVO
      </span>

      {/* Nav links */}
      <ul className="flex items-center gap-10 translate-x-8">
        {navLinks.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="font-sans text-sm text-white/60 hover:text-white transition-colors duration-300 tracking-wide"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a
        href="https://calendly.com/d/cvt3-7gk-kpd/discovery-call"
        target="_blank"
        rel="noopener noreferrer"
        className="font-sans text-sm font-medium px-5 py-2.5 rounded-full tracking-wide text-white/90 transition-all duration-300
          backdrop-blur-md bg-white/10 border border-white/20
          shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_24px_rgba(0,0,0,0.3)]
          hover:bg-white/15 hover:border-white/30 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_32px_rgba(0,0,0,0.4)]"
      >
        Get a website
      </a>
    </nav>
  );
}
