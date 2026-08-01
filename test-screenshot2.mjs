import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

await page.goto('http://localhost:8766/dashboard/');
await page.waitForTimeout(3000);

// Concept map screenshot
await page.locator('#viz-toggle').click();
await page.waitForTimeout(300);
await page.locator('.viz-tab[data-tab="concept"]').click();
await page.waitForTimeout(1000);
await page.screenshot({ path: '/Users/jinguo/.codex/visualizations/2026/08/01/019fbc6b-d8e4-7f43-b60f-db40648a03be/concept-map-v2.png', fullPage: false });

// Concept detail screenshot
await page.locator('.concept-node').nth(2).click();
await page.waitForTimeout(500);
await page.screenshot({ path: '/Users/jinguo/.codex/visualizations/2026/08/01/019fbc6b-d8e4-7f43-b60f-db40648a03be/concept-detail-v2.png', fullPage: false });

// Tag filter screenshot
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(300);
await page.screenshot({ path: '/Users/jinguo/.codex/visualizations/2026/08/01/019fbc6b-d8e4-7f43-b60f-db40648a03be/tag-filters-v2.png', fullPage: false });

console.log('Screenshots saved');
await browser.close();
