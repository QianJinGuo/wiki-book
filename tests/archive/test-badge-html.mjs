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
  
  // Save a note
  await page.click('.feynman-badge');
  await page.waitForTimeout(200);
  await page.fill('#feynman-got', 'Test note');
  await page.click('.feynman-save');
  await page.waitForTimeout(500);

  // Get the rendered HTML of the first card with feynman-badge
  const badgeHtml = await page.$eval('.feynman-badge', el => el.outerHTML);
  console.log('Badge HTML:', badgeHtml);

  // Get the card's file
  const cardFile = await page.$eval('.card', el => {
    const btn = el.querySelector('.level-btn');
    const onclick = btn?.getAttribute('onclick');
    const match = onclick?.match(/handleLevelClick\('([^']+)'/);
    return match ? match[1] : null;
  });
  console.log('Card file:', cardFile);

  // Check if getFeynmanNote returns something for this card
  const hasNote = await page.evaluate((file) => {
    return {
      hasNote: !!getFeynmanNote(file),
      note: getFeynmanNote(file)
    };
  }, cardFile);
  console.log('Has note:', hasNote);

  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
