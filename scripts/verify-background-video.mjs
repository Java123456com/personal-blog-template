import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const base = process.env.STATIC_TEST_URL || "http://127.0.0.1:4183";
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const android = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36";
const routes = [
  ["/", ".slh-video-layer", ".slh-video-poster"],
  ["/moments/tech/", ".tech-archive__hero", "img.tech-archive__hero-video"],
  ["/moments/life/", ".life-timeline__hero", "img.life-timeline__hero-video"],
];
const errors = [];
mkdirSync("artifacts/background-video", { recursive: true });

try {
  for (const [name, options] of [
    ["baidu-android", { userAgent: android + " baiduboxapp/13.80.0.10", isMobile: true, hasTouch: true }],
    ["baidu-ios", { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 baiduboxapp/13.80.0.10", isMobile: true, hasTouch: true }],
    ["baidu-browser", { userAgent: android + " BIDUBrowser/8.7", isMobile: true, hasTouch: true }],
    ["reduced-motion", { userAgent: android, isMobile: true, hasTouch: true, reducedMotion: "reduce" }],
  ]) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, ...options });
    const page = await context.newPage();
    const requests = [];
    page.on("request", request => { if (/\.mp4(?:\?|$)/.test(request.url())) requests.push(request.url()); });
    page.on("pageerror", error => errors.push(`${name}: ${error.message}`));
    for (const [route, container, poster] of routes) {
      const response = await page.goto(base + route);
      assert.equal(response.status(), 200);
      assert.equal(/<video\b/.test(await response.text()), false, "Static HTML must not autoplay before browser detection");
      await page.locator(".clone-nav-panel-title").waitFor({ state: "attached" });
      await page.locator(poster).waitFor({ state: "visible" });
      assert.equal(await page.locator(`${container} video`).count(), 0, `${name} must not mount a native decorative video`);
      const loaded = await page.locator(poster).evaluate(image => image.complete && image.naturalWidth > 0);
      assert.equal(loaded, true, "The replacement poster must load");
      await page.locator(".ns-btn").click();
      await page.locator(".ns-opt").filter({ hasText: "赛博编程" }).click();
      assert.equal(await page.locator("html").getAttribute("data-doc-theme"), "cyber");
      await page.locator(".ns-btn").click();
      await page.locator(".ns-opt").filter({ hasText: "星空极光" }).click();
      await page.locator(poster).waitFor({ state: "visible" });
      assert.equal(await page.locator(`${container} video`).count(), 0, "Switching themes must not reintroduce the video");
      await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
      await page.locator(".VPNavBarHamburger").click();
      await page.locator('.clone-mobile-menu a[href="/about/"]').waitFor({ state: "visible" });
      await page.locator(".VPNavBarHamburger").click();
      await page.locator(".DocSearch-Button").click();
      await page.locator(".clone-search-box").waitFor({ state: "visible" });
      await page.keyboard.press("Escape");
      if (name === "baidu-android") await page.screenshot({ path: `artifacts/background-video/${route === "/" ? "home" : route.split("/")[2]}.png` });
    }
    assert.deepEqual(requests, [], "Fallback browsers must not download any background MP4");
    await context.close();
  }

  for (const [name, options] of [
    ["desktop", { viewport: { width: 1600, height: 1000 } }],
    ["mobile-chrome", { viewport: { width: 390, height: 844 }, userAgent: android, isMobile: true, hasTouch: true }],
  ]) {
    const context = await browser.newContext(options);
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(`${name}: ${error.message}`));
    for (const [route, container] of routes) {
      await page.goto(base + route);
      const video = page.locator(`${container} video`);
      await video.waitFor({ state: "visible" });
      await page.waitForFunction(selector => document.querySelector(selector)?.readyState >= 2, `${container} video`);
      assert.equal(await video.evaluate(video => video.muted && video.playsInline && !video.controls), true, "Compatible browsers must keep muted inline backgrounds");
      assert.equal(await video.getAttribute("webkit-playsinline"), "");
      assert.equal(await video.getAttribute("x5-playsinline"), "");
      await page.waitForFunction(selector => document.querySelector(selector)?.currentTime > 0, `${container} video`);
      assert.equal(await page.evaluate(() => document.fullscreenElement), null);
    }
    await page.goto(base + "/");
    await page.locator(".clone-nav-panel-title").waitFor({ state: "attached" });
    await page.locator(".ns-btn").click();
    await page.locator(".ns-opt").filter({ hasText: "赛博编程" }).click();
    assert.equal(await page.locator(".slh-video-layer video").evaluate(video => video.paused), true);
    await page.reload();
    await page.locator(".clone-nav-panel-title").waitFor({ state: "attached" });
    assert.equal(await page.locator(".slh-video-layer video").count(), 0, "Saved cyber theme must not start the hidden starry video");
    await context.close();
  }
  // Check a cold cache on a 1 Mbps connection, including first-start latency.
  const slowContext = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  const slowPage = await slowContext.newPage();
  slowPage.on("pageerror", error => errors.push(`slow-network: ${error.message}`));
  await slowPage.addInitScript(() => {
    window.backgroundPlayback = { initialBuffer: null, waits: 0, waitingEvents: [], loadedAt: null, playingAt: null };
    document.addEventListener("loadeddata", event => {
      if (event.target instanceof HTMLVideoElement && event.target.matches(".slh-video")) window.backgroundPlayback.loadedAt ??= performance.now();
    }, true);
    document.addEventListener("playing", event => {
      const video = event.target;
      if (!(video instanceof HTMLVideoElement) || !video.matches(".slh-video")) return;
      if (window.backgroundPlayback.initialBuffer === null) {
        window.backgroundPlayback.initialBuffer = video.buffered.end(0) - video.currentTime;
        window.backgroundPlayback.playingAt = performance.now();
      }
    }, true);
    document.addEventListener("waiting", event => {
      const video = event.target;
      if (video instanceof HTMLVideoElement && video.matches(".slh-video") && video.currentTime > .1) {
        const available = Array.from({ length: video.buffered.length }, (_, i) =>
          video.buffered.start(i) <= video.currentTime && video.buffered.end(i) >= video.currentTime ? video.buffered.end(i) - video.currentTime : 0,
        );
        if (Math.max(0, ...available) <= .2) window.backgroundPlayback.waits++;
        window.backgroundPlayback.waitingEvents.push({
          time: video.currentTime, ready: video.readyState,
          buffer: Array.from({ length: video.buffered.length }, (_, i) => [video.buffered.start(i), video.buffered.end(i)]),
        });
      }
    }, true);
  });
  const network = await slowContext.newCDPSession(slowPage);
  await network.send("Network.enable");
  await network.send("Network.setCacheDisabled", { cacheDisabled: true });
  await network.send("Network.emulateNetworkConditions", {
    offline: false, latency: 120, downloadThroughput: 128 * 1024, uploadThroughput: 64 * 1024,
  });
  await slowPage.goto(base + "/", { waitUntil: "domcontentloaded" });
  await slowPage.waitForFunction(() => window.backgroundPlayback.initialBuffer !== null, null, { timeout: 45000 });
  await slowPage.waitForTimeout(12000);
  const playback = await slowPage.evaluate(() => ({
    ...window.backgroundPlayback,
    time: document.querySelector(".slh-video-layer video").currentTime,
  }));
  console.log(`Slow network sample: ${JSON.stringify(playback)}`);
  assert.ok(playback.initialBuffer > 0, `Playback should start when frames are available: ${JSON.stringify(playback)}`);
  assert.ok(playback.playingAt - playback.loadedAt < 4000, `Video startup buffering must stay bounded: ${JSON.stringify(playback)}`);
  assert.equal(playback.waits, 0, `The optimized video should play without rebuffering at 1 Mbps: ${JSON.stringify(playback)}`);
  assert.ok(playback.time > 10, "Playback must keep advancing on a slow connection");
  console.log(`Slow network passed: ${playback.initialBuffer.toFixed(2)}s buffered before playing, no buffering stalls in 12s.`);
  await slowContext.close();

  const recoveryContext = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  const recoveryPage = await recoveryContext.newPage();
  recoveryPage.on("pageerror", error => errors.push(`playback-recovery: ${error.message}`));
  await recoveryPage.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play;
    window.blockedBackgroundAttempts = 0;
    HTMLMediaElement.prototype.play = function () {
      if (this.matches(".slh-video") && window.blockedBackgroundAttempts++ === 0) {
        return Promise.reject(new DOMException("Simulated autoplay policy", "NotAllowedError"));
      }
      return play.call(this);
    };
  });
  await recoveryPage.goto(base + "/");
  await recoveryPage.waitForFunction(() => window.blockedBackgroundAttempts > 0);
  const recoveredVideo = recoveryPage.locator(".slh-video-layer video");
  assert.equal(await recoveredVideo.evaluate(video => video.paused), true, "Blocked autoplay must wait for user interaction");
  await recoveryPage.keyboard.press("Shift");
  await recoveryPage.waitForFunction(() => document.querySelector(".slh-video-layer video")?.currentTime > .1);
  await recoveryPage.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  assert.equal(await recoveredVideo.evaluate(video => video.paused), true, "Hidden pages must pause playback");
  await recoveryPage.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await recoveryPage.waitForFunction(() => !document.querySelector(".slh-video-layer video")?.paused);
  await recoveredVideo.evaluate(video => { video.dispatchEvent(new Event("waiting")); });
  await recoveryPage.waitForFunction(() => !document.querySelector(".slh-video-layer video")?.paused);
  await recoveredVideo.evaluate(video => { video.currentTime = video.duration - .15; });
  await recoveryPage.waitForFunction(() => document.querySelector(".slh-video-layer video")?.currentTime < 3);
  await recoveryContext.close();

  assert.deepEqual(errors, []);
  console.log("Backgrounds passed: fallback browsers avoid MP4 requests; desktop/mobile retain inline video; slow-network buffering, autoplay retry, page visibility, and looping work.");
} finally { await browser.close(); }
