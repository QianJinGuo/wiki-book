import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];
page.on('pageerror', err => errors.push(err.message));

await page.goto('http://localhost:8766/dashboard/');
await page.waitForTimeout(3000);

// Check tag filters
const chips = await page.locator('#tag-filters .tag-chip').evaluateAll(els =>
  els.slice(0, 10).map(e => e.textContent.trim())
);
console.log('First 10 tag chips:', chips);

// Check card tags
const cardTags = await page.locator('.card-tag').count();
console.log('Card tags:', cardTags);

// Click "memory" tag
const memoryChip = page.locator('#tag-filters .tag-chip[data-tag="memory"]');
await memoryChip.click();
await page.waitForTimeout(500);
const cardsAfterMemory = await page.locator('.card').count();
console.log('Cards after "memory" filter:', cardsAfterMemory);

// Reset
await page.locator('#tag-filters .tag-chip').first().click();
await page.waitForTimeout(300);

// Concept map
await page.locator('#viz-toggle').click();
await page.waitForTimeout(300);
await page.locator('.viz-tab[data-tab="concept"]').click();
await page.waitForTimeout(1000);

// Click a concept node
await page.locator('.concept-node').nth(3).click();
await page.waitForTimeout(500);
const detailTitle = await page.locator('.concept-detail-title').textContent();
const detailMeta = await page.locator('.concept-detail-meta').textContent();
console.log('Concept detail:', detailTitle, '|', detailMeta);

// Filter by concept
await page.locator('#concept-detail .tag-chip.active').click();
await page.waitForTimeout(800);
const activeTag = await page.locator('#tag-filters .tag-chip.active').textContent();
const cardsAfterConcept = await page.locator('.card').count();
console.log('After concept filter:', activeTag.trim(), '|', cardsAfterConcept, 'cards');

console.log('\nErrors:', errors.length);
if(errors.length) errors.forEach(e => console.log('  ', e));

await browser.close();
