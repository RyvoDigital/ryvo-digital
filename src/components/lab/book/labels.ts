import type { Locale } from "@/i18n/config";

// Round 1 only: the few short labels the two directions add, kept here so the
// lab does not touch src/i18n while three sessions share it. The chosen
// direction's labels move into src/i18n/pages.ts in round 2. Every line is
// plainly true: the people on each call (Manuel's brief), the steps, what the
// invitation does (the existing doneBody), the two cities (the footer).
export type BookLabels = {
  with: [string, string];
  steps: [string, string, string];
  stepQs: [string, string, string];
  next: string;
  nextSteps: [string, string, string];
  write: string;
  copy: string;
  copied: string;
  lisbon: string;
  madrid: string;
  yourTime: string;
  inLisbon: string;
  duration: string;
  where: string;
  stepOf: string;
};

export const LABELS: Record<Locale, BookLabels> = {
  en: {
    with: ["With Manuel or Martim", "With Manuel or Phil"],
    steps: ["Call", "Time", "Details"],
    stepQs: ["Which call?", "When suits you?", "Who are we meeting?"],
    next: "What happens next",
    nextSteps: [
      "You pick a time that suits you.",
      "A Google Calendar invitation with the Meet link reaches your inbox. Accept, decline or reschedule from it.",
      "Thirty minutes on Google Meet.",
    ],
    write: "Prefer to write?",
    copy: "Copy",
    copied: "Copied",
    lisbon: "Lisbon",
    madrid: "Madrid",
    yourTime: "your time",
    inLisbon: "In Lisbon",
    duration: "30 minutes",
    where: "Google Meet",
    stepOf: "of",
  },
  pt: {
    with: ["Com o Manuel ou o Martim", "Com o Manuel ou o Phil"],
    steps: ["Chamada", "Horário", "Dados"],
    stepQs: ["Que chamada?", "Quando lhe dá jeito?", "Com quem vamos falar?"],
    next: "O que acontece a seguir",
    nextSteps: [
      "Escolhe o horário que lhe convém.",
      "Recebe um convite do Google Calendar com o link do Meet. Pode aceitar, recusar ou reagendar a partir dele.",
      "Trinta minutos no Google Meet.",
    ],
    write: "Prefere escrever?",
    copy: "Copiar",
    copied: "Copiado",
    lisbon: "Lisboa",
    madrid: "Madrid",
    yourTime: "a sua hora",
    inLisbon: "Em Lisboa",
    duration: "30 minutos",
    where: "Google Meet",
    stepOf: "de",
  },
  es: {
    with: ["Con Manuel o Martim", "Con Manuel o Phil"],
    steps: ["Llamada", "Horario", "Datos"],
    stepQs: ["¿Qué llamada?", "¿Cuándo le va bien?", "¿Con quién hablamos?"],
    next: "Qué pasa después",
    nextSteps: [
      "Elige el horario que le va bien.",
      "Recibe una invitación de Google Calendar con el enlace de Meet. Puede aceptarla, rechazarla o cambiar la hora desde ella.",
      "Treinta minutos en Google Meet.",
    ],
    write: "¿Prefiere escribir?",
    copy: "Copiar",
    copied: "Copiado",
    lisbon: "Lisboa",
    madrid: "Madrid",
    yourTime: "su hora",
    inLisbon: "En Lisboa",
    duration: "30 minutos",
    where: "Google Meet",
    stepOf: "de",
  },
};
