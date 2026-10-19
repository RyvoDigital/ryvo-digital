import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LegalPage, { COMPANY, LegalSection } from "@/components/legal/LegalPage";
import { isLocale } from "@/i18n/config";

export const metadata: Metadata = {
  title: "Terms of Service — Ryvo Digital",
  description: "The terms that apply to the Ryvo Digital website and services.",
};

export default async function TermsOfServicePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <LegalPage lang={lang} path="/terms-of-service" title="Terms of Service" lastUpdated="22 September 2026">
      <LegalSection title="1. About us">
        <p>
          This website, ryvodigital.com, is operated by Ryvo Digital, a brand of {COMPANY.name},
          NIPC {COMPANY.nipc}, with registered address at {COMPANY.address}. You can contact us
          at <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
        </p>
        <p>
          By using this website you agree to these Terms of Service. If you do not agree,
          please do not use the website.
        </p>
      </LegalSection>

      <LegalSection title="2. Use of the website">
        <p>
          You may use this website for lawful purposes only. You must not attempt to disrupt
          it, gain unauthorised access to it, or use it in any way that could harm Ryvo
          Digital or other users.
        </p>
      </LegalSection>

      <LegalSection title="3. Our services">
        <p>
          The information on this website describes the services we offer and does not
          constitute a binding offer. Every project is governed by a separate written proposal
          or agreement, which sets out the scope, timeline, fees and payment terms. If that
          agreement conflicts with these Terms, the agreement prevails.
        </p>
      </LegalSection>

      <LegalSection title="4. Intellectual property">
        <p>
          All content on this website — including text, design, graphics, animations, logos
          and code — belongs to Ryvo Digital or its licensors and is protected by
          intellectual property laws. You may not copy, reproduce or reuse it without our
          prior written permission.
        </p>
        <p>
          Ownership of work created for clients is defined in each project agreement.
        </p>
      </LegalSection>

      <LegalSection title="5. Third-party links">
        <p>
          This website links to third-party services such as Calendly and LinkedIn. We are
          not responsible for the content, availability or privacy practices of those
          services.
        </p>
      </LegalSection>

      <LegalSection title="6. Liability">
        <p>
          We make reasonable efforts to keep this website accurate and available, but it is
          provided &ldquo;as is&rdquo;, without warranties of any kind. To the extent permitted
          by law, Ryvo Digital is not liable for any indirect or consequential loss arising
          from your use of the website. Nothing in these Terms limits liability that cannot be
          limited under applicable law, including your statutory rights as a consumer.
        </p>
      </LegalSection>

      <LegalSection title="7. Privacy">
        <p>
          How we handle personal data is explained in our{" "}
          <Link href={`/${lang}/privacy-policy`}>Privacy Policy</Link>.
        </p>
      </LegalSection>

      <LegalSection title="8. Governing law and jurisdiction">
        <p>
          These Terms are governed by the laws of Portugal. Any dispute arising from them will
          be submitted to the courts of Lisbon, Portugal, without prejudice to any mandatory
          rights you may have as a consumer to bring proceedings in the courts of your place
          of residence.
        </p>
        <p>
          Consumers may also turn to an alternative dispute resolution entity, such as the
          Centro de Arbitragem de Conflitos de Consumo de Lisboa (
          <a href="https://www.centroarbitragemlisboa.pt" target="_blank" rel="noopener noreferrer">
            www.centroarbitragemlisboa.pt
          </a>
          ).
        </p>
      </LegalSection>

      <LegalSection title="9. Changes to these Terms">
        <p>
          We may update these Terms from time to time. The latest version will always be
          available on this page, with the date of the last update shown at the top.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
