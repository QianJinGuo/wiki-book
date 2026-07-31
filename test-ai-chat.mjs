import { chromium } from 'playwright';

const SITE = 'https://jinguo.tech';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => logs.push(`[PAGEERROR] ${err.message()}`));
  page.on('requestfailed', req => logs.push(`[REQFAIL] ${req.url()} ${req.failure()?.errorText}`));

  // 1. Load
  console.log('1. Loading site...');
  await page.goto(SITE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  // 2. Set Sensenova config
  console.log('2. Setting Sensenova config...');
  await page.evaluate(() => {
    localStorage.setItem('ai-chat-config', JSON.stringify({
      endpoint: "", apiKey: "", model: "deepseek-v4-flash",
      ttsEndpoint: "", ttsKey: "", ttsModel: "", _provider: "sensenova"
    }));
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  const cfg = await page.evaluate(() => localStorage.getItem('ai-chat-config'));
  console.log(`   Config: ${cfg}`);

  // 3. Click the 🤖 trigger button
  console.log('3. Clicking chat trigger...');
  const trigger = await page.$('.ai-chat-trigger');
  if (!trigger) {
    console.log('   ERROR: No trigger found!');
    await browser.close();
    return;
  }
  await trigger.click({ force: true });
  console.log('   Clicked trigger');
  await page.waitForTimeout(1000);

  // 4. Check panel
  const panelInfo = await page.evaluate(() => {
    const p = document.querySelector('.ai-chat-panel');
    if (!p) return null;
    return { visible: p.offsetHeight > 0, h: p.offsetHeight, cls: p.className };
  });
  console.log(`   Panel: ${JSON.stringify(panelInfo)}`);

  // 5. Type message
  console.log('4. Typing message...');
  const textarea = await page.$('.ai-chat__input');
  if (!textarea) {
    console.log('   ERROR: textarea not found');
    await browser.close();
    return;
  }
  await textarea.fill('Hello!');
  console.log('   Filled');

  // 6. Click send
  console.log('5. Sending...');
  const sendBtn = await page.$('.ai-chat__send');
  if (sendBtn) {
    await sendBtn.click({ force: true });
    console.log('   Clicked send');
  } else {
    await textarea.press('Enter');
    console.log('   Pressed Enter');
  }

  // 7. Wait for response
  console.log('6. Waiting 20s for response...');
  await page.waitForTimeout(20000);

  // 8. Check messages
  const messages = await page.evaluate(() => {
    const msgEls = document.querySelectorAll('.ai-chat__message');
    const results = [];
    for (const el of msgEls) {
      results.push({
        isUser: el.classList.contains('ai-chat__message--user'),
        text: el.textContent?.substring(0, 200)
      });
    }
    // Check for errors
    const errors = document.querySelectorAll('.ai-chat__error');
    for (const e of errors) {
      results.push({ isError: true, text: e.textContent?.substring(0, 200) });
    }
    // Check typing indicator
    const typing = document.querySelector('.ai-chat__typing');
    if (typing) results.push({ isTyping: true });
    return results;
  });
  console.log(`   Messages (${messages.length}):`);
  for (const m of messages) {
    console.log(`   - ${m.isUser ? 'USER' : m.isError ? 'ERROR' : m.isTyping ? 'TYPING...' : 'AI'}: ${m.text}`);
  }

  // 9. Screenshot
  await page.screenshot({ path: '/tmp/ai-chat-test.png' });
  console.log('\nScreenshot: /tmp/ai-chat-test.png');

  // 10. Relevant console logs
  console.log('\n=== Console Logs ===');
  const relevant = logs.filter(l =>
    l.includes('ai-chat') || l.includes('ai-proxy') || l.includes('ERROR') ||
    l.includes('error') || l.includes('Failed') || l.includes('fetch') ||
    l.includes('sensenova') || l.includes('provider') || l.includes('403') ||
    l.includes('401') || l.includes('429') || l.includes('500')
  );
  for (const l of relevant.slice(-20)) console.log(l);
  if (relevant.length === 0) {
    console.log('(no relevant logs, showing last 10)');
    for (const l of logs.slice(-10)) console.log(l);
  }

  await browser.close();
  console.log('\nDone.');
})();
