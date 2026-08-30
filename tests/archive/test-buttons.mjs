import { chromium } from 'playwright';

const URL = 'http://localhost:8765/dashboard/index.html';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('\n=== Button Click Tests ===\n');

  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 1. Mark an article as read
  console.log('1. Marking first article as read...');
  const unreadBtn = await page.$('.level-btn:not(.read):not(.explained):not(.taught):not(.mastered)');
  if (!unreadBtn) {
    console.log('❌ No unread articles found');
    await browser.close();
    return;
  }
  await unreadBtn.click();
  await page.waitForTimeout(500);

  // 2. Check article is now marked as read
  const readBtn = await page.$('.level-btn.read, .level-btn.explained, .level-btn.taught, .level-btn.mastered');
  console.log(readBtn ? '✅ Article marked as read' : '❌ Article not marked');

  // 3. Try clicking the read button - should open Feynman modal
  console.log('\n2. Clicking read button (should open Feynman modal)...');
  await readBtn.click();
  await page.waitForTimeout(500);

  const modalOpen = await page.$eval('#feynman-modal', el => el.classList.contains('open'));
  console.log(modalOpen ? '✅ Feynman modal opened' : '❌ Modal did not open');

  // 4. Close modal
  if (modalOpen) {
    await page.click('.feynman-close');
    await page.waitForTimeout(200);
  }

  // 5. Try clicking feynman badge
  console.log('\n3. Clicking feynman badge...');
  const feynmanBadge = await page.$('.feynman-badge');
  if (feynmanBadge) {
    await feynmanBadge.click();
    await page.waitForTimeout(500);
    const modalOpen2 = await page.$eval('#feynman-modal', el => el.classList.contains('open'));
    console.log(modalOpen2 ? '✅ Feynman badge opens modal' : '❌ Badge click failed');
    
    // Close
    await page.click('.feynman-close');
    await page.waitForTimeout(200);
  } else {
    console.log('❌ No feynman badge found');
  }

  // 6. Check browser console for errors
  console.log('\n4. Checking for JS errors...');
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  
  // Refresh and interact
  await page.reload();
  await page.waitForTimeout(2000);
  const readBtn2 = await page.$('.level-btn.read, .level-btn.explained');
  if (readBtn2) {
    await readBtn2.click();
    await page.waitForTimeout(500);
  }
  
  console.log(consoleErrors.length === 0 ? '✅ No console errors' : `❌ ${consoleErrors.length} errors: ${consoleErrors[0]?.slice(0, 100)}`);

  console.log('\n=== Done ===');
  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
