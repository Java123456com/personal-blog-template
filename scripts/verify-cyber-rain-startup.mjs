import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const base = process.env.STATIC_TEST_URL || "http://127.0.0.1:4183";
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
mkdirSync("artifacts/cyber-rain", { recursive: true });
try {
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem("clone-site-theme", "赛博编程");
    localStorage.setItem("clone-site-theme-default", "starry-default-v2");
  });
  await page.route("**/_next/static/chunks/**/*.js", async route => {
    await new Promise(resolve => setTimeout(resolve, 8000));
    await route.continue().catch(() => {});
  });
  await page.goto(base + "/", { waitUntil: "commit" });
  const canvas = page.locator(".wasteland .rain-canvas");
  await canvas.waitFor({ state: "visible", timeout: 2500 });
  await page.waitForFunction(() => document.querySelector(".rain-canvas")?.dataset.rainReady === "inline", null, { timeout: 500 });
  const early = await canvas.evaluate(element => {
    const canvas = element;
    const pixels = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
    let painted = 0;
    for (let index = 3; index < pixels.length; index += 1600) if (pixels[index] > 0) painted++;
    return { painted, width: canvas.width, height: canvas.height, at: performance.now() };
  });
  assert.ok(early.painted > 100, `Inline code rain must paint immediately (${early.painted} sampled pixels)`);
  assert.equal(await page.locator(".clone-nav-panel-title").count(), 0, "Code rain must appear while React remains delayed");
  await page.screenshot({ path: "artifacts/cyber-rain/before-react.png" });
  await page.locator(".clone-nav-panel-title").waitFor({ state: "attached", timeout: 15000 });
  await page.waitForFunction(() => document.querySelector(".rain-canvas")?.dataset.rainReady === "enhanced");
  const firstFrame = await canvas.screenshot();
  await page.waitForTimeout(500);
  const nextFrame = await canvas.screenshot();
  assert.notDeepEqual(firstFrame, nextFrame, "Code rain must continue animating after React takes over");
  assert.deepEqual(errors, []);
  console.log(`Cyber rain passed: first painted frame at ${Math.round(early.at)}ms while React was delayed 8 seconds; animation continued after handoff.`);
  await context.close();
} finally { await browser.close(); }
