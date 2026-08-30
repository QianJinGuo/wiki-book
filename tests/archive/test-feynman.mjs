import { chromium } from 'playwright';

const URL = 'http://localhost:8765/dashboard/index.html';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('\n=== Feynman Note E2E Tests ===\n');

  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 1. Mark first article as read
  const levelBtn = await page.$('.level-btn:not(.read):not(.explained):not(.taught):not(.mastered)');
  if (!levelBtn) {
    console.log('❌ No unread articles found');
    await browser.close();
    return;
  }
  
  await levelBtn.click();
  await page.waitForTimeout(500);
  
  const feynmanBadge = await page.$('.feynman-badge');
  console.log(feynmanBadge ? '✅ Feynman badge appears after marking read' : '❌ Feynman badge missing');

  // 2. Badge shows 📝 (no checkmark yet)
  const badgeText = await feynmanBadge.evaluate(el => el.textContent);
  console.log(badgeText === '📝' ? '✅ Badge shows 📝 (no note yet)' : `❌ Badge shows "${badgeText}"`);

  // 3. Click feynman badge opens modal
  await feynmanBadge.click();
  await page.waitForTimeout(300);
  const modalOpen = await page.$eval('#feynman-modal', el => el.classList.contains('open'));
  console.log(modalOpen ? '✅ Feynman modal opens' : '❌ Feynman modal did not open');

  // 4. Modal has all fields
  const fields = ['feynman-got', 'feynman-missed', 'feynman-insight', 'feynman-next', 'feynman-question'];
  for (const id of fields) {
    const el = await page.$(`#${id}`);
    console.log(el ? `  ✅ Field #${id} exists` : `  ❌ Field #${id} missing`);
  }

  // 5. Fill and save
  await page.fill('#feynman-got', 'L1/L2/L3 结构, execute_code 消解本质');
  await page.fill('#feynman-missed', '类比讲给外行听的能力');
  await page.fill('#feynman-insight', 'execute_code 不是合并工具而是消解工具概念');
  await page.fill('#feynman-next', '给每个概念找日常类比');
  
  await page.click('.feynman-save');
  await page.waitForTimeout(500);
  
  const modalClosed = await page.$eval('#feynman-modal', el => !el.classList.contains('open'));
  console.log(modalClosed ? '✅ Modal closes after save' : '❌ Modal still open');

  // 6. Verify note saved
  const saved = await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('wiki-learn-feynman-v1') || '{}');
    const keys = Object.keys(data);
    if (keys.length === 0) return null;
    return data[keys[0]];
  });
  console.log(saved?.got ? '✅ Note saved to localStorage' : '❌ Note not saved');

  // 7. Badge now shows 📝✓
  const badgeWithCheck = await page.$eval('.feynman-badge', el => el.textContent);
  console.log(badgeWithCheck === '📝✓' ? '✅ Badge shows 📝✓ after saving note' : `❌ Badge shows "${badgeWithCheck}"`);

  // 8. Re-open modal shows saved values
  await page.click('.feynman-badge');
  await page.waitForTimeout(200);
  const gotValue = await page.$eval('#feynman-got', el => el.value);
  console.log(gotValue.includes('L1/L2') ? '✅ Saved values restored on re-open' : '❌ Values not restored');

  // 9. Close modal with X
  await page.click('.feynman-close');
  await page.waitForTimeout(200);
  const closed = await page.$eval('#feynman-modal', el => !el.classList.contains('open'));
  console.log(closed ? '✅ Close button works' : '❌ Close button failed');

  console.log('\n=== Done ===');
  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
