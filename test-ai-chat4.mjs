import { chromium } from 'playwright';

const SITE = 'https://f4a34dfb.ai-engineering-6yk.pages.dev';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => consoleLogs.push(`[PAGEERROR] ${err.message}`));

  await page.goto(SITE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  // Set Sensenova config
  await page.evaluate(() => {
    localStorage.setItem('ai-chat-config', JSON.stringify({
      endpoint: "", apiKey: "", model: "deepseek-v4-flash",
      ttsEndpoint: "", ttsKey: "", ttsModel: "", _provider: "sensenova"
    }));
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Open chat, type, send
  await page.click('.ai-chat-trigger', { force: true });
  await page.waitForTimeout(1000);
  await page.fill('.ai-chat__input', 'Hi');
  await page.click('.ai-chat__send', { force: true });
  console.log('Sent, waiting 20s...');
  await page.waitForTimeout(20000);

  // Check messages
  const msgInfo = await page.evaluate(() => {
    const msgs = document.querySelectorAll('.ai-chat__message');
    return [...msgs].map(m => ({
      isUser: m.classList.contains('ai-chat__message--user'),
      text: m.textContent?.substring(0, 200)
    }));
  });
  console.log(`\nMessages (${msgInfo.length}):`);
  for (const m of msgInfo) console.log(`  ${m.isUser ? 'USER' : 'AI'}: ${m.text}`);

  await page.screenshot({ path: '/tmp/ai-chat-test4.png' });
  console.log('\nScreenshot: /tmp/ai-chat-test4.png');

  // Console errors
  const errs = consoleLogs.filter(l => l.includes('error') || l.includes('ERROR') || l.includes('Failed'));
  if (errs.length) {
    console.log('\nErrors:');
    for (const e of errs.slice(-5)) console.log(e);
  }

  await browser.close();
  console.log(msgInfo.length > 0 ? '\nTEST PASSED' : '\nTEST FAILED - no messages rendered');
})();
