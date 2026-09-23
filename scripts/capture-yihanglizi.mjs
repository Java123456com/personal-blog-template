import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const out = 'docs/design-references/yihanglizi-cn-bc4c2f76/root-8a5edab2';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
for (const [label, url] of [['source', 'https://yihanglizi.cn/'], ['local', 'http://localhost:3000/']]) {
  for (const [device, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
    const context = await browser.newContext({ viewport: { width, height }, ignoreHTTPSErrors: true, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    if (label === 'local') await page.locator('.feed-line').first().waitFor({ state: 'visible' });
    else await page.waitForTimeout(3500);
    await page.screenshot({ path: `${out}/${label === 'source' ? 'source-ssr' : label}-${device}.png`, fullPage: true, animations: 'disabled' });
    console.log(`${label}-${device}`, await page.evaluate(() => ({ height: document.documentElement.scrollHeight, hero: document.querySelector('.hero')?.getBoundingClientRect().height })));
    if (label === 'local') {
      await page.locator('.ns-btn').click();
      await page.getByRole('button', { name: /星空极光/ }).click();
      await page.screenshot({ path: `${out}/local-starry-${device}.png`, fullPage: true, animations: 'disabled' });
    }
    await context.close();
  }
}
await browser.close();
