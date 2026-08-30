import { chromium } from 'playwright';

const URL = 'http://localhost:8765/dashboard/index.html';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('\n=== Threads Field E2E Tests ===\n');

  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 1. Mark first article as read
  const levelBtn = await page.$('.level-btn:not(.read):not(.explained):not(.taught):not(.mastered)');
  await levelBtn.click();
  await page.waitForTimeout(500);
  
  // 2. Open Feynman modal
  await page.click('.feynman-badge');
  await page.waitForTimeout(300);
  
  // 3. Check threads field exists
  const threadsField = await page.$('#feynman-threads');
  console.log(threadsField ? '✅ Threads field exists in modal' : '❌ Threads field missing');

  // 4. Fill all fields including threads
  await page.fill('#feynman-got', 'Test concept');
  await page.fill('#feynman-threads', 'codex://threads/019fa6f1-6358-75d1-80d3-8262ad0f3b20\nhttps://chatgpt.com/c/test123');
  
  // 5. Save
  await page.click('.feynman-save');
  await page.waitForTimeout(500);

  // 6. Check localStorage
  const saved = await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('wiki-learn-feynman-v1') || '{}');
    const keys = Object.keys(data);
    return data[keys[0]];
  });
  console.log(saved?.threads?.length === 2 ? '✅ Threads saved (2 links)' : '❌ Threads not saved correctly');
  console.log(`  threads: ${JSON.stringify(saved?.threads)}`);

  // 7. Check 💬 badge appears
  const threadBadge = await page.$('.thread-badge');
  console.log(threadBadge ? '✅ 💬 badge appears for threads' : '❌ 💬 badge missing');

  // 8. Re-open modal and verify threads loaded
  await page.click('.feynman-badge');
  await page.waitForTimeout(200);
  const threadsValue = await page.$eval('#feynman-threads', el => el.value);
  console.log(threadsValue.includes('codex://') ? '✅ Threads restored on re-open' : '❌ Threads not restored');

  // 9. Close modal
  await page.click('.feynman-close');
  await page.waitForTimeout(200);

  // 10. Click 💬 opens modal
  await page.click('.thread-badge');
  await page.waitForTimeout(200);
  const modalOpen = await page.$eval('#feynman-modal', el => el.classList.contains('open'));
  console.log(modalOpen ? '✅ 💬 badge opens modal' : '❌ 💬 badge failed to open modal');

  console.log('\n=== Done ===');
  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
