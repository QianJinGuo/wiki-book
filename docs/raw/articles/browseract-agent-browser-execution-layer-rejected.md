---
sha256: 05d27c8c514f35acc3114605060508b079fe47b3865d09598c50dbcd5b6439ca
source: "https://mp.weixin.qq.com/s/2CJS3LNKLAR1rQE4zxoFcg"
title: "发现一个神级开源项目，一句话让 AI Agent 无障碍接管真实浏览器，代理、多 Session 一起跑"
author: 丛林
publisher: 极客之家
date: 2026-06-18
type: article
ingested: 2026-06-18
review_value: 5
review_confidence: 5
review_recommendation: reject-as-supplementary
review_stars: 2
review_reason: "v×c≈37 < 49 临界线；软文特征明显（'神级开源项目'标题+'完美！'+ 邮箱残留）；与 wiki 既有 4 款浏览器工具表（chrome-devtools-mcp/Playwright/agent-browser/browser-use）高度重叠；反检测 + remote-assist + 多 Session 三个新视角可批判性吸收到既有对比表；作者无 wiki 历史。"
raw_status: "rejected-but-archived-for-supplementary-update"
supplementary_target: "entities/four-browser-automation-tools-comparison.md (append fifth-row note + add 反检测/remote-assist/multi-session dimensions)"
---

# BrowserAct（Agent 真实浏览器执行层）—— 待第三方验证

> 作者：丛林（极客之家） · 发布：2026-06-18 09:00
> **本文档作为批判性吸收来源**，不创建独立 entity。补充到 [[entities/four-browser-automation-tools-comparison.md]] 第 5 款对比。

## 评分结论

**reject-as-supplementary** — v×c ≈ 5.2 × 5.5 ≈ 37，**不建独立 entity**，但**反检测 + remote-assist + 多 Session** 三个维度是 wiki 既有 4 款对比表的真空白，应批判性吸收。

## 五维评分

| 维度 | 分 | 说明 |
|---|---|---|
| 原创性 | 6/10 | 反检测 + remote-assist + 多 Session + Skill Forge 四个新能力，但全部是"复述 BrowserAct README" |
| 技术深度 | 5/10 | 给了 bot.sannysoft 18 项全绿、headless Chrome 第一项挂；但 TLS 轮换/fingerprint 内部原理没说 |
| 硬数据 | 5/10 | 18 项反检测测试 + 8 小时 session 回收 + 30+ 预置 Skill；**零独家数据**（全部"产品方自报"） |
| 批判视角 | 4/10 | **几乎无**——纯工具介绍 + 故事化 + "完美！"，无任何 P0 风险/小规模验证/失败案例 |
| 作者稀缺度 | 6/10 | 丛林（极客之家），wiki 无历史 |

## 软文特征

- 标题「**神级开源项目**」+「**无障碍接管**」
- 故事化开篇「上个月某个周三晚上...我一看返回结果，Cloudflare的验证页面」
- 反复「**完美！**」+「**我花了十秒钟扫码，剩下全是 Agent 自己在跑**」
- 文末"务实的解决我们的痛点"
- 邮箱残留（`https://www.browseract.ai/Java`）

## 批判性吸收内容

### 1. 反检测（Anti-bot Detection）

**作者实测数据**（产品方自报）：
- 在 `bot.sannysoft.com` 跑反检测测试，**18 项检测全绿**
- WebDriver 显示 missing，Chrome 对象显示 present
- UA 是 Windows NT 10.0 + Firefox 135.0（**指纹伪装成 Windows Firefox**，与本机 macOS Chrome 完全无关）
- `Sec-Fetch-Dest` / `Sec-Fetch-Mode` / `Sec-Fetch-Site` / `Accept-Language` **整套指纹字段全部对齐 Firefox 行为模式**
- 普通 headless Chrome 第一项就挂

**wiki 现状**：chrome-devtools-mcp / Playwright / agent-browser / browser-use **全部不涉及反检测**。AGENTS.md 提到的 `tinyfish-web-agent` skill 是反检测浏览器抓取标准方案，但**没有作为独立工具进入 4 款对比表**。

**吸收建议**：在对比表加一列「反检测」+ 在选型决策树增加「需要绕过 Cloudflare/challenge」场景 → 推荐 BrowserAct（注：第三方独立验证缺失）。

### 2. Remote-assist（验证码/2FA 接力）

**机制**：Agent 碰到验证码/2FA/SSO 时**自动暂停 + 生成跨设备链接**让人接力处理，处理完 Agent 从断点续跑。

**对比 4 款**：
- chrome-devtools-mcp：Agent 撞墙就撞墙
- Playwright：要么预先处理，要么失败
- agent-browser：同样撞墙
- browser-use：内置 LLM 循环撞墙后只能 retry

**吸收建议**：作为新维度「人机接力」加入对比表。

### 3. 多 Session 隔离 + 静态代理绑定

**机制**：
- 浏览器管身份（登录态、Cookie、Profile、代理、指纹）
- Session 管任务（页面、步骤、提取内容、上下文）
- **同一 Agent 同时开 3 个 stealth 浏览器 × 3 个 Session × 3 个静态代理 × 3 个账号**——互不串
- Session **8 小时无操作自动回收**

**对比 4 款**：
- chrome-devtools-mcp：无并发支持
- Playwright：多 context 但 cookie 共享问题
- agent-browser：支持并行子 agent，但 cookie 隔离靠人工配置
- browser-use：Cloud 版更适合，但**未明确多身份隔离**

**吸收建议**：作为「并发 + 身份隔离」复合维度补充。

### 4. Skill Forge（**注意：与古法程序员 spec-as-code 直接重叠**）

**机制**：把跑通的网页流程打包成 SKILL.md + 脚本，下次 Agent 直接调用。

**重叠说明**：[[raw/articles/gufabiancheng-spec-for-complex-tasks-cc-codex]] 古法程序员 spec 写作的"SKILL.md 固定骨架"是**同一模式**。差异：
- 古法程序员 = spec 写作的**通用框架**（rule/docs/skill 三类目录 + skill 三层架构 + gate 四态 + edge 三种）
- BrowserAct Skill Forge = **针对网页操作流程的特化**

**吸收建议**：不重复入库，在 [[raw/articles/gufabiancheng-spec-for-complex-tasks-cc-codex|古法程序员 spec]] 的相关实体已经覆盖 SKILL.md 模式时**链接**即可。

## 三种浏览器模式（BrowserAct 独家）

| 模式 | 用途 | 特点 |
|---|---|---|
| **stealth** | 主力反检测浏览器 | 指纹伪装 + TLS 轮换 + 代理切换；批量采集/匿名访问/竞品监控 |
| **chrome** | 复用本地 Chrome Profile | 把本地 Chrome Profile 导入到独立环境跑；复用已有登录态 |
| **chrome-direct** | 直接控制当前 Chrome | 零配置，天然带所有登录态和插件；临时测试/快速验证 |

**对比 4 款**：
- chrome-devtools-mcp：单一 CDP 模式
- Playwright：单一隔离 context
- agent-browser：单一 stealth（accessibility tree）
- browser-use：单一 LLM-driven

**吸收建议**：作为「浏览器模式选择」子维度。

## 安装方式

Codex 一句话：
```
Install browser-act. Skill source: https://github.com/browser-act/skills/tree/main/browser-act
```

配套命令：
```
browser-act get-skills core --skill-version 2.0.2
```

操作流程：`open → state → interact → verify → close`

## 为什么 reject-as-supplementary 而非 reject

- **核心新视角（反检测 + remote-assist + 多 Session）确实填补 wiki 空白**
- 但**产品方自报**——bot.sannysoft 18 项全绿是 BrowserAct 自己测的，没有独立 benchmark
- **第三方验证缺失** + **软文特征** + **零批判视角** = 不能直接信

最佳处理：批判性吸收到既有 4 款对比表（`entities/four-browser-automation-tools-comparison.md`），明确标注「未第三方验证 + 产品方自报」。

## 链接

- 原文 URL：https://mp.weixin.qq.com/s/2CJS3LNKLAR1rQE4zxoFcg
- 补充目标：[[entities/four-browser-automation-tools-comparison.md]]
- 相关已入 entity：[[entities/browser-use-runtime-harness]] / [[entities/agent-browser]] / [[entities/webwright-microsoft-1000-lines]]
- AGENTS.md 反检测标准方案：`tinyfish-web-agent` skill
