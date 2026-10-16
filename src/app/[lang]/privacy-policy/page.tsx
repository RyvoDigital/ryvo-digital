import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegalPage, { COMPANY, LegalSection } from "@/components/legal/LegalPage";
import { isLocale } from "@/i18n/config";

export const metadata: Metadata = {
  title: "Privacy Policy — Ryvo Digital",
  description: "How Ryvo Digital collects, uses and protects your personal data.",
};

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <LegalPage lang={lang} title="Privacy Policy" lastUpdated="22 September 2026">
      <LegalSection title="1. Who we are">
        <p>
          Ryvo Digital is a brand of {COMPANY.name}, NIPC {COMPANY.nipc}, with registered
          address at {COMPANY.address}. This company is the data controller responsible for
          your personal data under the General Data Protection Regulation (EU) 2016/679
          (&ldquo;GDPR&rdquo;) and the Portuguese data protection law (Lei n.º 58/2019).
        </p>
        <p>
          For any privacy question or request, contact us at{" "}
          <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
        </p>
      </LegalSection>

      <LegalSection title="2. What data we collect">
        <p>We keep data collection to a minimum. We only process:</p>
        <ul>
          <li>
            <strong>Emails you send us.</strong> If you write to {COMPANY.email}, we receive
            your name, email address and anything you include in your message.
          </li>
          <li>
            <strong>Discovery call bookings.</strong> Our &ldquo;Get a website&rdquo; button
            takes you to Calendly, where you can book a call. Calendly collects the details you
            enter there (such as your name, email address and any answers you provide) and
            shares them with us so we can hold the call.
          </li>
          <li>
            <strong>Technical data.</strong> Our hosting provider, Vercel, automatically
            processes technical information such as your IP address, browser type and the
            pages requested, in order to deliver the website securely.
          </li>
        </ul>
        <p>
          This website does not have a contact form, does not use analytics or advertising
          tools, and does not set tracking cookies.
        </p>
      </LegalSection>

      <LegalSection title="3. Why we use it">
        <ul>
          <li>
            <strong>To reply to you and discuss a project</strong> — steps taken at your request
            before entering into a contract (Article 6(1)(b) GDPR).
          </li>
          <li>
            <strong>To deliver services we have agreed with you</strong> — performance of a
            contract (Article 6(1)(b) GDPR).
          </li>
          <li>
            <strong>To keep the website running and secure</strong> — our legitimate interest
            (Article 6(1)(f) GDPR).
          </li>
          <li>
            <strong>To keep invoices and accounting records</strong> — compliance with legal
            obligations (Article 6(1)(c) GDPR).
          </li>
        </ul>
        <p>We never sell your personal data or use it for automated decision-making.</p>
      </LegalSection>

      <LegalSection title="4. How long we keep it">
        <ul>
          <li>
            <strong>Enquiries that do not become a project:</strong> up to 12 months after our
            last contact, then deleted.
          </li>
          <li>
            <strong>Client data:</strong> for the duration of our working relationship and up
            to 5 years afterwards, to handle any follow-up or claims.
          </li>
          <li>
            <strong>Invoices and accounting records:</strong> for the period required by
            Portuguese tax law (currently 10 years).
          </li>
          <li>
            <strong>Hosting logs:</strong> kept by Vercel for a short period, in line with its
            own retention policy.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Who we share it with">
        <p>
          We only share data with providers that help us run our business, acting on our
          behalf or under their own privacy terms: our hosting provider (Vercel), our
          scheduling tool (Calendly) and our email provider. Some of these providers may
          process data outside the European Economic Area; when they do, the transfer is
          protected by appropriate safeguards such as the European Commission&rsquo;s Standard
          Contractual Clauses or the EU–US Data Privacy Framework.
        </p>
        <p>We may also disclose data where required by law or by a competent authority.</p>
      </LegalSection>

      <LegalSection title="6. Your rights">
        <p>Under the GDPR you have the right to:</p>
        <ul>
          <li>access the personal data we hold about you;</li>
          <li>have inaccurate data corrected;</li>
          <li>have your data erased;</li>
          <li>restrict or object to how we process it;</li>
          <li>receive your data in a portable format;</li>
          <li>withdraw consent at any time, where processing is based on consent.</li>
        </ul>
        <p>
          To exercise any of these rights, email{" "}
          <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>. We will reply within one
          month.
        </p>
      </LegalSection>

      <LegalSection title="7. Right to complain">
        <p>
          If you believe we have not handled your data properly, you can lodge a complaint with
          the Portuguese data protection authority, the Comissão Nacional de Proteção de Dados
          (CNPD), at{" "}
          <a href="https://www.cnpd.pt" target="_blank" rel="noopener noreferrer">
            www.cnpd.pt
          </a>
          , or with the supervisory authority of the EU country where you live or work.
        </p>
      </LegalSection>

      <LegalSection title="8. Changes to this policy">
        <p>
          We may update this policy from time to time. The latest version will always be
          available on this page, with the date of the last update shown at the top.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
