# Claude的17个能力背后：Agent正在从聊天框搬进工作流

## Ch04.377 Claude的17个能力背后：Agent正在从聊天框搬进工作流

> 📊 Level ⭐⭐ | 6.7KB | `entities/claude-17-capabilities-workflow-checklist-ruofei.md`

# Claude的17个能力背后：Agent正在从聊天框搬进工作流

## 核心洞察

Claude 的 17 个能力不是"隐藏功能合集"，而是在回答一个越来越实际的问题：**当 Agent 不再只是聊天框里的答题助手，而是要进入文档、浏览器、桌面、代码库和外部系统时，工作流本身要做哪些准备。**

工作链路：
1. 上下文从哪里来
2. 输出变成什么产物
3. Agent 能碰到哪些真实系统
4. 重复流程怎么沉淀
5. 推理、成本和权限怎么收住

## AI 工作流体检表

把 Claude 的能力压成五维体检表：

```
上下文是否有入口：Projects / Memory / Project instructions / CLAUDE.md
产物是否可审查：Artifacts / Files / Design
触达是否有权限：Chrome / Cowork / Connectors / Claude Code
流程是否可复用：Skills / Scheduled Tasks / workflow rules
成本风险是否可控：Permissions / Incognito / Extended Thinking / Prompt Caching / review
```

## 五维体检详解

### 第一维：上下文入口

**常见症状**：每次都要重讲背景，结论和风格容易漂

**先补**：Project instructions / WORKSPACE.md / SOURCE_INDEX.md

Claude 的 Memory、Projects、Project instructions、CLAUDE.md、Cowork projects 都和"记住上下文"有关，但定位不同：
- Memory：账号级或聊天历史形成的记忆
- Projects：项目空间
- CLAUDE.md：代码仓里的启动上下文
- Cowork projects：桌面任务里的本地项目

### 第二维：可审查产物

**常见症状**：只交一大段文字，复核成本高，下一次也不好复用

**先补**：Artifacts / 对比表 / 流程图 / 小工具

Artifacts、Files、Design 让 Claude 的输出不再只是一段文字，也可以变成表格、页面、图、文档、小工具，放在旁边看、改、复用。

### 第三维：触达权限

**常见症状**：一接网页、文件、连接器或代码库，团队就不放心

**先补**：PERMISSIONS.md，先分只读、可写、需确认、禁止

Chrome、Cowork、Connectors、Claude Code 一旦接到真实网页、本地文件、外部系统和代码库，问题就从效率延伸到权限、确认、日志和恢复。

### 第四维：过程资产

**常见症状**：同类任务反复复制 prompt，经验散在聊天记录里

**先补**：Skills / Scheduled Tasks

把稳定流程从聊天里拿出来，变成可复用、可调度、可交接的过程资产。

### 第五维：成本风险控制

**常见症状**：推理和成本没有控制面

**先补**：Extended Thinking / Prompt Caching / review

- Extended Thinking：管复杂任务的思考预算
- Prompt Caching：管重复上下文的缓存结构

这两个不该当成"打开就更好"的按钮。

## Claude vs Codex 的互补视角

| 维度 | Claude 这组能力 | Codex |
|---|---|---|
| 核心问题 | 日常工作流怎么变得足够清楚，让 Agent 进得来、做得下去、也交得出去 | 任务怎么持续跑下去 |
| 定位 | 日常工作流的补强包 | 任务持续执行的运行时 |
| 代表能力 | Projects、Memory、CLAUDE.md、Artifacts、Skills | durable threads、browser、automations、goals、memory |

## 若飞的方法论

不把功能清单当"隐藏技巧合集"收藏，而是把功能放回工作链里，看出它们各自的作用。

看到症状，就知道先补哪一层。

## 相关实体
- [Claude Code Agent Teams Task Decomposition Ruofei](ch03/073-claude-code.md)
- [Claude Code Agent Engineering](ch03/073-claude-code.md)
- [Claude Code开发负责人 为何放弃Rag而选择Agentic Search](ch03/073-claude-code.md)
- [Claude Code Agent View Huashu](ch03/065-claude-code-agent-view-huashu.md)
- [Anthropic Claude Code Large Codebase Best Practices 50002A089323](ch03/073-claude-code.md)

## 深度分析

### 1. 17 个能力的本质：从聊天框到工作流的基础设施
Claude 的 17 个能力不是"功能列表"，而是 AI Agent 从聊天框搬进工作流所需的基础设施清单——每个能力解决工作流的一个关键缺口：上下文入口、产物可审查性、系统触达权限、流程可复用性、成本风险可控性。

### 2. 五维体检表：Agent 工作流就绪度评估
将 17 个能力压缩为五维体检表是一个实用框架——任何组织在部署 Agent 前都应通过这五个维度的检查。这与 `Agent Development Crawl Walk Run Crewai Iterative` 的渐进式开发思路互补：Crawl 阶段满足上下文+产物维度，Walk 阶段满足触达+流程维度，Run 阶段满足成本+风险维度。

### 3. CLAUDE.md 作为上下文入口的关键角色
CLAUDE.md 是 Claude 工作流的"配置文件"——定义 agent 的行为边界、偏好和约束。与 Hermes 的 SKILL.md 模式一致：用 Markdown 文件定义 AI 的"操作系统配置"。

### 4. Skills 和 Scheduled Tasks：流程可复用性
Skills（可复用的 prompt+工具组合）和 Scheduled Tasks（定时执行）解决的是"一次成功的交互如何变为可持续的工作流"——这是 Agent 从"工具"进化为"系统"的关键。

### 5. 权限模型：从全开放到分级控制
Permissions 和 Incognito 模式解决了 Agent 的权限分级问题——不是所有任务都需要全部权限，按需授权是安全的基础。与 `Agent Security Three Step Sequence Harness Governance Identity Crewai` 的治理层对齐。

## 实践启示

### 1. 部署 Agent 前先跑五维体检
用五维体检表评估工作流就绪度——任何维度不通过都意味着 Agent 可能产生不可控行为。

### 2. CLAUDE.md 是必须的而非可选的
不要让 Agent 在没有配置文件的情况下运行——CLAUDE.md 定义了行为边界和偏好，是"默认安全"的基础。

### 3. 从低权限开始，按需升级
先用 Incognito/最小权限运行，验证行为后再逐步开放权限——避免一次性授予全部权限。

### 4. 每个成功交互都应沉淀为 Skill
如果一次 Agent 交互效果好，将其抽象为 Skill——使成功可复用，而非一次性。

### 5. Scheduled Tasks 是 Agent 的"自动驾驶模式"
定时任务使 Agent 从"按需响应"变为"主动执行"——这是 Agent 真正融入工作流的标志。

---

