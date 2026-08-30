import { chromium } from 'playwright';

const SITE = 'https://f4a34dfb.ai-engineering-6yk.pages.dev';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Intercept and log ALL fetch requests/responses
  await page.route('**/ai-proxy', async route => {
    const req = route.request();
    console.log(`[INTERCEPT REQ] ${req.method()} ${req.url()}`);
    console.log(`[INTERCEPT BODY] ${req.postData()?.substring(0, 200)}`);
    
    // Continue the request
    const response = await route.fetch();
    const body = await response.text();
    console.log(`[INTERCEPT RESP] status=${response.status()} body_len=${body.length}`);
    console.log(`[INTERCEPT RESP BODY] ${body.substring(0, 500)}`);
    
    await route.fulfill({ response, body });
  });

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

  // Add JS debug hook
  await page.evaluate(() => {
    const origFetch = window.fetch;
    window.fetch = async function(...args) {
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
      if (url && url.includes('ai-proxy')) {
        console.log('[DEBUG FETCH] url=' + url);
        const resp = await origFetch.apply(this, args);
        console.log('[DEBUG FETCH] status=' + resp.status + ' ok=' + resp.ok);
        // Clone and read a bit
        const clone = resp.clone();
        const reader = clone.body.getReader();
        let total = 0;
        let chunks = 0;
        const readSome = async () => {
          for (let i = 0; i < 5; i++) {
            const r = await reader.read();
            if (r.done) break;
            total += r.value.length;
            chunks++;
          }
          console.log('[DEBUG FETCH] read ' + chunks + ' chunks, ' + total + ' bytes');
        };
        readSome();
        return resp;
      }
      return origFetch.apply(this, args);
    };
  });

  // Open chat, send
  await page.click('.ai-chat-trigger', { force: true });
  await page.waitForTimeout(1000);
  await page.fill('.ai-chat__input', 'Hi');
  await page.click('.ai-chat__send', { force: true });
  console.log('Sent, waiting 10s...');
  await page.waitForTimeout(10000);

  // Check what the chat function returned
  const debugInfo = await page.evaluate(() => {
    const msgs = document.querySelectorAll('.ai-chat__message');
    const panel = document.querySelector('.ai-chat-panel');
    const messagesDiv = panel ? panel.querySelector('.ai-chat__messages') : null;
    return {
      msgCount: msgs.length,
      messagesHTML: messagesDiv ? messagesDiv.innerHTML.substring(0, 500) : 'no messages div',
      panelClasses: panel?.className
    };
  });
  console.log('\nDebug info:');
  console.log('  msgCount:', debugInfo.msgCount);
  console.log('  messagesHTML:', debugInfo.messagesHTML);
  console.log('  panelClasses:', debugInfo.panelClasses);

  await page.screenshot({ path: '/tmp/ai-chat-test5.png' });
  await browser.close();
})();
