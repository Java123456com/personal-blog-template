# Starry Theme Specification

- **Target:** captured `starry.html`, `nav.ts` / `paintGalaxy`, original CSS.
- **Interaction model:** theme click, scrolling, galaxy drag/click, zodiac button, Dipper star selection in original.
- **Structure:** `.slh` with status bar, large centered hero, `.slh-nav` galaxy canvas, `.slh-posts` Dipper detail panel, `.slh-tech` zodiac wheel, editor style footer.
- **Content and DOM:** exact Chinese headings, constellation SVG and wheel SVG were captured from the hydrated source and retained in `starry.html` with scope attributes. Seven Dipper panels and twelve zodiac states were captured from the live controls into `dipper-states.json` and `zodiac-states.json`.
- **Assets:** stars, orbit, constellations and wheel are CSS/SVG/canvas; no external bitmap is required. Captured galaxy canvas is repainted locally with linked star destinations.
- **Responsive:** original CSS controls hero typography, card stacking and zodiac layout at tablet/mobile widths.
- **States:** Dipper selection changes the highlighted star, cursor and detail panel. Zodiac icon selection or the spin button rotates the wheel, highlights the sign and updates its complete detail card. The galaxy canvas supports drag and star click navigation.
