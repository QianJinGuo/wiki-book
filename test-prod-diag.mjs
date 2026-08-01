import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

await page.goto('https://jinguo.tech/dashboard/', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(8000);

// 1. Check tag filters rendering
console.log('=== TAG FILTERS ===');
const tagWrap = await page.locator('#tag-filters-wrap').boundingBox();
console.log('Tag wrap box:', JSON.stringify(tagWrap));
const tagInner = await page.locator('#tag-filters').boundingBox();
console.log('Tag inner box:', JSON.stringify(tagInner));

// Check if tag chips text is correct
const tagTexts = await page.locator('#tag-filters .tag-chip').evaluateAll(els => 
  els.slice(0, 8).map(e => ({ text: e.textContent.trim(), tag: e.dataset.tag, classes: e.className }))
);
console.log('First 8 tag chips:', JSON.stringify(tagTexts, null, 2));

// 2. Check card rendering
console.log('\n=== CARDS ===');
const firstCard = await page.locator('.card').first();
const cardBox = await firstCard.boundingBox();
console.log('First card box:', JSON.stringify(cardBox));
const cardHtml = await firstCard.evaluate(el => el.innerHTML.slice(0, 800));
console.log('First card HTML:', cardHtml);

// Check card tags
const cardTagsInfo = await page.locator('.card-tags').first().evaluate(el => {
  const r = el.getBoundingClientRect();
  return { html: el.innerHTML.slice(0, 300), rect: { x: r.x, y: r.y, w: r.width, h: r.height } };
}).catch(() => 'No card-tags found');
console.log('First card tags:', JSON.stringify(cardTagsInfo, null, 2));

// 3. Check concept map
console.log('\n=== CONCEPT MAP ===');
await page.locator('#viz-toggle').click();
await page.waitForTimeout(500);
await page.locator('.viz-tab[data-tab="concept"]').click();
await page.waitForTimeout(2000);

const svgBox = await page.locator('#concept-map-container svg').boundingBox();
console.log('SVG box:', JSON.stringify(svgBox));

// Check label overlap
const labels = await page.locator('.concept-node-label').evaluateAll(els => {
  return els.map(e => {
    const r = e.getBoundingClientRect();
    return { text: e.textContent.slice(0, 20), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  });
});
console.log('All labels:', JSON.stringify(labels, null, 2));

// Check for label overlaps
let overlapCount = 0;
let overlapPairs = [];
for(let i = 0; i < labels.length; i++) {
  for(let j = i+1; j < labels.length; j++) {
    const a = labels[i], b = labels[j];
    if(a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y) {
      overlapCount++;
      if(overlapPairs.length < 5) overlapPairs.push([a.text, b.text]);
    }
  }
}
console.log('Label overlaps:', overlapCount);
if(overlapPairs.length) console.log('Overlap pairs:', JSON.stringify(overlapPairs));

// Check node positions
const nodes = await page.locator('.concept-node circle').evaluateAll(els => 
  els.map(e => {
    const r = e.getBoundingClientRect();
    return { cx: Math.round(r.x + r.width/2), cy: Math.round(r.y + r.height/2), radius: Math.round(r.width/2) };
  })
);
console.log('Node positions (first 5):', JSON.stringify(nodes.slice(0, 5)));

// Check legend
const legendText = await page.locator('#concept-legend').textContent();
console.log('Legend:', legendText.trim().slice(0, 150));

// Check detail panel
await page.locator('.concept-node').first().click();
await page.waitForTimeout(500);
const detailBox = await page.locator('#concept-detail').boundingBox();
console.log('Detail panel box:', JSON.stringify(detailBox));
const detailClasses = await page.locator('#concept-detail').getAttribute('class');
console.log('Detail classes:', detailClasses);

// 4. Check controls layout
console.log('\n=== LAYOUT ===');
const controls = await page.locator('.controls').boundingBox();
console.log('Controls box:', JSON.stringify(controls));
const searchBox = await page.locator('.search-box').boundingBox();
console.log('Search box:', JSON.stringify(searchBox));

await browser.close();
