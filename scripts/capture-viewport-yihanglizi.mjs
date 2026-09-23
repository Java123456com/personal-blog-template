import { chromium } from 'playwright';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
for (const [route, file] of [['/tools/', 'tools'], ['/moments/tech/', 'tech'], ['/friends/', 'friends']]) {
  await page.goto(`http://localhost:3000${route}`);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `docs/design-references/yihanglizi-cn-bc4c2f76/${file}-viewport.png` });
  console.log(route, await page.evaluate(() => [...document.images].filter(img => img.complete && !img.naturalWidth).length));
}
await browser.close();
