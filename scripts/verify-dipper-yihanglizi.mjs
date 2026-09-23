import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
try {
  await page.addInitScript(() => localStorage.setItem('clone-theme', '星空极光'));
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.locator('.slh-posts').scrollIntoViewIfNeeded();
  const names = ['天枢', '天璇', '天玑', '天权', '玉衡', '开阳', '摇光'];
  for (const [index, name] of names.entries()) {
    await page.locator('.dipper-star').nth(index).click();
    await page.waitForTimeout(50);
    assert.equal((await page.locator('.dp-name').textContent())?.trim(), name);
    assert.equal(await page.locator('.dipper-star.active').count(), 1);
    assert.ok(await page.locator('.dp-card').isVisible(), `${name} detail card remains visible`);
  }
  await page.screenshot({ path: 'docs/design-references/yihanglizi-cn-bc4c2f76/home-themes/dipper-current.png' });
  console.log('Dipper star selection and detail-card switching passed');
} finally {
  await browser.close();
}
