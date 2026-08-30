import { chromium } from 'playwright';

const URL = 'https://jinguo.tech/dashboard/';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);

  console.log('\n=== Live Site State ===\n');

  // Check localStorage
  const storage = await page.evaluate(() => {
    const progress = JSON.parse(localStorage.getItem('wiki-learn-progress-v3') || '{}');
    const feynman = JSON.parse(localStorage.getItem('wiki-learn-feynman-v1') || '{}');
    return {
      progressKeys: Object.keys(progress),
      progressData: progress,
      feynmanKeys: Object.keys(feynman)
    };
  });
  
  console.log('1. LocalStorage:');
  console.log('   Progress entries:', storage.progressKeys.length);
  console.log('   Progress data:', JSON.stringify(storage.progressData, null, 2));
  console.log('   Feynman entries:', storage.feynmanKeys.length);

  // Check stats
  const stats = await page.$eval('#stats-row', el => el.textContent);
  console.log('\n2. Stats row:', stats.trim());

  // Check badge count on first read article
  console.log('\n3. Checking badges...');
  const readBtn = await page.$('.level-btn.read, .level-btn.explained');
  if (readBtn) {
    const card = await readBtn.$('xpath=../..');
    const badges = await card.$$('.feynman-badge, .thread-badge');
    console.log('   Badges found:', badges.length);
    for (let i = 0; i < badges.length; i++) {
      const text = await badges[i].evaluate(el => el.textContent);
      const cls = await badges[i].evaluate(el => el.className);
      console.log(`   ${i+1}. class="${cls}" text="${text}"`);
    }
  } else {
    console.log('   No read articles found');
  }

  // Check all badges on page
  const allBadges = await page.$$('.feynman-badge, .thread-badge');
  console.log('\n4. Total badges on page:', allBadges.length);

  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
