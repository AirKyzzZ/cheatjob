<div align="center">

<img src="docs/brand/logos/cheatjob-mark-v5.png" alt="Cheatjob" width="180" />

# cheatjob

**Le logiciel qui contacte les recruteurs à ta place.**
*Pas de réseau ? On t'en fabrique un.*

[![Live Site](https://img.shields.io/badge/Live-cheatjob.fr-6B1F28?style=for-the-badge)](https://cheatjob.fr)
[![Status](https://img.shields.io/badge/Status-Pre--launch-FAF9F6?style=for-the-badge&labelColor=0A0A0A)](#status)
[![License](https://img.shields.io/badge/License-Proprietary-0A0A0A?style=for-the-badge)](#license)

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)

</div>

---

## Why this exists

Indeed, LinkedIn and Welcome to the Jungle funnel a few hundred CVs into one HR inbox. Most are never read. The students who land internships and *alternance* don't apply harder — they bypass the funnel and land directly in the **hiring manager's** inbox.

That used to require a network. Cheatjob makes it a feature.

> *Le système n'est pas cassé. Il est juste fermé.*

---

## What it does

For French students hunting **stages** and **alternances**, Cheatjob:

1. **Identifies the right hiring manager** at a target company (not HR — the person who actually wants you on the team).
2. **Reconstructs their direct email** from public signals.
3. **Drafts a cold outreach** in the student's voice, calibrated to the role and the company.
4. **Tracks deliverability and replies** so the student knows what's working.

The wedge is narrow on purpose: **email reconstruction + AI-personalized cold outreach**. No CV builder, no Indeed clone, no HR portal.

---

## Live evidence

Real replies from real recruiters, anonymized for the public site.

<div align="center">
  <img src="web/public/evidence/01.png" alt="Reply 01" width="48%" />
  <img src="web/public/evidence/02.png" alt="Reply 02" width="48%" />
</div>
<div align="center">
  <img src="web/public/evidence/03.png" alt="Reply 03" width="48%" />
  <img src="web/public/evidence/04.png" alt="Reply 04" width="48%" />
</div>

Companies the founder personally landed using the method that became Cheatjob:

> **Dataiku** · **Deezer** · **SQLI** · **Extrajool** · **HopHopImmo**

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16** (App Router) | Server Components for marketing surface, Route Handlers for outreach jobs |
| Runtime | **React 19** | New compiler, transitions, Server Actions for the waitlist |
| Language | **TypeScript** (strict) | Non-negotiable on the email path |
| Styling | **Tailwind CSS 4** + design tokens | Brand charter ported to CSS variables |
| Animation | **Motion** (formerly Framer Motion) | Editorial micro-interactions, reduced-motion respected |
| Typography | **Instrument Serif** + **Geist** | Editorial display, neutral UI |
| Analytics | **PostHog** + **Vercel Analytics** | Funnel + acquisition |
| Hosting | **Vercel** | Edge, preview deploys, OG image generation |

---

## Project layout

```
cheatjob/
├── docs/
│   └── brand/                   # Brand charter, logos, hero spec
│       ├── charter.md           # Single source of truth for design + copy
│       └── logos/
└── web/                         # Next.js app
    ├── src/
    │   ├── app/                 # App Router, OG image, robots, sitemap
    │   ├── components/
    │   │   ├── sections/        # hero, wedge, evidence, pricing, faq…
    │   │   ├── ui/              # primitives (BlurText, ProofPanel…)
    │   │   ├── waitlist/        # waitlist context + form
    │   │   └── analytics/
    │   ├── hooks/
    │   └── lib/
    └── public/
        └── evidence/            # Anonymized reply screenshots
```

---

## Run it locally

```bash
cd web
cp .env.example .env.local        # fill in the keys you actually need
npm install
npm run dev                       # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Next dev server (Webpack, with raised heap) |
| `npm run dev:turbo` | Same, but with Turbopack |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` over the whole app |

> **Note:** this version of Next.js 16 has breaking changes vs. older docs. If you're hacking on the app, read the relevant guide in `node_modules/next/dist/docs/` before assuming an API still exists.

---

## Brand & design

The visual system is documented end-to-end in [`docs/brand/charter.md`](docs/brand/charter.md):

- **Wordmark** — editorial lowercase, Instrument Serif Regular, burgundy on cream
- **Palette** — `#FAF9F6` cream, `#0A0A0A` ink, `#6B1F28` burgundy accent (≤ 5% per screen)
- **Typography** — Instrument Serif (display) + Geist (UI/body)
- **Voice** — *tu*, French-first, declarative, no em-dashes, no corporate jargon

If you contribute design or copy, the charter wins over personal taste. That's the deal.

---

## Status

Live at [cheatjob.com](https://www.cheatjob.com). New accounts start with 3 free credits; one-time packs add 15 credits for €9, 50 for €29, or 120 for €59. Credits never expire.

---

## License

This repository is published for transparency and as a portfolio piece. The Cheatjob name, brand assets, copy, and product mechanics are **proprietary** and not licensed for reuse. The code is open to read; please don't fork it as a competing product.

---

<div align="center">

Built by [Maxime Mansiet](https://maximemansiet.fr) · Bordeaux, France

[![Website](https://img.shields.io/badge/cheatjob.fr-6B1F28?style=flat-square&logoColor=white)](https://cheatjob.fr)
[![Portfolio](https://img.shields.io/badge/maximemansiet.fr-0A0A0A?style=flat-square&logoColor=white)](https://maximemansiet.fr)

</div>
