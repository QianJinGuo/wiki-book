import { chromium } from 'playwright';

const URL = 'https://jinguo.tech/dashboard/';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('\n=== Read Article Button Test ===\n');

  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);

  // 1. Mark an article as read first
  console.log('1. Marking article as read...');
  const unreadBtn = await page.$('.level-btn:not(.read):not(.explained):not(.taught):not(.mastered)');
  if (unreadBtn) {
    await unreadBtn.click();
    await page.waitForTimeout(1000);
    console.log('   ✅ Marked');
  }

  // 2. Now click the read button
  console.log('\n2. Clicking the READ button...');
  const readBtn = await page.$('.level-btn.read');
  if (readBtn) {
    const btnText = await readBtn.evaluate(el => el.textContent);
    console.log('   Button text:', btnText);
    
    await readBtn.click();
    await page.waitForTimeout(1000);
    
    const modalOpen = await page.$eval('#feynman-modal', el => el.classList.contains('open')).catch(() => false);
    console.log(modalOpen ? '   ✅ Modal opened!' : '   ❌ Modal did NOT open');
    
    // Check onclick attribute
    const onclick = await readBtn.evaluate(el => el.getAttribute('onclick'));
    console.log('   onclick:', onclick);
  } else {
    console.log('   ❌ No read button found');
  }

  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
