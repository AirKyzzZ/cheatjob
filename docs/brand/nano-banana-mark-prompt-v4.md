# Nano Banana Mark-Alone Prompt (v4)

Master prompt synthesized from Opus 4.7 (Claude) + Codex (GPT-5.x). Gemini 3.1 Pro was capacity-exhausted during generation. See `docs/brand/charter.md` for the full brand system.

## Target
Standalone brand mark: pure custom typographic ligature of lowercase italic serif `c` + `j`, no container, couture maison identity. Scales from 16px favicon to 1600px hero.

## Key synthesis decisions

**From Codex (GPT-5.x):**
- Narrow aesthetic references to 3 anchors max (Chanel, LV, Hermès) to avoid model averaging into "generic luxury"
- One ligature topology only — do not offer alternatives in the same prompt
- Explicit tittle control to prevent sparkle/star artifact
- Silhouette occupancy spec (60% of canvas)
- 32px legibility constraint

**From Opus 4.7:**
- Color precision language (Bordeaux wine, not brown)
- Material metaphor (flat single-ink pass, silkscreen feel)
- Aggressive four-corners-empty directive to kill the recurring sparkle watermark
- Cultural positioning (Parisian atelier, couture house identity)

## Failure modes defended against

| Failure (observed in v1-v3) | Defense |
|---|---|
| Generic serif, not Didone character | Letterform description by shape, not font name |
| Sparkle/star in bottom-right corner | "Four canvas corners completely empty", tittle explicitly "not a star, not a sparkle, not a diamond" |
| Inconsistent casing (capital C + lowercase j) | "100 percent lowercase, no capitals, no small caps" repeated in hard constraints |
| Oversized mark dominating canvas | Explicit "60 percent of canvas width and height" |
| Baseline drift / off-center | "Dead-centered", "vertical midline of emblem aligns with vertical midline of canvas" |
| Wax seal / container re-introduced | Forbidden list includes every container noun (circle, seal, badge, shield, frame, cartouche, etc.) |
| Hairlines disappear at favicon size | 32px legibility test explicitly called out |

## The prompt

```text
Design a single custom typographic monogram for the French luxury brand Cheatjob: a compact sculptural ligature fusing the two lowercase italic serif letters "c" and "j" into one emblem.

Render it as if commissioned from a contemporary Parisian maison. Couture house identity energy. Refined, restrained, confident, intelligent. Not tech, not hacker, not playful, not vintage.

LETTERFORM CHARACTER
- High-contrast italic serif with dramatic thick-to-thin modulation: hairline horizontal strokes against substantial vertical stems
- Low x-height, narrow condensed proportions
- Sharp, finely bracketed serifs
- Elegant ball terminals where strokes end
- The "c" is lowercase italic, narrow, with a visible open aperture on the right, a delicate top stroke ending in a soft ball terminal
- The "j" is lowercase italic, matched in weight and style to the "c", with one graceful single-curve descender ending in a refined ball terminal below the baseline
- Both letters feel like they were drawn by a type designer in a Parisian atelier, not by a software algorithm

LIGATURE TOPOLOGY (one interlock only, no alternatives)
- The two letters are FUSED into a single continuous sculptural form, not placed side by side
- The descender of the "j" curves leftward and passes exactly once through the inner counter of the "c", threading the letters into one shape
- One decisive crossing point. No extra flourishes, no calligraphic loops, no ornamental swashes
- The resulting silhouette reads as one icon first, then reveals the "c" and "j" on closer inspection
- Counters remain visibly open: the aperture of the "c" stays legible, the loop around the "j" descender stays clean

TITTLE CONTROL (critical, read carefully)
- The "j" has its dot (tittle) above the stem, centered over the vertical axis of the "j"
- The tittle is small and solid: a round ball at approximately 18 percent of the stem height in diameter, same burgundy color as the rest of the letter
- The tittle is clearly part of the "j", never floating ambiguously, never drifting to a corner, never decorative
- THE TITTLE IS NOT A STAR, NOT A SPARKLE, NOT A DIAMOND — it is a solid round typographic dot

COMPOSITION
- Single emblem, dead-centered on a 2048 by 2048 pixel square canvas
- The ligature occupies approximately 60 percent of the canvas width and height
- Balanced optically: vertical midline of the emblem aligns with the vertical midline of the canvas
- No container, no circle, no frame, no border, no seal, no shield, no badge, no plaque, no cartouche, no ring, no halo, no background shape behind the letters
- The four corners of the canvas must be COMPLETELY EMPTY — pure warm cream, no marks, no shapes, no artifacts whatsoever

COLOR
- The letters are rendered in deep burgundy #6B1F28 — a cool Bordeaux wine red, not brown, not rust, not maroon, not oxblood. Think Château Margaux wine, not autumn leaves
- The canvas is filled with warm off-white cream #FAF9F6 — visibly warmer than pure white, matte uncoated paper feel
- Only these two colors exist in the image. Nothing else. No third hue.

RENDERING
- Completely flat 2D vector artwork, as if designed in Adobe Illustrator and exported at maximum precision
- Single flat ink pass on paper — a silkscreen or letterpress feel without any dimensional relief
- Crisp geometric edges, clean curves, unbroken hairlines
- No drop shadow, no glow, no bevel, no emboss, no deboss, no letterpress indentation, no foil, no metallic finish, no texture, no grain, no noise, no halftone, no gradient, no 3D, no perspective

AESTHETIC REFERENCE (hold to these three, ignore others)
- Chanel interlocking C monogram: pure letterform fusion, no container
- Louis Vuitton LV monogram: confident typographic compression
- Hermès H motif: elegant restraint, single-color print quality

SMALL-SIZE LEGIBILITY TEST
- The mark must remain clearly readable at 32 pixel display
- Counters stay open, stroke contrast visible, no hairlines so thin they would disappear at favicon scale

HARD CONSTRAINTS (non-negotiable)
- Exactly one ligature on the canvas
- Exactly two letterforms: lowercase italic "c" and lowercase italic "j"
- 100 percent lowercase, no capitals, no small caps
- Exactly two colors: burgundy #6B1F28 and cream #FAF9F6
- Four empty canvas corners, no exceptions

FORBIDDEN ELEMENTS (do not include any of these)
sans-serif type, slab serif, geometric sans, brush lettering, handwriting, script fonts, blackletter, calligraphy, grunge, distressed, vintage, aged paper, sepia, neon, glow, 3D rendering, perspective, isometric, mockup on physical object, metallic foil, gold, silver, copper, gradients, drop shadows, embossing, letterpress indentation simulation, texture, grain, noise, halftone dots, containers (circle, oval, square, shield, seal, badge, crest, medallion, coin, stamp, wax seal, frame, border, ribbon, laurel, crown), decorative ornaments, swashes, flourishes, calligraphic loops, extra crossings, additional letters, capital C, capital J, small caps, subtitle text, tagline, slogan, brand name spelled out, descriptor text, AI watermarks, corner sparkles, stars, decorative dots, filigree, asterisks, plus signs, French flag imagery, tricolor, Eiffel Tower, beret, baguette, perfume bottle, any photography, any illustration other than the ligature itself, any mark or shape in any canvas corner
```

## Codex's 3-topology recommendation (if v4 doesn't land)

Run three separate generations with identical prompt body, only varying the LIGATURE TOPOLOGY block:

1. **Thread through** (current v4): j descender curves leftward and passes once through the inner counter of the c
2. **Hook under**: j descender wraps under the baseline and hooks back up into the terminal of the c
3. **Shared spine**: c and j share a common vertical spine, overlapping at the right side of the c where it meets the stem of the j

Compare the three outputs for couture feel + favicon readability, pick the best.
