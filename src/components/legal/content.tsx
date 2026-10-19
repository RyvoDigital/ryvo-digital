import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { COMPANY } from "./LegalPage";

// The Privacy Policy and the Terms of Service, in the three languages of the
// site (.review/step2/launch-legal.md, 19 Oct 2026). The English is the
// approved text with the launch changes (Calendly gone; the site's own call
// booking and cookie-free analytics added); PT (Portugal, new spelling) and ES
// (Spain) follow its structure section by section.

export const LEGAL_UPDATED: Record<Locale, string> = {
  en: "19 October 2026",
  pt: "19 de outubro de 2026",
  es: "19 de octubre de 2026",
};

export type LegalDoc = { title: string; metaTitle: string; metaDescription: string; sections: { title: string; body: ReactNode }[] };

const mail = <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>;
const cnpd = <a href="https://www.cnpd.pt" target="_blank" rel="noopener noreferrer">www.cnpd.pt</a>;
const arbitragem = <a href="https://www.centroarbitragemlisboa.pt" target="_blank" rel="noopener noreferrer">www.centroarbitragemlisboa.pt</a>;

// ── Privacy Policy ─────────────────────────────────────────────────────────

export const PRIVACY: Record<Locale, LegalDoc> = {
  en: {
    title: "Privacy Policy",
    metaTitle: "Privacy Policy · Ryvo Digital",
    metaDescription: "How Ryvo Digital collects, uses and protects your personal data.",
    sections: [
      { title: "1. Who we are", body: <>
        <p>Ryvo Digital is a brand of {COMPANY.name}, NIPC {COMPANY.nipc}, with registered address at {COMPANY.address}. This company is the data controller responsible for your personal data under the General Data Protection Regulation (EU) 2016/679 (&ldquo;GDPR&rdquo;) and the Portuguese data protection law (Lei n.º 58/2019).</p>
        <p>For any privacy question or request, contact us at {mail}.</p>
      </> },
      { title: "2. What data we collect", body: <>
        <p>We keep data collection to a minimum. We only process:</p>
        <ul>
          <li><strong>Emails you send us.</strong> If you write to {COMPANY.email}, we receive your name, email address and anything you include in your message.</li>
          <li><strong>Call bookings on our website.</strong> When you book a call on ryvodigital.com, we collect your name, email address and agency or brand name; optionally your WhatsApp number and a short answer (your monthly enquiries, or your current website); and the site language and your time zone. We use these details only to arrange and hold the call. The booking creates an event in our Google Workspace calendar, and Google sends you the invitation with a Google Meet link.</li>
          <li><strong>Website analytics.</strong> We use Vercel Web Analytics to count visits in aggregate: the pages viewed, the referring site, the country and the device type. It uses no cookies, builds no profile of you and cannot identify you.</li>
          <li><strong>Technical data.</strong> Our hosting provider, Vercel, automatically processes technical information such as your IP address, browser type and the pages requested, in order to deliver the website securely.</li>
        </ul>
        <p>This website does not use advertising tools and does not set tracking cookies. Our analytics are cookie-free and anonymous.</p>
      </> },
      { title: "3. Why we use it", body: <>
        <ul>
          <li><strong>To reply to you and discuss a project</strong> — steps taken at your request before entering into a contract (Article 6(1)(b) GDPR).</li>
          <li><strong>To arrange and hold a call you request</strong> — steps taken at your request before entering into a contract (Article 6(1)(b) GDPR).</li>
          <li><strong>To deliver services we have agreed with you</strong> — performance of a contract (Article 6(1)(b) GDPR).</li>
          <li><strong>To keep the website running and secure</strong> — our legitimate interest (Article 6(1)(f) GDPR).</li>
          <li><strong>To understand, in aggregate, how the website is used and improve it</strong> — our legitimate interest (Article 6(1)(f) GDPR).</li>
          <li><strong>To keep invoices and accounting records</strong> — compliance with legal obligations (Article 6(1)(c) GDPR).</li>
        </ul>
        <p>We never sell your personal data or use it for automated decision-making.</p>
      </> },
      { title: "4. How long we keep it", body: <>
        <ul>
          <li><strong>Enquiries and call bookings that do not become a project:</strong> up to 12 months after our last contact, then deleted.</li>
          <li><strong>Client data:</strong> for the duration of our working relationship and up to 5 years afterwards, to handle any follow-up or claims.</li>
          <li><strong>Invoices and accounting records:</strong> for the period required by Portuguese tax law (currently 10 years).</li>
          <li><strong>Hosting logs:</strong> kept by Vercel for a short period, in line with its own retention policy.</li>
          <li><strong>Analytics:</strong> kept only as aggregated, anonymous statistics.</li>
        </ul>
      </> },
      { title: "5. Who we share it with", body: <>
        <p>We only share data with providers that help us run our business, acting on our behalf or under their own privacy terms: Vercel (hosting and analytics) and Google (Workspace: email, calendar and Meet). Some of these providers may process data outside the European Economic Area; when they do, the transfer is protected by appropriate safeguards such as the European Commission&rsquo;s Standard Contractual Clauses or the EU–US Data Privacy Framework.</p>
        <p>We may also disclose data where required by law or by a competent authority.</p>
      </> },
      { title: "6. Your rights", body: <>
        <p>Under the GDPR you have the right to:</p>
        <ul>
          <li>access the personal data we hold about you;</li>
          <li>have inaccurate data corrected;</li>
          <li>have your data erased;</li>
          <li>restrict or object to how we process it;</li>
          <li>receive your data in a portable format;</li>
          <li>withdraw consent at any time, where processing is based on consent.</li>
        </ul>
        <p>To exercise any of these rights, email {mail}. We will reply within one month.</p>
      </> },
      { title: "7. Right to complain", body: <>
        <p>If you believe we have not handled your data properly, you can lodge a complaint with the Portuguese data protection authority, the Comissão Nacional de Proteção de Dados (CNPD), at {cnpd}, or with the supervisory authority of the EU country where you live or work.</p>
      </> },
      { title: "8. Changes to this policy", body: <>
        <p>We may update this policy from time to time. The latest version will always be available on this page, with the date of the last update shown at the top.</p>
      </> },
    ],
  },
  pt: {
    title: "Política de Privacidade",
    metaTitle: "Política de Privacidade · Ryvo Digital",
    metaDescription: "Como a Ryvo Digital recolhe, utiliza e protege os seus dados pessoais.",
    sections: [
      { title: "1. Quem somos", body: <>
        <p>A Ryvo Digital é uma marca da {COMPANY.name}, NIPC {COMPANY.nipc}, com sede em {COMPANY.address}. Esta empresa é a responsável pelo tratamento dos seus dados pessoais, nos termos do Regulamento Geral sobre a Proteção de Dados (UE) 2016/679 (&ldquo;RGPD&rdquo;) e da Lei n.º 58/2019.</p>
        <p>Para qualquer questão ou pedido sobre privacidade, contacte-nos através de {mail}.</p>
      </> },
      { title: "2. Que dados recolhemos", body: <>
        <p>Recolhemos o mínimo de dados possível. Tratamos apenas:</p>
        <ul>
          <li><strong>E-mails que nos envia.</strong> Se escrever para {COMPANY.email}, recebemos o seu nome, o seu endereço de e-mail e tudo o que incluir na mensagem.</li>
          <li><strong>Marcações de chamadas no nosso website.</strong> Quando marca uma chamada em ryvodigital.com, recolhemos o seu nome, o seu endereço de e-mail e o nome da sua agência ou marca; opcionalmente, o seu número de WhatsApp e uma resposta curta (os seus contactos por mês ou o seu website atual); e o idioma do site e o seu fuso horário. Utilizamos estes dados apenas para organizar e realizar a chamada. A marcação cria um evento no nosso calendário do Google Workspace, e a Google envia-lhe o convite com uma ligação do Google Meet.</li>
          <li><strong>Estatísticas do website.</strong> Utilizamos o Vercel Web Analytics para contar as visitas de forma agregada: as páginas vistas, o site de origem, o país e o tipo de dispositivo. Não utiliza cookies, não cria nenhum perfil seu e não permite identificá-lo.</li>
          <li><strong>Dados técnicos.</strong> O nosso fornecedor de alojamento, a Vercel, trata automaticamente informação técnica como o seu endereço IP, o tipo de navegador e as páginas pedidas, para disponibilizar o website de forma segura.</li>
        </ul>
        <p>Este website não utiliza ferramentas de publicidade nem instala cookies de rastreamento. As nossas estatísticas não usam cookies e são anónimas.</p>
      </> },
      { title: "3. Para que os utilizamos", body: <>
        <ul>
          <li><strong>Para lhe responder e falar sobre um projeto</strong> — diligências pré-contratuais a seu pedido (artigo 6.º, n.º 1, alínea b), do RGPD).</li>
          <li><strong>Para organizar e realizar uma chamada que pede</strong> — diligências pré-contratuais a seu pedido (artigo 6.º, n.º 1, alínea b), do RGPD).</li>
          <li><strong>Para prestar os serviços que acordámos consigo</strong> — execução de um contrato (artigo 6.º, n.º 1, alínea b), do RGPD).</li>
          <li><strong>Para manter o website a funcionar e em segurança</strong> — o nosso interesse legítimo (artigo 6.º, n.º 1, alínea f), do RGPD).</li>
          <li><strong>Para perceber, de forma agregada, como o website é utilizado e melhorá-lo</strong> — o nosso interesse legítimo (artigo 6.º, n.º 1, alínea f), do RGPD).</li>
          <li><strong>Para conservar faturas e registos contabilísticos</strong> — cumprimento de obrigações legais (artigo 6.º, n.º 1, alínea c), do RGPD).</li>
        </ul>
        <p>Nunca vendemos os seus dados pessoais nem os utilizamos para decisões automatizadas.</p>
      </> },
      { title: "4. Durante quanto tempo os conservamos", body: <>
        <ul>
          <li><strong>Pedidos e marcações de chamadas que não se tornam um projeto:</strong> até 12 meses após o nosso último contacto; depois, são apagados.</li>
          <li><strong>Dados de clientes:</strong> durante a nossa relação de trabalho e até 5 anos depois, para tratar de qualquer seguimento ou reclamação.</li>
          <li><strong>Faturas e registos contabilísticos:</strong> durante o período exigido pela lei fiscal portuguesa (atualmente, 10 anos).</li>
          <li><strong>Registos de alojamento:</strong> conservados pela Vercel durante um curto período, de acordo com a sua própria política de conservação.</li>
          <li><strong>Estatísticas:</strong> conservadas apenas como dados agregados e anónimos.</li>
        </ul>
      </> },
      { title: "5. Com quem os partilhamos", body: <>
        <p>Só partilhamos dados com os fornecedores que nos ajudam a gerir o negócio, que atuam em nosso nome ou ao abrigo das suas próprias condições de privacidade: a Vercel (alojamento e estatísticas) e a Google (Workspace: e-mail, calendário e Meet). Alguns destes fornecedores podem tratar dados fora do Espaço Económico Europeu; quando isso acontece, a transferência está protegida por garantias adequadas, como as Cláusulas Contratuais-Tipo da Comissão Europeia ou o Quadro de Privacidade de Dados UE-EUA.</p>
        <p>Podemos ainda divulgar dados quando a lei ou uma autoridade competente o exija.</p>
      </> },
      { title: "6. Os seus direitos", body: <>
        <p>Nos termos do RGPD, tem o direito de:</p>
        <ul>
          <li>aceder aos dados pessoais que temos sobre si;</li>
          <li>corrigir dados inexatos;</li>
          <li>apagar os seus dados;</li>
          <li>limitar o tratamento ou opor-se a ele;</li>
          <li>receber os seus dados num formato portável;</li>
          <li>retirar o consentimento a qualquer momento, quando o tratamento se baseia no consentimento.</li>
        </ul>
        <p>Para exercer qualquer destes direitos, envie um e-mail para {mail}. Respondemos no prazo de um mês.</p>
      </> },
      { title: "7. Direito de reclamação", body: <>
        <p>Se considerar que não tratámos os seus dados de forma adequada, pode apresentar uma reclamação à autoridade portuguesa de proteção de dados, a Comissão Nacional de Proteção de Dados (CNPD), em {cnpd}, ou à autoridade de controlo do país da UE onde vive ou trabalha.</p>
      </> },
      { title: "8. Alterações a esta política", body: <>
        <p>Podemos atualizar esta política periodicamente. A versão mais recente estará sempre disponível nesta página, com a data da última atualização indicada no topo.</p>
      </> },
    ],
  },
  es: {
    title: "Política de Privacidad",
    metaTitle: "Política de Privacidad · Ryvo Digital",
    metaDescription: "Cómo Ryvo Digital recoge, utiliza y protege sus datos personales.",
    sections: [
      { title: "1. Quiénes somos", body: <>
        <p>Ryvo Digital es una marca de {COMPANY.name}, NIPC {COMPANY.nipc}, con domicilio social en {COMPANY.address}. Esta empresa es la responsable del tratamiento de sus datos personales, conforme al Reglamento General de Protección de Datos (UE) 2016/679 (&ldquo;RGPD&rdquo;) y a la ley portuguesa de protección de datos (Lei n.º 58/2019).</p>
        <p>Para cualquier consulta o solicitud sobre privacidad, escríbanos a {mail}.</p>
      </> },
      { title: "2. Qué datos recogemos", body: <>
        <p>Recogemos los mínimos datos posibles. Solo tratamos:</p>
        <ul>
          <li><strong>Los correos que nos envía.</strong> Si escribe a {COMPANY.email}, recibimos su nombre, su dirección de correo y todo lo que incluya en su mensaje.</li>
          <li><strong>Las reservas de llamadas en nuestra web.</strong> Cuando reserva una llamada en ryvodigital.com, recogemos su nombre, su dirección de correo y el nombre de su agencia o marca; de forma opcional, su número de WhatsApp y una respuesta breve (sus consultas al mes o su web actual); y el idioma de la web y su zona horaria. Utilizamos estos datos únicamente para organizar y celebrar la llamada. La reserva crea un evento en nuestro calendario de Google Workspace, y Google le envía la invitación con un enlace de Google Meet.</li>
          <li><strong>Analítica de la web.</strong> Utilizamos Vercel Web Analytics para contar las visitas de forma agregada: las páginas vistas, el sitio de procedencia, el país y el tipo de dispositivo. No utiliza cookies, no crea ningún perfil sobre usted y no permite identificarle.</li>
          <li><strong>Datos técnicos.</strong> Nuestro proveedor de alojamiento, Vercel, trata automáticamente información técnica como su dirección IP, el tipo de navegador y las páginas solicitadas, para ofrecer la web de forma segura.</li>
        </ul>
        <p>Esta web no utiliza herramientas publicitarias ni instala cookies de seguimiento. Nuestra analítica no usa cookies y es anónima.</p>
      </> },
      { title: "3. Para qué los utilizamos", body: <>
        <ul>
          <li><strong>Para responderle y hablar de un proyecto</strong>: medidas precontractuales a petición suya (artículo 6, apartado 1, letra b), del RGPD).</li>
          <li><strong>Para organizar y celebrar una llamada que usted solicita</strong>: medidas precontractuales a petición suya (artículo 6, apartado 1, letra b), del RGPD).</li>
          <li><strong>Para prestar los servicios que hemos acordado con usted</strong>: ejecución de un contrato (artículo 6, apartado 1, letra b), del RGPD).</li>
          <li><strong>Para mantener la web en funcionamiento y segura</strong>: nuestro interés legítimo (artículo 6, apartado 1, letra f), del RGPD).</li>
          <li><strong>Para entender, de forma agregada, cómo se usa la web y mejorarla</strong>: nuestro interés legítimo (artículo 6, apartado 1, letra f), del RGPD).</li>
          <li><strong>Para conservar facturas y registros contables</strong>: cumplimiento de obligaciones legales (artículo 6, apartado 1, letra c), del RGPD).</li>
        </ul>
        <p>Nunca vendemos sus datos personales ni los utilizamos para decisiones automatizadas.</p>
      </> },
      { title: "4. Cuánto tiempo los conservamos", body: <>
        <ul>
          <li><strong>Consultas y reservas de llamadas que no se convierten en un proyecto:</strong> hasta 12 meses después de nuestro último contacto; después, se eliminan.</li>
          <li><strong>Datos de clientes:</strong> mientras dure nuestra relación de trabajo y hasta 5 años después, para atender cualquier seguimiento o reclamación.</li>
          <li><strong>Facturas y registros contables:</strong> durante el plazo que exige la legislación fiscal portuguesa (actualmente, 10 años).</li>
          <li><strong>Registros de alojamiento:</strong> conservados por Vercel durante un breve periodo, conforme a su propia política de conservación.</li>
          <li><strong>Analítica:</strong> se conserva únicamente como estadísticas agregadas y anónimas.</li>
        </ul>
      </> },
      { title: "5. Con quién los compartimos", body: <>
        <p>Solo compartimos datos con los proveedores que nos ayudan a llevar el negocio, que actúan en nuestro nombre o conforme a sus propias condiciones de privacidad: Vercel (alojamiento y analítica) y Google (Workspace: correo, calendario y Meet). Algunos de estos proveedores pueden tratar datos fuera del Espacio Económico Europeo; cuando lo hacen, la transferencia está protegida por garantías adecuadas, como las Cláusulas Contractuales Tipo de la Comisión Europea o el Marco de Privacidad de Datos UE-EE. UU.</p>
        <p>También podemos comunicar datos cuando lo exija la ley o una autoridad competente.</p>
      </> },
      { title: "6. Sus derechos", body: <>
        <p>Conforme al RGPD, usted tiene derecho a:</p>
        <ul>
          <li>acceder a los datos personales que tenemos sobre usted;</li>
          <li>rectificar los datos inexactos;</li>
          <li>suprimir sus datos;</li>
          <li>limitar el tratamiento u oponerse a él;</li>
          <li>recibir sus datos en un formato portable;</li>
          <li>retirar su consentimiento en cualquier momento, cuando el tratamiento se basa en el consentimiento.</li>
        </ul>
        <p>Para ejercer cualquiera de estos derechos, escriba a {mail}. Le responderemos en el plazo de un mes.</p>
      </> },
      { title: "7. Derecho a reclamar", body: <>
        <p>Si considera que no hemos tratado sus datos correctamente, puede presentar una reclamación ante la autoridad portuguesa de protección de datos, la Comissão Nacional de Proteção de Dados (CNPD), en {cnpd}, o ante la autoridad de control del país de la UE en el que vive o trabaja.</p>
      </> },
      { title: "8. Cambios en esta política", body: <>
        <p>Podemos actualizar esta política de vez en cuando. La versión más reciente estará siempre disponible en esta página, con la fecha de la última actualización indicada arriba.</p>
      </> },
    ],
  },
};

// ── Terms of Service ───────────────────────────────────────────────────────

export function terms(lang: Locale): LegalDoc {
  const privacy = (label: string) => <Link href={`/${lang}/privacy-policy`}>{label}</Link>;
  const docs: Record<Locale, LegalDoc> = {
    en: {
      title: "Terms of Service",
      metaTitle: "Terms of Service · Ryvo Digital",
      metaDescription: "The terms that apply to the Ryvo Digital website and services.",
      sections: [
        { title: "1. About us", body: <>
          <p>This website, ryvodigital.com, is operated by Ryvo Digital, a brand of {COMPANY.name}, NIPC {COMPANY.nipc}, with registered address at {COMPANY.address}. You can contact us at {mail}.</p>
          <p>By using this website you agree to these Terms of Service. If you do not agree, please do not use the website.</p>
        </> },
        { title: "2. Use of the website", body: <p>You may use this website for lawful purposes only. You must not attempt to disrupt it, gain unauthorised access to it, or use it in any way that could harm Ryvo Digital or other users.</p> },
        { title: "3. Our services", body: <p>The information on this website describes the services we offer and does not constitute a binding offer. Every project is governed by a separate written proposal or agreement, which sets out the scope, timeline, fees and payment terms. If that agreement conflicts with these Terms, the agreement prevails.</p> },
        { title: "4. Intellectual property", body: <>
          <p>All content on this website — including text, design, graphics, animations, logos and code — belongs to Ryvo Digital or its licensors and is protected by intellectual property laws. You may not copy, reproduce or reuse it without our prior written permission.</p>
          <p>Ownership of work created for clients is defined in each project agreement.</p>
        </> },
        { title: "5. Third-party links", body: <p>This website uses or links to third-party services such as Google Calendar, Google Meet and LinkedIn. We are not responsible for the content, availability or privacy practices of those services.</p> },
        { title: "6. Liability", body: <p>We make reasonable efforts to keep this website accurate and available, but it is provided &ldquo;as is&rdquo;, without warranties of any kind. To the extent permitted by law, Ryvo Digital is not liable for any indirect or consequential loss arising from your use of the website. Nothing in these Terms limits liability that cannot be limited under applicable law, including your statutory rights as a consumer.</p> },
        { title: "7. Privacy", body: <p>How we handle personal data is explained in our {privacy("Privacy Policy")}.</p> },
        { title: "8. Governing law and jurisdiction", body: <>
          <p>These Terms are governed by the laws of Portugal. Any dispute arising from them will be submitted to the courts of Lisbon, Portugal, without prejudice to any mandatory rights you may have as a consumer to bring proceedings in the courts of your place of residence.</p>
          <p>Consumers may also turn to an alternative dispute resolution entity, such as the Centro de Arbitragem de Conflitos de Consumo de Lisboa ({arbitragem}).</p>
        </> },
        { title: "9. Changes to these Terms", body: <p>We may update these Terms from time to time. The latest version will always be available on this page, with the date of the last update shown at the top.</p> },
      ],
    },
    pt: {
      title: "Termos de Utilização",
      metaTitle: "Termos de Utilização · Ryvo Digital",
      metaDescription: "Os termos que se aplicam ao website e aos serviços da Ryvo Digital.",
      sections: [
        { title: "1. Quem somos", body: <>
          <p>Este website, ryvodigital.com, é gerido pela Ryvo Digital, uma marca da {COMPANY.name}, NIPC {COMPANY.nipc}, com sede em {COMPANY.address}. Pode contactar-nos através de {mail}.</p>
          <p>Ao utilizar este website, aceita estes Termos de Utilização. Se não concordar, não utilize o website.</p>
        </> },
        { title: "2. Utilização do website", body: <p>Só pode utilizar este website para fins lícitos. Não deve tentar perturbar o seu funcionamento, aceder-lhe sem autorização nem utilizá-lo de qualquer forma que possa prejudicar a Ryvo Digital ou outros utilizadores.</p> },
        { title: "3. Os nossos serviços", body: <p>A informação deste website descreve os serviços que prestamos e não constitui uma proposta vinculativa. Cada projeto rege-se por uma proposta ou acordo escrito próprio, que define o âmbito, o calendário, os honorários e as condições de pagamento. Se esse acordo contrariar estes Termos, prevalece o acordo.</p> },
        { title: "4. Propriedade intelectual", body: <>
          <p>Todo o conteúdo deste website — incluindo texto, design, grafismo, animações, logótipos e código — pertence à Ryvo Digital ou aos seus licenciantes e está protegido pela legislação de propriedade intelectual. Não o pode copiar, reproduzir nem reutilizar sem a nossa autorização prévia por escrito.</p>
          <p>A titularidade dos trabalhos criados para clientes é definida em cada acordo de projeto.</p>
        </> },
        { title: "5. Serviços de terceiros", body: <p>Este website utiliza ou tem ligações para serviços de terceiros, como o Google Calendar, o Google Meet e o LinkedIn. Não somos responsáveis pelo conteúdo, pela disponibilidade nem pelas práticas de privacidade desses serviços.</p> },
        { title: "6. Responsabilidade", body: <p>Fazemos esforços razoáveis para manter este website correto e disponível, mas é disponibilizado &ldquo;tal como está&rdquo;, sem garantias de qualquer tipo. Na medida em que a lei o permita, a Ryvo Digital não é responsável por quaisquer danos indiretos ou consequenciais resultantes da utilização do website. Nada nestes Termos limita a responsabilidade que não possa ser limitada nos termos da lei aplicável, incluindo os seus direitos legais enquanto consumidor.</p> },
        { title: "7. Privacidade", body: <p>A forma como tratamos os dados pessoais está explicada na nossa {privacy("Política de Privacidade")}.</p> },
        { title: "8. Lei aplicável e foro", body: <>
          <p>Estes Termos regem-se pela lei portuguesa. Qualquer litígio deles resultante será submetido aos tribunais de Lisboa, Portugal, sem prejuízo dos direitos imperativos que lhe assistam enquanto consumidor de recorrer aos tribunais do seu local de residência.</p>
          <p>Os consumidores podem também recorrer a uma entidade de resolução alternativa de litígios, como o Centro de Arbitragem de Conflitos de Consumo de Lisboa ({arbitragem}).</p>
        </> },
        { title: "9. Alterações a estes Termos", body: <p>Podemos atualizar estes Termos periodicamente. A versão mais recente estará sempre disponível nesta página, com a data da última atualização indicada no topo.</p> },
      ],
    },
    es: {
      title: "Condiciones de Uso",
      metaTitle: "Condiciones de Uso · Ryvo Digital",
      metaDescription: "Las condiciones que se aplican a la web y a los servicios de Ryvo Digital.",
      sections: [
        { title: "1. Quiénes somos", body: <>
          <p>Esta web, ryvodigital.com, la gestiona Ryvo Digital, una marca de {COMPANY.name}, NIPC {COMPANY.nipc}, con domicilio social en {COMPANY.address}. Puede escribirnos a {mail}.</p>
          <p>Al utilizar esta web, acepta estas Condiciones de Uso. Si no está de acuerdo, no utilice la web.</p>
        </> },
        { title: "2. Uso de la web", body: <p>Solo puede utilizar esta web con fines lícitos. No debe intentar alterar su funcionamiento, acceder a ella sin autorización ni utilizarla de ningún modo que pueda perjudicar a Ryvo Digital o a otros usuarios.</p> },
        { title: "3. Nuestros servicios", body: <p>La información de esta web describe los servicios que ofrecemos y no constituye una oferta vinculante. Cada proyecto se rige por una propuesta o un acuerdo escrito independiente, que fija el alcance, el calendario, los honorarios y las condiciones de pago. Si ese acuerdo contradice estas Condiciones, prevalece el acuerdo.</p> },
        { title: "4. Propiedad intelectual", body: <>
          <p>Todo el contenido de esta web —incluidos los textos, el diseño, los gráficos, las animaciones, los logotipos y el código— pertenece a Ryvo Digital o a sus licenciantes y está protegido por la legislación de propiedad intelectual. No puede copiarlo, reproducirlo ni reutilizarlo sin nuestra autorización previa por escrito.</p>
          <p>La titularidad de los trabajos creados para clientes se define en cada acuerdo de proyecto.</p>
        </> },
        { title: "5. Servicios de terceros", body: <p>Esta web utiliza o enlaza servicios de terceros, como Google Calendar, Google Meet y LinkedIn. No somos responsables del contenido, la disponibilidad ni las prácticas de privacidad de esos servicios.</p> },
        { title: "6. Responsabilidad", body: <p>Hacemos esfuerzos razonables para que esta web sea correcta y esté disponible, pero se ofrece &ldquo;tal cual&rdquo;, sin garantías de ningún tipo. En la medida en que lo permita la ley, Ryvo Digital no es responsable de ningún daño indirecto o consecuente derivado del uso de la web. Nada de lo dispuesto en estas Condiciones limita la responsabilidad que no pueda limitarse conforme a la ley aplicable, incluidos sus derechos legales como consumidor.</p> },
        { title: "7. Privacidad", body: <p>La forma en que tratamos los datos personales se explica en nuestra {privacy("Política de Privacidad")}.</p> },
        { title: "8. Ley aplicable y jurisdicción", body: <>
          <p>Estas Condiciones se rigen por la ley portuguesa. Cualquier controversia derivada de ellas se someterá a los tribunales de Lisboa (Portugal), sin perjuicio de los derechos imperativos que le correspondan como consumidor de acudir a los tribunales de su lugar de residencia.</p>
          <p>Los consumidores también pueden acudir a una entidad de resolución alternativa de litigios, como el Centro de Arbitragem de Conflitos de Consumo de Lisboa ({arbitragem}).</p>
        </> },
        { title: "9. Cambios en estas Condiciones", body: <p>Podemos actualizar estas Condiciones de vez en cuando. La versión más reciente estará siempre disponible en esta página, con la fecha de la última actualización indicada arriba.</p> },
      ],
    },
  };
  return docs[lang];
}
