import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

await page.goto('https://jinguo.tech/dashboard/', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(8000);

// Check first 10 cards - do they have tags?
console.log('=== CARD TAGS CHECK ===');
const cardInfo = await page.locator('.card').evaluateAll((cards, limit) => {
  return cards.slice(0, 10).map((c, i) => {
    const tagsEl = c.querySelector('.card-tags');
    const title = c.querySelector('.card-title')?.textContent?.trim()?.slice(0, 40);
    const rect = c.getBoundingClientRect();
    return {
      idx: i,
      title,
      hasTags: !!tagsEl,
      tagsHtml: tagsEl ? tagsEl.innerHTML.slice(0, 100) : null,
      cardH: Math.round(rect.height),
      cardW: Math.round(rect.width)
    };
  });
}, 10);
console.log(JSON.stringify(cardInfo, null, 2));

// Check if card heights are inconsistent
console.log('\n=== CARD HEIGHT VARIANCE ===');
const heights = await page.locator('.card').evaluateAll((cards, limit) => 
  cards.slice(0, 20).map(c => Math.round(c.getBoundingClientRect().height)), 20
);
console.log('First 20 card heights:', heights);

// Check tag-count CSS
console.log('\n=== TAG COUNT STYLING ===');
const tagCountStyle = await page.locator('.tag-count').first().evaluate(el => {
  const cs = window.getComputedStyle(el);
  return { fontSize: cs.fontSize, color: cs.color, opacity: cs.opacity, display: cs.display };
}).catch(() => 'No tag-count found');
console.log('Tag count style:', JSON.stringify(tagCountStyle));

// Check concept map - which nodes have labels
console.log('\n=== CONCEPT MAP LABELS ===');
await page.locator('#viz-toggle').click();
await page.waitForTimeout(500);
await page.locator('.viz-tab[data-tab="concept"]').click();
await page.waitForTimeout(2000);

const nodeInfo = await page.locator('.concept-node').evaluateAll(els => 
  els.map(e => {
    const c = e.querySelector('circle');
    const label = e.querySelector('.concept-node-label');
    const r = c.getBoundingClientRect();
    const numText = e.querySelector('text:nth-of-type(2)')?.textContent;
    return {
      name: e.dataset.name?.slice(0, 25),
      cx: Math.round(r.x + r.width/2),
      cy: Math.round(r.y + r.height/2),
      radius: Math.round(r.width/2),
      hasLabel: !!label,
      labelText: label?.textContent?.slice(0, 20),
      articleCount: numText
    };
  })
);
console.log('All nodes:', JSON.stringify(nodeInfo, null, 2));

// Check the label vs node positions
console.log('\n=== LABEL POSITION vs NODE ===');
for(const n of nodeInfo) {
  if(n.hasLabel) {
    console.log(`  Node "${n.labelText}" at (${n.cx},${n.cy}) r=${n.radius} -> label should be at y=${n.cy + n.radius + 12}`);
  }
}

await browser.close();
