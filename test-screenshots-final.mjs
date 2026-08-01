import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

await page.goto('https://jinguo.tech/dashboard/', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(8000);

// 1. Top section (header + stats + tag filters + controls)
await page.screenshot({ path: '/Users/jinguo/.codex/visualizations/2026/08/01/019fbc6b-d8e4-7f43-b60f-db40648a03be/final-01-top.png' });

// 2. Cards section
await page.evaluate(() => window.scrollBy(0, 1000));
await page.waitForTimeout(500);
await page.screenshot({ path: '/Users/jinguo/.codex/visualizations/2026/08/01/019fbc6b-d8e4-7f43-b60f-db40648a03be/final-02-cards.png' });

// 3. Concept map
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(300);
await page.locator('#viz-toggle').click();
await page.waitForTimeout(500);
await page.locator('.viz-tab[data-tab="concept"]').click();
await page.waitForTimeout(2000);
await page.screenshot({ path: '/Users/jinguo/.codex/visualizations/2026/08/01/019fbc6b-d8e4-7f43-b60f-db40648a03be/final-03-concept-map.png' });

// 4. Concept detail
await page.locator('.concept-node').first().click();
await page.waitForTimeout(500);
await page.screenshot({ path: '/Users/jinguo/.codex/visualizations/2026/08/01/019fbc6b-d8e4-7f43-b60f-db40648a03be/final-04-detail.png' });

console.log('Screenshots saved');
await browser.close();
