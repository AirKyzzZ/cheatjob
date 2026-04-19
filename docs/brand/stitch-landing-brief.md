# Cheatjob — Google Stitch 2.0 Landing Page Brief

Comprehensive brief for generating the Cheatjob landing page visual design in Google Stitch 2.0. Paste the full prompt block below into Stitch. Copy anchors all in French.

---

## How to use this file

1. Copy the single `STITCH 2.0 PROMPT` block at the bottom of this file.
2. Paste into Google Stitch 2.0 (Pro account).
3. Generate. Iterate in Stitch with targeted edits.
4. When the design lands, export/screenshot and hand to Claude Code for Next.js implementation.

Reference files that inform the brief:
- `docs/brand/charter.md` — brand system (do not violate)
- `docs/brand/logos/cheatjob-mark-v5.png` — current mark
- Market research findings informed the copy and positioning

## Design philosophy for this landing page

**Editorial-premium light mode meets modern 2026 motion grammar.**

The visual reference is not SaaS. It's the intersection of:
- Aesop product pages (restraint, typographic confidence)
- The New Yorker digital covers (editorial serif + clean layout)
- Le Labo website (warm cream, burgundy-adjacent, generous whitespace)
- Linear light mode (typography scale, section rhythm)
- Mercury Bank (premium confidence without gimmicks)

Motion is subtle and editorial, not liquid-glass bubbly. Everything fades and settles; nothing bounces or orbits. One dramatic content cut (the inverse-color section) creates rhythm contrast without abandoning the editorial system.

## Critical anti-patterns to avoid

- No dark mode anywhere (one inverse black section is allowed once)
- No liquid glass, no glassmorphism, no backdrop-blur gimmicks
- No autoplay video backgrounds
- No gradient meshes, no neon, no tech-bro aesthetic
- No stock "trusted by Stripe/Vercel/Linear" logo strip (we have no logos yet, don't fake it)
- No fake testimonials from "Sarah Chen at Luminary". Only real founder story and real placeholder states
- No em dashes or en dashes in copy
- No word "piston"
- No French visual cliché (flag, Eiffel Tower, beret)

---

## STITCH 2.0 PROMPT

Paste everything below into Google Stitch 2.0 to generate the design.

```
Design a premium editorial landing page for Cheatjob, a French B2C SaaS that helps students find internships and alternance (apprenticeship contracts) by automating email reconstruction and sending personalized cold outreach to hiring managers, bypassing HR filters entirely. The brand voice is confident, provocative, slightly arrogant, anti-corporate. The visual identity is NOT tech/hacker — it is premium French editorial, in the spirit of Aesop, Le Labo, Hermès print advertising, The New Yorker, and Kinfolk magazine. Think French maison, not Silicon Valley startup.

ABSOLUTE VISUAL CONSTRAINTS

Color palette (strict, exactly these two colors for the entire page):
- Warm off-white cream background: #FAF9F6
- Deep burgundy (Bordeaux wine red): #6B1F28
- Near-black text for body: #0A0A0A
- Secondary gray text: #6B6B6B
- Border subtle: #E8E6E1
- No other colors. No gradients. No multi-color accents. No tricolor stripes.

Typography (free Google Fonts):
- Display and hero: Instrument Serif, weight 400, italic preferred for accent phrases, regular for statements
- Body and UI: Geist, weights 400 / 500 / 600
- Mono (optional, tiny use): Geist Mono

Hero scale target: desktop hero headline sets at 96 to 128 pixels in Instrument Serif with tight tracking (approximately -2 percent to -4 percent letter-spacing). Mobile scales down to 56 to 72 pixels.

Material language (replaces liquid glass):
- Backgrounds are flat warm cream paper
- Cards are pure white on cream with a 1 pixel #E8E6E1 border, 16 pixel radius, no shadow
- Rules and dividers are 1 pixel #E8E6E1
- One section of the page inverts to a near-black #0A0A0A background with cream #FAF9F6 text, creating a single moment of dramatic contrast. Only one inverse section on the entire page.
- No shadows, no glows, no bevels, no backdrop blur, no glass effects anywhere

Motion grammar (subtle editorial, not liquid-glass bubbly):
- Section headings fade+slide from y: 40, opacity: 0 to y: 0, opacity: 1 over 0.8 seconds when scrolled into view
- Italic pull quotes use a word-by-word blur reveal (filter: blur(10px) to blur(0px), opacity 0 to 1, stagger 120ms per word)
- No bouncing, no scaling on hover beyond 1.02, no rotations, no infinite loop animations
- No video backgrounds anywhere. Zero mp4 autoplay.
- One small in-page animated demo is allowed: a typewriter-style sequence inside the wedge-feature section showing the product "finding" an email and generating an outreach message

Voice and tone:
- Address the reader as tu, never vous
- Short sentences, one idea per sentence
- Confident, slightly arrogant, anti-corporate
- Occasional editorial italic accent in Instrument Serif Italic for cutting one-liners
- No em dashes or en dashes. Commas, periods, colons only
- Never the word piston
- Never corporate jargon (leverage, empower, game-changer)

PAGE STRUCTURE (8 sections total)

Section 0 — NAVIGATION (fixed top, thin, editorial)
- Full-width, transparent background, no pill container
- 72 pixel total height, 24 pixel vertical padding
- Left: wordmark "cheatjob" set in Instrument Serif Regular at 24px, burgundy #6B1F28
- Center: empty (no nav links on the landing page for launch; add later)
- Right: one link "Se connecter" (text only, Geist 400, 14px, #0A0A0A), followed by a single primary CTA button "Commencer" in solid burgundy #6B1F28 with cream text, 40 pixel height, 20 pixel horizontal padding, 8 pixel radius, no shadow
- On scroll past 80 pixels, navigation gets a 1 pixel #E8E6E1 bottom border and a semi-opaque cream background (no blur)

Section 1 — HERO (full viewport height on desktop, 90vh mobile)
- Cream background #FAF9F6, no illustration, no image, no video
- Content is dead-centered vertically, left-aligned horizontally on a 1200 pixel max-width container with 64 pixel padding
- Pre-heading eyebrow (above the main statement): "Pour étudiants sans piston" in Geist 500, 13px uppercase, tracking +8 percent, color burgundy #6B1F28. Note: the charter says never the word "piston". Instead use: "Pour ceux qui n'ont pas de réseau"
- Main statement, huge Instrument Serif, set on two lines with mixed roman and italic:
  Line 1 (Instrument Serif Regular): "Tu n'auras pas ton stage"
  Line 2 (Instrument Serif Italic): "en postulant sur Indeed."
  Set at 96px desktop, 56px mobile, line height 0.95, tracking -3 percent, color #0A0A0A
- Sub-headline below (Geist 400, 20px desktop, 16px mobile, line-height 1.5, max-width 640px, color #6B6B6B):
  "Cheatjob trouve l'email direct du recruteur et lui écrit à ta place. Tu arrives dans sa boîte, pas dans celle des RH."
- Primary CTA (solid burgundy button, 48px height, 32px horizontal padding, cream text, Geist 500, 15px, 8px radius): "Essayer 30 jours — 29€"
- Secondary link (text-only below primary, Geist 400, 14px, #0A0A0A with underline on hover): "Voir comment ça marche →"
- Micro-proof below the CTA pair (Geist 400, 13px, #6B6B6B):
  "Accès immédiat. Annulation en un clic. Ton CV n'est jamais partagé."
- Motion: main statement word-by-word blur reveal on page load, 120ms stagger. Sub-headline and CTA fade+slide from y:20, delayed 600ms and 900ms.

Section 2 — PAIN AGITATION (cream background, heavy whitespace)
- Top padding 160px desktop, 96px mobile
- Max-width 960px container, centered
- Eyebrow: "Le problème" (Geist 500, 13px uppercase, tracking +8 percent, burgundy)
- Section headline (Instrument Serif Regular, 64px desktop, 40px mobile, line-height 1.05, color #0A0A0A, max-width 720px):
  "Les RH reçoivent 400 CV par offre. Elles en lisent 12."
- Below, a 2-column grid on desktop, stacked on mobile. Each column is a "stat card":
  Card 1:
    - Number (Instrument Serif Italic, 96px, burgundy): "40%"
    - Label (Geist 500, 15px, #0A0A0A): "des étudiants cherchent plus de 3 mois"
    - Source line (Geist 400, 12px, #6B6B6B): "Baromètre Seekube 2024"
  Card 2:
    - Number (Instrument Serif Italic, 96px, burgundy): "−85%"
    - Label (Geist 500, 15px, #0A0A0A): "d'offres d'alternance en PME en 2024"
    - Source line (Geist 400, 12px, #6B6B6B): "Rapport JobTeaser 2024"
- Below the cards, a full-width italic pull quote (Instrument Serif Italic, 40px desktop, 28px mobile, line-height 1.2, color #0A0A0A, max-width 820px, centered):
  "Le système n'est pas cassé. Il est juste fermé."
  (Small attribution below, Geist 400, 13px, #6B6B6B, italic: "Maxime, fondateur")
- Motion: stats animate number count-up from 0 to final value over 1.2 seconds when scrolled into view. Pull quote word-by-word blur reveal.

Section 3 — WEDGE FEATURE (THE INVERSE SECTION, this is the dramatic cut)
- Full-bleed background #0A0A0A (near-black, the ONE inverse section of the page)
- Padding 160px top and bottom desktop, 96px mobile
- All text inside this section is cream #FAF9F6
- Max-width 1200px container
- Left column (50 percent width desktop, stacked on mobile):
  - Eyebrow (Geist 500, 13px uppercase, tracking +8 percent, burgundy): "Comment ça marche"
  - Section headline (Instrument Serif mixed, 72px desktop, 44px mobile, color cream):
    Line 1 (Regular): "Trouve l'email."
    Line 2 (Italic): "Écris le message."
    Line 3 (Regular): "Envoie."
  - Body paragraph (Geist 400, 17px, line-height 1.6, color cream at 0.75 opacity):
    "Tu donnes le nom de l'entreprise et le poste visé. Cheatjob trouve l'email du manager qui recrute, rédige un message personnalisé basé sur ton CV et le contexte de l'offre, puis te propose d'envoyer directement depuis ta boîte mail. Pas de Boîte RH. Pas d'ATS. Pas de file d'attente."
  - CTA (solid burgundy on dark background, cream text, same 48px button spec): "Voir un exemple →"
- Right column (50 percent width desktop, below the left on mobile):
  - A live demo widget showing a typewriter sequence in three stages:
    Stage 1 — A terminal-style input box showing: "Nom de l'entreprise: Qonto" typing itself out
    Stage 2 — Below it appears: "Email trouvé: thomas.dupuis@qonto.eu" with a burgundy checkmark
    Stage 3 — Below that appears a typing paragraph in Geist 400, 14px, cream color at 0.9 opacity, that reads: "Bonjour Thomas, je suis étudiant en M2 Marketing à Dauphine. J'ai vu l'offre d'alternance Growth ouverte chez Qonto. Avant de passer par le formulaire, je voulais vous contacter directement pour savoir si..."
  - The widget has a 1 pixel burgundy border, 16 pixel radius, 32 pixel padding, background #141414
  - The typewriter sequence loops every 8 seconds with a 2 second pause before restart
- Motion: Left column fades in from x: -40. Right column fades in from x: +40. Typewriter loops continuously.

Section 4 — FOUNDER STORY (back to cream)
- Cream background
- Padding 160px top, 120px bottom
- Max-width 820px container, centered
- Eyebrow: "Pourquoi Cheatjob existe"
- Headline (Instrument Serif Regular, 56px desktop, 36px mobile, line-height 1.1, color #0A0A0A):
  "J'ai trouvé mon stage comme ça. Puis un poste dans une licorne."
- Body paragraph (Geist 400, 18px, line-height 1.65, color #0A0A0A, max-width 720px):
  "En 2024, j'ai postulé à 80 stages via Indeed et Welcome to the Jungle. Zéro réponse. J'ai arrêté, j'ai cherché les emails des responsables, j'ai écrit 15 messages personnalisés. J'ai eu 4 entretiens et signé en 3 semaines. Un an plus tard, j'ai utilisé la même méthode pour décrocher un poste dans une licorne française. Cheatjob automatise ce que j'ai fait à la main."
- Below the paragraph, a single italic accent line (Instrument Serif Italic, 28px, color burgundy):
  "La méthode n'est pas secrète. Elle est juste fastidieuse. On l'a automatisée."
- Signature line: "Maxime Mansiet, fondateur" (Geist 500, 14px, #0A0A0A) with the date or city below (Geist 400, 12px, #6B6B6B): "Bordeaux, 2026"
- Motion: paragraph fades in on scroll, italic accent line does word-by-word blur reveal after paragraph settles.

Section 5 — PRICING (cream background, high contrast white cards)
- Padding 160px top and bottom
- Max-width 1200px container
- Eyebrow: "Tarifs"
- Section headline (Instrument Serif Regular, 64px desktop, 40px mobile, color #0A0A0A):
  "Le prix d'une soirée. Le contrat d'une année."
- Italic sub-accent below (Instrument Serif Italic, 24px, #6B6B6B):
  "Choisis le format qui te ressemble."
- Three pricing cards in a grid (3 columns desktop, stacked mobile), each card is pure white #FFFFFF on the cream background, 1 pixel #E8E6E1 border, 16 pixel radius, 40 pixel padding. No shadows. The middle card has a burgundy top border 4 pixels thick and a small burgundy "Populaire" pill (Geist 500, 11px, uppercase, tracking +8 percent, burgundy background, cream text, 4px radius) in the top-right corner of its card.

  Card 1 — Sprint:
    - Name (Geist 600, 18px, #0A0A0A): "Sprint"
    - Subtitle (Geist 400, 14px, #6B6B6B): "Le format one-shot"
    - Price (Instrument Serif Regular, 64px, #0A0A0A): "29€"
    - Price sub-label (Geist 400, 13px, #6B6B6B): "une fois, 30 jours d'accès"
    - 6 feature bullets, each preceded by a 14px burgundy checkmark:
      "50 emails reconstruits"
      "Messages personnalisés illimités"
      "Templates alternance et stage"
      "Suivi automatique à J+7"
      "Tableau de bord des candidatures"
      "Annulation automatique en fin de période"
    - CTA button (outline style, 1 pixel burgundy border, burgundy text, cream background, 44 pixel height, full card width): "Choisir Sprint"

  Card 2 — Mois (featured, middle card):
    - Name: "Mois"
    - Subtitle: "Le format flexible"
    - Price: "14€90"
    - Price sub-label: "par mois, sans engagement"
    - 7 feature bullets:
      "100 emails reconstruits par mois"
      "Tout de Sprint"
      "Priorité support par email"
      "Exports CSV de tes candidatures"
      "Intégration Gmail et Outlook"
      "Historique complet de tes envois"
      "Une relance intelligente par prospect"
    - CTA button (solid burgundy, cream text, 44 pixel height, full card width): "Commencer"

  Card 3 — Vie:
    - Name: "Vie"
    - Subtitle: "Le format définitif"
    - Price: "149€"
    - Price sub-label: "une fois, à vie"
    - Feature bullets:
      "Tout du plan Mois"
      "Aucune limite mensuelle"
      "Accès anticipé aux nouveautés"
      "Mises à jour à vie"
      "Support prioritaire"
      "Une heure de coaching candidature incluse"
    - CTA button (outline burgundy, full width): "Prendre à vie"

- Below the cards, a single centered line (Geist 400, 13px, #6B6B6B):
  "Paiement sécurisé par Stripe. Facturation en euros. TVA incluse."

Section 6 — FAQ (cream background, accordion list)
- Padding 120px top and bottom
- Max-width 820px container, centered
- Eyebrow: "Questions"
- Section headline (Instrument Serif Regular, 56px desktop, 36px mobile): "Ce que les autres ne te diront pas."
- List of 6 FAQ items, each an accordion row separated by a 1 pixel #E8E6E1 horizontal rule. Each row has a question in Geist 500 18px #0A0A0A on the left, and a plus/minus icon on the right. When expanded, the answer appears below in Geist 400 16px #6B6B6B line-height 1.65.

  Q1: "C'est légal d'envoyer un email à quelqu'un qu'on ne connaît pas ?"
  A1: "Oui. Le RGPD autorise la prospection vers des emails professionnels sous motif d'intérêt légitime, ce qui est le cas pour une recherche de stage ou d'alternance. Cheatjob ne stocke aucune base de données d'emails. Les adresses sont reconstruites en temps réel à partir d'informations publiques, comme le fait Dropcontact. Chaque message contient une mention de transparence RGPD et une option de désinscription."

  Q2: "Est-ce que le recruteur va savoir que c'est un robot ?"
  A2: "Non. Cheatjob écrit un premier brouillon que tu relis, corriges et valides avant envoi. C'est toi qui envoies, depuis ta boîte mail. Tu restes l'auteur du message. Et franchement, personne ne rédige un email de prospection from scratch en 2026, pas même les commerciaux."

  Q3: "Si je trouve mon alternance en 2 semaines, je peux arrêter ?"
  A3: "Oui. Le plan Sprint termine automatiquement au bout de 30 jours, sans renouvellement. Le plan Mois s'annule en un clic depuis ton tableau de bord, et le prorata des jours restants n'est pas facturé. Le plan Vie n'a pas de renouvellement."

  Q4: "Ça marche pour quel type de contrats ?"
  A4: "Stages de fin d'études, alternance (apprentissage et contrat pro), premier CDI pour jeunes diplômés. Les templates sont optimisés pour le marché étudiant français. La méthode fonctionne aussi pour les jobs d'été, mais ce n'est pas notre spécialité."

  Q5: "Mon email est envoyé depuis quelle adresse ?"
  A5: "Depuis ton adresse personnelle, via ta boîte Gmail ou Outlook connectée. Cheatjob ne t'envoie rien au nom d'un domaine intermédiaire. Ton identité reste la tienne, c'est la seule façon de ne pas finir en spam."

  Q6: "Je suis en bac+2 en BTS, c'est pour moi ?"
  A6: "Oui. Les étudiants de BTS représentent 35 pour cent de notre audience. Les templates sont adaptés aux stages obligatoires de 3 à 6 semaines autant qu'aux alternances longues."

Section 7 — FINAL CTA (inverse section returns? NO, stays cream, big statement)
- Cream background, centered, 200px vertical padding
- One giant line (Instrument Serif Regular then Italic, 120px desktop, 64px mobile, line-height 0.95, tracking -3 percent, color #0A0A0A):
  Line 1 (Regular): "Arrête de postuler."
  Line 2 (Italic): "Commence à contacter."
- Below, a single primary CTA button (solid burgundy, 56px height, 40px horizontal padding, Geist 500, 17px, cream text, 8px radius): "Lancer mon Sprint — 29€"
- Below the button, one micro-line (Geist 400, 13px, #6B6B6B): "Paiement sécurisé. Annulation automatique au bout de 30 jours. RGPD compliant."

Section 8 — FOOTER (minimal, cream)
- Cream background, 64px vertical padding, 1 pixel #E8E6E1 top border
- Max-width 1200px container
- Left: wordmark "cheatjob" in Instrument Serif Regular, 20px, burgundy
- Center: 4 text links separated by dots (Geist 400, 13px, #6B6B6B): "Mentions légales · CGU · Confidentialité · RGPD"
- Right: a tiny line (Geist 400, 13px, #6B6B6B): "Fait à Bordeaux, 2026"

GLOBAL RULES

- Max-width 1200 pixels on content containers
- Horizontal padding 64 pixels desktop, 24 pixels mobile
- Vertical rhythm between sections: 160 pixels desktop, 96 pixels mobile, with the exception of the inverse section which has extra 40 pixels of extra breathing room to emphasize the contrast transition
- All buttons are 8 pixel radius (NOT pills). Pills were tried and feel too SaaS-generic. The 8 pixel radius feels premium and editorial.
- All inputs are 44 pixel height, 8 pixel radius, 1 pixel #E8E6E1 border, cream background, burgundy focus ring (2 pixel burgundy inner ring on focus)
- Accessibility: contrast ratio for burgundy on cream is 8.1:1 (AAA). Near-black on cream is 19:1 (AAA). All text meets WCAG AA minimum.
- No interaction gimmicks. No cursor followers. No parallax. No ticker tapes.

DELIVERABLE

Generate this as a responsive desktop-first design with explicit mobile breakpoint at 768 pixels. The result should feel like a Paris magazine cover for a software product. Confident, quiet, French, sharp.
```

---

## Post-Stitch: what comes next

Once the design lands in Stitch, hand to Claude Code with:

1. Screenshots of each section (desktop + mobile)
2. Stitch export if available (SVG/CSS tokens)
3. The instruction "Implement this in Next.js 16 App Router, Tailwind, shadcn/ui, following `docs/brand/charter.md`. Use Framer Motion for the specified animations."

The charter tokens go into `tailwind.config.ts` directly. The Instrument Serif + Geist fonts get loaded via Next.js Font Optimization (`next/font/google`).

## Alternative motion experiments (if Stitch output feels too static)

One controlled experiment is allowed without breaking the editorial system: the typewriter demo in the Wedge section. Beyond that, resist adding motion. The charter's restraint is the point.

If you feel tempted to add more motion after seeing Stitch output, ask: "Would Aesop do this?" If no, don't.

## Version history

- v0.1 — 2026-04-18 — Initial Stitch brief synthesized from charter + motionsites.ai structural patterns + French market research findings. Maxime + Claude (Opus 4.7).
