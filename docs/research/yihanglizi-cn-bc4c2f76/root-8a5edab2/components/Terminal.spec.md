# Terminal and Telemetry Specification

- **Target:** `ClientEnhancements.tsx` / `enhanceTerminal`.
- **Screenshot:** `docs/design-references/yihanglizi-cn-bc4c2f76/root-8a5edab2/local-desktop.png`.
- **Interaction model:** time-driven text, cursor, meters, waveform, rain and cat sprite.
- **Structure:** `.wasteland > .hud > .hud-bar + .hero`; hero left contains ASCII title, prompt, eight feed lines and buttons; hero right contains SYS_STATUS panel rows/meters/wave/footer.
- **Exact desktop values:** HUD 1180px max width; hero 1135.2×504.1px with `grid-template-columns:645.117px 464.484px`, gap 25.6px; hero-left padding 25.6px 28.8px and 1px rgba(255,176,0,.32) border. ASCII 12.8px, line height 14.72px; prompt 14.72px; feed 14.4px, line height 26.64px; buttons 46.8px tall, first button amber background `rgb(255,176,0)`.
- **Content:** exact eight lines in `ClientEnhancements.tsx`, matching the source DOM. HUD time, uptime and three meter labels keep their source text. Wave SVG gets 41 points and changes periodically.
- **Assets:** `img/cat-sprite.png`, source CSS. Rain is drawn on the existing canvas.
- **Responsive:** source CSS stacks hero at tablet and mobile, stacking both buttons at mobile. At 390px source hero measured about 1001.6px high.
