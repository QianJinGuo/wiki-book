import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

await page.goto('http://localhost:8766/dashboard/');
await page.waitForTimeout(3000);

// Check tag filters area
const tagWrap = await page.locator('#tag-filters-wrap').boundingBox();
console.log('Tag filters wrap:', JSON.stringify(tagWrap));

const tagInner = await page.locator('#tag-filters-inner, #tag-filters').boundingBox();
console.log('Tag filters inner:', JSON.stringify(tagInner));

// Check if tag chips overflow
const tagChips = await page.locator('#tag-filters .tag-chip').count();
console.log('Tag chips count:', tagChips);

// Check tag chips positions for overlap
const chipBoxes = await page.locator('#tag-filters .tag-chip').evaluateAll(els => 
  els.slice(0, 5).map(e => {
    const r = e.getBoundingClientRect();
    return { text: e.textContent.trim().slice(0, 20), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  })
);
console.log('First 5 chip positions:', JSON.stringify(chipBoxes, null, 2));

// Check cards
const cardCount = await page.locator('.card').count();
console.log('\nCards:', cardCount);

const cardTagCount = await page.locator('.card-tag').count();
console.log('Card tags:', cardTagCount);

// Check first card structure
const firstCard = await page.locator('.card').first();
const cardHtml = await firstCard.evaluate(el => el.outerHTML.slice(0, 500));
console.log('\nFirst card HTML (truncated):', cardHtml);

// Check concept map
await page.locator('#viz-toggle').click();
await page.waitForTimeout(300);
await page.locator('.viz-tab[data-tab="concept"]').click();
await page.waitForTimeout(1000);

const svgEl = await page.locator('#concept-map-container svg');
const svgBox = await svgEl.boundingBox();
console.log('\nConcept map SVG:', JSON.stringify(svgBox));

// Check for overlapping labels
const labels = await page.locator('.concept-node-label').evaluateAll(els => {
  return els.slice(0, 10).map(e => {
    const r = e.getBoundingClientRect();
    return { text: e.textContent.slice(0, 15), x: Math.round(r.x), y: Math.round(r.y) };
  });
});
console.log('First 10 label positions:', JSON.stringify(labels, null, 2));

// Check for node overlap
const nodes = await page.locator('.concept-node').evaluateAll(els => {
  return els.slice(0, 10).map(e => {
    const c = e.querySelector('circle');
    const r = c.getBoundingClientRect();
    return { name: e.dataset.name?.slice(0, 20), cx: Math.round(r.x + r.width/2), cy: Math.round(r.y + r.height/2), radius: Math.round(r.width/2) };
  });
});
console.log('First 10 node positions:', JSON.stringify(nodes, null, 2));

// Check detail panel position
const detail = await page.locator('#concept-detail').boundingBox();
console.log('\nDetail panel box:', JSON.stringify(detail));

await browser.close();
