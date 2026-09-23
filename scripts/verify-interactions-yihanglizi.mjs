import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
try {
  await page.goto('http://localhost:3000/blog/');
  await page.locator('.hv-btn.primary').click();
  await page.waitForTimeout(800);
  assert.ok(await page.evaluate(() => scrollY > 300), 'blog reading button scrolls to the articles');
  await page.locator('.DocSearch-Button').click();
  await page.locator('.clone-search-input input').fill('Java');
  assert.ok(await page.locator('.clone-search-results a').count(), 'search finds the Java article');
  await page.keyboard.press('Escape');

  await page.goto('http://localhost:3000/resume/');
  await page.locator('.sort-toggle').click();
  assert.match(await page.locator('.sort-label').textContent(), /正序/);
  await page.locator('.resume-view-btn').first().click();
  assert.ok(await page.locator('.resume-modal[role="dialog"]').isVisible(), 'resume dialog opens');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.resume-modal').count(), 0);

  await page.goto('http://localhost:3000/friends/');
  await page.locator('.view-btn').nth(1).click();
  assert.ok(await page.locator('.starmap-wrap').isVisible(), 'friend star map opens');
  await page.locator('.view-btn').first().click();
  assert.ok(await page.locator('.friends-grid').isVisible(), 'friend list returns');

  await page.goto('http://localhost:3000/moments/life/');
  await page.locator('#gateBtn').click();
  assert.match(await page.locator('#gateErr').textContent(), /请输入/);
  assert.equal(await page.locator('.moments-content.locked').count(), 0, 'private content is absent');

  await page.goto('http://localhost:3000/moments/tech/');
  await page.locator('.sort-btn[data-order="asc"]').click();
  assert.equal(await page.locator('.sort-btn[data-order="asc"]').getAttribute('aria-pressed'), 'true');
  console.log('Interactive routes passed');
} finally {
  await browser.close();
}
