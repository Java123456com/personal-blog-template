# 星空极光简历背景修正

Source: https://yihanglizi.cn/resume/ (the browser returned an SSL error during this pass; use the already captured markup/CSS and user reference screenshots). This is an in-place update of the existing `/resume/` route, not a new page.

## Observed layout and layers

- `resume-d4be9fa6/markup.html` begins with a fixed `.doc-bg.starry-theme.bg-ready` layer containing two canvases, `.bg-overlay`, and nebula layer. Existing source CSS in `public/sites/yihanglizi-cn-bc4c2f76/root-8a5edab2/assets/original.css` makes `.doc-bg` fixed full screen, `.bg-canvas.active` visible, and the starry overlay a dark vignette.
- Current custom canvas painter is `src/components/sites/yihanglizi-cn-bc4c2f76/shared/background.ts` and runs on document pages, including `/resume/`.
- Current star field has 200 stars on desktop / 100 mobile, radii 0.5–2.5px, alpha 0.16–0.78, frequency 0.6–2.4rad/s, and a meteor spawn probability of 0.005 per 60Hz frame. The user reports that this is too sparse, dim, and slow compared with the source.
- Home page video must remain limited to the starry homepage. Document pages use twinkling stars and meteors.

## Requested behavior

- Make the starry document background, especially `/resume/`, visibly dense with many bright stars. Twinkles should be conspicuous and quick, with a mix of small pinpoints and fewer soft halos.
- Make meteors clearly visible and recurring, keeping their diagonal movement natural and their trails short enough to see against the resume content.
- Keep text/cards readable and preserve the cyber code-rain variant and reduced-motion behavior.
- Inspect `/resume/` in local preview to ensure the star canvas and hero backdrop actually render. The original CSS references `/img/resume-starry.jpg`, which is currently missing and produces a 404; resolve this missing backdrop with a suitable local asset or a deliberate CSS fallback consistent with the reference, without adding homepage video.

## Implementation ownership

Change only `shared/background.ts` and, if needed for the missing resume hero, route-scoped rules in `src/app/globals.css` or an asset under `public/img/`. Do not modify `root-8a5edab2/nav.ts`; another builder is fixing wheel rotation there. Verify `npm.cmd run typecheck` and browser appearance.
