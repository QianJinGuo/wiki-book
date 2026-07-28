import { chromium } from 'playwright';

const URL = 'http://localhost:8765/dashboard/';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  console.log('\n=== Status Button Behavior Test ===\n');

  // 1. Mark article as read
  console.log('1. Clicking unread button...');
  const unreadBtn = await page.$('.level-btn:not(.read):not(.explained):not(.taught):not(.mastered)');
  await unreadBtn.click();
  await page.waitForTimeout(500);
  
  const readBtn = await page.$('.level-btn.read');
  const text1 = readBtn ? await readBtn.evaluate(el => el.textContent) : '';
  console.log('   Button now shows:', text1);
  console.log(text1.includes('已读') ? '   ✅ Marked as read' : '   ❌ Not marked');
  
  // Check modal didn't open
  const modalOpen1 = await page.$eval('#feynman-modal', el => el.classList.contains('open')).catch(() => false);
  console.log(modalOpen1 ? '   ❌ Modal opened (should not)' : '   ✅ Modal did not open');

  // 2. Click again - should cycle to explained
  console.log('\n2. Clicking read button again...');
  await readBtn.click();
  await page.waitForTimeout(500);
  
  const explainedBtn = await page.$('.level-btn.explained');
  const text2 = explainedBtn ? await explainedBtn.evaluate(el => el.textContent) : '';
  console.log('   Button now shows:', text2);
  console.log(text2.includes('解释') ? '   ✅ Upgraded to explained' : '   ❌ Did not upgrade');
  
  const modalOpen2 = await page.$eval('#feynman-modal', el => el.classList.contains('open')).catch(() => false);
  console.log(modalOpen2 ? '   ❌ Modal opened (should not)' : '   ✅ Modal did not open');

  // 3. Click 📝 badge - should open modal
  console.log('\n3. Clicking 📝 badge...');
  const feynmanBadge = await page.$('.feynman-badge');
  await feynmanBadge.click();
  await page.waitForTimeout(500);
  
  const modalOpen3 = await page.$eval('#feynman-modal', el => el.classList.contains('open'));
  console.log(modalOpen3 ? '   ✅ Modal opened via 📝 badge' : '   ❌ Modal did not open');

  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
