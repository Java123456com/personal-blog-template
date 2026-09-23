# Navigation Specification

- **Target:** `nav.ts`, captured `markup.html`, original CSS and `globals.css` for the local search/mobile overlays.
- **Interaction model:** clicks for menu, theme, sound and search; Ctrl/⌘+K for search; hover for links.
- **Structure:** fixed `.VPNav` with logo, animated wordmark, search trigger, desktop links, social flyout, `.nav-switcher`, `.sound-toggle`, and `.VPNavBarHamburger` on mobile.
- **Exact desktop values:** fixed nav height 65px, background rgba(10,8,5,.88), Inter/system font 16px with 24px line height. Source menu/panel CSS is preserved through original data-v attributes.
- **States:** theme popover offers `⚡ 赛博编程` and `✦ 星空极光`; sound popover has interaction sound ON, music OFF and volume 70 by default; search filters destination titles; hamburger reveals navigation on mobile. Selecting the starry theme replaces the homepage visual with captured `.slh` markup.
- **Responsive:** desktop links hide at mobile and icon controls/hamburger remain. Footer and nav continue to use original layout CSS.
