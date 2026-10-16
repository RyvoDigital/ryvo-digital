# ryvodigital.com — makeover plan (content and structure)

**Date:** 15 October 2026. Revision 2, the same day, with Manuel's answers and decisions (§11).
**Scope:** research, audit and copy only. No visual design, no site code, nothing deployed.
**Visual direction:** it comes only from Manuel's own guidance, references, 21st.dev and Mobbin, in a later session. Nothing visual is derived here. Nothing visual is ever derived from Martim's proposal PDFs, which are styled in each prospect agency's identity, not Ryvo's.
**Not committed or pushed.** This file lives in the read-only clone `~/ryvo-website`.

---

## 0. Read this first: what the site may claim

The new site has one job. Someone reads Martim's email or sees Ryvo on LinkedIn, clicks through, and should leave with a booked call or an email to us. They arrive straight from that email, so **the site repeats its words and promises**, and every sentence is one we can stand behind.

### 0.1 The source of truth for wording: Martim's outreach email (8 Oct 2026)

The lines the site reuses, with the PT original first and then the EN rendering:

| Email (PT) | Site (EN) |
|---|---|
| "trabalha com agências imobiliárias em Portugal e em Espanha" | works with real estate agencies in Portugal and Spain |
| "automações que acompanham os clientes da agência desde o primeiro contacto até depois da escritura" | automations that look after your agency's clients from the first contact until after the deed |
| "Respondem a cada pedido em poucos segundos, no idioma do comprador, e marcam a visita." | Every enquiry answered in a few seconds, in the buyer's language, and the viewing booked. |
| "Retomam também o contacto com quem já passou pela agência" | They get back in touch with people who have already dealt with your agency |
| "mantêm por perto quem ainda não está pronto para comprar" | They keep close the buyers who are not ready yet |
| "depois da escritura, pedem a cada cliente uma avaliação" | After the deed, they ask every client for a review |
| "O preço e a negociação ficam sempre a cargo da vossa equipa." | **Price and negotiation always stay with your team.** |
| "mostrar o sistema em funcionamento, conhecer a vossa forma de trabalhar e adaptá-lo" | We show you the system working, learn how you work, and adapt it to your agency |
| "Caso não seja o momento certo, basta dizer-me." | If it is not the right moment, just say so. (The tone for every call to action: no pressure.) |

### 0.2 The five automation names, used everywhere

They are the same on the site, on LinkedIn, in proposals and in emails. "Matching", "Referral" and "Reputation Loop" are not used anywhere.

| # | PT (exact, from Manuel) | EN | ES |
|---|---|---|---|
| 01 | Concierge de entrada | Inbound Concierge | Concierge de entrada |
| 02 | Reactivação de contactos | Contact Reactivation | Reactivación de contactos |
| 03 | Acompanhamento de compradores | Buyer Follow-up | Seguimiento de compradores |
| 04 | Lançamento de angariações | Listing Launch | Lanzamiento de captaciones |
| 05 | Pós-escritura | After the Deed | Post-escritura |

The EN and ES names are my proposal. **Question 1:** confirm them, or give yours.

03 covers two things: following up buyers who are not ready yet, and, when a new listing comes in, showing the consultant which of those buyers it suits.

### 0.3 What is true on 15 October 2026 (sources in the claims register, §9)

| Fact | What it means for the copy |
|---|---|
| **No client proof at all** (Manuel's decision): no case studies, client names, logos, testimonials or results. No real agency is live yet. Production holds rehearsal clients only, and WhatsApp runs on Twilio's sandbox while Meta verification is pending. | Describe what the system **does**, in the present tense. The site itself has to be impressive enough that nobody misses the proof. |
| 01 runs end to end on rehearsal clients. 02–05 are built, and each is switched on per agency only after its checks: Meta-approved templates, a review of the contact list, legal confirmation, calibration. | All five are described as the service. *How we work* says plainly that each one is switched on only after its checks. Never write "live", "proven" or "trusted by". |
| **Languages: the assistant replies in Portuguese, English, Spanish, French and German** (Manuel's decision). PT/EN/ES are in the product today. FR and DE ship in the next Concierge change, before any client signs. | Use "in the buyer's language" and name the five. **Launch dependency:** this claim goes live only once that change is deployed. If the site launches first, it shows PT/EN/ES until then. The website itself is in PT/EN/ES only. |
| It books into **Google Calendar** only. There is no Outlook support. | Say "Google Calendar". The FAQ answers the Outlook question honestly. |
| Replies are measured in seconds: p50 8.2 s and p95 12.9 s over 2,326 replies, 27 Sep–1 Oct. | Say "in a few seconds", as in the email. Never "6 seconds". |
| AI disclosure (EU AI Act Art. 50) is enforced in code on first contact, cannot be switched off by a client, and is repeated after 30 days and after a hand-back. | A strong, true trust point. Use the real disclosure text in the demo. |
| Core systems are in the EU (servers in Falkenstein, DE; database and console in Frankfurt). **But** the AI model provider (Anthropic) and some providers (Twilio, Vercel, Resend) process data in the US under standard contractual clauses. | Never write "your data never leaves the EU". Write "hosted in the EU" and name the exceptions on the Trust page. |
| The lead database has **no** backups yet (Supabase Free). The engine backups are encrypted, offsite in the EU, and their restore was drilled. | Do not claim backups for lead data until Supabase Pro is on. |
| Agencies get no login. The cockpit is Ryvo's own console. | Do not sell "a dashboard". The true and stronger line: *nothing new for your team to learn.* |
| The pitch's third-party statistics ("78% close with the first agency that responds", "21x", "917 minutes") have no source in the repo. | Not used. |
| The current site's "100% client satisfaction", "< 2s average load time" and "< 24h response guaranteed" are unsupported. | Removed. |
| Pricing is **launch pricing** (Manuel's decision). | Use that label only. Make no promise that early agencies keep their rate. |

---

## 1. Technical audit of the current site

### 1.1 What it is

- **Repository:** `github.com/RyvoDigital/ryvo-digital`, public, 8 commits. The last is `03f4f3d` (legal pages and footer).
- **Stack:**
  - Next.js 14.2 with the App Router, TypeScript and Tailwind 3. It is two major versions behind the current Next.js 16.
  - GSAP ScrollTrigger and Lenis smooth scrolling.
  - Fonts: Syne, DM Sans and DM Mono through `next/font`. The deprecated `@next/font` package is also installed.
  - Deployed on Vercel. The apex domain resolves to Vercel and email is on Google Workspace.
- **Pages:**
  - `/`: the whole site, with hero, Design/Build/Maintain, services, 4 stats and footer.
  - `/privacy-policy` and `/terms-of-service`.
  - Everything else returns 404, including `/robots.txt` and `/sitemap.xml`.
- **The homepage is two scroll-driven canvas animations:**
  - Hero: a section 600 viewports tall that plays 411 WebP frames.
  - Services: 900 viewports, playing 768 frames.
  - In total, **1,179 frames ≈ 66 MB** in `public/frames`. `public/` weighs 74 MB.
  - The copy is drawn over the canvas and fades with scroll position.
- **Unused code:** `ManifestoSection.tsx` and `StatsSection.tsx` are imported nowhere.

### 1.2 Why it feels glitchy, in plain words

1. **The stuck "0%" loader.**
   - The hero asks for all 411 frames at once. A black overlay with a percentage lifts only when *every one* has arrived (`HeroSection.tsx`, `Promise.all(...).then(() => setIsReady(true))`).
   - All the requests share one connection, so the bytes trickle in for all of them together and the counter barely moves.
   - **Measured today**, on a 390 px phone with a fast-4G throttle: **"0%" for 9 seconds**, and only 9% after 13 seconds.
   - Most visitors from LinkedIn and email are on a phone.
2. **A 15-screen tunnel.**
   - Measured page height on a phone: 13,050 px, which is 15.5 screens.
   - Most of that is scroll distance used to scrub the animation, so the visitor scrolls and little changes.
   - The second animation (768 frames) loads with no indicator, so fast scrolling shows blank or stale frames.
3. **Smooth-scroll fighting.**
   - Lenis takes over the mouse wheel on desktop with a 1.4 s easing. GSAP adds a 1.5 s scrub lag on top.
   - On touch devices a scroll listener is added and never removed.
4. **Dead links.**
   - "About" points to `#about`, which is an empty `<div>` with 0 px height (measured).
   - "Home" is `#`.
   - There is no About content.
5. **No mobile navigation.** The nav links are `hidden md:flex` and nothing replaces them. On a phone the only control is "Get a website".
6. **The `www` address is broken.**
   - `https://www.ryvodigital.com` fails with a **certificate error**: the certificate does not cover `www`.
   - Plain `http://www` redirects (308), so only typed `https://www` links fail.
   - **Fix:** add `www` to the Vercel project with a redirect to the apex. It is a production change, so it is Manuel's to make.
7. **No reduced-motion support.** `prefers-reduced-motion` is ignored.
8. **SEO basics are missing.**
   - No robots, no sitemap, no canonical, no Open Graph or Twitter tags, so LinkedIn previews have no proper image or text.
   - `lang="en"` only, no `hreflang`, and one generic title.
   - The copy sits in canvas overlays, so search engines see little.
9. **Unsupported stats:** the four listed in §0.3.
10. **Wrong business.** Websites only. Automations and real estate appear nowhere, so the site contradicts every message Martim sends.

### 1.3 Rebuild: keep or drop

| Keep | Drop |
|---|---|
| Next.js on Vercel (upgrade to the current major and start a fresh App Router project) | The 66 MB of frame sequences and both canvas scroll-scrubs |
| Tailwind | Lenis smooth-scroll hijacking |
| The legal footer text, **exactly as it is now** (§3.9) | `@next/font`, the unused `ManifestoSection`/`StatsSection` |
| The privacy-policy and terms text as the base (with the updates in §3.9) | All four stats |
| `hello@ryvodigital.com`, the LinkedIn company link, "Lisbon & Madrid" (a real base, confirmed) | Single-page anchor navigation |

The visual identity (fonts, colours, motion) is decided in the design phase from Manuel's guidance. Nothing visual is carried over by default.

**Performance targets for the rebuild:**

- Largest Contentful Paint under 2.5 s on a mid-range phone over 4G.
- No full-screen loader, ever.
- Under ~300 KB of JavaScript on first load.
- Motion only where it carries meaning.
- `prefers-reduced-motion` respected.

Once these are measured, "fast" can go back on the Websites page as a claim, with the number.

---

## 2. Site map

One brand, two clearly separate sides. Automations come first. Websites are one click away, and a website client never has to read about WhatsApp.

```
/{lang}/                                   Home (automations first, websites second band)
├── real-estate-automations                The five automations, Monday report, pricing, FAQ
├── demo                                   Live demo (simulated Inbound Concierge conversation)
├── websites                               Websites & digital presence: offer, process, pricing, FAQ
├── how-we-work                            Two tracks: automations onboarding / website projects
├── trust                                  Trust & compliance
├── about                                  Two team presentations
├── contact                                Book a call (two Google schedules), email; WhatsApp slot reserved
├── privacy-policy                         Legal
└── terms                                  Legal
404                                        Real page with links to both sides
```

`{lang}` is `en`, `pt` or `es`; slugs are localised (§4).

**Navigation:**

- **Header:** Real estate automations · Demo · Websites · How we work · About, plus **Book a call** and a PT/EN/ES switcher.
- **Mobile:** a real menu, with Book a call always visible.
- **Footer:** every page, Trust & compliance, email, LinkedIn, then the legal block, unchanged.

**Added beyond the brief, and why:**

- **"What a missed enquiry costs you" calculator** on the automations page. The 15 Sep feedback said to lead with the ROI calculator. The visitor uses *their own* numbers, so no statistic is invented.
- **A real 404 page.** Old links and posts should land somewhere useful.
- **Pricing as a block inside each side,** not a page of its own. It keeps the two businesses apart and puts the price where the reader is already convinced.

**Removed, and why:**

- The case study (Manuel's decision: no client proof for now).
- The "Services" and "About" anchors, which become real pages.
- The stats band.

**Not added:**

- A blog: an empty one hurts a premium brand.
- Any logo strip or "work" page.

---

## 3. Page-by-page copy (English)

House style for all three languages:

- Short sentences. Concrete nouns.
- No "revolutionise", "supercharge", "seamless", "cutting-edge", "AI-powered" as a headline word, and no exclamation marks.
- Speak to the agency owner as an equal. Name the real things: WhatsApp, Google Calendar, the consultant, the deed, the AMI licence.
- Echo the email's calm tone: no pressure, and "if it is not the right moment, just say so".

Square-bracketed `[…]` items are inputs still owed (§10).

### 3.1 Home `/en/`

**Meta title:** Ryvo Digital: automations for boutique real estate agencies
**Meta description:** Every enquiry answered in a few seconds, in the buyer's language, and the viewing booked. Automations from first contact to after the deed, for agencies in Portugal and Spain.

**Hero**
- Eyebrow: *Real estate automations · Lisbon & Madrid*
- H1: **From the first enquiry to after the deed.**
- Sub: Every enquiry answered in a few seconds, in the buyer's language, and the viewing booked. Price and negotiation always stay with your team.
- Primary CTA: **Book a call**
- Secondary CTA: **See it working** → `/demo`
- Under the CTAs, small: *We work with agencies in Portugal and Spain. Set up and run for you.*

**Band 1: The first answer**
- H2: **The enquiry arrives at 21:40. Your answer arrives seconds later.**
- Enquiries come in from portals, your website and Instagram at all hours and in many languages. Your consultants are at viewings, at deeds, or asleep.
- Ryvo answers each one in the buyer's language, books the viewing, and passes the conversation to a person at exactly the right moment.

**Band 2: Five automations, the whole journey** (cards, each linking to its section)
- **01 Inbound Concierge.** Answers every enquiry in a few seconds, in the buyer's language, and books the viewing.
- **02 Contact Reactivation.** Gets back in touch with people who have already dealt with your agency.
- **03 Buyer Follow-up.** Keeps close the buyers who are not ready yet, and tells your consultant when a new listing suits them.
- **04 Listing Launch.** Listing texts in four languages, with the legal mentions in place.
- **05 After the Deed.** After the deed, asks every client for a review.
- Link: **How each one works →**

**Band 3: Where your team takes over**
- H2: **Price and negotiation always stay with your team.**
- Three steps:
  1. **Answers.** The buyer writes on WhatsApp. Ryvo replies in seconds, says it is your agency's virtual assistant, and finds out what they are looking for.
  2. **Books.** It offers free slots from your Google Calendar and books the viewing. The buyer can move or cancel it in the same conversation.
  3. **Hands over.** It hands over to a person, with a card on WhatsApp, when:
     - the buyer asks for one;
     - price or negotiation comes up;
     - a legal or tax question comes up;
     - it would have to guess to answer.

     The card holds: contact, language, what they want, budget, timeframe, why it was handed over, and what has already been said.
- CTA: **See a full conversation →**

**Band 4: What changes for your team**
- H2: **Nothing new to learn.**
- No dashboard to log into and no CRM required. Your consultants keep working in WhatsApp and Google Calendar, as they do today. Every Monday you receive a one-page PDF report: conversations, first-reply time, qualified leads, viewings booked, reactivations and handovers.

**Band 5: Trust** (three items, linking to /trust)
- **Always disclosed.** Every new conversation says it is answered by an AI. It cannot be switched off.
- **Consent first.** We only re-contact people whose origin is documented. Anyone who says stop is never contacted again.
- **Hosted in the EU.** Servers in Germany. Where a provider processes data outside the EU, we name it.
- Link: **Trust & compliance →**

**Band 6: Pricing teaser**
- *Launch pricing.* Inbound Concierge **from €350 / month** · Concierge + Contact Reactivation **from €650 / month** · all five **from €1,200 / month**.
- *The final price depends on your agency's size and setup. Book a call for a tailored quote.*
- Link: **Pricing details →**

**Band 7: Websites** (the second business, clearly separate)
- Eyebrow: *Also from Ryvo*
- H2: **Websites for brands that sell on detail.**
- Custom websites, designed, built and looked after by a small team in Lisbon and Madrid. This site is an example of the work.
- CTA: **Websites & digital presence →**

**Band 8: Closing CTA**
- H2: **A short call. The system, working.**
- We show you the system working, learn how your agency works, and tell you honestly whether it fits. If it does, you get a one-page proposal within 24 hours. If it is not the right moment, just say so.
- CTA: **Book a call** · or write to **hello@ryvodigital.com**

### 3.2 Real estate automations `/en/real-estate-automations`

**Meta title:** Real estate automations, from first contact to after the deed | Ryvo Digital
**Meta description:** Five done-for-you automations for boutique agencies in Portugal and Spain: Inbound Concierge, Contact Reactivation, Buyer Follow-up, Listing Launch and After the Deed. Launch pricing from €350/month.

**Hero**
- H1: **Five automations that look after your clients, from the first contact until after the deed.**
- Sub: Built for boutique agencies selling premium homes in Portugal and Spain. We adapt each one to how your agency already works, then run it for you on a monthly retainer. Price and negotiation always stay with your team.
- CTA: **Book a call** · **See the demo**

**01 Inbound Concierge**: *Every enquiry answered in a few seconds, in the buyer's language, and the viewing booked.*
- When a buyer writes on WhatsApp, Ryvo answers in a few seconds, in their language: Portuguese, English, Spanish, French or German.
- Its first message says plainly that it is your agency's virtual assistant and an AI, not a person.
- It asks what a good consultant would ask: area, type, budget, timeframe.
- It offers up to three free slots from your Google Calendar, within your working hours, and books the viewing. The buyer can move or cancel it in the same conversation.
- It hands the conversation to a person, with a card on WhatsApp, when:
  - the buyer asks for one;
  - price or negotiation comes up;
  - a legal, contract or tax question comes up;
  - the tone turns hostile;
  - the property is above the value you set;
  - it would have to guess to answer.
- The card goes to the right consultant: the one who already knows the buyer, or the one who covers the area.
- "Stop" is honoured at once and recorded for good.

**02 Contact Reactivation**: *Get back in touch with the people who already know you.*
- Most agencies hold years of contacts they cannot simply message.
- We start by sorting your list by where each contact came from. Contacts with no documented origin, and anyone who has objected, are never contacted.
- The rest are invited back with a WhatsApp-approved message, at a measured pace. Those who say yes become a database you are allowed to use.
- No cold outreach and no spam: only the relationships you have already earned.

**03 Buyer Follow-up**: *Keep close the buyers who are not ready yet.*
- Not every buyer is ready to buy now. Ryvo keeps them close until they are.
- When a new listing comes in, it shows your consultant which of those buyers it suits, so the first call goes to the right person. Your consultant decides who hears about it.
- It works without a CRM.
- We set the rules with you in a calibration session before anything is sent.

**04 Listing Launch**: *One listing, four languages, the legal lines in place.*
- From your listing details, Ryvo prepares the listing texts in Portuguese, English, Spanish and French.
- The legal mentions are included: the energy class (or the exemption) and your AMI licence number.
- Your consultant approves every text before it is published.
- (Do **not** say "AI-written": the model call is currently off; see §9.)

**05 After the Deed**: *A thank-you, and a review request, to every client.*
- When your consultant tells Ryvo the deed is done, each client receives a thank-you and a review request at the right moment.
- Everyone is asked; nobody is filtered out.

**Also included: the Monday report**
- A one-page PDF every Monday:
  - conversations;
  - median time to first reply;
  - qualified leads;
  - viewings booked;
  - reactivations;
  - handovers to your team.

**Optional block: What a missed enquiry costs you** (calculator)
- Inputs: *enquiries per month*, *average commission per sale (€)*.
- Output: one line, for example *"If one more enquiry a year becomes a sale, that is €X, against €Y a year for the Inbound Concierge."*
- It uses the visitor's own numbers only.

**Pricing** `#pricing`
- H2: **Launch pricing**
- Three cards:
  - **Inbound Concierge**: from **€350 / month**. *Every enquiry answered, the viewing booked, the handover card, the Monday report.*
  - **Concierge + Contact Reactivation**: from **€650 / month**. *Answer new enquiries and get back in touch with the people who already know you.*
  - **All five automations**: from **€1,200 / month**. *From the first contact until after the deed.*
- Under the cards: *Other combinations are priced by the number of automations. The final price depends on your agency's size and setup. Book a call for a tailored quote. Prices exclude VAT.*
- No setup fee shown anywhere on the site (decision).

**FAQ**
1. **Do buyers know they are talking to an AI?**
   Yes, always. The first message says so in the buyer's language, and it is repeated when a buyer returns after 30 days. The EU AI Act requires it, and we enforce it in the software, not in a setting.
2. **Who handles price and negotiation?**
   Your team, always. The moment price or negotiation comes up, the assistant hands over to your consultant with a card on WhatsApp.
3. **Which languages does it answer in?**
   Portuguese, English, Spanish, French and German, matching the language the buyer writes in.
4. **Which calendar does it use?**
   Google Calendar. Outlook is not supported today.
5. **Do we need a CRM?**
   No. If you use one, tell us which on the call.
6. **Do we need to change our WhatsApp number?**
   It runs on the WhatsApp Business Platform, on a number your agency owns. We take you through Meta's business verification during setup.
7. **How long does setup take?**
   We aim to go live within six weeks of signing. Meta's verification sets part of that pace, so we never promise a date that depends on Meta.
8. **Can it say something wrong about a property?**
   It answers from the facts you give it. When a question needs a fact it does not have, it hands over rather than guessing.
9. **Is there a free trial?**
   No, but we can start with a paid pilot. Ask on the call.
10. **What about our existing contacts and GDPR?**
    Before Contact Reactivation sends anything, we sort your contacts by where they came from. Undocumented contacts and objections are never contacted. See Trust & compliance.
11. **How do we stop?**
    [Hold until the lawyer-reviewed contract is signed off. The draft says monthly with 30 days' notice, and the fee fixed for the first 12 months.]

**Closing CTA:** **See it working, then decide.** · **Book a call**

### 3.3 Live demo `/en/demo`

**Meta title:** See the Ryvo Inbound Concierge answer an enquiry | Ryvo Digital
**Meta description:** One property enquiry from start to finish: the AI disclosure, the questions, a viewing booked in Google Calendar, and the card your consultant receives when price comes up.

- H1: **One enquiry, start to finish.**
- Sub: A simulated conversation, built from what the Inbound Concierge actually says. Pick a language and watch it run.
- Language tabs: PT / EN / ES, the site's languages. The script runs in each.
- **Phone panel (scripted conversation):**
  1. Buyer: *"Hi, I saw the 3-bedroom apartment in Estrela. Is it still available?"*
  2. Ryvo, the disclosure, verbatim from the product: *"🤖 Sofia, Casa Exemplo's virtual assistant. This conversation is answered by artificial intelligence, not by a person."*
  3. Answer, then two questions (budget, timeframe).
  4. Three slots offered. Buyer: *"Thursday morning works."* → *"Booked: Thursday 10:00."*
  5. Buyer: *"Would the owner accept 1.2 million?"* → *"That's one for our consultant. I've passed your details on and they'll be in touch."* This shows **price and negotiation stay with your team**.
- **Side panel (what the agency sees):**
  - the Google Calendar entry appearing;
  - then the handover card: Contact / Language / Looking for / Budget / Timeframe / Reason: price negotiation / Already said.
- Agency, assistant and property are **fictional and labelled as such**.
- Under it: *Want to see it on your own phone? Book a call; we show the system working live.*
- Later: **"Message our demo number on WhatsApp"** (§6, option 4).
- CTA: **Book a call**

### 3.4 Websites & digital presence `/en/websites`

**Meta title:** Custom websites for brands with high standards | Ryvo Digital
**Meta description:** Custom, premium websites designed, built and looked after by Ryvo, in Lisbon and Madrid. Websites from €1,500; care from €150/month.

- H1: **Websites for brands that sell on detail.**
- Sub: We design and build custom websites for businesses whose clients notice the details. Then we look after them, month by month.
- **What we do** (three columns):
  - **Design.** Made for your brand and your clients, never a template. One team from first sketch to launch.
  - **Build.** Fast on a phone, in every language you sell in, with what search engines need in place from day one.
  - **Care.** Updates, changes and improvements every month, so the site keeps pace with the business.
- **Proof line, instead of a portfolio:** *You are looking at our work. This site was designed and built by the same team.*
- **How a project runs:** a short version, linking to How we work.
- **Pricing:**
  - **Websites from €1,500.** *Custom and premium, designed and built for you.*
  - **Care from €150 / month.** *Updates, changes and improvements.*
  - *The final price depends on the scope. Book a call for a tailored quote.* No setup fees shown.
- **FAQ:**
  - *Do you use templates?* No. Every site is custom.
  - *Can the site be in several languages?* Yes.
  - *Who owns the site?* [Confirm: the client owns the domain and content.]
  - *How long does a site take?* [Your typical range.]
- CTA: **Book a website call** (schedule B, §5) · hello@ryvodigital.com

### 3.5 How we work `/en/how-we-work`

**Meta title:** How we work: from first call to go-live | Ryvo Digital
**Meta description:** How Ryvo adapts its real estate automations to your agency, and how a website project runs, step by step.

Two tabs: **Real estate automations** | **Websites**

**Automations track:**

1. **A short call.** We show you the system working, learn how your agency works, and tell you honestly whether it fits.
2. **Proposal within 24 hours.** One page: what we would set up, the monthly price and the go-live plan. No promises of numbers of leads or sales.
3. **Contract and data processing agreement.** No data of yours enters our systems before both are signed.
4. **One setup form.** Your agency details, AMI licence, WhatsApp number, calendar and working hours, areas, languages, tone of voice, and where your contact list came from.
5. **WhatsApp and Meta.** We take you through Meta's business verification and get the message templates approved. Meta's timing sets part of the pace.
6. **Testing.** Before any real buyer sees it, we run at least twenty test conversations against your setup, including the awkward ones.
7. **Careful go-live.** We switch on in stages and read every conversation for the first days.
8. **Every month.** A check-in on what the Monday reports show and what to adjust.

Closing line: *Each automation is switched on only when its own checks are done: an approved WhatsApp template, a reviewed contact list, your sign-off.*

**Websites track:** [Manuel/Phil to confirm. Suggested: call → proposal → design → build → launch → monthly care.]

### 3.6 Trust & compliance `/en/trust`

**Meta title:** Trust & compliance: GDPR, AI disclosure, EU hosting | Ryvo Digital
**Meta description:** How Ryvo handles your clients' data: hosted in the EU, AI always disclosed, consent before contact, opt-outs honoured for good, and erasure on request.

- H1: **Your clients' trust is your business. We treat it that way.**
- **AI is always disclosed.**
  - Every new conversation opens by saying it is answered by an AI, as the EU AI Act (Art. 50) requires.
  - It is enforced in the software and cannot be switched off.
  - It is repeated after 30 days, and when a conversation returns to the assistant after a person.
- **Price and negotiation stay with your team.** So do legal and tax questions. The assistant hands them to your consultant.
- **Consent before contact.**
  - Contact Reactivation contacts only people whose origin is documented.
  - Contacts with no documented origin, and anyone who has objected, are never contacted.
  - Every consent and objection is kept in a permanent record.
- **Stop means stop.** A request to stop ends contact at once, for good.
- **Where your data lives.**
  - Our servers are in Germany (Falkenstein) and our database in Frankfurt.
  - Some providers process data outside the EU under standard contractual clauses: the AI model provider, our WhatsApp provider (Twilio) and [the others per the DPA]. We list every subprocessor in our data processing agreement.
- **Erasure on request.** When a person asks to be erased, we act on it and record when it was done.
- **A data processing agreement with every agency,** signed before any data is shared.
- **Your licence on what you send.** Listing texts carry your AMI licence number and the energy class where Portuguese law requires them.
- Not to be added until true:
  - daily backups of lead data (needs Supabase Pro);
  - "encrypted at rest" (not verified);
  - any certification.

### 3.7 About `/en/about`

**Meta title:** About Ryvo Digital: the team | Ryvo Digital
**Meta description:** Ryvo Digital is a small team in Lisbon and Madrid with two lines of work: automations for boutique real estate agencies, and custom websites.

- H1: **Small on purpose.**
- Intro: Ryvo Digital is a small team in Lisbon and Madrid with two lines of work, and a different pair of people behind each. Whichever you hire us for, you speak to the people who do the work.
- **Real estate automations**
  - **Manuel Vale.** [Title on this side.] Adapts the system to each agency and runs its setup, from the first call to go-live and the monthly check-in. [One personal line.]
  - **Martim Gabriel.** Marketing & Communications. Outreach, social media and lead management. Often the first person an agency hears from. [One personal line, optional.]
- **Websites & digital presence**
  - **Manuel Vale.** [Title on this side.]
  - **Phil Hajjar.** Marketing & Communications for the websites side. [One personal line, optional.]
- Photos: real photos, same treatment for all three (to follow). No stock.
- Company line: *Ryvo Digital is a brand of PEDRO SEIXAS VALE - CONSULTORIA, LDA.*
- **Rule for the build:** Martim appears only on the automations side (here, and on any automations page that names people). Phil appears only on the websites side. Manuel appears on both.

### 3.8 Contact / Book `/en/contact`

**Meta title:** Book a call | Ryvo Digital
**Meta description:** Book a short call about real estate automations or a website project, or write to hello@ryvodigital.com.

- H1: **Let's talk.**
- Two cards, side by side on desktop and stacked on mobile:
  - **Real estate automations.** *A short call with Manuel or Martim. We show you the system working.* → embedded Google appointment schedule A.
  - **A website project.** *A short call with Manuel or Phil.* → embedded Google appointment schedule B.
- Below: **Prefer email?** hello@ryvodigital.com. [Add "we reply within one working day" only if it is always kept.]
- **WhatsApp slot (hidden for now):** reserved in the layout. It is switched on when +351 923 523 760 routes into the cockpit, and there is no dead button or "coming soon" before then.
- Legal note: *When you book, Google Calendar passes us your name, email and answers. See our privacy policy.*

### 3.9 Legal: privacy policy and terms

- **Footer, unchanged, word for word:**
  > © 2026 Ryvo Digital · Ryvo Digital is a brand of PEDRO SEIXAS VALE - CONSULTORIA, LDA · NIPC 513853847 · Rua Tomás da Fonseca, N 26, Edifício 3, 5º Esq, 1600-256 Lisboa, Portugal · All rights reserved. · Privacy Policy · Terms of Service
- **Privacy policy updates required by the new site:**
  - Replace Calendly with Google Calendar appointment schedules.
  - Name the analytics tool. With Plausible, "no tracking cookies" stays true.
  - The scripted demo adds nothing.
- **Translate both pages into PT and ES.** [Question: lawyer review alongside the client contract?]
- [Question: is a *Livro de Reclamações Eletrónico* link needed? Ask the lawyer. The footer stays as is meanwhile.]

### 3.10 404

- H1: **This page has moved or never existed.**
- Body: *Looking for real estate automations or websites?*
- Links to both sides and **Book a call**.

---

## 4. Portuguese and Spanish

### 4.1 Portuguese (pt-PT)

- **The PT site uses Martim's email almost word for word.** It is already the voice prospects know.
  - **Hero H1:** *Do primeiro contacto até depois da escritura.*
  - **Sub:** *Respondemos a cada pedido em poucos segundos, no idioma do comprador, e marcamos a visita. O preço e a negociação ficam sempre a cargo da sua equipa.*
- **Automation names exactly:** 01 Concierge de entrada · 02 Reactivação de contactos · 03 Acompanhamento de compradores · 04 Lançamento de angariações · 05 Pós-escritura.
- **European Portuguese:** *equipa*, *telemóvel*, *contacto*, *marcar a visita*, *consultor*, *angariação*, *escritura*, *licença AMI*, *classe energética*.
- **Address:** the email uses *vós* ("a vossa equipa"), which suits a personal letter to a team. The site speaks to one reader, so use *a sua agência* / *a sua equipa*. [Question: or keep *vossa* to match the email exactly?]
- **Prices:** "desde 350 €/mês" and "Preços de lançamento".
- **AI disclosure, verbatim:** *"🤖 {agent}, assistente virtual da {agency}. Esta conversa é respondida por inteligência artificial, não por uma pessoa."*
- Use "RGPD", not GDPR, in PT and ES.
- **Slugs:** `/pt/automacoes-imobiliarias`, `/pt/demonstracao`, `/pt/websites`, `/pt/como-trabalhamos`, `/pt/confianca`, `/pt/sobre`, `/pt/contacto`, `/pt/politica-de-privacidade`, `/pt/termos`.

### 4.2 Spanish (es-ES)

- **Names:** 01 Concierge de entrada · 02 Reactivación de contactos · 03 Seguimiento de compradores · 04 Lanzamiento de captaciones · 05 Post-escritura [confirm].
- **Hero H1:** *Del primer contacto hasta después de la escritura.*
- **Sub:** *Cada consulta respondida en pocos segundos, en el idioma del comprador, y la visita agendada. El precio y la negociación quedan siempre en manos de su equipo.*
- **Spain's Spanish:** *inmobiliaria*, *captación*, *visita*, *agente / asesor*, *escritura*, *móvil*.
- **Address:** I recommend *usted* for boutique luxury owners. [Question: or *tú*?]
- **AI disclosure, verbatim:** *"🤖 {agent}, asistente virtual de {agency}. Esta conversación la responde una inteligencia artificial, no una persona."*
- **Listing Launch (04) differs in Spain.**
  - The legal mentions built today follow **Portuguese** law. There is no Spanish policy yet.
  - Say *"con las menciones legales que exige la ley portuguesa; para España, las revisamos con cada agencia"*. Do not promise Spanish legal mentions.
- **Calendar:** Spain is one hour ahead of Lisbon, so the booking page shows the visitor's time zone (check this on the test schedule, §5).
- **Slugs:** `/es/automatizaciones-inmobiliarias`, `/es/demo`, `/es/sitios-web`, `/es/como-trabajamos`, `/es/confianza`, `/es/sobre-nosotros`, `/es/contacto`, `/es/politica-de-privacidad`, `/es/terminos`.

### 4.3 Translation method

- **EN is the master for structure. PT wording follows Martim's email.**
- Native review for PT and ES. Disclosure texts and legal terms must match the product and contract exactly.
- One string file per language. All three languages complete at launch.

---

## 5. Booking (decided): two Google Calendar appointment schedules, embedded

**Decision (Manuel, 15 Oct): Google Calendar appointment schedules, no Calendly.**

| Schedule | Name | Host / co-host | Where |
|---|---|---|---|
| A | Real estate automations: a short call | Manuel, with Martim as co-host | Inline on `/contact` (first card). Every automations-side "Book a call" opens it as a popup |
| B | Website project: a short call | Manuel, with Phil as co-host | Inline on `/contact` (second card). Every websites-side "Book a call" opens it as a popup |

**What Business Standard provides** (Google's comparison chart and admin docs list Business Standard among the eligible plans):

- multiple schedules;
- automatic reminders;
- availability checked across several calendars;
- booker email verification;
- schedules on secondary calendars;
- up to 20 co-hosts;
- payments (not used).

**Embed:** "Button with popup" or "Inline booking page", from the booking page's *Sharing options → Website embed*.

**Set up on each schedule:**

- Turn on booker email verification and reminders, and a Meet link.
- Booking form questions: agency name and city (A), or business and website (B). Keep them few.

**Check on a test schedule before the build** (I could not confirm these in Google's docs):

1. Which language the booking page shows to PT, EN and ES browsers.
2. That times show in the visitor's time zone (Lisbon versus Madrid).
3. How the inline embed looks and scrolls on a phone.
4. Whether co-host availability combines as expected.

**Known limits:**

- The look cannot be styled to match the site.
- No round-robin that I could confirm.
- **No documented "booking completed" signal to the page**, so the site tracks "booking opened" and real bookings are counted from the two calendars.

**Later:** our own booking UI on the same Google calendars. Build it when +351 923 523 760 routes into the cockpit, so one booking engine serves the site, WhatsApp and the cockpit in our design and in three languages, with exact tracking.

Sources: [Share your appointment schedule (Google)](https://support.google.com/calendar/answer/10733297?hl=en), [Compare premium features for appointment schedules (Google)](https://support.google.com/google-workspace-individual/answer/16287038?hl=en-GB), [Allow paid appointment schedules (Workspace admin)](https://knowledge.workspace.google.com/admin/calendar/allow-paid-appointment-schedules-in-calendar).

---

## 6. Live demo: options (no changes made)

1. **A scripted, simulated conversation on the page.**
   - The §3.3 design: PT/EN/ES, a fictional agency, clearly labelled, with the product's real disclosure text and card fields.
   - **Pros:** instant, free per view, no abuse risk, exact control of every claim.
   - **Con:** it is not "live", which the call covers.
   - **Recommended now.**
2. **A recorded screen capture of a real conversation.**
   - Heavier, harder to localise, and the sandbox would show.
   - Per the 14 Sep note, do it only once the system runs on a real number.
3. **An interactive chat on the website backed by the real model.**
   - **Pros:** the most convincing on the page.
   - **Cons:** cost per conversation; it needs rate limits and bot protection and must carry the Art. 50 disclosure itself; it is a different channel from WhatsApp; whatever it says is public.
   - **Not before option 4.**
4. **"Message our demo number": a real WhatsApp conversation with +351 923 523 760.**
   - The number is routed through Twilio into the cockpit as a Ryvo demo agency.
   - On the website: a QR code on desktop and a wa.me link on mobile.
   - The visitor gets the real product on their own phone, in their own language, including a viewing booked into a demo calendar and a handover.
   - **Needs first:**
     - the number live on the WhatsApp Business Platform;
     - the demo agency configuration;
     - a decision on storing demo conversations, and their retention;
     - an opt-out path;
     - a rate limit.
   - **Recommended next.** It doubles as the planned WhatsApp contact button.
5. **A hybrid**: option 1 on the page, plus "or try it on WhatsApp", which appears only when option 4 is live.

---

## 7. Analytics, conversion tracking, SEO, LinkedIn

### 7.1 Analytics (privacy-friendly)

- **Recommend Plausible Analytics.**
  - Cookieless, no persistent identifiers, made and hosted in the EU.
  - Starter is $9/month for up to 10k pageviews a month and includes goals and custom events ([plausible.io](https://plausible.io/)).
  - No consent banner is needed. The privacy policy names it.
- **The alternative is Vercel Web Analytics.**
  - Custom events need the Pro plan; they are not on Hobby ([Vercel docs](https://vercel.com/docs/analytics/limits-and-pricing)).
  - [Question: which Vercel plan is the `ryvo-digital` project on?]
- **Not used:** Google Analytics or the Meta pixel, which would need a banner.
- **LinkedIn Insight Tag** only with a proper consent banner, and only if paid campaigns run.

### 7.2 Conversions to track

| Event | Fired when |
|---|---|
| `book_open` (side, page, lang) | A Book-a-call button opens schedule A or B |
| `email_click` | A click on `mailto:hello@…` |
| `demo_play` / `demo_complete` | The demo starts or reaches the handover card |
| `lang_switch` | The visitor changes language |
| `whatsapp_click` | Later, when the WhatsApp slot is on |
| *Bookings* | Counted weekly from the two Google calendars (no signal from the embed) |

- **Attribution:** every link we control carries UTM tags. That means Martim's emails, all LinkedIn posts and profiles, and the company page.
- Proposal PDFs link back with their own `utm_medium=proposal`.

### 7.3 Multilingual SEO

- **URL structure:** `/pt/`, `/en/`, `/es/` on one domain, with localised slugs (§4).
- **The root `/`:** redirects once by the browser's `Accept-Language`, falling back to `/en/`. Never by IP. The switcher keeps the same page.
- **`hreflang` on every page:**
  - `pt-PT`, `en`, `es-ES`, plus `x-default` pointing to `/en/`, through `alternates.languages` in Next.js metadata (Next.js docs, via context7).
  - A self-referencing canonical.
- **`sitemap.ts`** with language alternates per entry; **`robots.ts`** pointing to it.
- **Per page, per language:** a unique title and description, Open Graph and Twitter tags, and an OG image per language (LinkedIn previews).
- **JSON-LD:** `Organization` (legal name, Lisbon address, email, LinkedIn `sameAs`), `Service` per side with a "from" `Offer`, and `FAQPage`. No `Review` or rating markup.
- **Old URLs:** 301 `/privacy-policy` and `/terms-of-service` to their new `/en/` paths.
- **Domain:** fix `https://www` (§1.2 item 6); the apex stays canonical.
- **After launch:** Search Console and Bing Webmaster Tools, the sitemap submitted, Core Web Vitals checked monthly.
- **Later:** one strong PT page and one ES page per automation, targeting real searches. Verify their volumes before writing.

### 7.4 LinkedIn consistency

- **Company page:**
  - Tagline equals the site's promise: *"Automations for real estate agencies in Portugal and Spain, from the first contact to after the deed. Also: custom websites."*
  - The About text equals the homepage hero and Band 1.
  - The link goes to `/pt/` or `/en/` with UTM tags.
- **People:**
  - Manuel: both sides.
  - **Martim Gabriel:** Marketing & Communications, automations only, linking to `/pt/automacoes-imobiliarias` (his emails are in PT).
  - **Phil Hajjar:** Marketing & Communications, websites only, linking to `/en/websites` (or his main language).
- **The same words everywhere:**
  - the five names from §0.2;
  - "price and negotiation always stay with your team";
  - "in a few seconds, in the buyer's language";
  - launch pricing "from" figures, if posted.
- **Never:** "Matching", "6 seconds", unsourced statistics, or client names.
- Every post links to the most specific page (an automation section, the demo), in the audience's language.
- **Consistency with the proposals:** the proposal PDFs carry the prices, so the site's "from" figures must never be higher than a proposal's number for the same package (see Question 2).

---

## 8. What goes to the design phase

- **Content and structure only:**
  - the site map (§2);
  - the copy (§3–4);
  - the moments that need the strongest design:
    - the hero promise;
    - the five-automation journey ("from the first contact to after the deed");
    - the three-step handover ending on "price and negotiation stay with your team";
    - the demo phone with its calendar entry and handover card;
    - the pricing cards;
    - the two-team About page.
- **No portfolio, so the site itself is the proof.** It has to be one of the best-made sites a visitor has seen this year.
- **Hard constraints:**
  - no full-screen loader;
  - fast on a phone over 4G;
  - `prefers-reduced-motion` respected;
  - a working mobile menu;
  - three languages with no layout breaking on long PT/ES words;
  - Book a call reachable in one tap from every screen.
- **Visual direction:** from Manuel's guidance, his reference images, 21st.dev and Mobbin only. Not from Martim's proposal PDFs (each one is styled in the prospect agency's identity) and not from anything in this document.

---

## 9. Claims register (every factual line on the site → where it is true)

Sources are in `~/ryvo-automation-platform` unless marked.

| Claim used | Source |
|---|---|
| Wording, promises, the five PT names | Martim's email of 8 Oct 2026; Manuel's decisions, 15 Oct (§11) |
| Replies in a few seconds | `docs/outside-sweep.md:135-137` (p50 8.2 s, p95 12.9 s, 2,326 replies); `docs/concierge-runbook.md:2360` |
| Replies in PT / EN / ES / FR / DE | PT/EN/ES: `src/ai_disclosure.js:83`, `src/reply_language.js:36`. FR/DE: Manuel's decision, 15 Oct; they ship in the next Concierge change before any client signs (**launch dependency**) |
| Disclosure texts, enforced, not configurable, 30-day and post-hand-back repeat | `src/ai_disclosure.js:38-44, 74-81` |
| Price and negotiation handed to the team; other handover triggers; card fields | contract `legal/fonte/contrato-prestacao-servicos-v1.md:280-282`; `docs/handover-card-template.md:44-54` |
| Google Calendar; up to 3 slots in working hours; move or cancel | `docs/improvements-and-opportunities.md:879-881`; change 7 (`docs/WHERE-WE-LEFT-OFF.md:3`) |
| The right consultant (stickiness, area) | `docs/WHERE-WE-LEFT-OFF.md:1930-1933` |
| Stop honoured for good | `src/opt_out.js:58-80`; F4 fixed in change 8 (deployed 15 Oct) |
| Contact Reactivation: documented origin only; D and E never contacted; approved template; measured pace | `legal/fonte/enquadramento-conformidade.md:144-150`; contract `:320` |
| "No cold outreach…" line | `docs/ryvo-operations-and-commercial-reference.md:770` |
| Buyer Follow-up: listing → suitable buyers shown to the consultant; works without a CRM; calibration first | `docs/automation-03-no-crm-design.md:30-33`; `cockpit/src/lib/gates.ts:488-497`; wording per Martim's email |
| Listing Launch: PT/EN/ES/FR, consultant approval, energy class + AMI | `docs/WHERE-WE-LEFT-OFF.md:3716`; `cockpit/src/lib/publication/mentions.ts:59-101` |
| After the Deed: triggered by the deed; ask everyone | `docs/WHERE-WE-LEFT-OFF.md:5245`; `docs/automation-05-review-request-design.md:13-17` |
| Monday PDF report | `docs/weekly-report-auto-send-plan.md:137-146`; contract `:326` |
| No client login | ops reference `:59`; `docs/cockpit-design-brief.md:722` |
| Automations launch pricing 350 / 650 / 1,200 "from", ex VAT | `cockpit/src/lib/account/ladder.ts:11-19, 29`; ops reference `:15-27`; "launch pricing" label per Manuel |
| Websites from €1,500; care from €150/month | Manuel, 15 Oct |
| Paid pilot, no free trial | ops reference `:117` |
| Six weeks from signature, Meta-dependent | contract `:81`; ops reference `:310, 489` |
| Onboarding steps | `legal/fonte/percurso-do-cliente.md:56-196` |
| EU hosting with named US exceptions | ops reference `:164-165, 228-232`; `legal/fonte/anexo-ii-acordo-tratamento-dados-v1.md:107-114` |
| Lisbon & Madrid | Manuel, 15 Oct |
| Team roles | Manuel, 15 Oct |

**Not claimed, on purpose:**

- any client, case study, logo, testimonial or result;
- "6 seconds";
- the 78% / 21x / 917-minute statistics;
- a promise that early agencies keep their rate;
- daily backups of lead data;
- encryption at rest;
- "data never leaves the EU";
- Outlook support;
- an AI-written listing text;
- Spanish legal mentions;
- portal-email replies (planned; not mentioned).

---

## 10. Open questions

1. **EN and ES names** for the five automations (§0.2): confirm or replace.
2. **Do the proposal PDFs use the same launch prices** (Concierge €350, plus Contact Reactivation €650, all five €1,200 per month)? The site's "from" must never exceed what a proposal quotes.
3. **Manuel's title** on each side, and a one-line personal note for each of the three. Photos are to follow.
4. **PT address:** *a sua equipa* (site reader) or *a vossa equipa* (as in the email)? **ES:** *usted* or *tú*?
5. **Email reply promise** on the contact page: only if it is always kept.
6. **Legal pages:** lawyer review of the PT privacy policy and terms with the contract? And the *Livro de Reclamações* question.
7. **Vercel plan** for the website project: Hobby or Pro? This decides Plausible versus Vercel Analytics.
8. **The `www` certificate fix:** it is a production change, so it is yours. I can give the exact Vercel step.
9. **Websites side:** the real project steps and a typical timeline, and whether the client owns the domain and content.

---

## 11. Decisions log

**15 Oct 2026 (Manuel):**

1. Website prices: **websites from €1,500; care from €150/month.** No setup fees shown anywhere on the site.
2. **Martim's 8 Oct email is the source of truth for wording and promises.** The five PT names are used exactly: 01 Concierge de entrada · 02 Reactivação de contactos · 03 Acompanhamento de compradores (follow-up of buyers not yet ready, plus matching new listings to them; not "Matching") · 04 Lançamento de angariações · 05 Pós-escritura.
3. The assistant's reply languages may be stated as **PT, EN, ES, FR and DE**. FR and DE ship in the next change, before any client signs. The website stays PT/EN/ES.
4. **No client proof for now:** the Sastrería case study and all client names and logos are dropped.
5. **Team:**
   - Martim Gabriel: Marketing & Communications (outreach, social media, lead management), automations side only.
   - Phil Hajjar: Marketing & Communications, websites side only.
   - Manuel Vale on both.
   - Photos to follow.
6. **Madrid is a real base:** "Lisbon & Madrid" stays.
7. Pricing is labelled **"launch pricing"** only, with no rate-keeping promise.
8. **Booking:** two Google Calendar appointment schedules, embedded (automations: Manuel + Martim; websites: Manuel + Phil). No Calendly.
9. **Design:** nothing derived from Martim's proposal PDFs. The visual direction comes later from Manuel's guidance, references, 21st.dev and Mobbin. This session stays on content and structure.

**16 Oct 2026 (Manuel), answers to §10, and the design approved:**

1. **Names approved** as proposed in §0.2. On the site they are written in **sentence case**, as in the design: "Inbound concierge", "Contact reactivation", "Buyer follow-up", "Listing launch", "After the deed"; ES "Concierge de entrada", "Reactivación de contactos", "Seguimiento de compradores", "Lanzamiento de captaciones", "Post-escritura". This replaces "Entry concierge" in the design files.
2. **The proposals use the same ladder** (01 €350, 01+02 €650, all five €1,200), so the site's "from" prices are safe.
3. **Titles:** Manuel Vale "Founder" on both sides. Martim Gabriel and Phil Hajjar "Marketing & Communications", each on their own side. No personal lines for now.
4. **Register:** Portuguese "a sua equipa" (formal *você*) everywhere. Spanish *usted*.
5. **Analytics:** the website moves to Vercel Pro before launch, so we use **Vercel Web Analytics with custom events**. No Plausible. (§7.1 is superseded; the privacy policy names Vercel Web Analytics.)
6. **The `www` certificate is fixed** (§1.2 item 6 closed).
7. **The design is approved:** `docs/design/` (DESIGN-BRIEF.md, homepage v2 desktop and mobile, references). Where the v2 design copy differs from this plan, the design wins.

**16 Oct 2026 (Manuel), the build go:**

1. **Next.js 16** for the rebuild, so Archivo and Geist Mono both load from Google Fonts through `next/font`.
2. **Placeholder booking links** until Manuel sends the two Google appointment-schedule embed links.
3. **The English legal text** on `/pt` and `/es`, marked as English, until lawyer-reviewed translations exist.
4. **The five corrections to the v2 design are approved:**
   - keep today's footer text exactly;
   - the real Google embed inside the glass panel;
   - "in the first days" (How we work, step 02);
   - "EU consent rules (GDPR) built in" (trust line);
   - "Twenty minutes" stays, and both schedules are 20 minutes.

**16 Oct 2026 (Manuel), homepage review round:**

1. **Pricing model (replaces the three tiers).** Visitors tick any automations; default 01 + 02.
   - **Monthly, from (excl. VAT):** €350 for the first automation; each added one: 02 +€300, 03 +€200, 04 +€200, 05 +€150, 01 +€300 when it is not the first. Formula: 350 + the add-ons of those chosen − the highest add-on among them. Checks: 01 = 350 · 01+02 = 650 · 01+02+03 = 850 · +04 = 1,050 · all five = 1,200 · 04+05 = 500.
   - **One-time setup (excl. VAT):** €1,000 for the first automation, +€500 for Reactivation added to another, +€750 for each other extra. Checks: 01+02 = 1,500 · all five = 3,750 · 02 alone = 1,000.
   - **Labels:** "from", "launch pricing", "excl. VAT", "Setup: half at signing, half at go-live".
   - **Fine print:** "Reactivation includes 1,000 campaign messages a month; above that, Meta's message fee is passed on at cost." · "For agencies up to 8 consultants and one office; larger teams get a quote."
   - This supersedes "No setup fee is shown" (setup is now shown live) and the earlier three-tier control.
2. **Hero still B**, with the chat mapped onto the screen by its four corners (matrix3d).
3. **No 24-hour ruler, no thread.** Minimal is the rule.
4. **About leads with proof, not names.** Names move to /about (Manuel "Founder & Engineering"). The test figure is the real one, rounded down: 3,317 recorded on 13 Oct, so "3,300+". Updated in round 3: the regression record of 15 Oct 2026 (20:04 UTC) has 3,552 cockpit tests passed plus 113/113 root test files, so "3,600+" (PT/ES "3600+"). The 113 are test files, not single tests.
5. **Booking:** 30-minute calls ("Thirty minutes"). Superseded the same day: our own booking UI on hello@'s Google Calendar (free/busy + event with Meet; `docs/booking-google-setup.md`), with buttons to the Google pages as the fallback.

**16 Oct 2026 (Manuel), homepage review round 3:**

1. **First-visit intro**, once per session (sessionStorage, CSS only): the phone sharpens and rises, then RYVO, the headline, the subline and buttons, the chip last. Skipped on later visits and under reduced motion.
2. **Notch nav:** the four links sit in a notch cut into the hero card, but only where the notch clears the language switch and Book. Measured: EN from 1280 px, PT and ES from 1440 px (`NOTCH_AT` in `src/components/chrome/notch.ts`). Narrower desktops keep the links inline in the card's bar. Notch widths: EN 430, PT 490, ES 550.
3. **Floating pill** past the notch: stays within the hero, hides on scroll down after it, returns on scroll up. Phones: RYVO + menu. The bottom Book pill is now phone-only.
4. **Own booking UI** (pick → form → confirmation) on the Calendar API, with the Google pages as the fallback (§ launch checklist).
5. **Scroll word reveal** on the night-shift headline and the About body. **How we work** scales to fit the viewport while pinned.

**16 Oct 2026 (Manuel), homepage review round 4:**

1. **Hero cut-out re-matted** from the full-resolution still B with BiRefNet HR-matting (MIT, run locally; Kie offers only Recraft's remover, which made the old one). Defringed, choked ~0.5 px, feathered ~1 px, a faint silver rim and film grain over the edge. Same framing, so the screen corners are unchanged.
2. **01–05 row:** five equal columns, each number centred over its name, the row centred under the card.
3. **Chats (hero, demo, trust) play like iMessage** (`ChatThread`): bubbles grow from their tail corner, the stack glides up (transform only, so CLS stays 0), breathing dots, "Delivered" under the last sent message. Reduced motion: simply there. The hero no longer types character by character.
4. **Word reveal** on GSAP ScrollTrigger scrub (night shift, the Automations heading, the About proof line). It is a colour change, not movement, so it also runs with reduced motion on.
5. **Booking:** copy ~40% / panel ~60%; one week at a time with arrows; phones swipe every day with edge fades; the call types read "Automations" / "Websites".
6. **01 object:** the Seedance video is replaced by two interlocking chrome rings in real-time 3D (three.js 0.186.1), loaded near the section, rendered only on screen; the poster is a frame of the same scene.
7. **How we work:** no scaling; minimum sizes (body 15 px, labels 12 px, headings 20 px); the heading joins the steps' column; panels show fewer rows (settings 4 of 6, the handover card without "Timeframe", the report's two main sections).

**16 Oct 2026 (Manuel), homepage review round 5:**

0. **Intro bug:** the intro was gated by sessionStorage, so every reload of a tab skipped it; the word reveal ran, but from steel over ~490 px of scroll, too faint and too quick to notice. The intro now plays on every homepage load (`html.intro`, set in the head script; `?intro=1` forces it, `?intro=0` turns it off; never with reduced motion). Proved on a cold load and a reload in Manuel's own Chrome.
1. **New hero:** one backlit photograph per layout (Nano Banana Pro, chosen over GPT Image 2.5 for the cleaner silhouette): a dark hand and unbranded phone in front of a mercury glow, full-bleed in the card. A silhouette layer cut from it (BiRefNet matte) sits above the glass RYVO, so the letters pass behind the hand. The letters are filled with a blurred, brightened copy of the photo (frosted glass), with a light edge and a highlight; plain translucent letters where background-clip: text is missing. A vertical photo for phones. All layers share the photo's cover rectangle in container units, so the chat (4-corner mapped) and the silhouette line up at every size.
2. **Nav:** four line icons in the notch open into icon + label on hover or keyboard focus; the notch widens (three mask pieces on one transitioned width) while the top row folds (RYVO → R, the language switch → the current one, Book → a round arrow). CSS transitions rather than GSAP, so it works before GSAP has loaded and costs no script per frame. The floating pill opens the same way.
3. **Intro:** ~2 s; the photo is there from the first frame (it brightens and settles), headline lines from the left (80 px, blur to sharp), subline and buttons from the right, the glass RYVO, then the chip.
5. **Word reveal:** only the night-shift headline and the About proof line; from #2A2D32 to #F1F2F4 over a much longer scroll; words stay lit until just below the screen (no visible jump, contrast checks pass on load). The Automations heading is static again.
6. **How we work:** no container; the cards float over a soft glow.
7. **Trust:** no chat timing; buyers glide in from the right, replies from the left, once.
8. **Booking:** frosted glass over a mercury glow; one week from the first bookable day, only bookable days shown; a day opens its times inline; the panel follows its content's height.
9. **Spanish How-we-work heading:** "Hecho por ti. / Lo vigilamos nosotros." (Manuel's wording; informal *tú*, where the rest of the Spanish site uses *usted*).

**17 Oct 2026 (Manuel), homepage review round 6:**

1. **Hero photo again** (Nano Banana Pro): the phone perfectly upright (0°) and centred, a near-black hand with only a thin rim light, for desktop and phones; the chat re-mapped (the screen fits at 0°). The headline sits left of the phone with a soft darkening behind it so it reads on the glow; the chip is to the right. The hero files are versioned (hero6-…): the media folder is cached for a year as immutable, so reusing a file name would show returning visitors the old image.
2. **RYVO in liquid glass:** one SVG; each letter clips a blurred, brightened copy of the photo (aligned to it), with a 15% white tint, a highlight from above, an inner shadow toward the bottom right, a soft rim of light inside the edge, and a luminous edge brighter at the top left. Without the texture, the tint and edges still draw the letters.
3. **RYVO on the card's bottom edge**, slightly cut, full width; in the intro it rises from below the edge after the subline and buttons, before the chip.
4. **Booking:** only the current week is rendered, so no chip is ever cut; changing week slides the chips in; touch swipes change the week.
5. **No Next.js "N" badge:** devIndicators off (it never shipped in production builds).
6. **Spanish How-we-work heading:** "Lo hacemos por usted. / Lo vigilamos nosotros."
7. **Keyboard order:** RYVO, then the nav links, then the languages and Book (where the notch shows, the logo sits outside the card, before the notch).
8. **Booking live:** Manuel set up Google (OAuth client, refresh token, calendar id in .env.local); BOOKING_MOCK removed from .env.local. Vercel still needs the same four variables, added by Manuel by hand.

**17 Oct 2026 (Manuel), homepage review round 8, and the inner pages (stop point 4):**

1. **Bottom dark:** a deep gradient under the hand, full black on the card's edge and falling off softly to ~42% of the card's height (25% on phones, where RYVO is small), so RYVO rises out of darkness.
2. **RYVO as liquid glass:** a solid body: the photo itself seen through the letters, blurred (~30 px) and lifted, under a milky tint; a specular highlight lit from above on the top edges (two SVG lights: broad and sharp); a darker inner bottom edge; a fine luminous rim. Chromium also refracts: an SVG displacement driven by the letters' own bevel, applied after first paint, with a slight red/green-blue split at the rims. Safari and Firefox keep the blur, tint and highlights.
3. **Phone 28% larger:** the art box is zoomed 1.28× past cover around the phone (`--z`), upright and centred; the headline and right column still keep 48 px from the screen (measured at 1024–1920; on phones the phone sits 48 px+ below the headline).
4. **Phone story, keynote style:** one large element per scene, centred: a big notification → one big language chip whose codes roll and lock on the buyer's (only PT EN ES FR DE) → one large reply writing itself → a big 11:00 picked from two → a big "Viewing booked ✓" → the handover card. ~17 s loop.
5. **One card flies:** the flying layer is the same component as the screen's card, placed at its exact rect and scale on the frame the screen card is hidden. Frame-by-frame check at 1440 and 390.
6. **Right column:** ends on the card's right margin, balanced with the headline on the left (never nearer the screen than 48 px), its first line's top on the headline's (measured).

**Inner pages, in the homepage's system** (the hero card with the notch and folding top row, the floating pill, glass, type, entrances):
- `/automations`: the five automations, one glass section each (plan §3.2 copy, true claims only), the "switched on only after its checks" line, the weekly report, the same pricing picker with setup, FAQ (Q11 still held for the contract), booking CTA.
- `/websites`: the light silver page (the same tokens re-pointed, `.theme-light`), from €1,500 and care from €150 / month, Manuel Vale + Phil Hajjar only, a websites-call CTA (`/book?kind=websites`).
- `/about`: the proof line first (3,600+ automated tests on every change), then the team by side (Manuel on both, Martim on automations only, Phil on websites only; titles as Manuel gave them, in English in every language), Lisbon and Madrid, the company line. No people photos: monograms.
- `/book`: the full booking UI, both call types.
- 404 in the visitor's language (any unknown `/xx/...` path, status 404) and a global English 404 for paths without a language; restyled privacy and terms (text unchanged, English on /pt and /es, marked as English).

**17 Oct 2026 (Manuel), homepage review round 7:**

1. **The phone screen tells the whole story** (PhoneStory, GSAP, a ~14 s seamless loop on the agency's phone; only while on screen; reduced motion or no script: the booked final frame, still). Storyboard:
   - 0.0 s · lock screen, 23:47.
   - 0.5 s · a new enquiry drops in (blur to sharp, expo ease): "+351 9•• ••• •78", the buyer's first lines.
   - 1.8 s · it opens into the conversation; the buyer's message grows from its corner.
   - 2.9 s · language detected: a chrome light flicks across PT EN ES FR DE and locks on the buyer's.
   - 4.6 s · the AI reply (tagged "AI assistant") appears with dots, then writes itself word by word.
   - ~7 s · free times from the calendar appear (10:00, 11:00); the buyer answers "11:00"; that time snaps into chrome.
   - ~9.5 s · "Viewing booked" forms, its check drawing in.
   - ~11 s · the handover card (contact · language · looking for · budget) builds row by row, lifts off and flies out of the phone into the "Viewing booked" chip, which glows.
   - ~14 s · back to the lock screen, seamlessly.
   The buyer's message in the story states the budget, so the handover card only carries what was said.
2. **Hero light:** a new photo (Nano Banana Pro) with a soft, wide light spread from the upper left, no hot spot, dimmed ~15% and dithered (fine grain) against banding; versioned hero7-… files.
3. **Text on both sides of the phone:** headline left, subline + Book a call + See it answer right, each 48 px clear of the screen; the chip on the phone's right edge.
4. **Notch:** drawn in the page colour over the card in overlapping opaque pieces (no seams, no edge lines); the labels fade in once the room is open; more padding.
5. **RYVO glass:** darker body (the light seen through it at ~0.72), 5% tint, a slight refraction, crisp luminous edge, letters 22% taller.
6. **Booking:** the panel no longer clips the last row (its padding was not counted); every slot inside the hours is shown, the ones the calendar has taken struck through, disabled and labelled "unavailable".
7. **Top bar:** RYVO left, languages + Book right, in every state.
8. **Contrast:** soft scrims where the text sits and a lighter grey in the headline; measured AA for every hero text at 1024–1920 and 390 in EN/PT/ES.

**Launch checklist (before the Vercel preview works):**

- [ ] Booking on hello@'s calendar (own UI, replaces the Google embed): follow `docs/booking-google-setup.md`. Then in Vercel → Project → Settings → Environment Variables (Preview and Production), add by hand: `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REFRESH_TOKEN`, `BOOKING_CALENDAR_ID` = hello@ryvodigital.com. Never set `BOOKING_MOCK` in Vercel. Until these are set, the site shows buttons to the Google booking pages (the short links are in `src/lib/booking/config.ts`, so the `NEXT_PUBLIC_BOOKING_*` variables are no longer needed).
- [x] Booking hours confirmed by Manuel (round 4, 16 Oct): Mon–Fri 09:00–14:00 and 19:00–23:00, Saturday 10:30–17:00 for automations calls only, no Sundays, Madrid time (`src/lib/booking/config.ts`). The Google appointment schedules should match these for the fallback links.
- [ ] Move the project to Vercel Pro and turn on Web Analytics (custom events).
- [ ] The privacy policy names Google Calendar appointment schedules and Vercel Web Analytics (text change for Manuel and the lawyer).
- [ ] FR/DE replies are live in the product before the site says "PT · EN · ES · FR · DE".

**Earlier the same day (from the brief):**

- one "from" price per offer;
- PT/EN/ES only;
- two team presentations;
- no WhatsApp number on the site yet, with a slot reserved for +351 923 523 760 once it routes into the cockpit.
