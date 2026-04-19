# Cheatjob Hero Spec v3 — Dark Cinematic

Synthesized from Opus 4.7 + Codex (GPT-5.x) consensus, 2026-04-18. Replaces the light-mode hero from `stitch-landing-brief.md`.

## Strategic frame

**Option B — dark hero + light editorial body.** The charter (`docs/brand/charter.md:129`) explicitly allows a dark inverse section. We extend that allowance to the hero because:
- TikTok / IG traffic expects dark + motion for first impression
- Light editorial body below carries the credibility for parents/schools
- Burgundy stays meaningful (accent on dark, primary on cream)
- Cheatjob stays distinct from Cluely/Interview Coder (which are fully dark)

## Implementation target

Next.js 16 App Router + Tailwind CSS + shadcn/ui + Framer Motion (`motion`). TypeScript strict. Mobile-first, production-quality.

## Hero component spec (from Codex)

```text
Strategic direction:
- Option B: dark high-impact hero, light editorial body below
- Must feel native to TikTok/Discord/Spotify-era users
- Retain French editorial taste
- Tone: provocative, precise, anti-corporate, premium. Not gamer, not crypto, not generic AI SaaS.

Core aesthetic:
- Base: near-black #0A0A0A
- Foreground: warm cream #FAF9F6
- Accent: deep burgundy #6B1F28
- Headings: Instrument Serif
- Body: Geist (fallback Inter)
- One insane premium asset: full-bleed cinematic MP4 video background
- No 3D floating SaaS dashboard, no stock-photo people, no abstract AI blobs

Layout:
- Hero min-height 100svh
- Content max-width 1280px
- Desktop: split — copy left, proof panel right
- Mobile: stacked, copy first
- Large top padding so nav floats cleanly

Background asset:
- Full-screen autoplaying muted looped playsInline MP4
- Luxury-tech editorial texture (not product demo):
  - dark smoky gradients, slow reflective surfaces, burgundy light sweeps, subtle lens bloom, soft depth shifts
- Overlays for readability:
  - base: absolute inset-0 object-cover
  - black overlay: bg-black/45
  - burgundy radial glow upper-right: radial-gradient(circle at 72% 28%, rgba(107,31,40,0.32), transparent 38%)
  - bottom fade: bg-gradient-to-b from-transparent via-transparent to-[#0A0A0A]

Right-side floating "live proof" glass panel:
- Simulates Cheatjob output, not app screenshot
- micro-label: "Recherche alternance · Qonto"
- line 1: "Hiring manager trouvé"
- line 2 mono: "thomas.dupuis@qonto.eu"
- email excerpt 3-4 lines French
- status row: "Prêt à envoyer" + burgundy pulsing dot
- Subtle 3D mouse-tilt desktop only
- Smaller blurred glass badge behind: "Pas de RH. Boîte directe."

Copy (exact):
- Eyebrow: "POUR CEUX QUI N'ONT PAS LE BON RÉSEAU"
- Headline line 1: "Tu n'auras pas ton stage"
- Headline line 2 (Instrument Serif Italic): "en postulant sur Indeed."
- Subhead: "Cheatjob trouve l'email direct du recruteur et lui écrit à ta place. Tu arrives dans sa boîte, pas dans celle des RH."
- Primary CTA: "Essayer 30 jours — 29€"
- Secondary CTA: "Voir comment ça marche"
- Micro-proof: "Accès immédiat. Annulation en un clic. Ton CV n'est jamais partagé."

Typography:
- Eyebrow: Geist 500, 12px mobile / 13px desktop, uppercase, tracking 0.18em, rgba(250,249,246,0.72)
- Headline: Instrument Serif regular + italic span, text-[56px] leading-[0.92] tracking-[-0.04em] mobile, scales md:text-[88px] lg:text-[112px] xl:text-[124px], max-width ~11ch
- Subhead: Geist 400, text-[17px] leading-[1.55] mobile / text-[20px] desktop, rgba(250,249,246,0.78), max-width 42rem

CTA row:
- Primary: h-56, px-7, rounded-[14px], bg cream #FAF9F6, text #0A0A0A, weight 600, hover lift y:-2px with shadow 0 10px 30px rgba(0,0,0,0.18)
- Secondary: h-56, glass, border 1px rgba(250,249,246,0.16), cream text, hover bg rgba(255,255,255,0.08)

Liquid glass CSS (nav + proof panels only, NOT headline):
.liquid-glass {
  background: linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06));
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  border: 1px solid rgba(255,255,255,0.14);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.10), 0 20px 60px rgba(0,0,0,0.35);
}
Strong variant for proof card: blur 24px, background rgba(255,255,255,0.10)

Entrance animation sequence:
1. Video playing on load
2. Nav: fade from y:-16, 0.5s, delay 0.05s
3. Eyebrow: fade, 0.35s, delay 0.18s
4. Headline BlurText word-by-word:
   - split by words
   - each word: filter blur(14px), opacity 0, y 18
   - to: blur(0), opacity 1, y 0
   - duration 0.7s, stagger 0.085s, ease [0.22, 1, 0.36, 1]
5. Italic segment sheen sweep: pseudo-element burgundy gradient L→R over 1.1s, delay 0.95s
6. Subhead: y:18 → 0 opacity 0→1, 0.55s, delay 0.72s
7. CTAs: same, 0.55s, delay 0.9s
8. Proof card: x:40, opacity 0, rotateY:-8deg → settled, 0.85s, delay 0.45s
9. Small badge perpetual drift: translateY 0 ↔ -10px, 6s, ease-in-out

Scroll behavior (first 25vh):
- Headline y: 0 → -24
- Opacity: 1 → 0.92
- Proof card scale: 1 → 0.96
- Video parallax: subtle only

Implementation notes:
- Reusable BlurText component
- Respect prefers-reduced-motion (disable blurs and tilt)
- AAA-ish text contrast against overlays
- No purple, no neon blue, no cyberpunk
- Transition out of hero into light body with clean dark-to-cream section break
```

## Navbar (also redone)

Floating glass rail, centered, max-width 960px, `top-4` desktop / `top-3` mobile.
- Left: `cj` monogram + `cheatjob` wordmark, cream
- Middle: empty
- Right: "Se connecter" muted + primary cream CTA
- Shape: h-14, rounded-full, liquid-glass background, 1px translucent border, blur 18px
- On scroll past hero midpoint: collapse into a thinner cream editorial bar for the light body sections

## Premium assets beyond hero (Codex suggestions)

1. **Scroll-reveal proof cards** in the "comment ça marche" section: start as dark translucent layers, resolve into crisp cream editorial cards on viewport entry. Mirrors "from opacity to direct access"
2. **Animated burgundy light grain**: subtle procedural noise + burgundy sweep across dark sections and footer. Felt as richness, not seen as effect
3. **Custom SVG "network bypass" linework**: thin editorial diagrams showing ATS funnel (crossed out) vs direct manager inbox route. Path-draw animation on scroll. Proprietary visual language instead of borrowing all sophistication from glassmorphism

## What to preserve from Stitch v2

Hero + nav get rebuilt from scratch. These sections stay as base for targeted polish pass:
- Pain (stats need source fix from earlier)
- Inverse feature section (already dark, typewriter needs real animation)
- Founder story (expand to unicorn arc)
- Pricing (already corrected to Sprint/Mois/Vie)
- FAQ
- Final CTA (hero returns to cream for contrast)

## Video asset

For launch placeholder, use one of the motionsites CloudFront MP4 URLs from our reference prompts (public, high-quality, luxury-tech texture). Replace later with either a Pexels abstract video (royalty-free) or a custom Runway/Kling generation once budget allows.

Candidate URL (from VEX prompt): `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4`
