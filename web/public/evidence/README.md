# Evidence — email screenshot assets

Drop real email screenshots here to populate the `<Evidence />` section.

## Expected files

- `01.png` through `04.png` (up to 4 screenshots)
- Any aspect ratio; the component auto-fits with object-cover inside a 4:3 editorial frame.
- Redact sensitive personal info (phone numbers, addresses). Company names are fine.
- PNG or JPG. 1200-1600px wide for retina. Keep file size under 500KB each.

## Tips for strong screenshots

- Crop to show: subject line + greeting + first 2-3 lines
- Include the sender's company/domain (it's social proof)
- If date-stamped, keep the date visible (signals recency)
- Light-mode screenshots read best on cream backgrounds (Gmail/Outlook default)

## Naming convention

Optional metadata via filename: `01-qonto-alternance-growth.png` is fine — the component reads `EVIDENCE` array in `src/components/sections/evidence.tsx` for captions.

## Missing assets

If a file is missing, the component falls back to an editorial placeholder card so the layout never breaks.
