import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

const errors = [];
page.on('console', msg => {
  if (msg.type() === 'error') errors.push(msg.text());
});
page.on('pageerror', err => errors.push(err.message));

await page.goto('http://localhost:8766/dashboard/');
await page.waitForTimeout(3000);

// 1. Check tag filters are rendered
const tagChips = await page.locator('#tag-filters .tag-chip').count();
console.log('Tag filter chips:', tagChips);

// 2. Check first tag chip text
if (tagChips > 1) {
  const firstTag = await page.locator('#tag-filters .tag-chip').nth(1).textContent();
  console.log('First tag chip:', firstTag.trim());
}

// 3. Check article cards have tags
const cardTags = await page.locator('.card-tag').count();
console.log('Article tag chips on cards:', cardTags);

// 4. Click a tag filter and verify filtering works
if (tagChips > 2) {
  await page.locator('#tag-filters .tag-chip').nth(2).click();
  await page.waitForTimeout(500);
  const visibleCards = await page.locator('.card').count();
  console.log('Cards after tag filter:', visibleCards);
  
  // Reset
  await page.locator('#tag-filters .tag-chip').first().click();
  await page.waitForTimeout(500);
}

// 5. Open viz section and check concept map
await page.locator('#viz-toggle').click();
await page.waitForTimeout(500);

// Click concept map tab
await page.locator('.viz-tab[data-tab="concept"]').click();
await page.waitForTimeout(1000);

const conceptNodes = await page.locator('.concept-node').count();
console.log('Concept map nodes:', conceptNodes);

const conceptEdges = await page.locator('.concept-edge').count();
console.log('Concept map edges:', conceptEdges);

const legendText = await page.locator('#concept-legend').textContent();
console.log('Legend text:', legendText.trim().slice(0, 100));

// 6. Click a concept node and check detail panel
if (conceptNodes > 0) {
  await page.locator('.concept-node').first().click();
  await page.waitForTimeout(500);
  const detailOpen = await page.locator('#concept-detail.open').count();
  console.log('Concept detail panel open:', detailOpen > 0);
  if (detailOpen > 0) {
    const detailText = await page.locator('#concept-detail .concept-detail-title').textContent();
    console.log('Detail title:', detailText);
    const articleLinks = await page.locator('#concept-detail .concept-detail-article').count();
    console.log('Articles in detail:', articleLinks);
  }
}

// 7. Test concept search
const searchEl = page.locator('#concept-search');
if (await searchEl.count() > 0) {
  await searchEl.fill('memory');
  await page.waitForTimeout(800);
  const filteredNodes = await page.locator('.concept-node').count();
  console.log('Nodes after search "memory":', filteredNodes);
}

console.log('\nConsole errors:', errors.length);
if (errors.length) console.log('Errors:', errors.slice(0, 5));

// Take screenshot
await page.screenshot({ path: '/tmp/concept-map-test.png', fullPage: false });
console.log('\nScreenshot saved to /tmp/concept-map-test.png');

await browser.close();
