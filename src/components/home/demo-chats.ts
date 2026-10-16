// The simulated conversation in the five languages the assistant answers in.
// Strings are the approved design's, with the viewing date filled in on the
// visitor's device (the next Thursday at least two days ahead).

export const CHAT_LANGS = ["PT", "EN", "ES", "FR", "DE"] as const;
export type ChatLang = (typeof CHAT_LANGS)[number];

const INTL: Record<ChatLang, string> = { PT: "pt-PT", EN: "en-GB", ES: "es-ES", FR: "fr-FR", DE: "de-DE" };

export function chatDates(lang: ChatLang, d: Date | null) {
  const day = d?.getDate();
  const month = d ? new Intl.DateTimeFormat(INTL[lang], { month: "long" }).format(d) : "";
  switch (lang) {
    case "PT": return d ? { a: `quinta-feira, ${day} de ${month}`, b: `quinta-feira, ${day} de ${month}` } : { a: "quinta-feira", b: "quinta-feira" };
    case "EN": return d ? { a: `Thursday ${day} ${month}`, b: `Thursday ${day} ${month}` } : { a: "Thursday", b: "Thursday" };
    case "ES": return d ? { a: `el jueves ${day} de ${month}`, b: `jueves ${day} de ${month}` } : { a: "el jueves", b: "jueves" };
    case "FR": return d ? { a: `jeudi ${day} ${month}`, b: `jeudi ${day} ${month}` } : { a: "jeudi", b: "jeudi" };
    case "DE": return d ? { a: `Donnerstag, den ${day}. ${month}`, b: `Donnerstag, ${day}. ${month}` } : { a: "Donnerstag", b: "Donnerstag" };
  }
}

export const CHATS: Record<ChatLang, { status: string; l1: string; a1: string; lp: string; ap: string; l2: string; a2: string; composer: string; delivered: string }> = {
  PT: { status: "Assistente de IA · responde 24/7", l1: "Olá! O T3 em Cascais ainda está disponível? Podia visitá-lo esta semana?", a1: "Olá, sou o assistente de IA da agência. Sim, está disponível. Temos {a}, às 10:00 ou às 11:00. Qual prefere?", l2: "Às 11:00, por favor", a2: "Marcado: {b}, às 11:00. Um consultor espera por si no local.", lp: "Tem estacionamento?", ap: "Sim: um lugar na garagem do prédio e uma arrecadação.", composer: "Mensagem", delivered: "Entregue" },
  EN: { status: "AI assistant · replies 24/7", l1: "Hi! Is the T3 in Cascais still available? Could I see it this week?", a1: "Hello, I’m the agency’s AI assistant. Yes, it’s available. We have {a} at 10:00 or 11:00. Which suits you?", l2: "11:00 please", a2: "Booked: {b} at 11:00. A consultant will meet you there.", lp: "Does it have parking?", ap: "Yes: one space in the building’s garage, plus a storage room.", composer: "Message", delivered: "Delivered" },
  ES: { status: "Asistente de IA · responde 24/7", l1: "¡Hola! ¿Sigue disponible el piso de tres dormitorios en Cascais? ¿Podría verlo esta semana?", a1: "Hola, soy el asistente de IA de la agencia. Sí, está disponible. Tenemos {a} a las 10:00 o a las 11:00. ¿Cuál le viene mejor?", l2: "A las 11:00, por favor", a2: "Reservado: {b} a las 11:00. Un asesor le esperará allí.", lp: "¿Tiene aparcamiento?", ap: "Sí: una plaza en el garaje del edificio y un trastero.", composer: "Mensaje", delivered: "Entregado" },
  FR: { status: "Assistant IA · répond 24h/24", l1: "Bonjour ! Le T3 à Cascais est-il toujours disponible ? Pourrais-je le visiter cette semaine ?", a1: "Bonjour, je suis l’assistant IA de l’agence. Oui, il est disponible. Nous avons {a} à 10h00 ou à 11h00. Quelle heure vous convient ?", l2: "11h00, s’il vous plaît", a2: "C’est réservé : {b} à 11h00. Un conseiller vous y attendra.", lp: "Y a-t-il un parking ?", ap: "Oui : une place dans le garage de l’immeuble, et une cave.", composer: "Message", delivered: "Distribué" },
  DE: { status: "KI-Assistent · antwortet rund um die Uhr", l1: "Hallo! Ist die 3-Zimmer-Wohnung in Cascais noch verfügbar? Könnte ich sie diese Woche besichtigen?", a1: "Hallo, ich bin der KI-Assistent der Agentur. Ja, sie ist verfügbar. Wir haben {a}, um 10:00 oder 11:00 Uhr. Was passt Ihnen?", l2: "11:00 Uhr bitte", a2: "Gebucht: {b}, um 11:00 Uhr. Ein Berater erwartet Sie vor Ort.", lp: "Gibt es einen Parkplatz?", ap: "Ja: ein Stellplatz in der Tiefgarage des Hauses und ein Abstellraum.", composer: "Nachricht", delivered: "Zugestellt" },
};

export const LANG_NAME: Record<ChatLang, string> = { PT: "Português", EN: "English", ES: "Español", FR: "Français", DE: "Deutsch" };
