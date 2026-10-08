import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = process.env.STATIC_TEST_URL || 'http://127.0.0.1:4183';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  for (const path of ['/', '/friends/', '/about/', '/moments/tech/']) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    const releases = [];
    const requests = [];
    const errors = [];
    page.on('request', request => requests.push(request.url()));
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', async route => {
      if (['font', 'image', 'media'].includes(route.request().resourceType())) {
        await new Promise(resolve => releases.push(resolve));
      }
      await route.continue().catch(() => {});
    });
    try {
      await page.goto(base + path, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('load', { timeout: 3000 });
      await page.locator('.clone-nav-panel-title').waitFor({ state: 'attached' });
      await page.waitForTimeout(200);
      assert.equal(await page.evaluate(() => document.readyState), 'complete', 'Unavailable decoration must not keep navigation loading');
      const fonts = requests.filter(url => /\.woff2(?:\?|$)/.test(url));
      assert.equal(fonts.length, 1, 'One optional font request replaces duplicate font downloads');
      const loadTime = await page.evaluate(() => performance.getEntriesByType('navigation')[0].loadEventStart);
      assert.ok(loadTime > 0);
      assert.equal(requests.some(url => url.includes('/assets/original.css')), false, 'Captured CSS must be bundled without a nested import request');
      await page.locator('.ns-btn').click();
      await page.locator('.ns-opt').filter({ hasText: '赛博编程' }).click();
      assert.equal(await page.locator('html').getAttribute('data-doc-theme'), 'cyber', 'Navigation must remain usable while media is pending');
      for (const release of releases) release();
      await page.waitForFunction(() => [...document.fonts].some(font => font.family === 'Inter' && font.status === 'loaded'));
      const fontTime = await page.evaluate(() => performance.getEntriesByType('resource').find(entry => entry.name.endsWith('/inter.woff2')).startTime);
      assert.ok(fontTime >= loadTime, 'Optional font must start after window.load');
      assert.deepEqual(errors, []);
      console.log(path + ': page completes and theme works with stalled font/media; one font starts after load');
    } finally {
      for (const release of releases) release();
      await page.close();
    }
  }
} finally { await browser.close(); }
