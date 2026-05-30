// Branded email shell — charter colors (warm canvas, burgundy accent), serif
// wordmark + display + accent (Georgia fallback; email clients ignore web fonts),
// Geist-style sans fallback for body. Table layout + inline styles for client safety.

const CANVAS = "#FAF9F6";
const SURFACE = "#FFFFFF";
const INK = "#0A0A0A";
const SECONDARY = "#6B6B6B";
const BORDER = "#E8E6E1";
const BURGUNDY = "#6B1F28";
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type EmailLayoutInput = {
  preheader?: string;
  heading: string;
  bodyHtml: string;
  accentItalic?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerText?: string;
};

export function renderEmailLayout(i: EmailLayoutInput): string {
  const cta =
    i.ctaLabel && i.ctaUrl
      ? `<tr><td style="padding:28px 32px 0 32px;">
        <a href="${escapeHtml(i.ctaUrl)}" style="display:inline-block;background:${BURGUNDY};color:${CANVAS};font-family:${SANS};font-size:15px;font-weight:500;text-decoration:none;padding:13px 24px;border-radius:8px;">${i.ctaLabel}</a>
      </td></tr>`
      : "";
  const accent = i.accentItalic
    ? `<tr><td style="padding:22px 32px 0 32px;"><p style="margin:0;font-family:${SERIF};font-style:italic;font-size:18px;line-height:1.3;color:${BURGUNDY};">${i.accentItalic}</p></td></tr>`
    : "";

  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"></head>
<body style="margin:0;padding:0;background:${CANVAS};">
${i.preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(i.preheader)}</div>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CANVAS};padding:32px 16px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:${SURFACE};border:1px solid ${BORDER};border-radius:16px;">
  <tr><td style="padding:32px 32px 0 32px;"><span style="font-family:${SERIF};font-size:22px;color:${BURGUNDY};letter-spacing:-0.5px;">cheatjob</span></td></tr>
  <tr><td style="padding:24px 32px 0 32px;"><h1 style="margin:0;font-family:${SERIF};font-size:28px;line-height:1.12;color:${INK};font-weight:400;">${i.heading}</h1></td></tr>
  <tr><td style="padding:16px 32px 0 32px;font-family:${SANS};font-size:16px;line-height:1.55;color:${INK};">${i.bodyHtml}</td></tr>
  ${accent}
  ${cta}
  <tr><td style="padding:32px;"><hr style="border:none;border-top:1px solid ${BORDER};margin:0 0 16px 0;"><p style="margin:0;font-family:${SANS};font-size:12px;line-height:1.5;color:${SECONDARY};">${escapeHtml(i.footerText ?? "cheatjob, le logiciel qui contacte les recruteurs à ta place.")}</p></td></tr>
</table>
</td></tr></table>
</body></html>`;
}
