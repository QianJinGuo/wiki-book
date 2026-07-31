import { chromium } from 'playwright';

const SITE = 'https://jinguo.tech';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Capture ALL network requests to /ai-proxy
  const networkLogs = [];
  page.on('request', req => {
    if (req.url().includes('ai-proxy')) {
      networkLogs.push({ type: 'REQ', url: req.url(), method: req.method(), body: req.postData()?.substring(0, 200) });
    }
  });
  page.on('response', resp => {
    if (resp.url().includes('ai-proxy')) {
      networkLogs.push({ type: 'RESP', url: resp.url(), status: resp.status() });
    }
  });

  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => consoleLogs.push(`[PAGEERROR] ${err.message}`));

  await page.goto(SITE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  // Set config
  await page.evaluate(() => {
    localStorage.setItem('ai-chat-config', JSON.stringify({
      endpoint: "", apiKey: "", model: "deepseek-v4-flash",
      ttsEndpoint: "", ttsKey: "", ttsModel: "", _provider: "sensenova"
    }));
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Open chat
  await page.click('.ai-chat-trigger', { force: true });
  await page.waitForTimeout(1000);

  // Type and send
  await page.fill('.ai-chat__input', 'Hello!');
  await page.click('.ai-chat__send', { force: true });
  console.log('Message sent, waiting 15s...');
  await page.waitForTimeout(15000);

  // Debug: dump panel HTML
  const panelHTML = await page.evaluate(() => {
    const panel = document.querySelector('.ai-chat-panel');
    return panel ? panel.innerHTML.substring(0, 1000) : 'no panel';
  });
  console.log('\n=== Panel HTML (first 1000 chars) ===');
  console.log(panelHTML);

  // Debug: message count & content
  const msgInfo = await page.evaluate(() => {
    const msgs = document.querySelectorAll('.ai-chat__message');
    return [...msgs].map(m => ({
      cls: m.className,
      text: m.textContent?.substring(0, 100)
    }));
  });
  console.log(`\n=== Messages (${msgInfo.length}) ===`);
  for (const m of msgInfo) console.log(JSON.stringify(m));

  // Network logs
  console.log('\n=== Network Logs ===');
  for (const l of networkLogs) console.log(JSON.stringify(l));

  // Console logs (last 15)
  console.log('\n=== Console Logs (last 15) ===');
  for (const l of consoleLogs.slice(-15)) console.log(l);

  await browser.close();
})();
