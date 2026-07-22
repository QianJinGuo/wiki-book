# 一个文件让 AI Coding 效率翻倍：AGENTS.md 实践指南

## Ch04.248 一个文件让 AI Coding 效率翻倍：AGENTS.md 实践指南

> 📊 Level ⭐⭐ | 10.1KB | `entities/一个文件让-ai-coding-效率翻倍agentsmd-实践指南.md`

## AGENTS.md 是什么

AGENTS.md 是一个简单的开放格式，用于指导 AI Coding Agent 在项目中工作。可以把它理解为 **给 AI 看的 README**——README.md 是给人类看的项目说明，AGENTS.md 则是给 AI Agent 看的项目指令，包含构建命令、编码规范、测试要求、安全注意事项等 AI 需要知道的上下文 。

### 格式统一化历程

| 工具 | 上下文文件 |
|------|------------|
| Claude Code | `CLAUDE.md` |
| Cursor | `.cursorrules` / `.cursor/rules` |
| Copilot | `.github/copilot-instructions.md` |
| Gemini CLI | `GEMINI.md` |
| Cline | `.clinerules` |
| AMP (Sourcegraph) | `AGENT.md` |
| OpenAI Codex | `AGENTS.md` |

2025 年 5 月，Sourcegraph 旗下的 AMP 率先提议统一标准，随后 OpenAI 宣布买下 agents.md 域名，提议用 `AGENTS.md`（复数）。最终 AGENTS.md 成为事实标准，由 Linux Foundation 下属的 Agentic AI Foundation 托管。截至 2026 年初，GitHub 上已有超过 6 万个开源项目使用这个格式 。

## 没有 AGENTS.md 的日子

痛点集中在以下几个方面 ：

- **前后端上下文割裂**：AI Coding 时只能打开一个仓库，改一个涉及前后端联动的功能需要在两个窗口之间来回切换，切换过程中 AI 丢失上下文
- **AI 不认识私域组件**：项目前端大量使用了私域组件库（ProTable、ProForm、ProAction 等），AI 工具的训练数据里没有，也查不到公开文档
- **AI 不知道项目的规矩**：每个项目都有自己的编码规约，存在于团队成员脑子里，但 AI 不知道
- **AI 不会启动项目、不会自测**：AI 改完代码之后不知道怎么构建、怎么启动、怎么验证

## 核心理念：地图，而非手册

AGENTS.md 的第一原则是 **渐进式披露**——它是一张地图，不是一本手册 。

**写进 AGENTS.md 的内容** ：
1. **AI 理解项目全貌的必要信息**——技术栈、仓库结构、核心模块、分层架构
2. **违反会直接导致问题的硬性规则**——编码规约、命名约定、禁止项

**不写进去的内容**：其他详细信息通过文档链接和引用指向对应的文档。

判断标准：如果 AI 不知道这条信息就会写出错误的代码，放 AGENTS.md；如果只是写出不够好的代码，放详细文档，AGENTS.md 里放链接 。

## 深度分析

**1. 渐进式披露原则直接解决了 AI 上下文的稀缺性问题**

AGENTS.md 的核心价值不是提供更多信息，而是提供**恰到好处的信息** 。当什么都重要的时候，什么都不重要。如果把所有内容都塞进 AGENTS.md，它会变成一个 5000 行的巨型文件，AI 的注意力被稀释，真正关键的规则反而容易被忽略。这个原则与 [Agent Harness Engineering Survey 2026](../ch05/116-harness-engineering.html) 中的 Map, not Manual 理念完全一致——AGENTS.md 只需要告诉 AI「文档在哪、源码在哪、什么时候该去看」，不需要把所有内容都搬过来。

**2. 痛点根源是「知识存在于人脑而非 AI 可读的地方」**

四个痛点（前后端割裂、不认识私域组件、不知道项目规矩、不会启动自测）的共同根源是：项目的知识和规范存在于人的脑子里，而不是存在于 AI 能读到的地方 。这意味着 AI Coding 效率低下的根本原因不是工具本身，而是项目对 AI 不友好。解决方案不是换工具，而是让项目变得对 AI 友好——通过 AGENTS.md 把散落在各处的知识集中起来。

**3. 仓库聚合策略从根本上解决了上下文割裂**

从三仓分离到 monorepo 的演进，本质上是在解决 AI 能看到的上下文范围问题 。AI 工具在同一个窗口中就能看到 Controller 接口定义和对应的前端 API 调用，实现真正的全栈编码。这种结构性改变比在 AGENTS.md 里写大量 cross-repo 说明要有效得多。对于无法一步到位改造的项目，脚本聚合是一个务实的折中方案。

**4. 参考项目引入策略重新定义了「文档」的边界**

对于闭源组件和内部项目，维护使用文档总是滞后于实现，而直接引入源码解决了这个问题 。**源码永远不会过时，它就是最准确的文档**。这个策略的深层含义是：当训练数据覆盖不到你的项目时，不应该依赖更多的文档，而应该让源码本身成为文档。

**5. 验证闭环是 AI Coding 从「看起来做完」到「真的可用」的关键**

验证闭环不仅仅是「代码能编译」，而是「功能能跑通」 。对于管控系统来说，验证手段主要是两类：后端用 curl 验证接口，前端用 Agent Browser 验证页面渲染和交互。Claude Code 主创 Boris Cherny 的观点是：当流程变成先完成任务、再自己验证、最后整理结果，Agent 的输出就不只是「看起来做完」，而是更接近真的可用。

**6. 自动化检查决定了规则的执行力**

AGENTS.md 中写的规则，如果没有自动化检查，AI 和人都会违反 。规则的优先级是：**能自动化检查的 > 写在 AGENTS.md 中的 > 口头约定的**。分层依赖检查脚本的错误信息格式（WHAT + WHY + HOW）不仅给人看，也给 AI 看——AI 读到这条错误信息后能直接按照 HOW 的指引去修复。

## 实践启示

**1. 从 200 行模板开始，用 Bad Case 驱动迭代**

不要试图一次写完 AGENTS.md。从实际使用中发现的 bad case 出发 ：AI 犯了一个错误 → 思考「如果 AGENTS.md 里多写一条 XX 规则，AI 是不是就不会犯这个错」→ 判断改哪里（全局规则 → AGENTS.md，模块细节 → 对应的 docs/）。这是最高效的迭代方式——AGENTS.md 不是一份写完就锁定的文档，它需要随着项目演进持续调整。

**2. 把复杂操作封装成一条命令，降低 AI 的认知负担**

在 AGENTS.md 中，所有环境变量统一配置在 `~/.<project>_env` 文件中，启动脚本自动 source 。配套一键启动脚本封装了 JDK 检测、优雅关闭旧进程、健康检查轮询等逻辑。AI 不需要理解这些细节，只需要调用一个命令。这是 AGENTS.md 中「快速命令」章节的核心价值——**把复杂的环境操作封装成一条命令**。

**3. 用 Makefile 提供统一入口，AI 只需记住命令类别**

通过 Makefile 提供统一入口 ：`make lint-arch` 检查分层依赖、`make lint-format` 检查格式、`make format` 修复格式、`make build` 构建、`make test` 测试。AI Agent 不需要记住每个检查命令的具体写法，只需要知道 `make lint-arch` 和 `make lint-format`。

**4. 为闭源组件和内部项目引入参考源码**

对于 AI 工具训练数据中不存在的闭源组件和内部项目，直接把源码放进来（通过 git submodule）是最有效的方式 。配合 ref 文档作为「地图」，告诉 AI 参考项目的整体结构和关键模块在哪里；参考项目源码作为「文档」，AI 需要细节时直接去读。

**5. 标注每个文件的「读者」，降低团队理解成本**

在推广 AGENTS.md 时，明确标注每个文件的目标读者 ：README.md 给人看、AGENTS.md 给 AI 为主、人可浏览、docs/*.md 给 AI 为主、人可参考、scripts/*.sh 人和 AI 都用。一句话总结：**脚本是人和 AI 共用的，AGENTS.md 和 docs/ 下的文档主要是给 AI 的上下文，人不需要刻意阅读但可以参考**。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/一个文件让-ai-coding-效率翻倍agentsmd-实践指南.md)

---

