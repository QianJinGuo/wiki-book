import { chromium } from 'playwright';

const URL = 'http://localhost:8765/dashboard/index.html';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('\n=== Unified Sync E2E Tests ===\n');

  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 1. Set user ID for sync
  await page.fill('#user-id', 'test-user-123');
  await page.waitForTimeout(500);

  // 2. Mark an article as read
  const levelBtn = await page.$('.level-btn:not(.read):not(.explained):not(.taught):not(.mastered)');
  await levelBtn.click();
  await page.waitForTimeout(500);

  // 3. Add Feynman note with threads
  await page.click('.feynman-badge');
  await page.waitForTimeout(300);
  await page.fill('#feynman-got', 'Test concept for sync');
  await page.fill('#thread-name-input', 'Codex 讨论');
  await page.fill('#thread-url-input', 'codex://threads/test-123');
  await page.click('.thread-add-btn');
  await page.waitForTimeout(200);
  await page.click('.feynman-save');
  await page.waitForTimeout(500);

  // 4. Check recall queue has entry
  const recallCount = await page.evaluate(() => Object.keys(recallData).length);
  console.log(recallCount > 0 ? '✅ Recall queue has entries' : '❌ Recall queue empty');

  // 5. Check thread in localStorage
  const savedThreads = await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('wiki-learn-feynman-v1') || '{}');
    const keys = Object.keys(data);
    return data[keys[0]]?.threads;
  });
  console.log(savedThreads?.length === 1 ? '✅ Thread saved with name + url' : '❌ Thread not saved');
  console.log(`  thread: ${JSON.stringify(savedThreads?.[0])}`);

  // 6. Check 💬 badge appears
  const threadBadge = await page.$('.thread-badge');
  console.log(threadBadge ? '✅ 💬 badge appears for threads' : '❌ 💬 badge missing');

  // 7. Re-open modal and verify thread display
  await page.click('.feynman-badge');
  await page.waitForTimeout(200);
  const threadItems = await page.$$('.thread-item');
  console.log(threadItems.length === 1 ? '✅ Thread item renders in modal' : '❌ Thread item missing');

  // Close modal
  await page.click('.feynman-close');
  await page.waitForTimeout(200);

  // 8. Test push to cloud (will fail without real API, but check structure)
  console.log('\n--- Testing sync structure ---');
  const syncPayload = await page.evaluate(() => {
    const progress = Object.entries(done).map(([file, data]) => ({
      file, level: typeof data === 'object' ? data.level : 'read',
      updatedAt: typeof data === 'object' ? data.updatedAt : Date.now()
    }));
    return {
      progress: progress.length,
      feynman: Object.keys(feynmanData).length,
      recall: Object.keys(recallData).length
    };
  });
  console.log(`Progress entries: ${syncPayload.progress}`);
  console.log(`Feynman entries: ${syncPayload.feynman}`);
  console.log(`Recall entries: ${syncPayload.recall}`);
  console.log(syncPayload.progress > 0 && syncPayload.feynman > 0 && syncPayload.recall > 0 
    ? '✅ All three data types ready for sync' : '❌ Missing data types');

  console.log('\n=== Done ===');
  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
