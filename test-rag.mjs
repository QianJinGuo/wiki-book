/**
 * RAG 端到端测试
 *
 * 测试目标：
 *   1. 生产环境 /rag-query 真实 RAG 响应（Phase 1+2）
 *   2. Docker nginx fallback（空结果 200）
 *   3. 响应结构完整性
 *   4. 搜索结果相关性（至少 top1 含查询关键字）
 *   5. 多组查询场景覆盖
 */

import { chromium } from 'playwright';

const PRODUCTION_URL = 'https://jinguo.tech';
const LOCAL_URL = 'http://127.0.0.1:8002';

async function testRagEndpoint(url, label) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${label}`);
  console.log(`${'='.repeat(60)}\n`);

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-proxy-server']
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  const testCases = [
    { q: 'Agent 记忆', expect: ['记忆', 'Agent', 'agent'] },
    { q: 'MCP 协议', expect: ['MCP', '协议', 'Model Context'] },
    { q: '工具调用', expect: ['工具', 'function', 'tool', 'function calling'] },
    { q: 'Harness 治理', expect: ['Harness', '治理', 'harnes'] },
    { q: '向量数据库', expect: ['向量', '数据库', 'vector', 'embedding'] },
  ];

  let passed = 0;
  let failed = 0;
  let retried = 0;

  for (const tc of testCases) {
    // 重试逻辑：Free 计划 CPU 受限时可能 503，等待后重试
    let data = null;
    let status = 0;
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) {
        await new Promise(r => setTimeout(r, 2000 * attempt)); // 2s, 4s backoff
        retried++;
      }
      const resp = await page.request.get(
        `${url}/rag-query?q=${encodeURIComponent(tc.q)}&top_k=5`
      );
      status = resp.status();
      try {
        data = await resp.json();
        if (status === 200 && data && Array.isArray(data.results)) break;
      } catch {
        data = null;
      }
    }

    // --- 结构验证 ---
    const hasResults = data && Array.isArray(data.results);
    const hasSource = data && typeof data.source === 'string';
    const structureOk = hasResults && hasSource;

    // 生产环境应有实际结果；Docker nginx fallback 返回空数组
    const isNginxFallback = data && data.source === 'nginx-fallback';
    const isRateLimited = status === 503;

    // --- 相关性验证（跳过 nginx fallback 和空结果） ---
    let relevanceOk = true;
    let relevanceDetail = '-';
    if (structureOk && data.results.length > 0 && !isNginxFallback) {
      const topTitle = data.results[0].title;
      relevanceOk = tc.expect.some(pat => topTitle.toLowerCase().includes(pat.toLowerCase()));
      if (!relevanceOk) {
        relevanceDetail = `top1 标题不包含 [${tc.expect.join(', ')}] — 实际: "${topTitle.substring(0, 40)}..."`;
      } else {
        relevanceDetail = `✅ top1 命中关键字`;
      }
    }

    const ok = structureOk && !isRateLimited && (isNginxFallback || relevanceOk);
    if (ok) passed++; else failed++;

    console.log(`  ${ok ? '✅' : '❌'} "${tc.q}"`);
    console.log(`     状态: ${status} | 结果数: ${structureOk ? data.results.length : 'invalid'} | 来源: ${structureOk ? data.source : 'N/A'}`);
    if (isRateLimited) {
      console.log(`     ⚠️  Free 计划 CPU 受限 (503)，3 次重试后仍失败`);
      console.log(`     这是已知困境，升级 Workers Paid 可解决`);
    } else if (!structureOk) {
      console.log(`     失败: 结构无效 (results=${typeof data?.results}, source=${typeof data?.source})`);
    } else if (data.results.length > 0 && !isNginxFallback) {
      console.log(`     top1: "${data.results[0].title.substring(0, 60)}..."`);
      console.log(`     score: ${data.results[0].score}`);
    }
    if (!relevanceOk && structureOk && data.results.length > 0 && !isNginxFallback) {
      console.log(`     相关性: ${relevanceDetail}`);
    }
  }

  // --- 错误汇总 ---
  if (errors.length > 0) {
    console.log(`\n  控制台错误 (${errors.length}):`);
    errors.forEach(e => console.log(`    - ${e.substring(0, 100)}`));
  }

  await browser.close();

  console.log(`\n  📊 结果: ${passed}/${passed + failed} 通过 (重试 ${retried} 次)`);
  return { passed, failed };
}

async function main() {
  let allPassed = 0;
  let allFailed = 0;

  // 1. 生产环境测试
  try {
    const prod = await testRagEndpoint(PRODUCTION_URL, '🌐 生产环境: jinguo.tech');
    allPassed += prod.passed;
    allFailed += prod.failed;
  } catch (e) {
    console.log(`\n❌ 生产环境测试失败: ${e.message}`);
    console.log('   (可能网络不通，跳过)');
    allFailed += 5;
  }

  // 2. Docker 本地测试
  try {
    const local = await testRagEndpoint(LOCAL_URL, '🐳 Docker 本地: localhost:8002');
    allPassed += local.passed;
    allFailed += local.failed;
  } catch (e) {
    console.log(`\n⚠️  Docker 本地测试跳过: ${e.message}`);
    console.log('   (Docker 可能未运行，不影响 CI)');
  }

  // 3. 前端 ai-chat.js 中 RAG_URL 引用检查
  console.log(`\n${'='.repeat(60)}`);
  console.log('  📝 前端 JS 源码检查');
  console.log(`${'='.repeat(60)}\n`);
  try {
    const browser = await chromium.launch({
      channel: 'chrome',
      headless: true,
      args: ['--no-proxy-server']
    });
    const page = await browser.newContext().then(c => c.newPage());
    await page.goto(PRODUCTION_URL, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1000);

    // 用页面上的某个 ai-chat.js 检查
    const scripts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script[src]'))
        .map(s => s.src)
        .filter(s => s.includes('ai-chat'));
    });
    if (scripts.length > 0) {
      const resp = await page.request.get(scripts[0]);
      const js = await resp.text();
      const hasRagUrl = js.includes('RAG_URL');
      const hasProxyUrl = js.includes('PROXY_URL');
      console.log(`  ✅ ai-chat.js: 已加载 (${scripts.length} 个)`);
      console.log(`     RAG_URL:    ${hasRagUrl ? '✅ 存在' : '❌ 缺失'}`);
      console.log(`     PROXY_URL:  ${hasProxyUrl ? '✅ 存在' : '❌ 缺失'}`);
      if (hasRagUrl && hasProxyUrl) allPassed++; else allFailed++;
    } else {
      console.log('  ⚠️  ai-chat.js 未加载（可能页面无文章内容）');
    }
    await browser.close();
  } catch (e) {
    console.log(`  ⚠️  前端检查跳过: ${e.message}`);
  }

  // --- 最终结果 ---
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${allFailed > 0 ? '❌ 部分测试失败' : '✅ 全部通过'}`);
  console.log(`  总计: ${allPassed}/${allPassed + allFailed} 通过`);
  console.log(`${'='.repeat(60)}\n`);

  process.exit(allFailed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('测试框架异常:', err.message);
  process.exit(1);
});
