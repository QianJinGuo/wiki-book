---
source_type: wechat
source: https://mp.weixin.qq.com/s/2vO99OlOInapWZSEbJau8A
title: "我从 Vibe Coding 升级到 Harness 模式 — 大模型评测平台 6-SubAgent 工程实践"
author: 17哥（极客之家 geekhome / 大模型评测平台团队）
ingested: 2026-06-10
sha256: 4ffe550c145b8d636310e01f6621b538c4a8088b1377d2d2c2771d18b6776719
tags: [harness-engineering, vibe-coding, multi-agent, sub-agent, agent-handoff, git-submodule, claude-code, codex, mcp, case-study]
stars: 4
confidence: 0.85
value: 8
description: 17哥 把 Vibe Coding 升级为 Harness 模式（OpenAI/Anthropic 思路）的工业实践：Git Submodule 整合前后端 + 6 Sub-Agent 全流程（需求→前后端→集成测试→E2E）+ Agent Handoff YAML 协议 + Chrome DevTools MCP 自动化 + 量化结果 1天→2小时（4x）
---

# 我从 Vibe Coding 升级到 Harness 模式 — 大模型评测平台 6-SubAgent 工程实践

> 来源：[微信公众号 / 极客之家](https://mp.weixin.qq.com/s/2vO99OlOInapWZSEbJau8A)
> 作者：17哥（极客之家 geekhome / 大模型评测平台团队）
> 发布：2026-06
> 字数：7589 字 / 阅读 7 分钟

## 文章定位

团队把 AI 驱动的开发模式从 **Vibe Coding**（AI 写代码，人统筹）升级为 **Harness 模式**（代码库为唯一事实源，Agent 自治流转）的实践。核心是：

1. **重构代码仓库为单仓**（用 Git Submodule 整合前后端）
2. **6 个专业 Sub-Agent** 自动化协作流水线（覆盖需求分析→前后端开发→集成测试→E2E）
3. **Agent Handoff 协议** — 任务状态在不同 Agent 间安全、自动化流转

**量化结果**：原本 1 天完成的功能 → 约 2 小时，**效率提升约 4 倍**，显著降低前后端联调沟通成本。

## 1. 背景

大模型评测平台 `versus` 由 React 前端 `versus-fe` + Go 后端 `versus-server` 构成。功能不断丰富、扩展（前 2026-02 上线时只支持生图大模型单图评估）。

## 2. Vibe Coding → Harness 模式

**Vibe Coding = "AI 代写代码，人来统筹状态"**
- 开发过程中唯一变化：代码实现由人变成 AI
- 新功能拆解、模块联调、代码迭代调整还都是人来驱动
- 人的产物不再是代码，而是自然语言
- 极大降低产品开发门槛

**Harness = "代码库即唯一事实，Agent 自治流转状态"**
- 任何 Agent 不能 in-context 访问的东西，等于不存在
- Google Docs、聊天记录、人脑知识 → Agent 无法访问
- 仓库内、版本化的制品（代码、markdown、schemas、可执行计划）→ Agent 唯一可看

**痛点**：Vibe Coding 模式下，"调整页面元素"反复和 DUCC（豆包 / 字节 AI Coding）沟通 2+ 小时，"越改越糟"问题严重。

## 3. 对 Harness 的判断

读了 OpenAI《Harness engineering: leveraging Codex in an agent-first world》+ Anthropic《Harness design for long-running application development》后，作者判断 Harness 值得探索：

- OpenAI 案例也是基于内部工具实验，和 `versus` 平台发展阶段类似
- 平台 UI 交互不复杂 → 校验闭环更可操作
- 轻量级架构 → 如果 Harness 都不能胜任，更复杂系统更不行

## 4. Harness 初探

### 4.1 单仓代码库

**关键判断**："AI-first 意味着我们必须以 AI 为核心重塑我们的流程、架构、组织模式" — 康威法则：团队怎么分工、如何沟通，代码仓库就会变成对应结构。

**已有结构**：`versus-fe` + `versus-server` 两个独立仓库 + 各自 `CLAUDE.md` + 跨仓库知识存在"人脑中"（Agent 不可访问）

**方案**（避开暴力合并）：用 **Git Submodule** 整合，新建主仓 `versus`：

```
versus/                              # 父仓库
├── versus-server/                   # 服务端子模块 (Go + Gin)
│   └── CLAUDE.md
├── versus-fe/                       # 前端子模块 (React + Vite)
│   └── CLAUDE.md
├── scripts/                         # 管理脚本
│   ├── setup.sh
│   ├── pull-all.sh
│   ├── status.sh
│   └── sync-user-config.sh
├── .claude/                         # Claude Code 配置与 Agent 定义
│   ├── settings.json
│   ├── settings.local.json
│   ├── agents/                      # 6 个协作 Agent 定义
│   │   ├── requirement-designer.md
│   │   ├── go-api-implementer.md
│   │   ├── frontend-engineer.md
│   │   ├── test-case-designer.md
│   │   ├── integration-test-runner.md
│   │   └── e2e-test-executor.md
│   └── agent-memory/                # Agent 跨会话记忆
│       └── <agent-name>/MEMORY.md
├── docs/                            # 项目文档与需求产物
│   ├── system-architecture.md
│   ├── 6-agent-collaboration-summary.md
│   └── requirements/
│       └── {REQ-ID}/
├── .gitmodules                      # 子模块配置
├── CLAUDE.md                        # 项目整体知识（作战地图 + 协作规则 + 产品背景 + 全局约束）
├── dev.sh
├── README.md
└── FEATURES.md
```

**`versus/CLAUDE.md` 角色** = 整个项目的作战地图 + 协作规则 + 产品背景 + 全局约束
**`versus-fe/CLAUDE.md` / `versus-server/CLAUDE.md`** = 前端 / 服务端局部知识

**Git Submodule 的复杂度**用 DUCC 实现仓库管理脚本（"一句话更新主仓库、子仓库的代码" / "一句话部署前后端代码"）。

### 4.2 Harness 闭环设计

**两个问题**（Anthropic 博客提到）：
- **上下文焦虑**：模型感知到即将达到上下文上限，提前结束任务
- **自视甚高**：智能体评价自己工作时，即便产出在人类看来平平无奇，也会自信大加夸赞

**6 个 Sub-Agent** 拆分：

| Agent | 角色 | 产出 |
|---|---|---|
| `requirement-designer` | 需求分析师 | PRD 文档 |
| `go-api-implementer` | 后端开发 | Go API 代码 |
| `frontend-engineer` | 前端开发 | React 代码 |
| `test-case-designer` | 测试用例设计 | API 测试 + E2E 测试 JSON |
| `integration-test-runner` | API 集成测试执行 | 集成测试报告 |
| `e2e-test-executor` | 浏览器 E2E 测试执行 | E2E 报告 + 截图 |

**闭环流转**：除 PRD 阶段需人工审核外，其他阶段不需要人工介入。前后端开发由 Harness 自治流转，避免了联调沟通成本。

### 4.3 Agent Handoff 协议

**问题**：Sub-Agent 拆分带来新问题 — 如何在 Agent 间安全、结构化地转移"控制权"与"上下文状态"？否则 "哑巴交流" → 任务断连 / 状态错乱 / 故障恢复 / 链路追溯都会异常。

**协议格式**：

```yaml
---AGENT-HANDOFF---
requirement-id: REQ-001
status: completed | awaiting_review | has_bugs | all_passed
output: 产出的文件路径
next-step: 下一步动作描述
next-step-prompt: 启动下一个 Agent 时使用的 prompt
after-approval-next-step: 审核通过后的动作（仅 awaiting_review）
after-approval-prompt: 审核通过后的 prompt（仅 awaiting_review）
bugs: Bug 列表（仅 has_bugs）
review-message: 审核提示（仅 awaiting_review）
---END-HANDOFF---
```

**实现** — Handoff 块内容**直接写入主 session**（不写入本地文件，避免引入过多存储结构增加复杂度）：

```yaml
---AGENT-HANDOFF---
requirement-id: REQ-021
status: awaiting_review
output: docs/requirements/REQ-021/PRD.md
next-step: wait_for_human_approval
after-approval-next-step: launch go-api-implementer
after-approval-prompt: "根据需求 REQ-021 的 PRD 实现后端接口。PRD路径: docs/requirements/REQ-021/PRD.md"
review-message: "PRD 已生成，请审核 docs/requirements/REQ-021/PRD.md，确认无误后回复 '继续' 启动后端实现"
---END-HANDOFF---
```

**Bug 修复流程**（`has_bugs` 状态）：

1. 主会话解析 `bugs` 列表，确定 Bug 类型（后端/前端）
2. 分发给对应 Agent 修复
   - 后端 Bug → `go-api-implementer`
   - 前端 Bug → `frontend-engineer`
3. 修复完成后，重新启动测试 Agent 验证
4. 循环直到所有测试用例全部通过，状态变为 `all_passed`

### 4.4 测试用例生成 — test-case-designer Agent

**输入**：
- PRD 文档：`docs/requirements/{REQ-ID}/PRD.md`（requirement-designer 产出）
- API 摘要：`docs/requirements/{REQ-ID}/api-summary.md`（go-api-implementer 产出）
- 后端代码：`versus-server/`
- 前端代码：`versus-fe/`

**输出**：
- API 测试用例：`docs/requirements/{REQ-ID}/api-test-cases.json`（**必须**保存）
- E2E 测试用例：`docs/requirements/{REQ-ID}/e2e-test-cases.json`（**必须**保存）

**下游触发**：测试用例设计完成后，提示主会话**并行启动** `integration-test-runner` 和 `e2e-test-executor`：

```yaml
---AGENT-HANDOFF---
requirement-id: {当前REQ-ID}
status: completed
output: docs/requirements/{REQ-ID}/api-test-cases.json, docs/requirements/{REQ-ID}/e2e-test-cases.json
next-step: launch integration-test-runner AND e2e-test-executor in parallel
next-step-prompt-integration: "启动服务(后端8899/前端3000)并执行需求 {REQ-ID} 的 API 集成测试。测试用例路径: docs/requirements/{REQ-ID}/api-test-cases.json"
next-step-prompt-e2e: "启动服务(后端8901/前端3001)并执行需求 {REQ-ID} 的浏览器 E2E 测试。测试用例路径: docs/requirements/{REQ-ID}/e2e-test-cases.json"
---END-HANDOFF---
```

### 4.5 E2E 浏览器测试 — Chrome DevTools MCP

工具：**Chrome DevTools MCP**（直接安装插件到 DUCC）

**三类工具**：

- **导航与页面管理**：`navigate_page` / `new_page` / `list_pages` / `select_page` / `close_page`
- **页面内容获取**：`take_snapshot`（a11y 树 + uid）/ `take_screenshot` / `list_console_messages` / `list_network_requests` / `get_network_request` / `evaluate_script`
- **页面交互**：click / fill / type

**`e2e-test-executor` 三阶段**：

1. **环境准备** — 在独立端口（后端 8901 / 前端 3001，与集成测试 8899/3000 互不干扰）启动服务，通过 Chrome DevTools MCP 连接浏览器
2. **逐用例执行** — `navigate_page` → `take_snapshot` 定位元素 → 按步骤交互（click/fill/type）→ `take_screenshot` 留存 → 对比实际状态与预期
3. **结果判定** — 全部通过 → `summary.md` + 截图归档 → `all_passed`；有失败 → 按 Bug 类型分发给对应 Coding Agent 修复 → 循环直到全部通过

## 5. 文档更新 — 文档与代码一致性

**问题**：项目迭代 → 文档知识"熵增"。例：登录系统从 UUAP 升级到 Passport，但 `versus/CLAUDE.md` 没更新 → 严重影响 Agent 后续执行性能。

**方案**：用 Codex CLI `/goal`：

```
/goal 执行一次"文档与代码一致性同步"任务，直到满足完成条件
```

**目标**：
- 检查并更新 `CLAUDE.md` / `README.md` / `docs/**/*.md` / 其他 `*.md` / `*.markdown`
- 与当前代码、测试、配置、脚本、类型定义、API 路由、CLI 命令、环境变量和实际目录结构保持一致

**事实源优先级**：
1. 当前代码实现
2. 测试用例
3. `package.json` / `Makefile` / CI 配置 / 脚本
4. 类型定义 / API schema / 路由定义 / 配置 schema
5. `.env.example` 或配置示例
6. 实际目录结构

**硬性约束**：
- 只允许修改 Markdown 文档文件
- 不允许修改业务代码 / 测试 / 配置文件 / lock 文件 / 生成文件 / 二进制文件
- 不要为匹配文档而修改代码（**代码是事实源，文档是派生物**）
- 不要重写整篇文档，只做最小必要修改
- 不确定内容不要编造，列入"需要人工确认"
- 禁止修改 `.claude/` 目录下任何内容

**执行步骤**：

1. 建立项目事实清单（包管理器、启动命令、构建命令、测试命令、lint/typecheck 命令、目录结构、主要模块、API/路由/CLI、环境变量）
2. 扫描所有 Markdown 文档（排除 `.claude/`），识别与代码事实不一致
3. 对有明确事实依据的不一致，只更新 Markdown
4. 修改后运行 `git diff --name-only`（子模块也跑 `git -C <submodule> diff --name-only`）
5. 如发现非 Markdown 文件被修改，立即回滚
6. 输出最终报告

**完成条件**：
- 所有有明确代码事实依据的文档不一致都已修复
- 父仓库和所有子模块的实际文件级 diff 只包含 Markdown 文件
- 最终报告列出：修改了哪些文档 / 每个文档修正了什么 / 每项修正依据 / 仍需人工确认 / 确认无修改非文档文件

**结果**：8 分钟 + 约 435W token 完成升级。

**未来计划**（仿照 OpenAI）：起一个**后台服务**周期性地进行清理 + 自动合并到代码仓库：

> On a regular cadence, we have a set of background Codex tasks that scan for deviations, update quality grades, and open targeted refactoring pull requests. Most of these can be reviewed in under a minute and automerged.

## 6. 局限性

### 6.1 E2E 测试检测能力相对较弱

- 用例执行阶段耗时最长，E2E 决定用例执行时间
- 实践中：**E2E 很少报告缺陷，90%+ 缺陷由 API 接口测试发现**
- 例外：长任务名时任务类型出现元素遮挡的前端样式 BUG（人工发现）
- 根因：测试 Agent 对 Bug 认定比人类宽松 + 缺少对布局、美感等的评判
- **当前 Harness 只保证功能可用性，不保证页面符合人类审美**

### 6.2 需求改动存在遗漏

- 例：视频任务分类拆分升级时，Agent 实现遗漏了"模型管理"页面改动
- 根因：PRD 中就存在遗漏 → 人工审核时也遗漏（600+ 行文本审核成本大）

## 7. 总结

**量化结果**：4 个功能升级统计，**效率提升 4 倍**（与 OpenAI 的 10 倍有差距）

**意义**：从"人工调优代码"跨越到"治理 Agent 流水线"，**彻底打破前后端联调的沟通壁垒**

**ROI**：已极其可观

## 引用

- OpenAI: Harness engineering: leveraging Codex in an agent-first world
- Anthropic: Harness design for long-running application development
- Peter Pang: Why Your "AI-First" Strategy Is Probably Wrong
- Chrome DevTools MCP: https://github.com/ChromeDevTools/chrome-devtools-mcp
- 通过 Chrome DevTools MCP 增强 Agent 的浏览器操控能力（wangwei1237）
