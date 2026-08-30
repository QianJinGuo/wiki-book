import { chromium } from 'playwright';

const URL = 'http://localhost:8765/dashboard/';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('\n=== Feynman Improvements Tests ===\n');

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // 1. Mark an article as read
  console.log('1. Marking article as read...');
  const unreadBtn = await page.$('.level-btn:not(.read):not(.explained):not(.taught):not(.mastered)');
  await unreadBtn.click();
  await page.waitForTimeout(500);
  console.log('   ✅ Marked');

  // 2. Open feynman modal and save note
  console.log('\n2. Saving first feynman note...');
  await page.click('.feynman-badge');
  await page.waitForTimeout(300);
  await page.fill('#feynman-got', 'Test concept');
  await page.click('.feynman-save');
  await page.waitForTimeout(500);
  console.log('   ✅ Saved');

  // 3. Open modal again and check review history
  console.log('\n3. Checking review history...');
  await page.click('.feynman-badge');
  await page.waitForTimeout(300);
  
  const reviewInfo = await page.$eval('#feynman-review-info', el => el.textContent);
  console.log('   Review info:', reviewInfo);
  console.log(reviewInfo.includes('复习') ? '   ✅ Shows review count' : '   ❌ No review count');
  console.log(reviewInfo.includes('首次') ? '   ✅ Shows first time' : '   ❌ No first time indicator');

  // 4. Close and check for upgrade hint after multiple saves
  console.log('\n4. Testing upgrade hint (saving 3 times)...');
  await page.click('.feynman-save');
  await page.waitForTimeout(300);
  await page.click('.feynman-badge');
  await page.waitForTimeout(300);
  await page.click('.feynman-save');
  await page.waitForTimeout(300);
  await page.click('.feynman-badge');
  await page.waitForTimeout(300);
  
  const upgradeHint = await page.$eval('#feynman-upgrade-hint', el => ({
    text: el.textContent,
    visible: el.classList.contains('show')
  })).catch(() => ({ text: '', visible: false }));
  
  console.log('   Upgrade hint:', upgradeHint.text.slice(0, 50));
  console.log(upgradeHint.visible ? '   ✅ Hint visible after 3 reviews' : '   ⚠️ Hint not visible');

  // 5. Close modal
  await page.click('.feynman-close');
  await page.waitForTimeout(200);

  // 6. Test Recall integration
  console.log('\n5. Testing Recall integration...');
  
  // Recall panel should show articles
  await page.click('#recall-header');
  await page.waitForTimeout(300);
  
  const recallCards = await page.$$('.recall-card');
  console.log(`   Recall cards: ${recallCards.length}`);
  
  if (recallCards.length > 0) {
    // Check if note button exists
    const noteBtn = await page.$('.recall-btn:last-child');
    const btnText = noteBtn ? await noteBtn.evaluate(el => el.textContent) : '';
    console.log(btnText.includes('笔记') ? '   ✅ Note button in recall card' : '   ❌ No note button');
  } else {
    console.log('   ⚠️ No recall cards yet (article just marked)');
  }

  // 7. Check review count persisted
  console.log('\n6. Checking persisted review count...');
  await page.click('.feynman-badge');
  await page.waitForTimeout(300);
  
  const finalReviewInfo = await page.$eval('#feynman-review-info', el => el.textContent);
  console.log('   Final review info:', finalReviewInfo);
  console.log(finalReviewInfo.includes('3 次') || finalReviewInfo.includes('4 次') ? '   ✅ Review count persisted' : '   ❌ Count wrong');

  await browser.close();
  console.log('\n=== Done ===');
}

run().catch(e => { console.error(e); process.exit(1); });
