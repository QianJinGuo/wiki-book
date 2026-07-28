import { chromium } from 'playwright';

const URL = 'file:///Users/jinguo/wiki-book/docs/dashboard/index.html';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const consoleMsgs = [];
  page.on('console', msg => {
    consoleMsgs.push({ type: msg.type(), text: msg.text() });
  });

  console.log('\n=== Testing Local File ===\n');

  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000); // Wait for JS to execute

  // Check what's in the content div
  const contentHtml = await page.$eval('#content', el => el.innerHTML.slice(0, 300));
  console.log('1. #content HTML:', contentHtml);

  // Check if articles loaded
  const cards = await page.$$('.card');
  console.log('2. Cards found:', cards.length);

  // Check stats row
  const statsRow = await page.$('#stats-row');
  const statsHtml = statsRow ? await statsRow.evaluate(el => el.innerHTML.slice(0, 200)) : 'not found';
  console.log('3. Stats row:', statsHtml);

  // Console messages
  const errors = consoleMsgs.filter(m => m.type === 'error');
  if (errors.length > 0) {
    console.log('\n4. Console errors:');
    errors.forEach(e => console.log('   -', e.text.slice(0, 150)));
  }

  // Check articles.json loading
  const loadingDiv = await page.$('.loading');
  console.log('\n5. Loading div present:', !!loadingDiv);

  // Check if file protocol is the issue
  const headerSub = await page.$eval('#header-sub', el => el.textContent);
  console.log('6. Header subtitle:', headerSub);

  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
