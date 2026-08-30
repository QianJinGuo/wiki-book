import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];
page.on('pageerror', err => errors.push(err.message));

await page.goto('http://localhost:8766/dashboard/');
await page.waitForTimeout(3000);

// 1. Verify card tags exist and clicking one filters
const firstCardTag = page.locator('.card-tag').first();
const tagText = await firstCardTag.textContent();
console.log('First card tag:', tagText);

// Click it
await firstCardTag.click();
await page.waitForTimeout(800);

// Check that tag filter is now active
const activeTag = await page.locator('#tag-filters .tag-chip.active').textContent();
console.log('Active tag after card click:', activeTag.trim());

// Check cards still render
const cardCount = await page.locator('.card').count();
console.log('Cards visible after card-tag click:', cardCount);

// 2. Verify all visible cards have this tag
const allCardsHaveTag = await page.locator('.card').evaluateAll((cards, tag) => {
  return cards.every(c => c.textContent.includes(tag));
}, tagText);
console.log('All cards have tag "'+tagText+'":', allCardsHaveTag);

// 3. Reset and check concept map detail
await page.locator('#tag-filters .tag-chip').first().click();
await page.waitForTimeout(300);

await page.locator('#viz-toggle').click();
await page.waitForTimeout(300);
await page.locator('.viz-tab[data-tab="concept"]').click();
await page.waitForTimeout(1000);

// Click a concept node
await page.locator('.concept-node').nth(5).click();
await page.waitForTimeout(500);

const detailTitle = await page.locator('.concept-detail-title').textContent();
const detailMeta = await page.locator('.concept-detail-meta').textContent();
console.log('Concept detail title:', detailTitle);
console.log('Concept detail meta:', detailMeta);

// Click "filter by concept" button
const filterBtn = page.locator('#concept-detail .tag-chip.active');
if (await filterBtn.count() > 0) {
  await filterBtn.click();
  await page.waitForTimeout(800);
  const activeTag2 = await page.locator('#tag-filters .tag-chip.active').textContent();
  console.log('Active tag after concept filter:', activeTag2.trim());
  const cardsAfterConcept = await page.locator('.card').count();
  console.log('Cards after concept filter:', cardsAfterConcept);
}

console.log('\nErrors:', errors.length);
if(errors.length) console.log(errors);

await browser.close();
