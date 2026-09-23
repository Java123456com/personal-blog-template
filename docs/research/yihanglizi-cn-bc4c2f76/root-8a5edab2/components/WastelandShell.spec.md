# Wasteland Shell Specification

- **Target:** `markup.html`, `ClientEnhancements.tsx` and `original.css`.
- **Interaction model:** time-driven background and decorative overlays.
- **Structure:** `.wasteland` wraps a rain canvas, scanlines, vignette, and `.hud` content; a fixed `.catpet` sprite floats above the page.
- **Computed styles:** `.wasteland` background `rgb(10,8,5)` with rust radial gradients, border radius 12.8px, `overflow:hidden`, `isolation:isolate`, margin `-24px -24px 0`; `.hud` has 1180px maximum width, 16px top and 22.4px horizontal padding at 1440px.
- **Assets:** captured `img/cat-sprite.png`; the source CSS supplies radial layers and the sprite presentation.
- **States:** canvas paints amber falling characters. Scanlines and vignette remain over the background. The boot overlay is removed after loading, matching the steady live state.
- **Responsive:** original CSS controls negative margins and HUD padding on tablet and phone.
