import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const directory = 'docs/design-references/yihanglizi-cn-bc4c2f76/themes';
await mkdir(directory, { recursive: true });

try {
  await page.goto('http://localhost:4173/about/', { waitUntil: 'networkidle' });
  await page.locator('.ns-btn').click();
  assert.equal(await page.locator('.ns-opt').count(), 2, 'theme menu contains two choices');
  await page.getByText('赛博编程', { exact: true }).click();
  await page.waitForTimeout(200);
  assert.equal(await page.locator('html').getAttribute('data-doc-theme'), 'cyber');
  assert.ok(await page.locator('.doc-bg.cyber-theme').count(), 'cyber background is applied');
  await page.screenshot({ path: `${directory}/cyber-about.png` });

  await page.locator('.ns-btn').click();
  await page.getByText('星空极光', { exact: true }).click();
  await page.waitForTimeout(200);
  assert.equal(await page.locator('html').getAttribute('data-doc-theme'), 'starry');
  assert.ok(await page.locator('.doc-bg.starry-theme').count(), 'starry background is applied');
  await page.screenshot({ path: `${directory}/starry-about.png` });

  await page.goto('http://localhost:4173/tools/', { waitUntil: 'networkidle' });
  assert.equal(await page.locator('html').getAttribute('data-doc-theme'), 'starry', 'selected theme persists across pages');
  console.log('Theme switch, page styling, and persistence passed');
} finally {
  await browser.close();
}
