import { chromium } from 'playwright';

const URL = 'https://wiki.jinguo.tech';

async function main() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: [
      '--no-proxy-server',
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai'
  });
  const page = await context.newPage();

  // 隐藏自动化特征
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));
  page.on('response', resp => {
    if (resp.status() >= 400) {
      errors.push(`HTTP ${resp.status()}: ${resp.url()}`);
    }
  });

  console.log('1. 导航到 wiki.jinguo.tech...');
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  console.log(`   URL: ${page.url()}`);
  console.log(`   Title: ${await page.title()}`);

  // 等待内容加载
  await page.waitForTimeout(3000);

  // CSS 加载检查
  const cssCount = await page.evaluate(() => {
    return document.querySelectorAll('link[rel="stylesheet"]').length;
  });
  const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const bodyFont = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  console.log(`   CSS link 数: ${cssCount}`);
  console.log(`   Body background: ${bodyBg}`);
  console.log(`   Body font: ${bodyFont.substring(0, 60)}`);

  // 关键 UI 元素
  const header = page.locator('.md-header');
  const content = page.locator('.md-content');
  const footer = page.locator('.md-footer');
  const h1 = page.locator('h1');
  const trigger = page.locator('.ai-chat-trigger');
  const navPrimary = page.locator('nav.md-nav--primary');

  const headerVis = await header.isVisible();
  const contentVis = await content.isVisible();
  const footerVis = await footer.isVisible();
  const h1Text = await h1.textContent();
  const triggerVis = await trigger.isVisible().catch(() => false);
  const navVis = await navPrimary.isVisible().catch(() => false);

  console.log(`   Header: ${headerVis}`);
  console.log(`   Nav (primary): ${navVis}`);
  console.log(`   Content: ${contentVis}`);
  console.log(`   Footer: ${footerVis}`);
  console.log(`   H1: "${h1Text}"`);
  console.log(`   AI Chat 按钮: ${triggerVis}`);

  // 颜色方案
  const colorScheme = await page.evaluate(() => {
    const body = document.body;
    return {
      scheme: body.getAttribute('data-md-color-scheme'),
      primary: body.getAttribute('data-md-color-primary'),
    };
  });
  console.log(`   颜色方案: ${JSON.stringify(colorScheme)}`);

  // 页面内容
  const bodyText = await page.locator('body').innerText();
  console.log(`   页面文本长度: ${bodyText.length} 字符`);

  // 截图
  await page.screenshot({ path: '/tmp/wiki-book-online.png', fullPage: true });
  console.log('   截图已保存: /tmp/wiki-book-online.png');

  console.log('\n========== 测试结果 ==========');
  if (errors.length > 0) {
    console.log(`❌ ${errors.length} 个问题:`);
    errors.forEach(e => console.log(`   - ${e}`));
  }
  if (!headerVis || !contentVis) console.log('❌ 关键 UI 元素缺失');
  if (errors.length === 0 && headerVis && contentVis) {
    console.log('✅ 全部正常');
  }

  await browser.close();
  process.exit(errors.length > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('测试失败:', err.message);
  process.exit(1);
});
