import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const base = process.env.STATIC_TEST_URL || "http://127.0.0.1:4183";
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errors = [];
page.on("pageerror", error => errors.push(error.message));
mkdirSync("artifacts/nav-panels", { recursive: true });

try {
  for (const route of ["/about/", "/", "/moments/tech/"]) {
    assert.equal((await page.goto(base + route)).status(), 200);
    await page.locator(".clone-nav-panel-title").waitFor({ state: "attached" });
    const blogButton = page.locator(".VPNavBarMenuGroup button");
    const blogPanel = page.locator(".VPNavBarMenuGroup > .menu .VPMenu");
    const themeButton = page.locator(".ns-btn");
    for (const [label, theme] of [["星空极光", "starry"], ["赛博编程", "cyber"]]) {
      await themeButton.click();
      await page.locator(".ns-opt").filter({ hasText: label }).click();
      assert.equal(await page.locator("html").getAttribute("data-doc-theme"), theme);
      assert.equal(await page.locator(".ns-panel").count(), 0);

      await blogButton.click();
      await blogPanel.waitFor({ state: "visible" });
      const blogRect = await blogPanel.boundingBox();
      assert.equal(await blogButton.getAttribute("aria-expanded"), "true");
      await blogPanel.locator(".clone-nav-panel-title").click();
      assert.equal(await blogPanel.isVisible(), true, "Clicks inside the blog panel must keep it open");
      assert.deepEqual(await blogPanel.locator("a").evaluateAll(links => links.map(link => link.getAttribute("href"))), ["/moments/tech/", "/moments/life/"]);
      if (route === "/about/") await page.screenshot({ path: `artifacts/nav-panels/blog-${theme}.png`, clip: { x: 800, y: 0, width: 800, height: 280 } });

      await page.mouse.click(24, 180);
      assert.equal(await blogPanel.isVisible(), false, "Clicking outside must close the blog menu");
      assert.equal(await blogButton.getAttribute("aria-expanded"), "false");
      await blogButton.hover();
      assert.equal(await blogPanel.isVisible(), false, "Hover must not reopen a closed menu");
      await blogButton.focus();
      await page.keyboard.press("Enter");
      await blogPanel.waitFor({ state: "visible" });
      assert.equal(await blogPanel.isVisible(), true);
      await page.keyboard.press("Escape");
      assert.equal(await blogPanel.isVisible(), false, "Escape must close the menu while its trigger stays focused and hovered");

      await blogButton.click();
      await themeButton.click();
      assert.equal(await blogPanel.isVisible(), false, "Opening themes must close the blog menu");
      await page.locator(".ns-title").click();
      assert.equal(await page.locator(".ns-panel").count(), 1, "Clicks inside the theme panel must keep it open");
      const themeRect = await page.locator(".ns-panel").boundingBox();
      for (const dimension of ["width", "height", "y"]) assert.ok(Math.abs(blogRect[dimension] - themeRect[dimension]) <= 1, `Panels must match in ${dimension}`);
      assert.ok(themeRect.width <= 200 && themeRect.height <= 130, "Panels must stay compact");
      if (route === "/about/") await page.screenshot({ path: `artifacts/nav-panels/theme-${theme}.png`, clip: { x: 800, y: 0, width: 800, height: 280 } });
      await blogButton.click();
      assert.equal(await page.locator(".ns-panel").count(), 0, "Opening the blog menu must close themes");
      await page.locator(".st-btn").click();
      assert.equal(await blogPanel.isVisible(), false, "Opening sound settings must close the blog menu");
      await page.keyboard.press("Escape");
      await blogButton.click();
      await page.locator(".DocSearch-Button").click();
      assert.equal(await blogPanel.isVisible(), false, "Clicking elsewhere in the navigation must close the blog menu");
      await page.keyboard.press("Escape");
      await themeButton.click();
      await page.mouse.click(24, 180);
      assert.equal(await page.locator(".ns-panel").count(), 0, "Clicking outside must close themes");
    }
  }
  await page.evaluate(() => {
    const outside = document.createElement("button");
    outside.id = "outside-pointer-test";
    outside.setAttribute("aria-label", "外部图标验证");
    outside.style.cssText = "position:fixed;left:16px;bottom:16px;width:40px;height:40px;z-index:500";
    outside.innerHTML = '<svg width="24" height="24"><circle cx="12" cy="12" r="10" /></svg>';
    outside.addEventListener("pointerdown", event => event.stopPropagation());
    document.body.append(outside);
  });
  await page.locator(".VPNavBarMenuGroup button").click();
  await page.locator("#outside-pointer-test svg").click();
  assert.equal(await page.locator(".VPNavBarMenuGroup > .menu .VPMenu").isVisible(), false, "Outside SVG clicks must close the menu even when bubbling is stopped");
  await page.locator(".ns-btn").click();
  await page.locator("#outside-pointer-test svg").click();
  assert.equal(await page.locator(".ns-panel").count(), 0);
  await page.locator(".st-btn").click();
  await page.locator("#outside-pointer-test svg").click();
  assert.equal(await page.locator(".st-panel").count(), 0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + "/");
  await page.locator(".clone-nav-panel-title").waitFor({ state: "attached" });
  await page.locator(".VPNavBarHamburger").click();
  await page.locator(".clone-mobile-blog summary").click();
  await page.locator('.clone-mobile-blog a[href="/moments/tech/"]').waitFor({ state: "visible" });
  await page.locator(".VPNavBarHamburger").click();
  await page.locator(".ns-btn").click();
  const mobileRect = await page.locator(".ns-panel").boundingBox();
  assert.ok(mobileRect.x >= 0 && mobileRect.x + mobileRect.width <= 391, "The theme panel must fit on mobile");
  await page.screenshot({ path: "artifacts/nav-panels/mobile.png" });
  await page.keyboard.press("Escape");
  assert.equal(await page.locator(".ns-panel").count(), 0);
  assert.deepEqual(errors, []);
  console.log("Navigation passed: outside click, hover, keyboard, exclusive panels, matched dimensions, themes, routes and mobile.");
} finally { await browser.close(); }
