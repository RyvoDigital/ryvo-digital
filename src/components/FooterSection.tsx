import { Footer } from "@/components/ui/footer";

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

// linkPrefix lets pages other than the homepage point section anchors back at "/"
export default function FooterSection({ linkPrefix = "" }: { linkPrefix?: string }) {
  return (
    <div className="bg-[#080808] border-t border-white/10">
      <Footer
        logo={
          <span
            className="font-display font-black text-white tracking-tight"
            style={{ fontSize: "1.25rem", letterSpacing: "-0.02em" }}
          >
            RYVO
          </span>
        }
        brandName=""
        socialLinks={[
          {
            icon: <LinkedInIcon />,
            href: "https://linkedin.com/company/ryvodigital",
            label: "LinkedIn",
          },
        ]}
        mainLinks={[
          { href: `${linkPrefix}#`, label: "Home" },
          { href: `${linkPrefix}#services`, label: "Services" },
          { href: `${linkPrefix}#about`, label: "About" },
          { href: "mailto:hello@ryvodigital.com", label: "hello@ryvodigital.com" },
        ]}
        legalLinks={[
          { href: "/privacy-policy", label: "Privacy Policy" },
          { href: "/terms-of-service", label: "Terms of Service" },
        ]}
        copyright={{
          text: "© 2026 Ryvo Digital",
          legalEntity:
            "Ryvo Digital is a brand of PEDRO SEIXAS VALE - CONSULTORIA, LDA · NIPC 513853847 · Rua Tomás da Fonseca, N 26, Edifício 3, 5º Esq, 1600-256 Lisboa, Portugal",
          license: "All rights reserved.",
        }}
      />
    </div>
  );
}
