import { chromium } from 'playwright';

const URL = 'http://localhost:8765/dashboard/';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Check localStorage
  const storage = await page.evaluate(() => {
    const progress = JSON.parse(localStorage.getItem('wiki-learn-progress-v3') || '{}');
    const feynman = JSON.parse(localStorage.getItem('wiki-learn-feynman-v1') || '{}');
    const recall = JSON.parse(localStorage.getItem('wiki-learn-recall-v1') || '{}');
    return {
      progressCount: Object.keys(progress).length,
      feynmanCount: Object.keys(feynman).length,
      recallCount: Object.keys(recall).length,
      progressSample: Object.keys(progress).slice(0, 3),
      feynmanSample: Object.keys(feynman).slice(0, 3)
    };
  });
  
  console.log('\n=== LocalStorage State ===');
  console.log('Progress (已读):', storage.progressCount);
  console.log('Feynman (笔记):', storage.feynmanCount);
  console.log('Recall (复习队列):', storage.recallCount);
  console.log('\nProgress samples:', storage.progressSample);
  console.log('Feynman samples:', storage.feynmanSample);

  // Check stats display
  const statsText = await page.$eval('#stats-row', el => el.textContent);
  console.log('\nStats row:', statsText.slice(0, 100));

  // Check card buttons
  console.log('\n=== Card Buttons ===');
  const card = await page.$('.card');
  if (card) {
    const actions = await card.$$('.card-actions > *');
    console.log('Button count in first card:', actions.length);
    for (let i = 0; i < actions.length; i++) {
      const text = await actions[i].evaluate(el => el.textContent);
      const tag = await actions[i].evaluate(el => el.tagName);
      console.log(`  ${i+1}. <${tag}> "${text}"`);
    }
  }

  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
