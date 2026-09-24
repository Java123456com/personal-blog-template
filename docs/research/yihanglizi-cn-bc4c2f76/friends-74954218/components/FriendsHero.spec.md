# Friends hero and local node

Reference: `https://yihanglizi.cn/friends/` and `docs/design-references/yihanglizi-cn-bc4c2f76/friends-viewport.png`.

## Structure

- Full width dark telemetry hero with a two column mast.
- Left column: cluster status, terminal prompt, oversized “友 链” title, bilingual description, and four status cells.
- Right column: framed cat image with cyan and amber corner marks.
- Module `#01 本节点 · Local Node` follows the hero.
- The local node keeps the reference card composition, but uses generic “个人博客” identity copy and contains no 一行栗子 profile details.

## Responsive behavior

- Desktop uses the captured side by side mast and wide content frame.
- Mobile stacks the mast content and artwork while keeping all telemetry readable.
