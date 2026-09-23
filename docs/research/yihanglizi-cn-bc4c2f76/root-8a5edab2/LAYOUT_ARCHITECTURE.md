# Layout architecture

The `#app > .Layout` tree mirrors VitePress. `.VPNav` is fixed, while `.VPContent` and `.VPFooter` remain in document flow. The default page uses a `.wasteland` root with a max-width 1180px `.hud`. Overlay canvas and vignette are inside the root. Desktop hero and quest grids collapse to one column at narrower widths using the source media queries. The game remains centered and scales its board on mobile.

The alternate `.slh` theme is inserted beside `.wasteland` within the same content wrapper; one is hidden while the other is visible. The root theme data attribute switches the nav palette. The starry page has a wide hero, galaxy panel, Dipper details, zodiac wheel and footer.
