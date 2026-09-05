---
source_url: https://mp.weixin.qq.com/s/sCmRKJjTpdB4k3145OzZMg
title: "深入解析Chromium的 AI Coding 开发体系"
source: "腾讯程序员"
ingested: 2026-06-01
sha256: 0abb6faed595f9dc2a8b8268297f93dcd58c764ea8dd68484bd4af90cc36ea73
---

# 深入解析Chromium的 AI Coding 开发体系

**作者：** QQ浏览器团队
**发布日期：** 2026年6月1日

**背景：** Chromium 是全球最大的开源 C++ 项目之一，代码量超过 3500 万行。面对如此庞大的代码库，Chromium 团队在源码仓库 `chromium/src/agents/` 目录下构建了一整套 AI Agent 基础设施。

## 内容

Chromium 的 AI Coding 体系不只是"用 AI 写代码"，而是建立了一套完整的提示词管理、技能系统、知识库、评估体系和大规模自动化项目。

AI Coding 相关内容集中在 `agents/` 目录下，同时支持 Gemini CLI、Claude Code、GitHub Copilot 三种 AI 工具，核心的 Prompts 和 Skills 设计为跨工具复用。

核心原则：**AI 是辅助工具，人类开发者始终是最终责任人**。违反原则可能被剥夺提交代码的权限。

## 一、AI Policy：人类始终是最终责任人

`agents/ai_policy.md` 是整个 AI Coding 体系的底层约束：

| 规则 | 要求 | 违规后果 |
|------|------|----------|
| 自审义务 | 作者必须在发送 Review 前自行审查并理解所有代码 | 提交不理解的代码→剥夺 Committer 权限，再犯→封禁 |
| 原创声明 | 无论是否使用 AI，作者必须声明代码为自己的原创作品 | — |
| 人类回复人类 | AI Agent 创建的 CL/bug 收到人类反馈后，必须由人类操作者亲自回复 | 违反项目行为准则 |

推荐做法：在 CL 描述中说明 AI 工具的使用方式（附上 prompt）；通过设计文档+prompt 驱动 AI 生成的代码，可将设计文档一并提交。

## 二、Prompts：四层分层组合的提示词体系

Chromium 没有使用一个巨大的单体提示词，而是设计了四层分层组合架构，通过本地 `GEMINI.md` 文件用 `@` 引用组合不同层级的 prompt。

### 四层架构

```
第四层：Task Prompts（任务提示词）
  一次性任务指令，如 /cr:gerrit/cl-description
第三层：Templates（平台模板）
  desktop.md / android.md / ios.md / rust.md
第二层：common.md（完整工作流）
  8步标准编辑流程 + 知识库引用
第一层：common.minimal.md（核心指令）
  构建、测试、编码、JNI 等基础规范
```

System Instruction = GEMINI.md 递归展开后的内容（包含所有 prompt 层），User Prompt = 开发者实际输入的任务。

### 第一层：common.minimal.md — 核心指令

所有开发者共享的最底层指令，定义 AI 在 Chromium 中工作的基本规范：

- **构建：** 必须先确认构建目录和目标，未确认前禁止构建（AI 猜错构建目录的代价太大）
- **测试：** 使用 `tools/autotest.py` 运行测试，不要提前调用 `autoninja`（autotest 会自动构建）
- **编码：** Stay on task：不修无关的 TODO 和 code health；注释只写"为什么"不写"做了什么"
- **JNI：** 定义 Java↔C++ 的 JNI 方法识别规则
- **预提交：** 完成后运行 `git cl format` + `git cl presubmit`，只修自己改动引入的问题

### 第二层：common.md — 8 步标准工作流

所有代码编辑任务都必须遵循的 8 步流程：

1. **深度理解代码（强制第一步，不可跳过）：** 定位核心文件 → 完整审计（读取每个文件源码，总结控制流和所有权语义） → 向开发者确认理解 → 反模式规避（绝不从函数名猜测行为，必须读源码实现）
2. **编写代码：** 只做需求要求的事
3. **编写/更新测试：** 优先向已有测试文件添加用例
4. **构建**
5. **修复编译错误：** 为每个错误至少读取一个新文件，绝不做投机性修复
6. **运行测试**
7. **修复测试错误**
8. **迭代（循环 Step 4-7 直到全部通过）**

Step 1 是关键设计——强制 AI 在写代码之前先完整阅读所有相关文件并向开发者确认理解，有助于减少幻觉。

### 第三层：Templates — 平台模板

为不同平台（desktop、android、ios）提供特定的上下文和构建指令。桌面平台模板强制 AI 在动手之前先阅读平台架构文档（如 `chrome_browser_design_principles.md`、`views/overview.md`），确保理解 Views 框架的 Widget/View 层级、Browser/Profile 的所有权模型等核心概念。

### 第四层：Task Prompts — 自定义命令

在 `.gemini/commands/` 中预定义可直接调用的任务提示词：

| 命令 | 功能 |
|------|------|
| `/cr:gerrit/fix-review-comments` | 自动修复 Review 意见 |
| `/cr:test/gen-gtests` | 自动生成单元测试 |
| `/cr:gerrit/cl-description` | 自动生成 CL 描述 |
| `/cr:git/pre-upload-checklist` | 一键预提交检查 |
| `/cr:test/disable-test` | 禁用失败的测试 |

### Prompt 维护机制

源文件是 `.tmpl.md`（包含 HTML 注释形式的设计意图说明），通过 `process_prompts.py` 自动去除注释生成最终 `.md` 文件，PRESUBMIT 检查确保同步。每条 prompt 规则背后都有"为什么这样写"的记录。

## 三、Skills：按需激活的专业技能模块

Skills 是专家模块，与 Prompts（始终加载）不同，Skills 按需激活——只有当用户请求与某个 Skill 相关时，AI Agent 才自动加载对应的 `SKILL.md`。

Chromium 已有 18+ 个 Skill：

| Skill | 功能 |
|-------|------|
| feature-flag-removal | 移除 Feature Flag（17 步完整 checklist） |
| fuzzing | 编写 Fuzz 测试（含环境配置、代码模板、验证流程） |
| histograms | 管理 UMA 指标（元数据、所有权、过期时间） |
| cl-description | 生成 CL 描述 |
| git-cl-helper | Git CL 操作辅助 |
| chromium-docs | 文档搜索 |
| network-traffic-annotations | 网络流量注解 |
| nullaway | NullAway 空指针检查 |
| policy-creation | 企业策略创建 |
| webui-lit-migration | WebUI Lit 迁移 |
| trace-analysis | 性能 Trace 分析 |
| utr | 通用测试运行器 |

## 四、Knowledge Base：三层 Agentic RAG 架构

核心理念：**Consult, then Answer** — 强制 AI 不依赖自身通用知识，而在回答前先去读源码中的权威文档。

### 三层架构

```
第三层：MCP 扩展 — 外部知识源
  blink-spec（GitHub API）/ build-information 等
第二层：chromium-docs Skill — 本地文档检索工具
  2000+ md 文件索引，Python 脚本辅助定位
第一层：knowledge_base.md — 静态路由表
  任务关键词 → 文档路径的 if-then 规则引擎
```

### 第一层：knowledge_base.md — 静态路由表

核心机制：任务→文档的 if-then 规则引擎。示例路由：

- 进程间通信（browser-to-renderer）→ 查找对应的 `.mojom` 文件
- 异步操作或线程 → 读取 `docs/threading_and_tasks.md`
- 回调（base::OnceCallback）→ 读取 `docs/callback.md`
- 修改 `third_party/blink/renderer/` 下代码 → 必须使用 WTF 容器 + Oilpan GC，禁止 STL 容器
- 涉及用户偏好（pref）→ `components/prefs/README.md`
- 涉及 UMA 指标 → `docs/metrics/uma/README.md`
- 调试路由：header file not found → 验证 deps → 验证 #include → 重新生成 gn → 检查 gn desc → 检查 gn check

### 第二层：chromium-docs Skill — 本地文档检索工具

当静态路由无法覆盖时，AI 激活 chromium-docs Skill 进行动态搜索。

核心是一个 Python 脚本 `chromium_docs.py`，通过命令行调用，在本地 JSON 索引中做字符串匹配+关键词匹配，返回文档路径列表，AI 自行读取这些文档。

索引覆盖 `docs/**/*.md` 等路径下的 2000+ 个 markdown 文件，首次构建约 30 秒。

**三分索引架构（借鉴搜索引擎倒排索引+正排索引）：**

| 索引文件 | 结构 | 用途 |
|----------|------|------|
| `doc_index.json` | { "docs/threading.md": {title, summary, content, keywords, category, mtime} } | 主索引，存储完整元信息用于相关性打分 |
| `keyword_index.json` | { "mojo": [doc1, ...], "sandbox": [...], ... } | 关键词倒排索引，O(1) 时间查找 |
| `category_index.json` | { "ui": [...], "network": [...], ... } | 分类索引，按 13 个预定义分类归类文档 |

搜索机制：先通过 keyword_index 快速定位候选文档，然后只从 doc_index 中读取候选文档元信息进行打分。内存使用量减少 90%+。

搜索时纯字符串匹配+权重打分：标题匹配×4.0、路径匹配×2.5、关键词×2.0、内容×1.0-1.5，近期修改文档获小幅加分。

策略："一次构建，持久复用"。索引不存在时才重建。

### 与传统 RAG 的对比

| 维度 | 传统 RAG | Chromium 的 Agentic RAG |
|------|----------|----------------------|
| 检索方式 | 用户 query → 向量检索 → 返回 chunks | AI 自主判断 → 按规则读取 → 按需搜索 |
| 知识来源 | 预构建的向量数据库 | 源码树中的原始文档（实时读取） |
| 路由机制 | 纯语义相似度 | 静态规则表 + 动态搜索 + MCP 外部查询 |
| 更新方式 | 需要重新 embedding | 文档随代码同步，索引按需重建 |
| 核心理念 | 被动检索 | AI 主动查阅 |

## 五、Eval：AI Agent 的回归测试体系

`agents/prompts/eval/` 目录下有 15 个子目录，每个代表一个独立评估任务，覆盖日常开发典型场景：

| 用例 | 任务类型 |
|------|----------|
| adapt_builder | 构建配置 |
| add_browser_test_coverage | 测试生成 |
| add_gtest_coverage | 测试生成 |
| class_refactor | 重构 |
| fix_broken_test | 修复测试 |
| fuzzing | Fuzz 测试 |
| cl-description | CL 描述 |
| feature_flags_add | Feature Flag |
| find_function / search_class | 代码搜索 |
| build_file / build_target | 构建 |

### 用例结构

- `prompt.md` — 模拟用户输入的任务指令
- `eval.md` 或 `eval.promptfoo.yaml` — 评估标准（自动化断言配置）

### 测试框架 `agents/testing/`

核心组件：`eval_prompts.py`（主入口脚本）、`gemini_provider.py`（promptfoo 自定义 Provider）、`workers.py`（并行执行引擎，btrfs 快照秒级创建确保测试隔离）、`asserts/`（自定义断言脚本）。

关键设计：
- **Pass@K 机制：** 一个用例运行 N 次，只要 K 次通过就算成功，适应 LLM 输出的非确定性
- **隔离执行：** 每个测试在独立 WorkDir 中运行
- **CI 级基础设施：** 支持 Swarming 分片并行、Docker 沙箱隔离、ResultDB 上报、Skia Perf 性能看板
- **Telemetry 采集：** 从 Gemini CLI 的 OpenTelemetry 输出中提取 token 用量和工具调用记录

## 六、Projects：AI 驱动的大规模代码改造

`agents/projects/` 目录存放生产环境中运行的 AI 驱动大规模工程项目：

| 项目 | 目标 | 核心机制 |
|------|------|----------|
| `bedrock/modularize-chrome-browser` | 将 `chrome/browser/` 的巨型单体构建目标拆分为独立模块 | 6 阶段流程：盘点→选择构建模式→生成 BUILD.gn→更新父级 BUILD→修复 include→验证提交。SKILL.md 长达 344 行 |
| `code-health/` | 代码健康自动化治理框架 | Hub 调度中心 + 子任务（histogram-cleanup、lint-sync）。AI 自动发现→置信度评估→创建分支→修改→验证→提交到 Gerrit |
| `modernization/` | 代码现代化自动修复 | Python 框架 AutoFixer，将错误信息喂给 Gemini 自动修复，验证后重试，最多 3 轮循环 |

Projects 与 Skills 的差异：Skills 粒度为单个任务（如"移除一个 Feature Flag"），Projects 面向长期工程治理目标，包含完整 SKILL.md + 参考文档 + Python 脚本 + 自动化流水线。

## 七、具体案例：实现页面分屏

以"桌面版 Chrome 支持同一窗口内左右并排显示两个 Tab"为例，拆解为 6 个 CL：

1. 添加 Feature Flag（kSplitView）→ Prompts + Skills 协同
2. 修改窗口布局模型（BrowserView 支持双 ContentsWebView）
3. 实现分屏控制器（SplitViewController）→ Knowledge 深度参与
4. 添加 UI 入口（Tab 右键菜单 + 工具栏按钮）
5. 添加 UMA 指标追踪 → histograms Skill 主导
6. 编写 Browser Tests

三层知识增强机制同时工作：静态路由表触发平台规范 → chromium-docs 动态搜索 → Prompts 8 步工作流。

## 总结

Chromium AI Coding 体系建立在一条底线和三大机制的精密协同：

- **AI Policy** — 明确人与 AI 的责任边界
- **Prompts** — 四层分层组合架构，确保 AI 在任何场景下有正确行为规范
- **Skills** — 18+ 个按需激活的专业模块，将复杂任务编码为可复用 checklist
- **Knowledge Base** — 三层 Agentic RAG 架构，确保 AI 基于权威文档而非通用知识工作
- **Eval** — 15+ 评估用例 + 自动化测试框架，确保 AI Coding 基础设施持续迭代中不退化

Chromium 的文档从 2015 年开始积累，跨越 11 年，总计 6445 次提交。agents/ 目录于 2025 年 7 月 10 日创建，chromium-docs 核心 Skill 则是 2026 年 1 月由一位微软工程师提交的。