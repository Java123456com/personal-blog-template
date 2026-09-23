import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const routes = ['/blog/', '/blog/static-blog-setup.html', '/moments/tech/', '/moments/life/', '/friends/', '/tools/', '/about/', '/resume/', '/blog/fullstack-project-guide.html', '/blog/java-learning-roadmap.html', '/blog/ai-usage-guide.html'];
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const failures = [];
for (const route of routes) {
  const response = await page.goto(`http://localhost:3000${route}`, { waitUntil: 'domcontentloaded' });
  const h1 = await page.locator('h1,h2').first().textContent();
  const app = await page.locator('#app .Layout').count();
  const externalNav = await page.locator('.VPNavBarMenuLink[href^="https://yihanglizi.cn"]').count();
  const result = { route, status: response?.status(), h1: h1?.trim(), app, externalNav };
  console.log(JSON.stringify(result));
  if (result.status !== 200 || !app || externalNav) failures.push(result);
  if (['/blog/', '/moments/tech/', '/moments/life/', '/friends/', '/tools/', '/resume/', '/about/'].includes(route)) {
    const out = `docs/design-references/yihanglizi-cn-bc4c2f76/${route.slice(1).replaceAll('/', '-').replace(/-$/, '')}`;
    await mkdir(out, { recursive: true });
    await page.screenshot({ path: `${out}/local-desktop.png`, fullPage: true, animations: 'disabled' });
  }
}
await page.setViewportSize({ width: 390, height: 844 });
await page.goto('http://localhost:3000/blog/', { waitUntil: 'domcontentloaded' });
await page.screenshot({ path: 'docs/design-references/yihanglizi-cn-bc4c2f76/blog/local-mobile.png', fullPage: true, animations: 'disabled' });
await browser.close();
if (failures.length) process.exitCode = 1;
