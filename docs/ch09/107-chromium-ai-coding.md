# Chromium AI Coding 开发体系

> 📊 Level ⭐⭐⭐⭐⭐ | 16.4KB

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

这套体系的真正价值不在六个支柱各自的设计，而在支柱互相兜底的方式：Prompt 管"怎么做事"，Knowledge 管"去哪找依据"，Skills 管"特定任务的专业流程"，Eval 管"改了之后没退化"，Policy 管住人在闭环里的位置。以下按跨支柱机制拆解。

### 分层 Prompt 的抗失败逻辑

四层结构里每一层都在封堵一类具体的失败模式。第一层 common.minimal.md 针对"AI 自作主张"：构建前必须先确认构建目录（猜错的代价太大）、测试走 tools/autotest.py 而非提前调 autoninja、Stay on task 禁止顺手修无关的 TODO 和 code health、预提交只修自己改动引入的问题。第二层 8 步工作流封堵"投机性修复"：每遇到一个编译错误至少读取一个新文件，绝不做投机性修复，与"强制第一步完整审计源码并向开发者确认"一起，构成对幻觉的主要抑制手段。第三层平台模板封堵"上下文缺失"：桌面模板强制 AI 在动手前先读平台架构文档，理解 Views 框架的 Widget/View 层级与 Browser/Profile 所有权模型。第四层 Task Prompts 把高频环节封装成命令，降低现编指令的方差。维护机制服务于一致性：源文件 .tmpl.md 用 HTML 注释记录每条规则的设计意图，process_prompts.py 生成最终 .md，PRESUBMIT 检查确保两者同步——prompt 漂移在这里被当作构建失败处理，而不是文档债。这与 [Prompt Engineering Fundamentals](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/prompt-engineering-fundamentals.md) 的原则同源，但 Chromium 推进到了 PRESUBMIT 强制同步的工程强度。

### Skills 激活协议与 Projects 的工程化升级

Prompts 常驻加载、Skills 按需激活是核心的资源分配决策：只有用户请求命中某个 Skill 时才自动加载对应 SKILL.md，本质是把专家经验编译成可复用的 checklist——feature-flag-removal 就有 17 步完整流程。Projects 是 Skills 的长期工程化形态：modularize-chrome-browser 以 6 阶段流程（盘点→选择构建模式→生成 BUILD.gn→更新父级 BUILD→修复 include→验证提交）承载 344 行的 SKILL.md；code-health 用 Hub 调度子任务，走"自动发现→置信度评估→创建分支→修改→验证→提交 Gerrit"的流水线；modernization 的 AutoFixer 把错误信息喂给模型、验证后重试、最多 3 轮循环——修复循环的边界被显式写死，防止无限重试。跨支柱协同在官方拆解的分屏案例里最直观：一个功能拆成 6 个 CL，静态路由表触发平台规范、chromium-docs 动态搜索、8 步工作流与 histograms Skill 在不同 CL 中各自接管。"任务粒度 vs 工程粒度"的这层区分，与 [Skill Engineering Principles](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/skill-engineering-principles.md) 的设计原则互为印证。

### Eval 基础设施：把非确定性当工程常量处理

评估层回答的问题是：prompt 或 skill 改动后，如何确认基础设施没有退化。agents/prompts/eval/ 下 15 个用例各自独立成目录：prompt.md 模拟用户任务指令，eval.md 或 eval.promptfoo.yaml 写自动化断言，覆盖构建配置、测试生成、重构、修复测试、Fuzz、CL 描述、Feature Flag、代码搜索等日常场景。对 LLM 输出抖动的处理是关键设计：Pass@K 机制让同一用例运行 N 次、K 次通过即算成功，用统计口径消化非确定性；隔离执行靠 workers.py 用 btrfs 快照秒级创建独立 WorkDir，上层接 Swarming 分片、Docker 沙箱、ResultDB 上报与 Skia Perf 看板；Telemetry 从 Gemini CLI 的 OpenTelemetry 输出提取 token 用量与工具调用记录。prompt 改动在这里等价于代码改动——必须过 eval 才算完成，这套"评估先于迭代"的立场与 [Evaluation Harness Design](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/evaluation-harness-design.md) 一致。

### Agentic RAG 的检索取舍与落地节奏

检索层的工程取舍：chromium_docs.py 先用 keyword_index 倒排定位候选文档，再只读取候选的元信息打分，内存占用减少 90%+；打分权重为标题×4.0、路径×2.5、关键词×2.0、内容×1.0-1.5，近期修改文档小幅加分；索引"一次构建、持久复用"，只在不存在时才重建，覆盖 2000+ markdown 文件、首次构建约 30 秒。文档活在源码树里随代码同步版本化，与传统向量 RAG"预构建数据库+重新 embedding"的更新成本形成对照，也印证了 [Retrieval Augmented Generation Rag](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/retrieval-augmented-generation-rag.md) 中"检索层跟着知识载体走"的判断。时间线揭示了真实依赖：文档自 2015 年开始积累、跨越 11 年总计 6445 次提交，而 agents/ 目录 2025 年 7 月 10 日才创建，核心的 chromium-docs Skill 到 2026 年 1 月才由一位微软工程师提交——三层知识增强之所以可能，是因为权威文档文化早已存在，AI 层是其放大器而非替代品。同一套 Prompts/Skills 跨 Gemini CLI、Claude Code、GitHub Copilot 复用，从第一天起就是工具无关的。

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
- [Ai Coding Agent Memory System](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-coding-agent-memory-system.md)

- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/prompt-engineering-guide.md)
## 相关主题

- Agent 编排框架
- MCP 协议
- AI 安全与责任
→ [原文存档](https://mp.weixin.qq.com/s/sCmRKJjTpdB4k3145OzZMg)

---

