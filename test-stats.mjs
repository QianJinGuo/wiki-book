import { chromium } from 'playwright';

const URL = 'https://jinguo.tech/dashboard/';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);

  // Check stats
  const stats = await page.$$eval('#stats-row .stat', els => 
    els.map(el => ({
      num: el.querySelector('.num')?.textContent,
      label: el.querySelector('.label')?.textContent
    }))
  );
  
  console.log('\n=== Stats ===');
  stats.forEach(s => console.log(`${s.label}: ${s.num}`));

  // Check localStorage
  const storage = await page.evaluate(() => ({
    progress: Object.keys(JSON.parse(localStorage.getItem('wiki-learn-progress-v3') || '{}')).length,
    feynman: Object.keys(JSON.parse(localStorage.getItem('wiki-learn-feynman-v1') || '{}')).length
  }));
  
  console.log('\n=== LocalStorage ===');
  console.log('Progress entries:', storage.progress);
  console.log('Feynman entries:', storage.feynman);

  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
