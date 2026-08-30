import { chromium } from 'playwright';

const URL = 'https://jinguo.tech/dashboard/';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);

  // Check all localStorage keys
  const storage = await page.evaluate(() => {
    const keys = Object.keys(localStorage);
    const data = {};
    for (const key of keys) {
      if (key.startsWith('wiki-learn')) {
        data[key] = JSON.parse(localStorage.getItem(key) || '{}');
      }
    }
    return data;
  });
  
  console.log('\n=== LocalStorage for wiki-learn-* ===');
  for (const [key, val] of Object.entries(storage)) {
    console.log(`\n${key}:`);
    if (typeof val === 'object') {
      console.log('  Keys:', Object.keys(val));
    }
  }

  // Check if service worker is registered
  const sw = await page.evaluate(() => {
    return navigator.serviceWorker.getRegistrations().then(regs => regs.length);
  });
  console.log('\n=== Service Workers ===');
  console.log('Registrations:', sw);

  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
