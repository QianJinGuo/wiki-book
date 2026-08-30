import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

await page.goto('http://localhost:8766/dashboard/');
await page.waitForTimeout(3000);

// Screenshot 1: Top of page with tag filters
await page.screenshot({ path: '/tmp/dashboard-tags-top.png', fullPage: false });

// Screenshot 2: Tag filter active
const tagChip = page.locator('#tag-filters .tag-chip').nth(2);
if (await tagChip.count() > 0) {
  await tagChip.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/dashboard-tags-filtered.png', fullPage: false });
}

// Reset filter
await page.locator('#tag-filters .tag-chip').first().click();
await page.waitForTimeout(500);

// Screenshot 3: Concept map
await page.locator('#viz-toggle').click();
await page.waitForTimeout(300);
await page.locator('.viz-tab[data-tab="concept"]').click();
await page.waitForTimeout(1000);
await page.screenshot({ path: '/tmp/dashboard-concept-map.png', fullPage: false });

// Screenshot 4: Concept detail
const conceptNode = page.locator('.concept-node').first();
if (await conceptNode.count() > 0) {
  await conceptNode.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/dashboard-concept-detail.png', fullPage: false });
}

console.log('Screenshots saved');
await browser.close();
