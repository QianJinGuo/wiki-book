import { chromium } from 'playwright';

const LOCAL_URL = 'http://127.0.0.1:8002';

async function main() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-proxy-server']
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  console.log('=== Phase 1+2: RAG 测试 ===\n');

  // 1. 页面加载
  console.log('1. 页面加载...');
  await page.goto(LOCAL_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);
  console.log('   Title:', await page.title());

  // 2. 检查 ai-chat.js
  console.log('\n2. 检查前端 JS...');
  const aiChatSrc = await page.evaluate(() => {
    const scripts = document.querySelectorAll('script[src]');
    for (const s of scripts) {
      if (s.src.includes('ai-chat.js')) return s.src;
    }
    return null;
  });
  console.log('   ai-chat.js:', aiChatSrc ? '已加载' : '未找到');

  if (aiChatSrc) {
    const resp = await page.request.get(aiChatSrc);
    const js = await resp.text();
    console.log('   RAG_URL:', js.includes('RAG_URL') ? '存在' : '缺失');
    console.log('   PROXY_URL:', js.includes('/ai-proxy') ? '存在' : '缺失');
  }

  // 3. 打开 AI Chat 面板
  console.log('\n3. 打开 AI Chat 面板...');
  const triggerVis = await page.locator('.ai-chat-trigger').isVisible();
  console.log('   触发按钮:', triggerVis ? '可见' : '不可见');
  if (!triggerVis) throw new Error('触发按钮不可见');

  await page.locator('.ai-chat-trigger').click();
  await page.waitForTimeout(500);

  const panelVis = await page.locator('.ai-chat-panel.open').isVisible();
  console.log('   面板:', panelVis ? '已打开' : '未打开');
  if (!panelVis) throw new Error('面板未打开');

  // 4. 输入问题
  console.log('\n4. 输入问题...');
  await page.locator('.ai-chat__input').fill('Agent 记忆有哪些类型？');
  console.log('   已输入: Agent 记忆有哪些类型？');

  // 5. 截图
  await page.screenshot({ path: '/tmp/wiki-book-rag-ui.png', fullPage: true });
  console.log('\n   截图已保存: /tmp/wiki-book-rag-ui.png');

  // 结果
  console.log('\n========== 测试结果 ==========');
  if (errors.length > 0) {
    console.log('控制台问题:', errors.length, '个');
    errors.forEach(e => console.log('  -', e));
  }
  console.log('全部测试通过');

  await browser.close();
  process.exit(0);
}

main().catch(err => {
  console.error('测试失败:', err.message);
  process.exit(1);
});
