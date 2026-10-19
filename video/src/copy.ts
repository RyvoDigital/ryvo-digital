import { createContext, useContext } from "react";

// The film's captions in each language. Only the words change between the
// three films: every frame, timing, animation and layout is the same. The
// names and taglines are the site's own (src/i18n); a line that would not fit
// the English layout is reworded shorter, never the layout changed (measured
// at the film's sizes, 19 Oct 2026): PT 03 is "Seguimento de compradores",
// the name the site uses too ("Acompanhamento" alone was wider than the
// name's box); ES "Cinco automatizaciones" fills the frame at 168 px, so
// "5 automatizaciones"; the night line is a little shorter in both; PT's third statement drops "sempre"
// to keep 0.4 s a word plus 1 s within its fixed 4.6 s. "\n" in a name sets
// its line break (otherwise it breaks at its middle word, as in English).
export type Lang = "en" | "pt" | "es";

const COPY = {
  en: {
    night: "Enquiries arrive at any hour.",
    intro: ["Five automations", "from the first contact until after the deed."],
    moments: [
      ["Inbound concierge", "Every enquiry answered in a few seconds, in the buyer’s language, and the viewing booked."],
      ["Contact reactivation", "Get back in touch with the people who already know you."],
      ["Buyer follow-up", "Keep close the buyers who are not ready yet."],
      ["Listing launch", "One listing, four languages, the legal lines in place."],
      ["After the deed", "A thank-you and a review request, to every client."],
    ],
    howLabel: "HOW WE WORK",
    how: [
      ["We adapt each one to how", "your agency already works."],
      ["We run it for you", "on a monthly retainer."],
      ["Price and negotiation", "always stay with your team."],
      ["It always says", "it is an AI."],
    ],
    end: "REAL ESTATE AUTOMATIONS",
  },
  pt: {
    night: "Os pedidos chegam a toda a hora.",
    intro: ["Cinco automações", "desde o primeiro contacto até depois da escritura."],
    moments: [
      ["Concierge de entrada", "Cada pedido respondido em poucos segundos, no idioma do comprador, e a visita marcada."],
      ["Reativação\nde contactos", "Retome o contacto com quem já conhece a sua agência."],
      ["Seguimento de compradores", "Mantenha por perto quem ainda não está pronto para comprar."],
      ["Lançamento\nde angariações", "Uma angariação, quatro idiomas, as menções legais no sítio."],
      ["Pós-escritura", "Um agradecimento e um pedido de avaliação, a cada cliente."],
    ],
    howLabel: "COMO TRABALHAMOS",
    how: [
      ["Adaptamos cada uma à forma", "como a sua agência já trabalha."],
      ["Gerimo-la por si,", "com uma mensalidade."],
      ["O preço e a negociação", "ficam com a sua equipa."],
      ["Diz sempre", "que é uma IA."],
    ],
    end: "AUTOMAÇÕES IMOBILIÁRIAS",
  },
  es: {
    night: "Las consultas llegan a todas horas.",
    intro: ["5 automatizaciones", "desde el primer contacto hasta después de la escritura."],
    moments: [
      ["Concierge de entrada", "Cada consulta respondida en pocos segundos, en el idioma del comprador, y la visita agendada."],
      ["Reactivación\nde contactos", "Retome el contacto con quienes ya conocen su agencia."],
      ["Seguimiento de compradores", "Mantenga cerca a los compradores que aún no están listos."],
      ["Lanzamiento\nde captaciones", "Una captación, cuatro idiomas, las menciones legales en su sitio."],
      ["Post-escritura", "Un agradecimiento y una petición de reseña, a cada cliente."],
    ],
    howLabel: "CÓMO TRABAJAMOS",
    how: [
      ["Adaptamos cada una a cómo", "ya trabaja su agencia."],
      ["La gestionamos por usted,", "con una cuota mensual."],
      ["El precio y la negociación", "siempre quedan en su equipo."],
      ["Siempre dice", "que es una IA."],
    ],
    end: "AUTOMATIZACIONES INMOBILIARIAS",
  },
} satisfies Record<Lang, unknown>;

export type Copy = (typeof COPY)["en"];
const LangContext = createContext<Lang>("en");
export const LangProvider = LangContext.Provider;
export const useCopy = (): Copy => COPY[useContext(LangContext)];
