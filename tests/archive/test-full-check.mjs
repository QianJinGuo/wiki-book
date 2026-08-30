import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];
page.on('pageerror', err => errors.push(err.message));

await page.goto('http://localhost:8766/dashboard/', { waitUntil: 'domcontentloaded', timeout: 15000 });
await page.waitForTimeout(5000);

const tagChips = await page.locator('#tag-filters .tag-chip').count();
const cardTags = await page.locator('.card-tag').count();
const cards = await page.locator('.card').count();
console.log('Tag chips:', tagChips, '| Card tags:', cardTags, '| Cards:', cards);

// Tag filter
await page.locator('#tag-filters .tag-chip[data-tag="memory"]').click();
await page.waitForTimeout(500);
const filteredCards = await page.locator('.card').count();
console.log('Cards after "memory" filter:', filteredCards);
await page.locator('#tag-filters .tag-chip').first().click();
await page.waitForTimeout(300);

// Concept map
await page.locator('#viz-toggle').click();
await page.waitForTimeout(500);
await page.locator('.viz-tab[data-tab="concept"]').click();
await page.waitForTimeout(2000);
const nodes = await page.locator('.concept-node').count();
const labels = await page.locator('.concept-node-label').count();
console.log('Concept nodes:', nodes, '| Labels:', labels);

// Concept detail
await page.locator('.concept-node').first().click();
await page.waitForTimeout(500);
const detailOpen = await page.locator('#concept-detail.open').count();
console.log('Detail open:', detailOpen > 0);

// Concept filter
await page.locator('#concept-detail .tag-chip.active').click();
await page.waitForTimeout(800);
const activeTag = await page.locator('#tag-filters .tag-chip.active').textContent();
const conceptCards = await page.locator('.card').count();
console.log('After concept filter:', activeTag.trim().slice(0,30), '| Cards:', conceptCards);

console.log('Errors:', errors.length);
errors.forEach(e => console.log('  ', e));
await browser.close();
