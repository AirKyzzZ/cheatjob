# Cheatjob — Brand Charter

Single source of truth for every design, copy, and marketing decision. If a deliverable contradicts this document, the document wins.

---

## 1. Brand snapshot

| Field | Value |
|---|---|
| Name | Cheatjob |
| Domain (primary) | cheatjob.fr |
| Category | B2C SaaS, AI job-search assistant |
| Target | French students hunting alternance or stage (bac+2 to bac+5) |
| Core wedge | Email reconstruction + AI-personalized cold outreach to hiring managers |
| Founder narrative | "J'ai trouvé mon stage et mon poste dans une licorne comme ça. Maintenant je te donne la méthode en SaaS." |
| Positioning line (FR) | Pas de réseau ? On t'en fabrique un. |
| One-liner (FR) | Le logiciel qui contacte les recruteurs à ta place. Directement dans leur boîte mail. |

## 2. Positioning and voice

### Archetype
**The Outlaw with receipts.** The product is provocative on the outside, rigorous on the inside. The look is premium and credible so the reader trusts the tool. The copy is confident and slightly arrogant so the reader feels like an insider.

### Tone rules

- Address the reader as **tu**, never **vous**.
- Short sentences. One idea per sentence.
- Confident, not apologetic. The product works and we know it.
- Prefer declarative to interrogative. "Les RH ne liront jamais ton CV." beats "Est-ce que les RH lisent ton CV ?"
- Slightly arrogant is fine. Cringe is not. One joke per section max.
- Never the word **piston**. It belongs to a competitor (mon-piston.fr) and is semantically off.
- Never **em dashes** or **en dashes** in copy. Use commas, periods, or colons. Writers who rely on em dashes signal AI output.
- Never corporate jargon: "unleash", "empower", "leverage", "game-changer", "nouvelle génération". Banned.
- French first. No franglais gimmicks. Technical terms like "email", "inbox", "follow-up" stay English because that is how users speak them in real life.

### Accent voice moments
One sentence in **Instrument Serif Italic** per screen maximum. This is our editorial signature. Use it for the cutting observation that punctuates a section:

> *Le système n'est pas cassé. Il est juste fermé.*

## 3. Typography

All fonts free, served via Google Fonts or self-hosted.

### Stack

| Role | Family | Weight | Source |
|---|---|---|---|
| Display | Instrument Serif | 400 regular, 400 italic | Google Fonts |
| Body and UI | Geist | 400, 500, 600 | Vercel, open source |
| Mono (optional) | Geist Mono | 400, 500 | Vercel, open source |

### Typographic system

| Token | Font | Size | Weight | Line height | Tracking |
|---|---|---|---|---|---|
| display-xl | Instrument Serif | 80 | 400 | 0.95 | -2% |
| display-lg | Instrument Serif | 56 | 400 | 1.0 | -1.5% |
| display-md | Instrument Serif | 40 | 400 | 1.05 | -1% |
| heading-xl | Geist | 32 | 600 | 1.15 | -0.5% |
| heading-lg | Geist | 24 | 600 | 1.2 | -0.5% |
| heading-md | Geist | 18 | 600 | 1.3 | 0% |
| body-lg | Geist | 18 | 400 | 1.55 | 0% |
| body-md | Geist | 16 | 400 | 1.55 | 0% |
| body-sm | Geist | 14 | 400 | 1.5 | 0% |
| caption | Geist | 12 | 500 | 1.4 | 2% |
| accent-italic | Instrument Serif Italic | 24 | 400 italic | 1.3 | 0% |

### Usage rules

- Instrument Serif is reserved for display, hero, pull quotes, section openers, and the accent italic.
- Never set body copy in Instrument Serif. It is a display face, not a reading face.
- Geist is the default for everything else, including buttons, forms, pricing tables, dashboards.
- Use Instrument Serif Italic sparingly. Target: one italic sentence per section, never two in a row.

## 4. Color palette

### Core tokens

| Token | Hex | Role |
|---|---|---|
| `bg-canvas` | `#FAF9F6` | Primary background, warm off-white |
| `bg-surface` | `#FFFFFF` | Cards, elevated surfaces, pricing boxes |
| `bg-inverse` | `#0A0A0A` | Rare, for one high-contrast section per page max |
| `text-primary` | `#0A0A0A` | Body copy, headings |
| `text-secondary` | `#6B6B6B` | Sub-labels, captions, meta |
| `text-tertiary` | `#9A9A9A` | Placeholder, disabled |
| `border-subtle` | `#E8E6E1` | Default borders, dividers |
| `border-strong` | `#CFCBC2` | Input focus, emphasized borders |
| `accent` | `#6B1F28` | **Burgundy.** Primary accent, CTA, links, brand |
| `accent-hover` | `#561821` | Darker burgundy for hover states |
| `accent-subtle` | `#F5E8EA` | Very light burgundy tint for backgrounds, badges |
| `destructive` | `#B91C1C` | Errors, warnings |
| `success` | `#166534` | Confirmations |

### Usage rules

- One accent color, burgundy, used with discipline. Never more than 5% of any screen.
- CTAs are filled burgundy, text primary on the button is `#FAF9F6`.
- Links are burgundy, underlined on hover.
- Never gradients. Never shadows on buttons. Flat design, premium restraint.
- The inverse section (`bg-inverse`) is optional and should appear at most once per landing page, ideally for a pull-quote or testimonial section, to create contrast rhythm.

### Contrast and accessibility

- Primary text on canvas: 19:1 (AAA)
- Accent on canvas: 8.1:1 (AAA for normal text)
- Secondary text on canvas: 6.5:1 (AA for normal text)
- All CTAs must pass WCAG AA at a minimum.

## 5. Logo system

### Direction
Editorial lowercase wordmark set in **Instrument Serif Regular**, tight kerning (-1% tracking), primary accent burgundy on warm off-white canvas. No icon, no container, no tagline inside the mark.

### Variations to generate

1. **Primary wordmark**: `cheatjob` lowercase, Instrument Serif Regular, burgundy on cream.
2. **Italic variant**: `cheatjob` lowercase, Instrument Serif Italic, burgundy on cream. This is the signature moment, used in video outros and social headers.
3. **Statement variant**: `cheatjob.` with a period, Instrument Serif Regular, burgundy on cream. The period turns the wordmark into a declarative statement.
4. **Monogram + wordmark lockup**: A `cj` ligature monogram to the left of the wordmark, used for app icons and favicons. Keep the monogram geometric and simple so it reads at 16px.

### Logo rules

- Never stretch, skew, or recolor the wordmark outside the defined palette.
- Minimum clear space around the mark equals the x-height of the lowercase letters.
- Minimum display size: 80px wide on digital, 20mm on print.
- On dark backgrounds (rare, only for one hero section) the wordmark inverts to `#FAF9F6` on `#0A0A0A`.
- Never add drop shadows, outlines, glows, or 3D effects.

## 6. Imagery and iconography

- **Photography**: editorial portraits, natural light, minimal retouching. Think French magazine (Society, Les Inrocks, M Le Monde). Avoid stock-photo smiling.
- **Screenshots**: framed in a thin `#E8E6E1` border with 24px padding on a `#FFFFFF` surface. No device mockups. No drop shadows.
- **Icons**: Lucide or Phosphor, thin stroke (1.5px), `#0A0A0A` default. Never accent color on icons except for a single meaningful moment per screen.
- **Illustrations**: avoid for v1. If ever needed, editorial line drawings only, no corporate blob illustrations, no isometric 3D.

## 7. Component rules (for Stitch 2.0 brief)

- **Buttons**: 44px height, 24px horizontal padding, 8px radius, Geist 500, no shadow.
- **Inputs**: 48px height, 16px horizontal padding, 8px radius, 1px `border-subtle`, focus state 2px `accent`.
- **Cards**: `bg-surface`, 1px `border-subtle`, 16px radius, 32px padding.
- **Max content width**: 1200px desktop, 32px horizontal padding on mobile.
- **Grid**: 12 columns, 24px gutter.
- **Section vertical rhythm**: 120px top and bottom padding desktop, 80px mobile.

## 8. Don't list

- No dark mode for v1.
- No gradients anywhere.
- No drop shadows on buttons, cards, or text.
- No emoji in UI copy. (Social copy is fine, landing page is not.)
- No word "piston".
- No em or en dashes in body copy.
- No stock illustrations of hands holding phones.
- No testimonial carousels with 5-star graphics.
- No "featured in" logo strips until we actually are featured.
- No French flag or tricolor anywhere. The brand is French by voice, not by visual cliché.

## 9. Taglines and copy starters (working set)

Shortlist, for landing hero rotation or A/B testing:

- Pas de réseau ? On t'en fabrique un.
- Les RH ne liront jamais ton CV. Nous, on contacte leur patron.
- Le logiciel qui trouve l'email du recruteur et lui écrit à ta place.
- L'alternance que tu n'auras pas si tu passes par Indeed.
- Trouver un stage, version 2026. Sans piston, sans attendre, sans espoir.

Signature italic moments:

- *Le système n'est pas cassé. Il est juste fermé.*
- *Ton CV vaut rien dans une pile de 400. On le sort de la pile.*
- *Pendant qu'ils postulent, toi tu contactes.*

## 10. File and asset locations

- This charter: `docs/brand/charter.md`
- Logo prompt: `docs/brand/nano-banana-logo-prompt.json`
- Generated logos (pending): `docs/brand/logos/`
- Tokens for Tailwind: to be generated into `tailwind.config.ts` when the Next.js project is scaffolded

## 11. Versioning

- v0.1: Initial charter, 2026-04-18. Maxime Mansiet.

Every material change to color, typography, or logo direction should bump the version and summarize the change at the top of this file.
