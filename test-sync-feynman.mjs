import { chromium } from 'playwright';

const URL = 'http://localhost:8765/dashboard/';
const TEST_USER = 'test-sync-' + Date.now();

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('\n=== Auto-sync Feynman Notes Test ===\n');
  console.log('Test user:', TEST_USER);

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // 1. Set user ID
  console.log('1. Setting user ID...');
  await page.fill('#user-id', TEST_USER);
  await page.waitForTimeout(1000);
  
  const status = await page.$eval('#sync-status', el => el.textContent);
  console.log('   Status:', status);

  // 2. Mark article as read
  console.log('\n2. Marking article as read...');
  const unreadBtn = await page.$('.level-btn:not(.read):not(.explained):not(.taught):not(.mastered)');
  await unreadBtn.click();
  await page.waitForTimeout(500);
  
  // Wait for auto-sync (3 seconds)
  console.log('   Waiting for auto-sync (3s)...');
  await page.waitForTimeout(3500);
  
  const afterMark = await page.$eval('#sync-status', el => el.textContent);
  console.log('   Status after mark:', afterMark);

  // 3. Add Feynman note
  console.log('\n3. Adding Feynman note...');
  await page.click('.feynman-badge');
  await page.waitForTimeout(300);
  await page.fill('#feynman-got', 'Auto-sync test concept');
  await page.fill('#feynman-insight', 'Test insight');
  await page.click('.feynman-save');
  await page.waitForTimeout(500);
  
  // Wait for auto-sync
  console.log('   Waiting for auto-sync (3s)...');
  await page.waitForTimeout(3500);
  
  const afterNote = await page.$eval('#sync-status', el => el.textContent);
  console.log('   Status after note:', afterNote);

  // 4. Verify data in D1 via API
  console.log('\n4. Checking D1 data via API...');
  await page.waitForTimeout(2000);
  
  // Use fetch in browser to check API
  const d1data = await page.evaluate(async (user) => {
    const resp = await fetch(`/api/user-data?user=${user}`);
    return await resp.json();
  }, TEST_USER);
  
  console.log('   Progress entries:', Object.keys(d1data.progress || {}).length);
  console.log('   Feynman entries:', Object.keys(d1data.feynman || {}).length);
  console.log('   Recall entries:', Object.keys(d1data.recall || {}).length);
  
  if (d1data.feynman && Object.keys(d1data.feynman).length > 0) {
    const firstKey = Object.keys(d1data.feynman)[0];
    const note = d1data.feynman[firstKey];
    console.log('   Feynman note got:', note.got);
    console.log('   Feynman note insight:', note.insight);
    console.log('\n✅ Feynman note synced to D1!');
  } else {
    console.log('\n❌ Feynman note NOT synced to D1');
  }

  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
