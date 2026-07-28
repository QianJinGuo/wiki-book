import { chromium } from 'playwright';

const URL = 'file:///Users/jinguo/wiki-book/docs/dashboard/index.html';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  console.log('\n=== Testing Local File ===');
  console.log('URL:', URL, '\n');

  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Check localStorage
  const storage = await page.evaluate(() => {
    const progress = JSON.parse(localStorage.getItem('wiki-learn-progress-v3') || '{}');
    const feynman = JSON.parse(localStorage.getItem('wiki-learn-feynman-v1') || '{}');
    return {
      progressKeys: Object.keys(progress),
      progressData: progress
    };
  });
  
  console.log('1. LocalStorage:');
  console.log('   Progress entries:', storage.progressKeys.length);
  if (storage.progressKeys.length > 0) {
    console.log('   Files:', storage.progressKeys);
    console.log('   Full data:', JSON.stringify(storage.progressData, null, 2));
  }

  // Check stats display
  const statsNum = await page.$eval('#stats-row .stat:first-child .num', el => el.textContent);
  console.log('\n2. Stats: 已读总数 =', statsNum);

  // Check if there are read articles
  const readBtns = await page.$$('.level-btn.read, .level-btn.explained, .level-btn.taught, .level-btn.mastered');
  console.log('3. Read article buttons:', readBtns.length);

  // If there are read articles, check their badges
  if (readBtns.length > 0) {
    console.log('\n4. Checking first read article badges...');
    const firstReadBtn = readBtns[0];
    // Go up to card-actions, then find siblings
    const parentDiv = await firstReadBtn.$('xpath=..'); // card-actions div
    const allChildren = await parentDiv.$$('xpath=*'); // all children
    
    console.log('   Elements in card-actions:');
    for (let i = 0; i < allChildren.length; i++) {
      const tag = await allChildren[i].evaluate(el => el.tagName);
      const cls = await allChildren[i].evaluate(el => el.className);
      const txt = await allChildren[i].evaluate(el => el.textContent);
      console.log(`   ${i+1}. <${tag}> class="${cls}" text="${txt}"`);
    }
  }

  // Check for any thread-badge elements
  const threadBadges = await page.$$('.thread-badge');
  console.log('\n5. thread-badge elements found:', threadBadges.length);
  
  const feynmanBadges = await page.$$('.feynman-badge');
  console.log('   feynman-badge elements found:', feynmanBadges.length);

  // Console errors
  if (consoleErrors.length > 0) {
    console.log('\n6. Console errors:');
    consoleErrors.forEach(e => console.log('   -', e.slice(0, 150)));
  }

  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
