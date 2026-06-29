# Harness 模式 6-SubAgent 实战 — 17哥 versus 大模型评测平台（Git Submodule + Agent Handoff + Chrome DevTools MCP）

## Ch05.025 Harness 模式 6-SubAgent 实战 — 17哥 versus 大模型评测平台（Git Submodule + Agent Handoff + Chrome DevTools MCP）

> 📊 Level ⭐⭐ | 17.0KB | `entities/harness-engineering-practical-17ge-versus-6-subagent.md`

## Harness 模式 6-SubAgent 实战 — 17哥 versus 大模型评测平台

17哥（极客之家 geekhome / 大模型评测平台团队）将 Vibe Coding 升级为 Harness 模式的工业实践。**核心工程动作**：

1. **Git Submodule 整合前后端**为单仓（避开暴力合并）
2. **6 个专业 Sub-Agent** 全流程协作（需求→前后端→集成测试→E2E）
3. **Agent Handoff YAML 协议** — 任务状态在 Agent 间安全、自动化流转
4. **Chrome DevTools MCP** — 浏览器 E2E 自动化
5. **文档与代码一致性自动同步**（Codex CLI `/goal`）

**量化结果**：1 天 → 约 2 小时，**效率提升 4 倍**（4 个功能升级统计）。vs OpenAI 10x 仍有差距。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/harness-engineering-practical-17ge-versus-6-subagent.md)

## 1. Vibe Coding → Harness 范式转变

**Vibe Coding = "AI 代写代码，人来统筹状态"**
- 唯一变化：代码实现由人变成 AI
- 新功能拆解、模块联调、代码迭代调整还都是人来驱动
- 人的产物不再是代码，而是自然语言

**Harness = "代码库即唯一事实，Agent 自治流转状态"**
- 任何 Agent 不能 in-context 访问的东西，等于不存在
- 仓库内、版本化的制品（代码、markdown、schemas、可执行计划）→ Agent 唯一可看
- Google Docs / 聊天记录 / 人脑知识 → Agent 无法访问

**痛点**：Vibe Coding 模式下"调整页面元素"反复和 DUCC（豆包）沟通 2+ 小时，"越改越糟"问题严重。]

## 2. 单仓重构 — Git Submodule 方案

**已有结构**：`versus-fe`（React） + `versus-server`（Go）两个独立仓库 + 各自 `CLAUDE.md` + 跨仓库知识在"人脑中"

**为何不暴力合并**：目录结构 / CI 任务 / 上线方式都要大幅调整

**方案 — Git Submodule**：新建主仓 `versus`，前后端以子模块形式整合：

```
versus/                              # 父仓库
├── versus-server/                   # 服务端子模块 (Go + Gin)
│   └── CLAUDE.md
├── versus-fe/                       # 前端子模块 (React + Vite)
│   └── CLAUDE.md
├── scripts/                         # 仓库管理脚本
│   ├── setup.sh
│   ├── pull-all.sh
│   ├── status.sh
│   └── sync-user-config.sh
├── .claude/                         # Claude Code 配置 + Agent 定义
│   ├── settings.json
│   ├── settings.local.json          # 本地工具权限（不入库）
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
│   └── requirements/{REQ-ID}/
├── .gitmodules
├── CLAUDE.md                        # 项目整体知识（作战地图 + 协作规则 + 产品背景 + 全局约束）
├── dev.sh
├── README.md
└── FEATURES.md
```

**CLAUDE.md 角色分工**：
- `versus/CLAUDE.md` = 跨前后端、跨 Agent、跨需求都需要知道的全局知识
- `versus-fe/CLAUDE.md` / `versus-server/CLAUDE.md` = 前端 / 服务端局部知识

**理念**："一切皆在代码库，代码库之外，别无他物"]

**Submodule 复杂度**通过 DUCC 实现仓库管理脚本（"一句话更新主仓库、子仓库的代码" / "一句话部署前后端代码"）解决。

## 3. 6 Sub-Agent 全流程协作

### 两个问题（Anthropic 博客提到）
- **上下文焦虑**：模型感知到即将达到上下文上限 → 提前结束任务
- **自视甚高**：智能体评价自己工作时自信大加夸赞

### 6 个 Agent 拆分

| Agent | 角色 | 产出 |
|---|---|---|
| `requirement-designer` | 需求分析师 | PRD 文档 |
| `go-api-implementer` | 后端开发 | Go API 代码 |
| `frontend-engineer` | 前端开发 | React 代码 |
| `test-case-designer` | 测试用例设计 | API + E2E JSON |
| `integration-test-runner` | API 集成测试执行 | 集成测试报告 |
| `e2e-test-executor` | 浏览器 E2E 测试执行 | E2E 报告 + 截图 |

**闭环流转**：除 PRD 阶段需人工审核外，其他阶段不需人工介入。前后端开发由 Harness 自治流转，**避免联调沟通成本**。]

## 4. Agent Handoff 协议

**问题**：Sub-Agent 拆分带来"如何在 Agent 间安全、结构化地转移控制权与上下文状态"。否则"哑巴交流" → 任务断连 / 状态错乱 / 故障恢复 / 链路追溯异常。

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

**实例**（PRD 完成等审核）：

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

**实现要点** — Handoff 块内容**直接写入主 session**（不写入本地文件，避免引入过多存储结构增加复杂度）。]

### Bug 修复流程（`has_bugs` 状态）

1. 主会话解析 `bugs` 列表，确定 Bug 类型（后端/前端）
2. 分发给对应 Agent 修复
   - 后端 Bug → `go-api-implementer`
   - 前端 Bug → `frontend-engineer`
3. 修复完成后，重新启动测试 Agent 验证
4. 循环直到所有测试用例全部通过，状态变为 `all_passed`

## 5. 测试用例设计 — test-case-designer

**输入**：
- PRD 文档（requirement-designer 产出）
- API 摘要（go-api-implementer 产出）
- 后端 / 前端代码

**输出**（**必须**保存）：
- `docs/requirements/{REQ-ID}/api-test-cases.json`
- `docs/requirements/{REQ-ID}/e2e-test-cases.json`

**下游触发** — 测试用例设计完成后，**并行启动** integration + e2e Agent：

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

## 6. E2E 浏览器测试 — Chrome DevTools MCP

工具：**Chrome DevTools MCP**（直接装到 DUCC）

**三类工具**：
- **导航与页面管理**：`navigate_page` / `new_page` / `list_pages` / `select_page` / `close_page`
- **页面内容获取**：`take_snapshot`（a11y 树 + uid）/ `take_screenshot` / `list_console_messages` / `list_network_requests` / `get_network_request` / `evaluate_script`
- **页面交互**：click / fill / type

**`e2e-test-executor` 三阶段**：
1. **环境准备** — 独立端口（后端 8901 / 前端 3001，与集成测试 8899/3000 互不干扰）启动服务，Chrome DevTools MCP 连接浏览器
2. **逐用例执行** — `navigate_page` → `take_snapshot` 定位元素 → 按步骤交互（click/fill/type）→ `take_screenshot` 留存 → 对比实际状态与预期
3. **结果判定** — 全过 → `summary.md` + 截图归档 → `all_passed`；有失败 → 按 Bug 类型分发修复 → 循环直到全过]

## 7. 文档与代码一致性 — `/goal` 自动化

**问题**：项目迭代 → 文档知识"熵增"。例：登录系统从 UUAP 升级到 Passport，但 `versus/CLAUDE.md` 没更新。

**方案 — Codex CLI `/goal`**：

```
/goal 执行一次"文档与代码一致性同步"任务，直到满足完成条件
```

**事实源优先级**：
1. 当前代码实现
2. 测试用例
3. `package.json` / `Makefile` / CI 配置 / 脚本
4. 类型定义 / API schema / 路由定义 / 配置 schema
5. `.env.example` 或配置示例
6. 实际目录结构

**硬性约束**：
- 只允许修改 Markdown 文档文件
- 不允许修改业务代码 / 测试 / 配置文件 / lock 文件
- **不要为匹配文档而修改代码**（代码是事实源，文档是派生物）
- 不要重写整篇文档，只做最小必要修改
- 不确定内容不要编造，列入"需要人工确认"
- 禁止修改 `.claude/` 目录下任何内容

**完成条件**：
- 所有有明确代码事实依据的文档不一致都已修复
- 父仓库和所有子模块的实际文件级 diff 只包含 Markdown 文件
- 最终报告列出：修改了哪些文档 / 每项修正依据 / 仍需人工确认

**结果**：8 分钟 + 约 435W token 完成升级。]

**未来计划**（仿照 OpenAI） — 后台 Codex 任务周期清理 + 自动开 PR：

> On a regular cadence, we have a set of background Codex tasks that scan for deviations, update quality grades, and open targeted refactoring pull requests. Most of these can be reviewed in under a minute and automerged.

## 8. 局限性与教训

| 局限 | 数据 | 根因 |
|---|---|---|
| E2E 测试检测能力弱 | 90%+ 缺陷由 API 测试发现 | 测试 Agent 对 Bug 认定比人类宽松 + 缺少布局/美感评判 |
| 需求改动遗漏 | 视频分类拆分时遗漏"模型管理" | PRD 本身遗漏 → 人工审核 600+ 行成本大 |

**当前 Harness 只保证功能可用性，不保证页面符合人类审美。**]

## 关键 takeaway

1. **Git Submodule 而非暴力合并** — 改造已有 2 仓为单仓的工程化路径
2. **CLAUDE.md 角色分层** — 主仓全局作战地图 + 子仓局部知识
3. **6 Agent + 状态机** — requirement → API → FE → test → integration → e2e 全流程
4. **Agent Handoff YAML 协议** — Sub-Agent 间"哑巴交流"解决方案；写入主 session 而非本地文件
5. **Chrome DevTools MCP** — 浏览器 E2E 自动化的标准协议层
6. **独立端口并行执行** — 集成测试 8899/3000，E2E 8901/3001，互不干扰
7. **事实源优先级** — 文档派生物地位，代码/测试/Makefile 优先
8. **量化 ROI** — 4 个功能升级验证 4x speedup（vs OpenAI 10x）

## 与既有相关实体的关系

| 实体 | 关系 | 区分 |
|---|---|---|
| `harness-engineering-framework` (concept) | Harness Engineering 概念框架 | Anthropic 视角通用框架；本篇工业实践 + 6-SubAgent 具体设计 |
| `agentic-harness-engineering-ahe` | AHE 自动优化 | 复旦/北大 AHE 学术方法；本篇工业流水线 |
| `agent-engineering-principles-architecture-practice` | Agent 工程原则 | 通用原则 + OpenClaw；本篇具体 6-SubAgent 拆分 |
| `claude-code-multi-agent-collaboration-多智能体协作体系设计` | 多智能体协作 | Claude Code 视角；本篇 DUCC + Codex 视角 |
| `claude-code-7-layer-memory-architecture` | 7 层 Memory 架构 | 概念；本篇应用了 MEMORY.md per-agent |
| `erik-schluntz-vibe-coding-in-production` | Vibe Coding 生产实践 | Erik 视角；本篇 Vibe → Harness 升级 |
| `karpathy-vibe-coding-to-agentic-engineering` | Karpathy Vibe→Agentic 转型 | 范式论述；本篇具体案例 |

## 引用

- OpenAI: [Harness engineering: leveraging Codex in an agent-first world](https://openai.com)
- Anthropic: [Harness design for long-running application development](https://anthropic.com)
- Peter Pang: Why Your "AI-First" Strategy Is Probably Wrong
- Chrome DevTools MCP: https://github.com/ChromeDevTools/chrome-devtools-mcp
- wangwei1237: 通过 Chrome DevTools MCP 增强 Agent 的浏览器操控能力
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/harness-engineering-practical-17ge-versus-6-subagent.md)

## 相关实体

- MOC

---

