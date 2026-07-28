import { chromium } from 'playwright';

const URL = 'https://jinguo.tech/dashboard/';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('\n=== Live Site Button Tests ===\n');
  console.log('Testing:', URL);

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000); // Wait for JS to execute
  } catch (e) {
    console.log('Page load error:', e.message);
    await browser.close();
    return;
  }

  // 1. Check if articles load
  const cards = await page.$$('.card');
  console.log(`\n1. Cards loaded: ${cards.length}`);

  // 2. Check for read articles
  const readBtns = await page.$$('.level-btn.read, .level-btn.explained, .level-btn.taught, .level-btn.mastered');
  const unreadBtns = await page.$$('.level-btn:not(.read):not(.explained):not(.taught):not(.mastered)');
  console.log(`2. Read articles: ${readBtns.length}, Unread: ${unreadBtns.length}`);

  // 3. Check onclick attributes
  if (cards.length > 0) {
    const firstCard = cards[0];
    const levelBtn = await firstCard.$('.level-btn');
    if (levelBtn) {
      const onclick = await levelBtn.evaluate(el => el.getAttribute('onclick'));
      const btnClass = await levelBtn.evaluate(el => el.className);
      const btnText = await levelBtn.evaluate(el => el.textContent);
      console.log(`\n3. First card level-btn:`);
      console.log(`   text: "${btnText}"`);
      console.log(`   class: "${btnClass}"`);
      console.log(`   onclick: "${onclick}"`);
    }
  }

  // 4. Try clicking unread button
  if (unreadBtns.length > 0) {
    console.log('\n4. Clicking unread button...');
    const btn = unreadBtns[0];
    try {
      await btn.click({ timeout: 5000 });
      await page.waitForTimeout(1000);
      
      // Check if modal opened
      const modalOpen = await page.$eval('#feynman-modal', el => el.classList.contains('open')).catch(() => false);
      console.log(modalOpen ? '   ✅ Modal opened' : '   ❌ Modal did not open');
    } catch (e) {
      console.log('   ❌ Click failed:', e.message);
    }
  }

  // 5. Try clicking read button (if any)
  if (readBtns.length > 0) {
    console.log('\n5. Clicking read button...');
    const btn = readBtns[0];
    try {
      await btn.click({ timeout: 5000 });
      await page.waitForTimeout(1000);
      
      const modalOpen = await page.$eval('#feynman-modal', el => el.classList.contains('open')).catch(() => false);
      console.log(modalOpen ? '   ✅ Modal opened' : '   ❌ Modal did not open');
    } catch (e) {
      console.log('   ❌ Click failed:', e.message);
    }
  }

  // 6. Check feynman badges
  console.log('\n6. Feynman badges...');
  const feynmanBadges = await page.$$('.feynman-badge');
  console.log(`   Found: ${feynmanBadges.length}`);
  
  if (feynmanBadges.length > 0) {
    const badge = feynmanBadges[0];
    const onclick = await badge.evaluate(el => el.getAttribute('onclick'));
    console.log(`   onclick: "${onclick}"`);
    
    try {
      await badge.click({ timeout: 5000 });
      await page.waitForTimeout(500);
      const modalOpen = await page.$eval('#feynman-modal', el => el.classList.contains('open')).catch(() => false);
      console.log(modalOpen ? '   ✅ Opens modal' : '   ❌ Modal did not open');
    } catch (e) {
      console.log('   ❌ Click failed:', e.message);
    }
  }

  // 7. Check for JS errors
  console.log('\n7. Console errors:', consoleErrors.length);
  consoleErrors.slice(0, 3).forEach(e => console.log('   -', e.slice(0, 120)));

  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
