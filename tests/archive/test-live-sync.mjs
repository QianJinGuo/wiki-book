import { chromium } from 'playwright';

const URL = 'https://jinguo.tech/dashboard/';
const TEST_USER = 'test-live-' + Date.now();

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('\n=== Live Site Auto-sync Test ===\n');
  console.log('Test user:', TEST_USER);

  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);

  // 1. Set user ID
  console.log('1. Setting user ID...');
  await page.fill('#user-id', TEST_USER);
  await page.waitForTimeout(2000);
  
  const status = await page.$eval('#sync-status', el => el.textContent);
  console.log('   Status:', status);

  // 2. Mark article as read
  console.log('\n2. Marking article as read...');
  const unreadBtn = await page.$('.level-btn:not(.read):not(.explained):not(.taught):not(.mastered)');
  await unreadBtn.click();
  await page.waitForTimeout(500);
  
  // Wait for auto-sync
  console.log('   Waiting for auto-sync (4s)...');
  await page.waitForTimeout(4000);
  
  const afterMark = await page.$eval('#sync-status', el => el.textContent);
  console.log('   Status:', afterMark);

  // 3. Add Feynman note
  console.log('\n3. Adding Feynman note...');
  const feynmanBadge = await page.$('.feynman-badge');
  await feynmanBadge.click();
  await page.waitForTimeout(500);
  await page.fill('#feynman-got', 'Test concept from Playwright');
  await page.fill('#feynman-insight', 'Test insight');
  await page.click('.feynman-save');
  await page.waitForTimeout(500);
  
  // Wait for auto-sync
  console.log('   Waiting for auto-sync (4s)...');
  await page.waitForTimeout(4000);
  
  const afterNote = await page.$eval('#sync-status', el => el.textContent);
  console.log('   Status:', afterNote);

  // 4. Verify via direct API call
  console.log('\n4. Verifying D1 data...');
  
  const d1data = await page.evaluate(async (user) => {
    const resp = await fetch(`https://jinguo.tech/api/user-data?user=${user}`);
    return await resp.json();
  }, TEST_USER);
  
  const progressCount = Object.keys(d1data.progress || {}).length;
  const feynmanCount = Object.keys(d1data.feynman || {}).length;
  const recallCount = Object.keys(d1data.recall || {}).length;
  
  console.log('   Progress:', progressCount);
  console.log('   Feynman:', feynmanCount);
  console.log('   Recall:', recallCount);
  
  if (feynmanCount > 0) {
    const firstKey = Object.keys(d1data.feynman)[0];
    const note = d1data.feynman[firstKey];
    console.log('   Note content:', note.got);
    console.log('\n✅ SUCCESS: Feynman note synced to D1!');
  } else if (progressCount > 0) {
    console.log('\n⚠️ Progress synced but Feynman not');
  } else {
    console.log('\n❌ No data synced');
  }

  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
