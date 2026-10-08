import assert from "node:assert/strict";
import { chromium } from "playwright";

const base = process.env.STATIC_TEST_URL || "http://127.0.0.1:4183";
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const errors = [];
async function createPage(options = {}) {
  const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await context.newPage();
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(options => {
    window.testAudios = [];
    const Audio = window.Audio;
    window.Audio = function (...args) {
      const audio = new Audio(...args);
      window.testAudios.push(audio);
      return audio;
    };
    window.Audio.prototype = Audio.prototype;
    if (options.enabled) localStorage.setItem("clone-background-music", "on");
    if (options.position) sessionStorage.setItem("clone-background-music-time", String(options.position));
    if (options.block) {
      const play = HTMLMediaElement.prototype.play;
      let blocked = 0;
      HTMLMediaElement.prototype.play = function () {
        if (this instanceof HTMLAudioElement && this.src.includes("background-music") && blocked++ < (options.blockAttempts || 1)) {
          return Promise.reject(new DOMException("Simulated autoplay policy", "NotAllowedError"));
        }
        return play.call(this);
      };
    }
  }, options);
  return { context, page };
}
const music = page => page.locator(".st-row").filter({ hasText: "背景音乐" });
try {
  const early = await createPage();
  let releaseVideo;
  await early.page.route("**/starlight-orbit-v2.mp4", async route => {
    await new Promise(resolve => { releaseVideo = resolve; });
    await route.continue().catch(() => {});
  });
  await early.page.addInitScript(() => {
    document.addEventListener("loadstart", event => {
      if (event.target instanceof HTMLVideoElement) window.videoStartedAt = performance.now();
    }, true);
  });
  const videoRequest = early.page.waitForRequest("**/starlight-orbit-v2.mp4");
  await early.page.goto(base + "/", { waitUntil: "domcontentloaded" });
  await videoRequest;
  await early.page.locator(".clone-nav-panel-title").waitFor({ state: "attached" });
  await early.page.locator(".cosmic-markers").waitFor({ state: "attached" });
  await early.page.locator(".ns-btn").click();
  await early.page.locator(".ns-opt").filter({ hasText: "赛博编程" }).click();
  const startup = await early.page.evaluate(() => ({
    load: performance.getEntriesByType("navigation")[0].loadEventStart,
    video: window.videoStartedAt,
    theme: document.documentElement.dataset.docTheme,
  }));
  assert.ok(startup.video > 0, "Decorative video must start immediately");
  assert.equal(startup.theme, "cyber", "Theme controls must work while the video request is still pending");
  releaseVideo?.();
  await early.page.unroute("**/starlight-orbit-v2.mp4");
  await early.context.close();

  const { context, page } = await createPage();
  const requests = [];
  page.on("request", request => { if (/\.(mp3|m4a)(?:\?|$)/.test(request.url())) requests.push(request.url()); });
  await page.goto(base + "/", { waitUntil: "domcontentloaded" });
  await page.locator(".clone-nav-panel-title").waitFor({ state: "attached" });
  await page.waitForFunction(() => document.querySelector(".slh-video-layer video")?.currentTime > .2);
  assert.deepEqual(requests, [], "Disabled music and untouched pet sounds must not download on the first screen");
  await page.locator(".cosmic-markers").waitFor({ state: "attached" });
  assert.equal(await page.locator(".cosmic-marker").count() > 0, true, "The galaxy must initialize with the rest of the page");
  await page.locator(".st-btn").click();
  const started = Date.now();
  await music(page).click();
  await page.waitForFunction(() => document.documentElement.dataset.backgroundMusic === "playing");
  assert.ok(Date.now() - started < 3000, "Explicit music playback should begin promptly");
  await page.waitForFunction(() => window.testAudios.some(audio => audio.src.includes("background-music") && audio.currentTime > .2 && !audio.paused && audio.volume > 0));
  assert.match(await music(page).textContent(), /播放中/);
  const energy = await page.evaluate(async () => {
    const audio = window.testAudios.find(audio => audio.src.includes("background-music"));
    const context = new AudioContext();
    const source = context.createMediaElementSource(audio);
    const analyser = context.createAnalyser();
    source.connect(analyser); analyser.connect(context.destination);
    await context.resume();
    await new Promise(resolve => setTimeout(resolve, 250));
    const samples = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(samples);
    const rms = Math.sqrt(samples.reduce((sum, sample) => sum + sample * sample, 0) / samples.length);
    await context.close();
    return rms;
  });
  assert.ok(energy > .001, `Decoded music must contain audible audio samples, RMS=${energy}`);
  await music(page).click();
  assert.equal(await page.locator("html").getAttribute("data-background-music"), "off");
  await context.close();

  const retry = await createPage({ enabled: true, block: true, position: 120 });
  await retry.page.goto(base + "/");
  await retry.page.waitForFunction(() => document.documentElement.dataset.backgroundMusic === "blocked");
  await retry.page.locator(".st-btn").click();
  // Opening the panel is a gesture that retries the saved enabled preference.
  await retry.page.waitForFunction(() => document.documentElement.dataset.backgroundMusic === "playing");
  await retry.page.waitForFunction(() => window.testAudios.some(audio => audio.src.includes("background-music") && audio.currentTime > 23 && audio.currentTime < 30 && !audio.paused));
  assert.match(await music(retry.page).textContent(), /播放中/);
  const range = retry.page.locator(".st-range");
  await range.evaluate(input => { input.value = "0"; input.dispatchEvent(new Event("input", { bubbles: true })); });
  assert.match(await music(retry.page).textContent(), /已静音/);
  await range.evaluate(input => { input.value = "80"; input.dispatchEvent(new Event("input", { bubbles: true })); });
  assert.match(await music(retry.page).textContent(), /播放中/);
  await music(retry.page).click();
  assert.equal(await retry.page.locator("html").getAttribute("data-background-music"), "off");
  assert.equal(await retry.page.evaluate(() => localStorage.getItem("clone-background-music")), "off");
  await retry.context.close();
  const explicitRetry = await createPage({ enabled: true, block: true, blockAttempts: 2 });
  await explicitRetry.page.goto(base + "/");
  await explicitRetry.page.waitForFunction(() => document.documentElement.dataset.backgroundMusic === "blocked");
  await explicitRetry.page.locator(".st-btn").click();
  await explicitRetry.page.waitForFunction(() => document.documentElement.dataset.backgroundMusic === "blocked");
  await music(explicitRetry.page).click();
  await explicitRetry.page.waitForFunction(() => document.documentElement.dataset.backgroundMusic === "playing");
  assert.equal(await explicitRetry.page.evaluate(() => localStorage.getItem("clone-background-music")), "on", "Clicking retry must not turn music off");
  await explicitRetry.context.close();
  const slow = await createPage();
  let releaseMusic;
  await slow.page.route("**/background-music-v2.m4a", async route => {
    await new Promise(resolve => { releaseMusic = resolve; });
    await route.continue().catch(() => {});
  });
  await slow.page.goto(base + "/");
  await slow.page.locator(".st-btn").click();
  await music(slow.page).click();
  await slow.page.waitForFunction(() => document.documentElement.dataset.backgroundMusic === "error", null, { timeout: 7500 });
  assert.match(await music(slow.page).textContent(), /网络慢·重试/);
  releaseMusic?.();
  await slow.page.unroute("**/background-music-v2.m4a");
  await music(slow.page).click();
  await slow.page.waitForFunction(() => document.documentElement.dataset.backgroundMusic === "playing");
  await slow.context.close();
  assert.deepEqual(errors, []);
  console.log(`Media startup passed: video and galaxy start immediately; controls remain usable while video is pending; no idle audio downloads; music starts, emits nonzero samples (RMS ${energy.toFixed(3)}), restores position, retries blocked autoplay, reports mute, and exits a stalled load after 6 seconds.`);
} finally { await browser.close(); }
