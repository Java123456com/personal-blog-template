import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const destination = 'docs/design-references/yihanglizi-cn-bc4c2f76/home-themes';
await mkdir(destination, { recursive: true });
try {
  for (const [theme, selector] of [['星空极光', '.slh'], ['赛博编程', '.wasteland']]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
    await page.addInitScript(value => localStorage.setItem('clone-theme', value), theme);
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    assert.ok(await page.locator(selector).isVisible(), `${theme} loads its own home layout`);
    assert.equal(await page.locator('html').getAttribute('data-doc-theme'), theme === '星空极光' ? 'starry' : 'cyber');
    await page.screenshot({ path: `${destination}/${theme === '星空极光' ? 'starlight' : 'cyber'}.png`, fullPage: false });
    await page.close();
  }
  console.log('Both structurally different home themes load from the saved selection');
} finally {
  await browser.close();
}
