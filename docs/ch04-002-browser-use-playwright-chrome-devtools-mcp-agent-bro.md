# 五款浏览器自动化工具横向对比：browser-use / Playwright / chrome-devtools-mcp / agent-browser / BrowserAct

## Ch04.002 五款浏览器自动化工具横向对比：browser-use / Playwright / chrome-devtools-mcp / agent-browser / BrowserAct

> 📊 Level ⭐ | 11.3KB | `entities/four-browser-automation-tools-comparison.md`

> 来源：[行小招 - 科技充电站](https://mp.weixin.qq.com/s/2aqrTvswa6FtqI-GK-EmvQ)，2026-05-19
> 评分：v=6, c=7, v×c=42 → 作为 [OpenCLI](/ch03-080-opencli/) entity 的补充
| 维度 | chrome-devtools-mcp | Playwright | agent-browser | browser-use | BrowserAct | [raw/articles/browseract-agent-browser-execution-layer-rejected.md]
|------|--------------------|-----------|---------------|-------------|------------|
| 语言/运行时 | Node.js | Node.js，多语言绑定 | Rust，原生二进制 | Python | Node.js + Rust 内核 |
| 浏览器协议 | CDP 直接暴露 | 自有协议封装 CDP | CDP | Playwright | CDP + 自有反检测层 |
| 依赖链 | Chrome + Node | Chrome + Node | 仅 Chrome | Chrome + Python + Playwright | Chrome + Node + 代理 |
| 感知方式 | DOM / 网络 / JS 原语 | DOM selector / locator | Accessibility tree + @eN ref | 截图 + DOM 混合 | DOM + accessibility tree + 视觉 |
| AI 集成方式 | MCP tool 调用 | 外部调用脚本 | MCP / CLI 调用 | 内置 LLM 循环 | CLI + 配套 Skill |
| 状态持久 | 无，每次连接 | 需配置 persistent context | 跨命令持久 session | Agent 自己维护状态 | **多 Session 隔离 + 8h 自动回收** |
| 并发支持 | 依赖调用方 | 很强，多 context | 支持并行子 agent | Cloud 版更适合 | **同 Agent 3 浏览器 × 3 Session × 3 静态代理** |
| **反检测** | ❌ | ❌ | ❌ | ❌ | **✅ 18 项反检测全绿**（产品方自报，bot.sannysoft） |
| **人机接力（验证码/2FA）** | ❌ | ❌ | ❌ | ❌ | **✅ Remote-assist 跨设备链接** |
| **多身份隔离（多账号）** | ❌ | ❌ | ❌ | ❌ | **✅ 浏览器身份 × 静态代理绑定** |
| **Skill Forge 流程打包** | ❌ | ❌ | ❌ | ❌ | ✅（注：与 古法程序员 spec-as-code 的 SKILL.md 模式重叠） |

## 四层抽象

- **chrome-devtools-mcp** → 暴露 CDP 原语，最底层
- **Playwright** → 脚本化测试框架，人类写脚本
- **agent-browser** → AI 友好的 CLI 工具箱，命令驱动
- **browser-use** → AI 自己思考和操作的 Agent 闭环，最高层

## 选型结论

- **AI 即时验证（AI Coding Agent 边写边看）** → `agent-browser`：accessibility tree 省 token、@eN ref 定位短、跨命令 session 持久
- **CI / 稳定回归** → `Playwright`：一次写脚本，后面零 token 跑 N 次
- **模糊目标的完整自动化** → `browser-use`：think-act 循环，适合登录+动态页面+不确定结果
- **底层调试（网络/性能/JS）** → `chrome-devtools-mcp`：CDP 级别控制
- **反检测/Cloudflare 绕过/竞品监控**（**⚠️ 第三方独立验证缺失**） → `BrowserAct`：18 项反检测全绿（产品方自报）、三种浏览器模式、Skill Forge；适合多账号运营 + 需要人机接力的验证码场景；与 `tinyfish-web-agent` skill（AGENTS.md 标准反检测方案）功能重叠

## 决策树

| 场景 | 推荐工具 |
|------|---------|
| AI 写代码时顺手验证页面 | agent-browser |
| 固定流程回归测试 / CI | Playwright |
| 模糊目标的完整自动化任务 | browser-use |
| 网络、性能、JS、CDP 级调试 | chrome-devtools-mcp |
| **Cloudflare/challenge 绕过 + 竞品监控 + 多账号运营**（**⚠️ 待第三方验证**） | **BrowserAct**（备用：tinyfish-web-agent skill） |

> 固定流程看成本，模糊任务看完成度，AI 即时验证看调用摩擦，**反检测场景看清单外约束**。

## 深度分析

### 技术栈选择的根本分歧

四个工具代表了浏览器自动化领域三条截然不同的技术路线。**chrome-devtools-mcp** 选择直连 CDP 协议，放弃一切抽象，用最大的灵活 性换取最低的完整性——它本质上是一个协议透传层，所有智能决策都交给调用方。**Playwright** 走的是传统测试框架路线，用人类可读的 selector/locator 模型封装 CDP，提供稳定的跨浏览器 API，但 AI 感知能力有限。**agent-browser** 则在 CDP 之上构建了 accessibility tree 这一 AI 友好中间层，用 @eN ref 引用机制解决了 AI 定位元素的问题，同时保持 Rust 原生性能。**browser-use** 是唯一内置 LLM 循环的工具，它把 AI 做决策的负担从人类开发者转移到了 AI Agent 本身。

### 状态管理是隐性分水岭

表格中没有明确标注但实际影响巨大的一点是**状态管理策略**。chrome-devtools-mcp 每次连接无状态，意味着 AI 必须自行维护上下文。Playwright 需要显式配置 persistent context 才能跨请求保持状态，学习成本高。agent-browser 通过跨命令持久 session 将状态管理内置化，对 AI Agent 非常友好。browser-use 则把状态完全交给 Agent 自己的循环逻辑，这种设计在简单场景下优雅，在复杂长流程中可能丢失状态。状态持久化的缺失是 chrome-devtools-mcp 和 Playwright 在 AI 集成场景的主要短板。

### 依赖链复杂度影响 AI 集成可靠性

browser-use 的依赖链最长（Chrome + Python + Playwright），这意味着任何一层出问题都会传导到 AI 层面。Rust 原生的 agent-browser 依赖最薄，只有 Chrome，这意味着它更适合作为 AI Coding Agent 的长期基础设施。依赖越少，AI Agent 的失败模式越少，排查成本越低。

## 实践启示

### 1. AI Coding 工作流首选 agent-browser

在 AI 生成代码后即时验证的场景中，accessibility tree 的省 token 特性尤为关键。截图 + DOM 混合模式虽然信息量更大，但 token 消耗也更高。跨命令 session 持久意味着 AI 不需要在每次验证时重新登录或导航到目标页面，大幅降低调用摩擦。对于 Cursor、Copilot 等 AI Coding 工具的插件生态，agent-browser 的 CLI 调用模式比 MCP 集成更易对接。

### 2. 企业级 CI/CD 选 Playwright 仍是政治正确

尽管 AI 工具概念火热，Playwright 在稳定回归测试场景的统治地位短期内不会动摇。一次编写、零 token 执行、成本可控、结果可复现，这些特性对财务报告级的 CI 测试至关重要。模糊目标自动化听起来美好，但企业不愿为不可预测的 AI 行为承担生产事故风险。

### 3. browser-use 适合探索性任务，不适合确定性流程

think-act 循环是 browser-use 的核心优势，也是它的局限。在目标页面结构未知、需要多步试探才能完成的场景（如自动填报、跨平台数据聚合），browser-use 的 AI 自主性能够显著减少人工干预。但在结构稳定、流程确定的场景中，它的 token 消耗和不可预测性反而成为负担。

### 4. chrome-devtools-mcp 是底层调试的最后手段

CDP 级别控制适合网络抓包、性能分析、JS 调试等专项任务，但在常规业务自动化中几乎不直接使用。它更像是其他工具的底层依赖，而非独立使用的前端工具。如果你的问题无法通过 Playwright 或 agent-browser 解决，再考虑 chrome-devtools-mcp。

### 5. 多工具组合使用是成熟团队的常见形态

实际项目中很少只选一个工具。常见组合是 agent-browser 负责开发时的即时验证 + Playwright 负责 CI 的回归测试 + chrome-devtools-mcp 偶尔用于专项调试。browser-use 则根据团队对 AI 接受度和任务模糊程度决定是否引入。这种分层组合比单一工具更能应对真实场景的复杂性。

## 第五款候选：BrowserAct（待第三方验证）

**来源**：[原文存档（reject-as-supplementary）](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/browseract-agent-browser-execution-layer-rejected.md)
**评分**：v=5, c=5, v×c=25（reject-as-supplementary，不创建独立 entity）
**作者**：丛林（极客之家），2026-06-18，**wiki 无历史**
**GitHub**：https://github.com/browser-act/skills · **官网**：https://www.browseract.ai/

### ⚠️ 验证状态声明

- 本文补充自 reject-as-supplementary 文章，**产品方自报数据未独立 benchmark**
- 反检测 18 项全绿数据来自 `bot.sannysoft.com` 测试（产品方自测，非第三方独立验证）
- 8 小时 Session 回收、30+ 预置 Skill、3 浏览器 × 3 Session 能力均为**产品方自报**
- 软文特征明显（"神级开源项目"标题 + "完美！"反复 + 邮箱残留）
- AGENTS.md 标准反检测方案 `tinyfish-web-agent` skill 与之功能重叠

**使用建议**：在找到独立 benchmark 之前，**仅作为对比表的占位项**，不要作为生产环境首选。

### 三种浏览器模式

| 模式 | 用途 | 特点 |
|---|---|---|
| **stealth** | 主力反检测浏览器 | 指纹伪装 + TLS 轮换 + 代理切换；批量采集/匿名访问/竞品监控 |
| **chrome** | 复用本地 Chrome Profile | 把本地 Chrome Profile 导入到独立环境跑；复用已有登录态 |
| **chrome-direct** | 直接控制当前 Chrome | 零配置，天然带所有登录态和插件；临时测试/快速验证 |

### Remote-assist（人机接力）

Agent 碰到验证码/2FA/SSO 时**自动暂停 + 生成跨设备链接**让人接力处理，处理完 Agent 从断点续跑。**不绕过验证码，让人来处理**——区别于 4 款工具的"撞墙/失败"模式。

### 多 Session + 静态代理绑定

- 浏览器管**身份**（登录态、Cookie、Profile、代理、指纹）
- Session 管**任务**（页面、步骤、提取内容、上下文）
- 同 Agent 同时 3 浏览器 × 3 Session × 3 静态代理 = 9 个并行任务单元
- Session **8 小时无操作自动回收**

### Skill Forge

把跑通的网页流程打包成 SKILL.md + 脚本，下次 Agent 直接调用。**注：与 [古法程序员 spec-as-code](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/gufabiancheng-spec-for-complex-tasks-cc-codex.md) 的 SKILL.md 模式直接重叠**——古法程序员是通用框架，BrowserAct 是网页操作特化。

### 安装方式

```
Install browser-act. Skill source: https://github.com/browser-act/skills/tree/main/browser-act
browser-act get-skills core --skill-version 2.0.2
```

操作流程：`open → state → interact → verify → close`

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/four-browser-automation-tools-comparison.md)
→ [BrowserAct 原文存档（待验证）](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/browseract-agent-browser-execution-layer-rejected.md)

---

