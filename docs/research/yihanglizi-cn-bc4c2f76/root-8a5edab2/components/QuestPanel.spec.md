# QuestPanel Specification

- **Target:** captured `markup.html`, styled by `original.css`.
- **Screenshot:** `docs/design-references/yihanglizi-cn-bc4c2f76/root-8a5edab2/local-desktop.png`.
- **Interaction model:** hover and link navigation.
- **Structure:** `.quests > .block-head + .quest-grid`, six `.quest-card` links; each card has four corner markers, a scan overlay, ID/difficulty, title, description, three tags and reward/arrow footer.
- **Exact desktop values:** quest grid 1135.2px wide with two 559.6px columns and 16px gap; card 223.25px tall, padding 17.6px 19.2px, border 1px solid rgba(255,176,0,.32), background rgba(15,9,3,.7). Title 16.8px, weight 800, 0.336px letter spacing. Hover transition is `transform .25s, background .25s, border-color .25s`.
- **Text:** all six cards are verbatim in `markup.html`. Links go to original blog, moments, friends, tools and about paths.
- **Responsive:** a single column at 768px and 390px, with source CSS controlling card height and padding.
