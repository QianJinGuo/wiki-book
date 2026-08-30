import { chromium } from 'playwright';

const URL = 'http://localhost:8765/dashboard/index.html';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Mark first article as read
  const levelBtn = await page.$('.level-btn:not(.read):not(.explained):not(.taught):not(.mastered)');
  await levelBtn.click();
  await page.waitForTimeout(500);
  
  // Get the file path of the first read article
  const fileInfo = await page.evaluate(() => {
    const btn = document.querySelector('.level-btn.read, .level-btn.explained, .level-btn.taught, .level-btn.mastered');
    if (!btn) return null;
    const onclick = btn.getAttribute('onclick');
    const match = onclick?.match(/handleLevelClick\('([^']+)'/);
    return match ? match[1] : null;
  });
  console.log('Read article file:', fileInfo);

  // Click feynman badge and save note
  await page.click('.feynman-badge');
  await page.waitForTimeout(200);
  await page.fill('#feynman-got', 'Test note');
  await page.click('.feynman-save');
  await page.waitForTimeout(500);

  // Check localStorage
  const storage = await page.evaluate(() => {
    const feynman = JSON.parse(localStorage.getItem('wiki-learn-feynman-v1') || '{}');
    return { files: Object.keys(feynman), first: Object.values(feynman)[0] };
  });
  console.log('Saved files:', storage.files);
  console.log('First note:', storage.first);

  // Check what getFeynmanNote returns for the file
  const noteCheck = await page.evaluate((file) => {
    return {
      file,
      note: getFeynmanNote(file),
      allKeys: Object.keys(feynmanData)
    };
  }, storage.files[0]);
  console.log('getFeynmanNote result:', noteCheck);

  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
