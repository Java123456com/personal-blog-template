import assert from "node:assert/strict";
import { existsSync, mkdirSync, writeFileSync, unlinkSync, readFileSync } from "node:fs";
import { chromium } from "playwright";

const article = "content/articles/static-verification.md";
const draft = "content/articles/static-verification-draft.md";
const newer = "content/life/static-verification-new.md";
const older = "content/life/static-verification-old.md";
const image = "public/images/static-verification.png";
const files = [article, draft, newer, older, image];

if (process.argv.includes("--prepare")) {
  assert.ok(files.every((path) => !existsSync(path)), "Verification fixtures must not overwrite existing files");
  mkdirSync("public/images", { recursive: true });
  writeFileSync(image, Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=", "base64"));
  writeFileSync(article, '---\ntitle: Java 静态验证文章\nslug: static-verification\ndate: "2026-10-08"\nsummary: 本地 Markdown 构建验证\ntags: [Java, 静态博客]\n---\n\n## 图片与表格\n\n![验证图片](/images/static-verification.png)\n\n| 项目 | 结果 |\n| --- | --- |\n| Markdown | 正常 |\n\n## 图表\n\n```mermaid\nflowchart LR\n  Markdown --> GitHub --> Blog\n```\n');
  writeFileSync(draft, '---\ntitle: 禁止公开的验证草稿\nslug: static-verification-draft\ndate: "2026-10-08"\ndraft: true\n---\n\nPRIVATE_DRAFT_VERIFICATION\n');
  writeFileSync(newer, '---\ntitle: 验证较新生活记录\nslug: static-verification-new\ndate: "2026-10-08"\nimages: ["/images/static-verification.png"]\n---\n\n新记录\n');
  writeFileSync(older, '---\ntitle: 验证较早生活记录\nslug: static-verification-old\ndate: "2026-10-01"\nimages: ["/images/static-verification.png"]\n---\n\n早期记录\n');
  console.log("Temporary Markdown and image fixtures created.");
} else if (process.argv.includes("--cleanup")) {
  for (const file of files) if (existsSync(file)) unlinkSync(file);
  console.log("Temporary verification fixtures removed.");
} else {
  const base = process.env.STATIC_TEST_URL || "http://127.0.0.1:4183";
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const failures = [];
  page.on("pageerror", (error) => failures.push(error.message));
  const apiRequests = [];
  page.on("request", (request) => { if (new URL(request.url()).pathname.startsWith("/api/")) apiRequests.push(request.url()); });
  mkdirSync("artifacts/static", { recursive: true });
  try {
    for (const route of ["/", "/moments/tech/", "/moments/life/", "/friends/", "/tools/", "/about/", "/resume/", "/moments/tech/static-verification/"]) {
      const response = await page.goto(base + route);
      assert.equal(response.status(), 200, `${route} must be exported`);
      await page.locator(".DocSearch-Button").waitFor();
      assert.equal(await page.locator('a[href*="/write"], .nav-admin-link').count(), 0, `${route} must not contain admin links`);
    }
    const index = JSON.parse(readFileSync("out/search-index.json", "utf8"));
    assert.equal(index.entries.length, 1);
    assert.equal(index.entries[0].slug, "static-verification");
    assert.equal(existsSync("out/moments/tech/static-verification-draft/index.html"), false, "Draft articles must not be exported");
    assert.equal(existsSync("out/moments/tech/__empty"), false, "The empty-archive build placeholder must not be published");
    await page.goto(base + "/");
    await page.locator(".ns-btn").click();
    await page.locator(".ns-panel").waitFor();
    await page.locator(".ns-panel button").filter({ hasText: "赛博编程" }).click();
    assert.equal(await page.locator("html").getAttribute("data-doc-theme"), "cyber");
    await page.screenshot({ path: "artifacts/static/home-cyber.png" });
    await page.locator(".ns-btn").click();
    await page.locator(".ns-panel button").filter({ hasText: "星空极光" }).click();
    assert.equal(await page.locator("html").getAttribute("data-doc-theme"), "starry");
    await page.screenshot({ path: "artifacts/static/home-starry.png" });
    await page.locator(".DocSearch-Button").click();
    await page.locator(".clone-search-input input").fill("Java");
    await page.locator('.clone-search-result[href="/moments/tech/static-verification/"]').waitFor();
    await page.keyboard.press("Enter");
    await page.waitForURL("**/moments/tech/static-verification/");
    await page.locator(".article-reader h1").waitFor();
    assert.match(await page.locator(".article-reader h1").first().textContent(), /Java 静态验证文章/);
    assert.equal(await page.locator(".article-reader table").count(), 1);
    await page.locator(".mermaid-diagram svg").waitFor({ timeout: 30000 });
    assert.equal(await page.locator(".article-reader__toc-link").count(), 2);
    await page.reload();
    assert.equal(await page.locator(".article-reader table").count(), 1, "Article reload must work without a backend");
    assert.equal(await page.locator(".article-reader__prose img").evaluate((img) => img.complete && img.naturalWidth > 0), true);
    await page.screenshot({ path: "artifacts/static/article.png", fullPage: true });
    await page.goto(base + "/moments/life/");
    assert.match(await page.locator(".life-timeline__card h2").first().textContent(), /较新/);
    await page.getByRole("button", { name: "最早", exact: true }).click();
    assert.match(await page.locator(".life-timeline__card h2").first().textContent(), /较早/);
    await page.locator(".life-timeline__image").first().click();
    await page.getByRole("dialog", { name: "查看记录图片" }).waitFor();
    await page.keyboard.press("Escape");
    assert.equal(await page.locator(".life-timeline__lightbox").count(), 0);
    await page.goto(base + "/resume/");
    assert.equal(await page.locator(".resume-page .timeline").isVisible(), true);
    if (await page.locator(".sort-toggle").count()) {
      await page.locator(".sort-toggle").click();
      assert.match(await page.locator(".sort-label").textContent(), /正序/);
    }
    if (await page.locator(".resume-view-btn").count()) {
      await page.locator(".resume-view-btn").first().click();
      await page.locator('.resume-modal[role="dialog"]').waitFor();
      await page.keyboard.press("Escape");
      assert.equal(await page.locator(".resume-modal").count(), 0);
    }
    await page.goto(base + "/friends/");
    await page.locator(".view-btn").nth(1).click();
    assert.equal(await page.locator(".starmap-wrap").isVisible(), true);
    await page.locator(".view-btn").first().click();
    assert.equal(await page.locator(".friends-grid").isVisible(), true);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base + "/");
    await page.locator(".VPNavBarHamburger").click();
    await page.locator(".clone-mobile-menu").waitFor();
    assert.equal(await page.locator('a[href*="/write"]').count(), 0);
    await page.screenshot({ path: "artifacts/static/mobile.png" });
    for (const path of ["/write/", "/api/entries?type=article", "/moments/tech/static-verification-draft/"]) {
      assert.equal((await page.request.get(base + path)).status(), 404);
    }
    assert.deepEqual(apiRequests, [], "Browsers must not depend on backend APIs");
    assert.deepEqual(failures, [], "Browser must have no uncaught application errors");
    console.log("Static export passed: routes, drafts, search, Markdown, Mermaid, images, sorting, themes, mobile navigation, resume and friends interactions.");
  } finally { await browser.close(); }
}
