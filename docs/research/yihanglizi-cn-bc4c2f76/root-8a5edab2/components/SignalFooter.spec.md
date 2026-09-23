# Signal Stream and Footer Specification

- **Target:** `markup.html` and `original.css`.
- **Interaction model:** time-driven ticker; static status strip; filing link hover/navigation.
- **Structure:** `.signal-widget` contains a `SIG` block header and `.ticker` of repeated skill names. `.vim-bar` is an editor status strip. `.VPFooter` contains `个人博客`, `© 2025-2026 一行栗子` and `豫ICP备2026008219号`.
- **Desktop styles:** source CSS uses an amber dashed border above the signal section, `.block-num` 0.72rem, `.block-title` 0.95rem, `.block-sub` 0.72rem and a bright amber Vim bar. Ticker text repeats Java, Spring Boot, Vue 3, TypeScript, AI Agent, MySQL, Redis, Docker, Linux, Git, VitePress, Node.js, RESTful and RAG.
- **Responsive:** source CSS retains the horizontal marquee with clipped overflow and wraps the footer text at narrow widths.
