# Chromium AI Coding 开发体系

## Ch09.051 Chromium AI Coding 开发体系

> 📊 Level ⭐⭐ | 11.3KB | `entities/chromium-ai-coding-development-system.md`

# Chromium AI Coding 开发体系

> [!summary] 核心洞察
> Chromium（3500 万行 C++ 代码）在源码仓库中构建了完整的 AI Agent 基础设施：AI Policy（人类全责）+ 四层 Prompt 分层组合 + 18+ Skills 按需激活 + 三层 Agentic RAG（静态路由表+动态搜索+MCP）+ Eval 回归测试 + Projects 大规模自动化。跨工具复用（Gemini CLI、Claude Code、GitHub Copilot）。

## AI Policy：责任边界

`agents/ai_policy.md` 定义了人与 AI 的责任边界：

- **自审义务：** 作者必须在发送 Review 前自行审查并理解所有代码，确保正确性/设计/安全性/风格达标
- **原创声明：** 无论是否使用 AI，必须声明代码为自己的原创作品
- **人类回复人类：** AI Agent 创建的内容收到人类反馈后，必须由人类操作者亲自回复

违规后果：提交不理解的代码→剥夺 Committer 权限→再犯封禁账号。

核心原则：**AI 是工具，不是作者——人类开发者对每一行代码负全责。**

## Prompts：四层分层组合架构

Chromium 使用本地 `GEMINI.md` 文件通过 `@` 引用组合不同层级 prompt，最终递归展开为完整的 System Instruction 注入 AI。

### 四层结构

| 层级 | 内容 | 说明 |
|------|------|------|
| **Layer 4** | Task Prompts | 一次性任务指令（`/cr:gerrit/cl-description` 等） |
| **Layer 3** | Templates | 平台模板（desktop/android/ios/rust） |
| **Layer 2** | common.md | 8 步标准编辑工作流 + 知识库引用 |
| **Layer 1** | common.minimal.md | 核心指令：构建/测试/编码/JNI/预提交规范 |

### 8 步标准工作流

所有代码编辑任务必须遵循：

1. **深度理解代码（强制第一步）：** 定位核心文件 → 完整审计源码 → 向开发者确认理解 → 反模式规避（绝不从函数名猜测行为）
2. **编写代码：** 只做需求要求的事
3. **编写/更新测试：** 优先向已有测试文件添加用例
4. **构建**
5. **修复编译错误：** 绝不投机性修复
6. **运行测试**
7. **修复测试错误**
8. **迭代（循环 4-7 直到通过）**

Step 1 是关键——强制 AI 先完整阅读所有相关文件，有助于减少幻觉。

### Prompt 维护机制

源文件是 `.tmpl.md`（含 HTML 注释记录设计意图），通过 `process_prompts.py` 自动生成最终 `.md`，PRESUBMIT 检查确保同步。

### Task Prompts 自定义命令

预定义在 `.gemini/commands/` 中，封装特定环节的完整操作步骤：

- `/cr:gerrit/fix-review-comments` — 自动修复 Review 意见
- `/cr:test/gen-gtests` — 自动生成单元测试
- `/cr:gerrit/cl-description` — 自动生成 CL 描述
- `/cr:git/pre-upload-checklist` — 一键预提交检查

## Skills：按需激活的专业模块

与 Prompts（始终加载）不同，Skills 只在用户请求相关时自动激活对应的 `SKILL.md`。

Chromium 已有 18+ 个 Skill：

- **feature-flag-removal** — 移除 Feature Flag（17 步完整 checklist）
- **fuzzing** — 编写 Fuzz 测试
- **histograms** — 管理 UMA 指标
- **chromium-docs** — 文档搜索
- **trace-analysis** — 性能 Trace 分析
- **cl-description** — 生成 CL 描述
- **git-cl-helper** — Git CL 操作
- **network-traffic-annotations** — 网络流量注解
- **nullaway** — NullAway 空指针检查
- **policy-creation** — 企业策略创建
- **webui-lit-migration** — WebUI Lit 迁移
- **utr** — 通用测试运行器

## Knowledge Base：三层 Agentic RAG

核心理念：**"Consult, then Answer"** — 强制 AI 不依赖自身通用知识，而是在回答前先去读源码中的权威文档。

### 第一层：knowledge_base.md — 静态路由表

任务→文档的 if-then 规则引擎：

- 进程间通信 → 查找对应的 `.mojom` 文件
- 异步/线程 → `docs/threading_and_tasks.md`
- 回调 → `docs/callback.md`
- 修改 blink 代码 → 必须使用 WTF 容器 + Oilpan GC，禁止 STL
- 用户偏好（pref）→ `components/prefs/README.md`
- UMA 指标 → `docs/metrics/uma/README.md`
- 调试路由（header not found / linker error / visibility error）有精细的逐步检查流程

### 第二层：chromium-docs Skill — 本地文档检索

Python 脚本 `chromium_docs.py` 在本地 JSON 索引中做字符串匹配+关键词匹配。索引覆盖 2000+ markdown 文件，首次构建约 30 秒。

**三分索引架构：**

| 索引 | 结构 | 优势 |
|------|------|------|
| `doc_index.json` | 主索引（标题/摘要/内容/关键词/分类/mtime） | 完整元信息用于相关性打分 |
| `keyword_index.json` | 关键词倒排索引 | O(1) 时间查找 |
| `category_index.json` | 13 个预定义分类索引 | 按分类快速聚合 |

搜索机制：title ×4.0、path ×2.5、keyword ×2.0、content ×1.0-1.5 + 近期修改加分。"一次构建，持久复用"策略。

### 第三层：MCP 扩展

通过 MCP 协议获取外部知识源：

- `blink-spec` — 通过 GitHub API 查询 W3C/CSS 规范 Issue
- `build-information` — 查询当前构建配置和状态
- `depot-tools` — 获取 depot_tools 命令帮助

### 与传统 RAG 对比

| 维度 | 传统 RAG | Chromium Agentic RAG |
|------|----------|---------------------|
| 检索方式 | 向量检索→返回 chunks | AI 自主判断→按规则读取→按需搜索 |
| 知识来源 | 预构建向量数据库 | 源码树原始文档（实时读取） |
| 路由机制 | 纯语义相似度 | 静态规则+动态搜索+MCP 外部查询 |
| 更新 | 需重新 embedding | 文档随代码同步，索引按需重建 |
| 理念 | 被动检索 | AI 主动查阅 |

## Eval：AI Agent 的回归测试

`agents/prompts/eval/` 下 15 个评估用例，覆盖构建配置、测试生成、重构、修复测试、Fuzz 测试、CL 描述、Feature Flag、代码搜索、构建等场景。

每个用例由 `prompt.md`（模拟用户任务指令）和 `eval.md`/`eval.promptfoo.yaml`（自动化断言）组成。

测试框架 `agents/testing/`：
- **Pass@K 机制：** 适应 LLM 输出的非确定性
- **隔离执行：** btrfs 快照秒级创建测试隔离
- **CI 级基础设施：** Swarming 分片并行、Docker 沙箱、ResultDB 上报、Skia Perf 性能看板
- **Telemetry：** OpenTelemetry 提取 token 用量和工具调用记录

## Projects：AI 驱动的大规模代码改造

`agents/projects/` 存放生产环境中运行的 AI 驱动大规模工程项目：

| 项目 | 目标 | 规模 |
|------|------|------|
| `modularize-chrome-browser` | 将 `chrome/browser/` 巨型单体构建目标拆分为独立模块 | 6 阶段流程，SKILL.md 344 行 |
| `code-health/` | 代码健康自动化治理 | Hub 调度中心 + 子任务（histogram-cleanup, lint-sync） |
| `modernization/` | 代码现代化自动修复 | AutoFixer Python 框架，最多 3 轮循环 |

Projects vs Skills：Skills 粒度为单个任务，Projects 面向长期工程治理，含完整项目结构（SKILL.md + 参考文档 + Python 脚本 + 测试）。

## 三大机制的协同关系

```
开发者需求 → Prompts（工作流引擎：定义"怎么做"）
           ├─ Knowledge（知识增强：告诉 AI "去哪找信息"）
           ├─ Skills（专业技能：告诉 AI "如何做特定任务"）
           └─ Task Prompts（快捷命令：加速关键环节）
```

## 历史积淀

Chromium 的文档从 2015 年开始积累，跨越 11 年，总计 6445 次提交。agents/ 目录于 2025 年 7 月 10 日创建，chromium-docs 核心 Skill 则是 2026 年 1 月由一位微软工程师提交的。

## 深度分析

### 1. Chromium 集成 AI 编码：浏览器作为开发环境
Chromium 的 AI 编码开发系统代表了一个趋势：浏览器从内容消费工具转变为开发环境——AI 编码助手直接嵌入浏览器，无需 IDE。

### 2. 对传统 IDE 的冲击
如果浏览器可以成为开发环境，传统 IDE 的差异化价值需要重新定义——调试器、Git 集成、插件生态仍需 IDE 级别的深度，但编码/测试/部署的轻量级工作流可能迁移到浏览器。

### 3. Web 标准对 AI 编码的影响
Chromium 作为 Web 标准的主要实现者，其 AI 编码系统可能影响 Web 标准本身——如 WebGPU for AI inference、WebAssembly for model serving。

### 4. 安全模型：浏览器沙箱中的 AI
浏览器沙箱为 AI 编码提供了天然的安全边界——AI 生成的代码在沙箱中执行，无法访问本地文件系统或网络。这与 Claude Cowork 的虚拟机隔离思路类似但更轻量。

### 5. 从本地优先到浏览器优先的范式
传统开发是"本地优先"（IDE 在本地），Chromium AI 编码是"浏览器优先"——代码在云端执行，浏览器仅做渲染和交互。这一范式对远程开发和协作场景更友好。

## 实践启示

### 1. 评估浏览器 AI 编码的适用场景
轻量级编码/原型验证/学习场景适合浏览器 AI 编码，但重型项目（大型代码库、复杂调试）仍需 IDE。

### 2. 关注 WebGPU + AI inference 的发展
WebGPU 使浏览器可以直接运行 AI 模型——这可能改变"AI 编码必须调用云端 API"的假设。

### 3. 安全优势：利用浏览器沙箱
浏览器沙箱为 AI 生成代码提供了"默认安全"的执行环境——在沙箱中验证后再部署到生产。

### 4. 不要忽视协作场景
浏览器 AI 编码的协作潜力（实时共享、无需安装）可能比单机效率更重要。

### 5. 追踪 Chromium 的 AI 编码 API 标准化
如果 Chromium 定义了 AI 编码的浏览器 API 标准，其他浏览器（Firefox/Safari）可能跟进——关注标准化进展。

## 相关实体
- [Ai Coding Agent Memory System](../ch04-288-ai-coding-agent-记忆系统)

- MOC
## 相关主题

- Agent 编排框架
- MCP 协议
- AI 安全与责任

---

