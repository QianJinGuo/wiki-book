import { chromium } from 'playwright';

const SITE = 'https://jinguo.tech';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(SITE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  // Check if the fix is deployed
  const hasFix = await page.evaluate(() => {
    // Check via global script content
    const scripts = [...document.querySelectorAll('script[src]')].map(s => s.src);
    const aiChatSrc = scripts.find(s => s.includes('ai-chat'));
    return { aiChatSrc, hasReasoning: false };
  });
  console.log('ai-chat.js src:', hasFix.aiChatSrc);

  // Force load the latest JS by checking content
  const jsContent = await page.evaluate(async () => {
    const scripts = [...document.querySelectorAll('script[src]')];
    const aiChat = scripts.find(s => s.src.includes('ai-chat'));
    if (!aiChat) return 'not found';
    const resp = await fetch(aiChat.src + '?_t=' + Date.now());
    const text = await resp.text();
    return {
      hasReasoningContent: text.includes('reasoning_content'),
      hasSensenova: text.includes('sensenova'),
      hasProvider: text.includes('_provider'),
      size: text.length
    };
  });
  console.log('JS content check:', JSON.stringify(jsContent));

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
  await page.fill('.ai-chat__input', 'Hello!');
  await page.click('.ai-chat__send', { force: true });
  console.log('Sent, waiting 15s...');
  await page.waitForTimeout(15000);

  // Check result
  const result = await page.evaluate(() => {
    const msgs = document.querySelectorAll('.ai-chat__msg');
    return [...msgs].map(m => ({
      isUser: m.classList.contains('ai-chat__msg--user'),
      text: m.textContent?.substring(0, 200)
    }));
  });
  console.log(`\nMessages (${result.length}):`);
  for (const m of result) {
    console.log(`  ${m.isUser ? 'USER' : 'AI'}: ${m.text}`);
  }

  await page.screenshot({ path: '/tmp/ai-chat-prod.png' });
  console.log('\nScreenshot: /tmp/ai-chat-prod.png');

  await browser.close();
  console.log(result.length >= 2 ? '\n✅ TEST PASSED' : '\n❌ TEST FAILED');
})();
