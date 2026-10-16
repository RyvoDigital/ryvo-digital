// English is the master copy. PT and ES mirror this shape exactly.

export type CalcToken =
  | { t: "text"; v: string; strong?: boolean }
  | { t: "input"; key: "enq" | "after" | "unans" | "close" | "comm"; label: string };

const en = {
  meta: {
    homeTitle: "Ryvo Digital · AI automations for luxury real estate",
    homeDescription:
      "Every enquiry answered in seconds, in the buyer’s language, and the viewing booked. Automations from first contact to after the deed, for agencies in Portugal and Spain.",
  },
  nav: {
    automations: "Automations",
    websites: "Websites",
    how: "How we work",
    about: "About",
    book: "Book a call",
    menu: "Open menu",
    close: "Close menu",
    main: "Main",
    language: "Language",
  },
  ruler: { answered: "23:47 · ANSWERED" },
  hero: {
    eyebrow: ["AI AUTOMATIONS", "FOR LUXURY REAL ESTATE/"],
    titleA: "Every enquiry",
    titleB: "answered.",
    titleC: "In seconds,",
    titleD: "in the buyer’s",
    titleE: "language.",
    body: "Ryvo answers every new contact on your WhatsApp, day and night, books the viewing in your calendar and hands the client to the right consultant.",
    primary: "Book a call",
    secondary: "See it answer",
    cities: ["LISBON", "MADRID"],
    repliesIn: "REPLIES IN",
    chipLabel: "VIEWING BOOKED",
    chipValue: "Thu 22 Oct · 11:00",
    chat: {
      agency: "Your agency",
      status: "AI assistant · replies 24/7",
      stamp: "TODAY · 23:47",
      l1: "Hi! Is the T3 in Cascais still available? Could I see it this week?",
      a1: "Hello, I’m the agency’s AI assistant. Yes, it’s available. Thursday 22 October at 10:00 or 11:00?",
      l2: "11:00 please",
      a2: "Booked: Thursday 22 October at 11:00. A consultant will meet you there.",
    },
  },
  automationNames: ["Inbound concierge", "Contact reactivation", "Buyer follow-up", "Listing launch", "After the deed"],
  night: {
    label: ["THE NIGHT", "SHIFT/"],
    line1: "A buyer writes at 23:47.",
    line2a: "Ryvo",
    line2b: "answers in seconds.",
    line3: "Your team wakes up to",
    line4: "booked viewings.",
    pills: ["Answer", "Qualify", "Book"],
    typing: "Typing",
  },
  calc: {
    label: "THE COST OF A LATE REPLY · TYPE YOUR OWN NUMBERS",
    labelShort: "THE COST OF A LATE REPLY",
    sentence: [
      { t: "text", v: "We get " },
      { t: "input", key: "enq", label: "Enquiries per month" },
      { t: "text", v: " enquiries a month. ", strong: true },
      { t: "input", key: "after", label: "Percent arriving after hours" },
      { t: "text", v: "%", strong: true },
      { t: "text", v: " arrive after hours, and " },
      { t: "input", key: "unans", label: "Percent of those answered too late" },
      { t: "text", v: "%", strong: true },
      { t: "text", v: " of those get a late reply. About " },
      { t: "input", key: "close", label: "Percent that become a sale" },
      { t: "text", v: "%", strong: true },
      { t: "text", v: " become a sale, worth " },
      { t: "text", v: "€", strong: true },
      { t: "input", key: "comm", label: "Commission per sale, in euros" },
      { t: "text", v: " each.", strong: true },
    ] as CalcToken[],
    resultLabel: "COMMISSION AT RISK, EVERY MONTH",
    note: "Example figures to start. An estimate from your numbers, not a promise.",
  },
  pill: { book: "Book a call" },
};

export default en;
export type Dictionary = typeof en;
