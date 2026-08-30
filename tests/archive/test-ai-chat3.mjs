import { chromium } from 'playwright';

// Use the fresh deployment URL to avoid CDN cache
const SITE = 'https://f4a34dfb.ai-engineering-6yk.pages.dev';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const networkLogs = [];
  page.on('request', req => {
    if (req.url().includes('ai-proxy')) {
      networkLogs.push({ type: 'REQ', url: req.url(), method: req.method(), body: req.postData()?.substring(0, 300) });
    }
  });
  page.on('response', async resp => {
    if (resp.url().includes('ai-proxy')) {
      let body = '';
      try { body = (await resp.text()).substring(0, 500); } catch(e) {}
      networkLogs.push({ type: 'RESP', url: resp.url(), status: resp.status(), bodyPreview: body });
    }
  });

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

  // Verify the fix is in place
  const hasFix = await page.evaluate(() => {
    const scripts = document.querySelectorAll('script');
    for (const s of scripts) {
      if (s.textContent && s.textContent.includes('reasoning_content')) return true;
    }
    return false;
  });
  console.log(`reasoning_content fix present: ${hasFix}`);

  // Open chat
  await page.click('.ai-chat-trigger', { force: true });
  await page.waitForTimeout(1000);

  // Type and send
  await page.fill('.ai-chat__input', 'Hello!');
  await page.click('.ai-chat__send', { force: true });
  console.log('Message sent, waiting 15s...');
  await page.waitForTimeout(15000);

  // Check messages
  const msgInfo = await page.evaluate(() => {
    const msgs = document.querySelectorAll('.ai-chat__message');
    return [...msgs].map(m => ({
      cls: m.className,
      text: m.textContent?.substring(0, 200)
    }));
  });
  console.log(`\n=== Messages (${msgInfo.length}) ===`);
  for (const m of msgInfo) console.log(JSON.stringify(m));

  // Network
  console.log('\n=== Network ===');
  for (const l of networkLogs) console.log(JSON.stringify(l));

  // Console
  console.log('\n=== Console (last 15) ===');
  for (const l of consoleLogs.slice(-15)) console.log(l);

  // Screenshot
  await page.screenshot({ path: '/tmp/ai-chat-test3.png' });
  console.log('\nScreenshot: /tmp/ai-chat-test3.png');

  await browser.close();
})();
