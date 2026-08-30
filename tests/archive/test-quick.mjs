import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

const errors = [];
page.on('console', msg => { if(msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(err.message));

await page.goto('http://localhost:8766/dashboard/');
await page.waitForTimeout(2000);

// Open concept map
await page.locator('#viz-toggle').click();
await page.waitForTimeout(300);
await page.locator('.viz-tab[data-tab="concept"]').click();
await page.waitForTimeout(2000);

const containerHtml = await page.locator('#concept-map-container').innerHTML();
console.log('Container HTML length:', containerHtml.length);
console.log('Container HTML (first 200):', containerHtml.slice(0, 200));

console.log('\nErrors:', errors.length);
errors.forEach(e => console.log('  ', e));

await browser.close();
