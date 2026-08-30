import { chromium } from 'playwright';

const URL = 'https://jinguo.tech/dashboard/';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('\n=== Live Site Button Re-Test ===\n');

  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);

  // Find an unread article and mark it
  const unreadBtn = await page.$('.level-btn:not(.read):not(.explained):not(.taught):not(.mastered)');
  if (unreadBtn) {
    const btnText = await unreadBtn.evaluate(el => el.textContent);
    console.log('1. Clicking unread button:', btnText);
    
    await unreadBtn.click();
    await page.waitForTimeout(1000);
    
    // Check if modal opened
    const modalOpen = await page.$eval('#feynman-modal', el => el.classList.contains('open')).catch(() => false);
    console.log(modalOpen ? '   ✅ Modal opened' : '   ❌ Modal did not open');
    
    // Check if article was marked as read
    const readBtn = await page.$('.level-btn.read');
    console.log(readBtn ? '   ✅ Article marked as read' : '   ❌ Not marked');
  } else {
    console.log('❌ No unread articles');
  }

  // Check article link
  const firstCard = await page.$('.card');
  if (firstCard) {
    const link = await firstCard.$eval('.card-title a', el => el.href);
    console.log('\n2. First article link:', link);
    console.log(link.endsWith('.html') ? '   ✅ Has .html suffix' : '   ❌ Missing .html');
  }

  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
