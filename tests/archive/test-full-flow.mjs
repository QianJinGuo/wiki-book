import { chromium } from 'playwright';

const SITE = 'https://jinguo.tech';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  console.log('1. 打开网站...');
  await page.goto(SITE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  console.log('   页面加载完成');

  // 清除旧配置
  console.log('2. 清除旧配置...');
  await page.evaluate(() => localStorage.removeItem('ai-chat-config'));
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  // 截图：首页
  await page.screenshot({ path: '/tmp/step1-homepage.png' });
  console.log('   截图: step1-homepage.png');

  // 点击🤖机器人图标
  console.log('3. 点击机器人图标...');
  const trigger = await page.$('.ai-chat-trigger');
  if (!trigger) {
    console.log('   找不到机器人图标！');
    await browser.close();
    return;
  }
  await trigger.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/tmp/step2-panel-open.png' });
  console.log('   聊天面板已打开，截图: step2-panel-open.png');

  // 点击⚙️设置按钮
  console.log('4. 点击设置按钮...');
  const settingsBtn = await page.$('button[data-action="settings"]');
  if (!settingsBtn) {
    console.log('   找不到设置按钮！');
    await browser.close();
    return;
  }
  await settingsBtn.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/step3-settings-open.png' });
  console.log('   设置面板已打开，截图: step3-settings-open.png');

  // 选择 Sensenova 预设
  console.log('5. 选择 Sensenova (DeepSeek) 预设...');
  const presetSelect = await page.$('#ai-cfg-preset');
  if (!presetSelect) {
    console.log('   找不到预设下拉框！');
    await browser.close();
    return;
  }
  // Find the Sensenova option
  const options = await presetSelect.$$('option');
  let sensenovaIdx = -1;
  for (let i = 0; i < options.length; i++) {
    const text = await options[i].textContent();
    if (text.includes('Sensenova')) {
      sensenovaIdx = i;
      console.log(`   找到 Sensenova 预设，索引=${i}`);
      break;
    }
  }
  if (sensenovaIdx < 0) {
    console.log('   找不到 Sensenova 预设！');
    await browser.close();
    return;
  }
  await presetSelect.selectOption({ index: sensenovaIdx });
  await page.waitForTimeout(500);

  // 验证 model 字段自动填充
  const modelValue = await page.$eval('#ai-cfg-model', el => el.value);
  console.log(`   模型字段: ${modelValue}`);

  // 点击保存
  console.log('6. 保存配置...');
  const saveBtn = await page.$('button[data-action="save-config"]');
  if (!saveBtn) {
    console.log('   找不到保存按钮！');
    await browser.close();
    return;
  }
  await saveBtn.click();
  await page.waitForTimeout(1000);

  // 验证保存成功
  const savedCfg = await page.evaluate(() => localStorage.getItem('ai-chat-config'));
  console.log(`   已保存配置: ${savedCfg}`);
  await page.screenshot({ path: '/tmp/step4-config-saved.png' });

  // 关闭设置面板（点击其他地方）
  await settingsBtn.click();
  await page.waitForTimeout(500);

  // 输入消息
  console.log('7. 输入消息...');
  const textarea = await page.$('.ai-chat__input');
  if (!textarea) {
    console.log('   找不到输入框！');
    await browser.close();
    return;
  }
  await textarea.fill('你好，请介绍一下你自己');
  console.log('   已输入: "你好，请介绍一下你自己"');
  await page.screenshot({ path: '/tmp/step5-typed.png' });

  // 点击发送
  console.log('8. 点击发送...');
  const sendBtn = await page.$('.ai-chat__send');
  if (sendBtn) {
    await sendBtn.click({ force: true });
    console.log('   已点击发送');
  } else {
    await textarea.press('Enter');
    console.log('   按 Enter 发送');
  }

  // 等待响应
  console.log('9. 等待 AI 响应 (20s)...');
  await page.waitForTimeout(20000);

  // 检查结果
  const result = await page.evaluate(() => {
    const msgs = document.querySelectorAll('.ai-chat__msg');
    return [...msgs].map(m => ({
      isUser: m.classList.contains('ai-chat__msg--user'),
      isAssistant: m.classList.contains('ai-chat__msg--assistant'),
      text: m.textContent?.substring(0, 300)
    }));
  });
  console.log(`\n=== 消息 (${result.length}) ===`);
  for (const m of result) {
    const role = m.isUser ? '👤 用户' : m.isAssistant ? '🤖 AI' : '❓';
    console.log(`${role}: ${m.text}`);
  }

  await page.screenshot({ path: '/tmp/step6-result.png' });
  console.log('\n截图: step6-result.png');

  await browser.close();
  console.log(result.length >= 2 ? '\n✅ 测试通过！' : '\n❌ 测试失败');
})();
