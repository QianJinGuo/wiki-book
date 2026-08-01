import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];
page.on('console', msg => { if(msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(err.message));

await page.goto('http://localhost:8766/dashboard/');
await page.waitForTimeout(3000);

// Check daily section rendered
const dailyGrid = await page.locator('#smart-daily-grid').innerHTML();
console.log('Daily grid HTML length:', dailyGrid.length);
console.log('Daily grid (first 150):', dailyGrid.slice(0, 150));

// Check cards rendered
const cardCount = await page.locator('.card').count();
console.log('Cards:', cardCount);

// Simulate cloud pull by entering user ID and clicking pull
await page.locator('#user-id').fill('test-user');
await page.waitForTimeout(500);
await page.locator('#sync-pull').click();
await page.waitForTimeout(3000);

// Check sync status
const syncStatus = await page.locator('#sync-status').textContent();
console.log('Sync status:', syncStatus);

// Check daily section still intact after pull
const dailyGridAfter = await page.locator('#smart-daily-grid').innerHTML();
console.log('Daily grid after pull (length):', dailyGridAfter.length);

// Check cards still render after pull
const cardCountAfter = await page.locator('.card').count();
console.log('Cards after pull:', cardCountAfter);

console.log('\nErrors:', errors.length);
errors.forEach(e => console.log('  ', e));

await browser.close();
