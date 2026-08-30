import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];
page.on('pageerror', err => errors.push(err.message));

await page.goto('https://jinguo.tech/dashboard/', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(8000);

await page.locator('#viz-toggle').click();
await page.waitForTimeout(500);
await page.locator('.viz-tab[data-tab="concept"]').click();
await page.waitForTimeout(2000);

const labels = await page.locator('.concept-node-label').evaluateAll(els => 
  els.map(e => {
    const r = e.getBoundingClientRect();
    return { text: e.textContent.slice(0, 20), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  })
);

let overlaps = 0;
let pairs = [];
for(let i = 0; i < labels.length; i++) {
  for(let j = i+1; j < labels.length; j++) {
    const a = labels[i], b = labels[j];
    if(a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y) {
      overlaps++;
      pairs.push([a.text, b.text]);
    }
  }
}

console.log('Production label count:', labels.length);
console.log('Production label overlaps:', overlaps);
if(pairs.length) console.log('Overlap pairs:', JSON.stringify(pairs));
console.log('Errors:', errors.length);

await browser.close();
