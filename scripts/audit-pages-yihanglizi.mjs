import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
for (const route of ['/', '/blog/', '/moments/tech/', '/moments/life/', '/friends/', '/tools/', '/about/', '/resume/', '/blog/static-blog-setup.html']) {
  await page.goto(`http://localhost:3000${route}`, { waitUntil: 'networkidle' });
  console.log(route, JSON.stringify(await page.evaluate(() => ({
    broken: [...document.images].filter(img => img.getAttribute('src') && img.complete && !img.naturalWidth).map(img => ({src: img.getAttribute('src'), alt: img.alt})),
    emptyAnchors: [...document.querySelectorAll('a[href="#"]')].map(a => a.textContent.trim().slice(0, 50)),
    sourceLinks: [...document.querySelectorAll('a[href^="https://yihanglizi.cn/"]')].map(a => ({label: a.textContent.trim().slice(0, 40), href: a.href})),
  })), null, 2));
}
await browser.close();
