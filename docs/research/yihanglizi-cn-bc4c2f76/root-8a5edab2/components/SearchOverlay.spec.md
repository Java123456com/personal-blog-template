# SearchOverlay Specification

## Overview
- **Target files:** `src/components/sites/yihanglizi-cn-bc4c2f76/root-8a5edab2/nav.ts`, `src/app/globals.css`
- **Reference:** `https://yihanglizi.cn/`
- **Screenshot:** `docs/design-references/yihanglizi-cn-bc4c2f76/root-8a5edab2/source-search.png`
- **Interaction model:** click and keyboard driven overlay, with asynchronous content loading

## DOM Structure
- Full viewport modal mask.
- Search box near the top center.
- Search row with icon, search input, detail toggle, and ESC button.
- Live result count.
- Scrollable result list.
- Keyboard help footer.

## Computed Reference Styles
- Source overlay: fixed, full viewport, `z-index: 100`.
- Source shell at a 1265px viewport: `900px` wide, `12px` padding, dark background.
- Source search form: `876px × 38px`, flex layout, `1px` blue border, `4px` radius.
- Source input: `740px × 36px`, transparent background, `16px/24px` type.
- Local adaptation uses the existing theme tokens and a taller 72px search row to match the blog navigation scale.

## States and Behaviors
- Navigation search button or `Ctrl/Cmd + K` opens the overlay and focuses the input.
- Empty query lists static pages and all published content.
- Input searches titles, categories, summaries, tags, and Markdown body text.
- Results are ranked with exact title, title prefix, title inclusion, category, then full text matches.
- Matching text is highlighted.
- Up and Down move the active result; Enter opens it; Escape closes the overlay.
- Pointer hover updates the active result.
- Clicking the mask closes the overlay. Closing restores body scroll and the previous focus.
- The detail toggle shows or hides result excerpts.
- Published articles and moments load from the public entries API. Static page search remains available if MySQL is offline.

## Content Sources
- Static routes: 首页、技术学习记录、日常生活记录、简历、友链、工具、关于.
- MySQL published `article` entries link to their reader route.
- MySQL published `moment` entries link to their anchored card on the life timeline.

## Responsive Behavior
- Desktop: maximum width `900px`, maximum height `78vh`, top offset `8vh`.
- Mobile at `700px` and below: 12px viewport inset, nearly full height, smaller controls, stacked result metadata.

## Accessibility
- Modal uses `role="dialog"` and `aria-modal="true"`.
- Results use listbox and option semantics with `aria-selected`.
- Result count uses an `aria-live` region.
- Buttons and input have explicit accessible labels.
