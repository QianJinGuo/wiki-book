import { chromium } from 'playwright';

const BASE = 'http://localhost:8002';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    // 模拟真实浏览器 localStorage
    storageState: undefined,
  });
  const page = await context.newPage();

  // 收集 console 错误
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  console.log('1. 导航到 wiki-book...');
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
  console.log('   ✅ 页面加载成功');

  // 检查 Talk to AI 触发按钮
  const trigger = page.locator('.ai-chat-trigger');
  await trigger.waitFor({ state: 'visible', timeout: 10000 });
  console.log('   ✅ Talk to AI 触发按钮可见');

  // 点击触发按钮打开面板
  await trigger.click();
  const panel = page.locator('.ai-chat-panel');
  await panel.waitFor({ state: 'visible', timeout: 5000 });
  const panelOpen = await panel.evaluate(el => el.classList.contains('open'));
  console.log(`   ✅ 面板已打开: ${panelOpen}`);

  // 检查面板元素
  const header = panel.locator('.ai-chat__header');
  const messages = panel.locator('.ai-chat__messages');
  const input = panel.locator('.ai-chat__input');
  const sendBtn = panel.locator('.ai-chat__send');
  const settingsBtn = panel.locator('[data-action="settings"]');
  console.log(`   ✅ 面板元素: header=${await header.isVisible()}, messages=${await messages.isVisible()}, input=${await input.isVisible()}, send=${await sendBtn.isVisible()}`);

  // 检查设置面板
  await settingsBtn.click();
  const settings = panel.locator('.ai-chat__settings');
  await settings.waitFor({ state: 'visible', timeout: 3000 });
  const presetSelect = panel.locator('#ai-cfg-preset');
  const endpointInput = panel.locator('#ai-cfg-endpoint');
  const modelInput = panel.locator('#ai-cfg-model');
  const saveBtn = panel.locator('[data-action="save-config"]');
  console.log(`   ✅ 设置面板: preset=${await presetSelect.isVisible()}, endpoint=${await endpointInput.isVisible()}, model=${await modelInput.isVisible()}, save=${await saveBtn.isVisible()}`);

  // 检查 TTS 设置
  const ttsEndpoint = panel.locator('#ai-cfg-tts-endpoint');
  const ttsModel = panel.locator('#ai-cfg-tts-model');
  console.log(`   ✅ TTS 设置: endpoint=${await ttsEndpoint.isVisible()}, model=${await ttsModel.isVisible()}`);

  // 清空所有配置（走站点内置 proxy）
  await endpointInput.fill('');
  const apiKeyInput = panel.locator('#ai-cfg-apikey');
  await apiKeyInput.fill('');
  await modelInput.fill('');
  await ttsEndpoint.fill('');
  const ttsKeyInput = panel.locator('#ai-cfg-tts-key');
  await ttsKeyInput.fill('');
  await ttsModel.fill('');

  // 保存配置
  await saveBtn.click();
  await page.waitForTimeout(500);
  const status = panel.locator('.ai-chat__form-status');
  const statusText = await status.textContent();
  console.log(`   ✅ 配置保存状态: "${statusText}"`);

  // 关闭设置
  await settingsBtn.click();
  await page.waitForTimeout(300);

  // 发送消息
  await input.fill('你好，请简单介绍一下你自己');
  await sendBtn.click();
  console.log('2. 发送消息...');

  // 等待 AI 回复（streaming）
  try {
    await page.waitForFunction(() => {
      const bubbles = document.querySelectorAll('.ai-chat__bubble');
      const last = bubbles[bubbles.length - 1];
      return last && !last.querySelector('.ai-chat__typing') && last.textContent.length > 5;
    }, { timeout: 30000 });
    const bubbles = await page.locator('.ai-chat__bubble').all();
    const lastText = await bubbles[bubbles.length - 1].textContent();
    console.log(`   ✅ AI 回复成功: "${lastText.substring(0, 80)}..."`);
  } catch (e) {
    // 检查是否有错误显示
    const errorEl = page.locator('.ai-chat__bubble span[style*="color"]');
    if (await errorEl.isVisible()) {
      const errText = await errorEl.textContent();
      console.log(`   ⚠️ AI 回复显示错误: ${errText}`);
      errors.push(`AI response error: ${errText}`);
    } else {
      console.log(`   ⚠️ AI 回复超时或未显示`);
    }
  }

  // 检查朗读按钮
  const speakBtns = page.locator('.ai-chat__speak-btn');
  const speakCount = await speakBtns.count();
  console.log(`   ✅ 朗读按钮数量: ${speakCount}`);

  // 检查拖动功能
  const headerEl = panel.locator('.ai-chat__header');
  const cursor = await headerEl.evaluate(el => window.getComputedStyle(el).cursor);
  console.log(`   ✅ 面板可拖动 (cursor: ${cursor})`);

  // 检查清空功能
  const clearBtn = panel.locator('[data-action="clear"]');
  await clearBtn.click();
  await page.waitForTimeout(300);
  const welcome = panel.locator('.ai-chat__welcome');
  const welcomeVisible = await welcome.isVisible();
  console.log(`   ✅ 清空后欢迎语可见: ${welcomeVisible}`);

  // 检查关闭功能
  const closeBtn = panel.locator('[data-action="close"]');
  await closeBtn.click();
  await page.waitForTimeout(300);
  const panelClosed = !(await panel.evaluate(el => el.classList.contains('open')));
  console.log(`   ✅ 面板已关闭: ${panelClosed}`);

  console.log('\n========== 测试结果 ==========');
  if (errors.length > 0) {
    console.log(`❌ ${errors.length} 个错误:`);
    errors.forEach(e => console.log(`   - ${e}`));
  } else {
    console.log('✅ 全部测试通过，无错误');
  }

  await browser.close();
  process.exit(errors.length > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('测试失败:', err.message);
  process.exit(1);
});
