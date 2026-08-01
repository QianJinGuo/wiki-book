import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

const consoleErrors = [];
const pageErrors = [];
page.on('console', msg => { if(msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', err => pageErrors.push(err.message));

console.log('=== Loading production dashboard ===');
await page.goto('https://jinguo.tech/dashboard/', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(8000);

// Screenshot 1: Top of page
await page.screenshot({ 
  path: '/Users/jinguo/.codex/visualizations/2026/08/01/019fbc6b-d8e4-7f43-b60f-db40648a03be/prod-01-top.png', 
  fullPage: false 
});
console.log('Screenshot 1: top of page saved');

// Screenshot 2: Scroll to cards
await page.evaluate(() => window.scrollBy(0, 800));
await page.waitForTimeout(1000);
await page.screenshot({ 
  path: '/Users/jinguo/.codex/visualizations/2026/08/01/019fbc6b-d8e4-7f43-b60f-db40648a03be/prod-02-cards.png', 
  fullPage: false 
});
console.log('Screenshot 2: cards saved');

// Screenshot 3: Concept map
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);
await page.locator('#viz-toggle').click();
await page.waitForTimeout(500);
await page.locator('.viz-tab[data-tab="concept"]').click();
await page.waitForTimeout(2000);
await page.screenshot({ 
  path: '/Users/jinguo/.codex/visualizations/2026/08/01/019fbc6b-d8e4-7f43-b60f-db40648a03be/prod-03-concept-map.png', 
  fullPage: false 
});
console.log('Screenshot 3: concept map saved');

// Screenshot 4: Concept detail
await page.locator('.concept-node').first().click();
await page.waitForTimeout(500);
await page.screenshot({ 
  path: '/Users/jinguo/.codex/visualizations/2026/08/01/019fbc6b-d8e4-7f43-b60f-db40648a03be/prod-04-concept-detail.png', 
  fullPage: false 
});
console.log('Screenshot 4: concept detail saved');

// Diagnostic
console.log('\n=== Diagnostic ===');
console.log('Console errors:', consoleErrors.length);
consoleErrors.forEach(e => console.log('  ', e));
console.log('Page errors:', pageErrors.length);
pageErrors.forEach(e => console.log('  ', e));

const tagChips = await page.locator('#tag-filters .tag-chip').count();
console.log('Tag chips:', tagChips);
const cardTags = await page.locator('.card-tag').count();
console.log('Card tags:', cardTags);
const nodes = await page.locator('.concept-node').count();
console.log('Concept nodes:', nodes);

await browser.close();
console.log('Done');
