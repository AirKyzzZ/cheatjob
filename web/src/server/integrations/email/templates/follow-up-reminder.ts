import { renderEmailLayout, escapeHtml } from "./layout";

type Locale = "fr" | "en" | "es" | "de";
const LOCALES: Locale[] = ["fr", "en", "es", "de"];

export type FollowUpReminderInput = {
  recruiterName: string | null;
  companyName: string;
  candidatureUrl: string;
  locale: string;
};

type Copy = {
  subject: string;
  heading: string;
  body: string[];
  accent: string;
  cta: string;
  footer: string;
};

const DEFAULT_RECRUITER: Record<Locale, string> = {
  fr: "le recruteur",
  en: "the recruiter",
  es: "el reclutador",
  de: "die Ansprechperson",
};

// Voice per brand charter: tu / informal, declarative, confident, one italic
// signature line, no em dashes.
const COPY: Record<Locale, (recruiter: string, company: string) => Copy> = {
  fr: (r, c) => ({
    subject: `Relance ${r} chez ${c}`,
    heading: "7 jours. Le bon moment pour relancer.",
    body: [
      `Tu as contacté ${r} chez ${c} il y a une semaine. Pas de réponse, c'est normal.`,
      `Une relance courte double tes chances. Deux lignes suffisent : tu rappelles ton intérêt, tu redemandes un échange de 15 minutes.`,
    ],
    accent: "Ceux qui relancent passent devant.",
    cta: "Relancer maintenant",
    footer: "Tu reçois ce rappel parce que tu as marqué cette candidature comme envoyée sur cheatjob.",
  }),
  en: (r, c) => ({
    subject: `Follow up with ${r} at ${c}`,
    heading: "7 days in. Time to follow up.",
    body: [
      `You reached out to ${r} at ${c} a week ago. No reply, that's normal.`,
      `A short follow-up doubles your odds. Two lines: restate your interest, ask again for a 15-minute chat.`,
    ],
    accent: "The ones who follow up get the interview.",
    cta: "Follow up now",
    footer: "You're getting this reminder because you marked this application as sent on cheatjob.",
  }),
  es: (r, c) => ({
    subject: `Haz seguimiento a ${r} en ${c}`,
    heading: "7 días. Momento de insistir.",
    body: [
      `Contactaste a ${r} en ${c} hace una semana. Sin respuesta, es normal.`,
      `Un seguimiento breve duplica tus opciones. Dos líneas: recuerdas tu interés y vuelves a pedir 15 minutos.`,
    ],
    accent: "Quien insiste consigue la entrevista.",
    cta: "Hacer seguimiento",
    footer: "Recibes este recordatorio porque marcaste esta candidatura como enviada en cheatjob.",
  }),
  de: (r, c) => ({
    subject: `Bei ${r} bei ${c} nachfassen`,
    heading: "7 Tage. Zeit, nachzufassen.",
    body: [
      `Du hast ${r} bei ${c} vor einer Woche kontaktiert. Keine Antwort, das ist normal.`,
      `Kurzes Nachfassen verdoppelt deine Chancen. Zwei Zeilen: Interesse bekräftigen, nochmal um 15 Minuten bitten.`,
    ],
    accent: "Wer nachfasst, bekommt das Gespräch.",
    cta: "Jetzt nachfassen",
    footer: "Du erhältst diese Erinnerung, weil du diese Bewerbung auf cheatjob als gesendet markiert hast.",
  }),
};

export function renderFollowUpReminder(input: FollowUpReminderInput): {
  subject: string;
  html: string;
  text: string;
} {
  const locale = (LOCALES as string[]).includes(input.locale) ? (input.locale as Locale) : "fr";
  const rawRecruiter = input.recruiterName?.trim() || DEFAULT_RECRUITER[locale];
  const rawCompany = input.companyName.trim();

  // Subject + plain-text use raw values; HTML uses escaped values.
  const raw = COPY[locale](rawRecruiter, rawCompany);
  const esc = COPY[locale](escapeHtml(rawRecruiter), escapeHtml(rawCompany));

  const bodyHtml = esc.body.map((p) => `<p style="margin:0 0 14px 0;">${p}</p>`).join("");
  const html = renderEmailLayout({
    preheader: raw.body[0],
    heading: esc.heading,
    bodyHtml,
    accentItalic: esc.accent,
    ctaLabel: esc.cta,
    ctaUrl: input.candidatureUrl,
    footerText: raw.footer,
  });

  const text = `${raw.heading}\n\n${raw.body.join("\n\n")}\n\n${raw.accent}\n\n${raw.cta}: ${input.candidatureUrl}`;

  const subject = raw.subject.replace(/[\r\n\t]+/g, " ").trim();
  return { subject, html, text };
}
