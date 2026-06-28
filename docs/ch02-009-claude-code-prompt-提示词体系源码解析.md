## Ch02.009 Claude Code Prompt 提示词体系源码解析

> 📊 Level ⭐⭐ | 13.6KB | `entities/claude-code-prompt-source-analysis.md`

## 概述
FanOne 从源码角度解析 Claude Code 的 Prompt 提示词模块六大分层体系：Core System（静态/动态分离 + 优先级策略树）、Tool（自然语言行为协议）、Skill（渐进式加载 + Reading Guide）、Agent（强角色边界 SOP）、Context Management、Memory（四类分级存储）。与 [Claude Code 架构解析](ch01-571-claude-code-架构解析.html) 构成完整源码解读系列。

## 六大 Prompt 模块
| 模块 | 核心职责 | 关键设计 |
|------|---------|---------|
| **Core System Prompt** | 角色/边界/风格/风险原则 | 静态/动态分离 + P0-P4 优先级树 |
| **Tool Prompts** | 每个工具的用途/约束/边界 | 自然语言行为协议，不用代码补丁 |
| **Skill Prompts** | 专项能力包 + 渐进式展开 | Reading Guide + 语言检测 + doc 标签 |
| **Agent Prompts** | 四种角色（coordinator/worker/verifier/planner）| 强角色边界 SOP 模板 |
| **Context Management** | 压缩/总结/提取/恢复 | — |
| **Memory Prompts** | user/feedback/project/reference 四类存储 | 持久化文件 + MEMORY.md 索引 |

## Core System Prompt：优先级策略树
**buildEffectiveSystemPrompt** 保证多模式/多角色/多来源 prompt 共存时的覆盖关系：
| 优先级 | 类型 | 规则 |
|--------|------|------|
| **P0** | Override | 硬覆盖，其他所有 prompt 全部失效 |
| **P1** | Coordinator | coordinator mode 开启时，主线程变为调度者 |
| **P2** | Agent | mainThreadAgentDefinition 设置时；proactive mode 下追加而非替换 |
| **P3** | Custom | 用户 `--system-prompt` 传入 |
| **P4** | Default | 最终兜底 |
**静态/动态分离**：静态规则缓存（不频繁变化的部分），动态规则每次会话更新。两者有明确 boundary 划分。

## Tool Prompts：自然语言行为协议
CC 的 Tool Prompt 特点：

- **不用代码补丁**：把规则以自然语言放在 Prompt 里，充分相信大模型的理解能力
- **典型结构**：「这个工具是什么 / 什么时候该用 / 什么时候不该用 / 参数约束是什么」
- **BashTool 特殊案例**：Prompt 复杂到像 SOP（定义了 git 提交/PR 详细流程、禁止事项、Skill 替代部分 git 流程）—— 看起来是 Skill 的前身

## Skill Prompts：渐进式加载
**问题**：所有工具定义塞进上下文 → token 严重浪费
**Solution**：Skill 作为 Prompt 资产先注册，运行时不立刻展开，按需从 SkillTool 展开成上下文消息。

### Token 优化：Reading Guide + 语言检测
- `detectLanguage`：检测项目语言（Python → pyproject.toml/requirements.txt，Go → go.mod，Java → pom.xml）
- 只发**当前项目最相关的文档**，不发全部语言版本
- doc 标签标识文档来源，防止重复检索

### Skill Prompt 标准格式
```markdown
name / description / allowedTools / model / hooks / paths

## Reference Documentation
...Reading Guide...（文档索引）

## Included Documentation
<doc path="go/claude-api/README.md">...</doc>
<doc path="shared/tool-use-concepts.md">...</doc>

## When to Use
## Common Pitfalls
```

## Agent Prompts：强角色边界 SOP
### 主线程视角（如何使用 AgentTool）
Prompt 组成：Shared core + When NOT to use + Usage notes + Writing the prompt + When to fork + Examples

### Agent System Prompt 模板
```markdown

## 工作职责：负责什么 / 核心价值
## 强制边界：不能做什么 / 失败条件
## 可获取信息：输入什么 / 依赖什么上下文
## 执行过程：先做什么 → 再做什么 → 何时停止 → 何时升级
## 错误处理：常见错误行为 + 纠正方法
## 工具使用：优先用什么 / 什么不能碰 / 什么信号要验证
## 输出规范：汇报格式 / 必须字段 / verdict/critical files/summary
```
**原则**：用有逻辑的自然语言，不用 JSON/key-value 编码语言。

## Memory Prompts：四类分级存储
### 四类 Memory
| 类型 | 内容 | 写法 |
|------|------|------|
| **user** | 角色/目标/知识水平/偏好 | 直接描述 |
| **feedback** | 对 Agent 工作方式的反馈 | 规则 → Why → How to apply |
| **project** | 事实/决策/动机/截止时间/事故背景 | 事实 → Why → How to apply |
| **reference** | 看板/dashboard/Slack/Linear 入口 | 直接描述 |
**不进 Memory**：代码结构、git 历史、修 bug recipe、CLAUDE.md 内容、临时任务状态。

### 两步保存法
1. 每条 memory 写**单独文件** + frontmatter（name/description/type）
2. 入口加到 `MEMORY.md`（仅索引，不写正文）

### 读取时机
- 相关时读 / recall/check/remember 时必须读 / ignore memory 时当为空
- memory 可能过时——提到文件/函数/flag 时**先验证是否还存在**

## 深度分析
### 分层设计的工程哲学
六大模块的划分不是功能的简单堆砌，而是对"prompt 职责"的精细分解。每层解决不同粒度的问题：
| 层级 | 解决的问题 |
|------|-----------|
| Core System | 角色、边界、风格、风险原则 |
| Tool | 调用契约、使用条件、参数约束 |
| Skill | 知识分发、按需加载 |
| Agent | 协作结构、角色边界 |
| Context Management | 上下文容量管理 |
| Memory | 长期记忆与知识保留 |
这种分层使得每层可以独立演进，不互相耦合。

### 静态/动态分离的性能含义
静态规则缓存 → 减少每次会话的 token 消耗；动态规则按需 → 会话特定信息不冗余。两者之间有明确的 boundary 划分，使得缓存失效范围清晰可控。

### 优先级树的覆盖语义
P0 硬覆盖在极端情况下保留降级通道；P1/P2 的追加而非替换设计是关键亮点——proactive mode 下追加而非替换，保持了系统可扩展性。多模式/多角色/多来源 prompt 共存时，优先级策略树保证覆盖关系清晰。

### 自然语言行为协议的深意
"充分相信大模型的理解能力"是 CC 设计哲学的核心。不依赖代码补丁来约束模型行为，而是用自然语言描述工具语义：工具是什么 / 什么时候该用 / 什么时候不该用 / 参数约束是什么。这是一种"语义优先于结构"的设计哲学。

### 渐进式加载的成本控制
注册与展开的分离是关键技术：Skill 作为 Prompt 资产先注册，运行时不立刻展开，按需从 SkillTool 展开成上下文消息。Token 消耗从"全部"降到"按需"。语言检测 + Reading Guide 进一步减少不相关文档传输；doc 标签防止同一文档被重复引用。

### Agent 强角色边界的协作语义
七维度角色契约：工作职责 / 强制边界 / 可获取信息 / 执行过程 / 错误处理 / 工具使用 / 输出规范。coordinator/worker/verifier/planner 四种角色的语义距离清晰，各自的失败条件和升级条件明确。

### 四类 Memory 的知识分层
user → 关于"人"的知识；feedback → 关于"协作方式"的知识；project → 关于"事实"的知识；reference → 关于"外部系统"的知识。不进 Memory 的内容划定了边界（代码结构、git 历史、修 bug recipe、CLAUDE.md 内容、临时任务状态），防止记忆系统过载。

## 实践启示
### 1. 按职责分层设计 prompt 系统
不要把所有规则塞进一个 system prompt。区分：角色定义（Core）/ 工具约束（Tool）/ 知识资产（Skill）/ 协作协议（Agent）/ 上下文管理（Context Management）/ 长期记忆（Memory）。分层后每层可独立测试、独立迭代。

### 2. 优先级覆盖比追加更重要
多来源 prompt 共存时，明确优先级比简单追加更有价值。P0（硬覆盖）→ P1（Coordinator）→ P2（Agent追加）→ P3（Custom）→ P4（Default）的设计值得借鉴。这套机制保障了系统在多模式切换时的可预测性。

### 3. 静态缓存 + 动态按需是性能优化的标准模式
不频繁变化的部分（角色定义、风险原则、工具总则）缓存起来减少 token 消耗；会话特定的部分（memory、session guidance）每次会话更新。这套模式适用于任何需要控制 token 成本的场景。

### 4. 自然语言 > 代码补丁
在 prompt 中用自然语言描述工具的使用规范，而不是用代码/JSON 去限制模型行为。大模型对语义的理解远比结构化编码更灵活。信任模型的理解能力，比试图用参数定义约束它更有效。

### 5. 渐进式展开是 token 成本控制的关键
Skill/knowledge module 的思想：不是一次性加载所有知识，而是按需展开。需要建立一套"注册→展开"的机制：注册时只知道有哪些 Skill，展开时才注入具体内容。语言检测 + Reading Guide 是具体实现手段。

### 6. Agent 角色用 SOP 而非 JSON 定义
用有逻辑的自然语言描述角色，比用 JSON/key-value 编码更利于模型理解。每个角色应有：明确的工作职责 + 强制边界 + 可获取信息 + 执行过程 + 错误处理 + 工具使用指南 + 输出规范。七个维度构成完整的角色契约。

### 7. Memory 系统按类型分层，定期验证时效
Memory 分四类（user/feedback/project/reference）避免记忆混乱。每条 memory 写单独文件 + frontmatter + MEMORY.md 索引。Memory 内容可能过时——提到文件/函数/flag 时必须先验证是否还存在。

### 8. BashTool 的 SOP 化是工具设计的高阶形态
BashTool 的 prompt 已经复杂到像高风险工具专用操作 SOP（定义 git 提交/PR 详细流程、禁止事项、Skill 替代部分 git 流程）。这提示：当某个工具的行为复杂度超过简单描述时，应该用 SOP 而非简单 prompt 来定义它。

## 相关页面
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-prompt-source-analysis-fanone.md)
- [Claude Code Skills 实践与 Superpowers](ch01-408-claude-code-core-developer-lessons-action-space-design.html) — Skill 体系工程化实践
- Claude Code Subagent 上下文卫生 — Subagent = Harness 上下文隔离工具
- [Agent Memory 架构](ch04-146-how-ai-agent-memory-works.html) — 与 CC Memory 的对比
- [Obsidian + Claude Code 集成指南](ch03-002-obsidian-claude-code.html) — 五种集成策略

## 相关实体
- [Claude Code 源码解析：Skills/MCP/Rules 底层机制对比](ch07-006-claude-code-skills-mcp-rules-source-analysis.html)
- [两万字详解Claude Code源码核心机制](ch09-056-claude-code-routines-agent.html)
- [Claude Code 源码深度解析（13 核心机制）](ch01-231-ai.html)
- [Claude Code 源码拆解：从启动到多 Agent 扩展层](ch01-240-claude-code-源码拆解-从启动到多-agent-扩展层.html)
- [Claude Code 接入自建开源模型：企业私有化与降本实践 | 亚马逊AWS官方博客](ch09-069-deepseek-code-harness.html)
- [Claude Code 设计原则与对照分析](ch01-403-claude-code-设计原则与对照分析.html)
- [Claude Code vs OpenClaw 记忆系统 — 向量数据库必要性反思](ch01-342-读完-claude-code-和-openclaw-的-memory-源码-我对-agent记忆需要向量数据库-这件.html)
- [Agent Memory System 设计指南](ch04-087-boris-cherny-ide-agent.html)
- [SkillClaw](ch04-312-agent-moltbook.html)
- [Skill 系统：Agent 如何把经验沉淀成可复用能力](ch04-135-agent-evolution-four-stages-and-six-dimensions-alibaba-clo.html)
- [深度解析 OpenClaw 在 Prompt / Context / Harness 三个维度中的设计哲学与实践](ch05-014-harness-到底是什么-看看-openclaw-hermes-claude-code-的演绎吧.html)
- [AI Agent 记忆系统架构](ch04-145-how-ai-agent-memory-works.html)
- [从Vibe Coding到Agentic Engineering：重构后台开发全流程 — 腾讯技术工程](ch04-191-8-ui-ai-agent-skills.html)
- [Agent Memory System Design](ch04-451-agentbrowser.html)
- [KAIROS — Claude Code 常驻协作范式](ch03-002-obsidian-claude-code.html)
- [Thin Harness Fat Skills](ch05-063-ai-forgetrain-megatron.html)
- [Hermes Agent 记忆系统深度拆解](ch04-068-hermes-agent-记忆系统深度拆解.html)
- [Code as Agent Harness 综述](ch09-046-code-as-agent-harness.html)
- [AI Agent 工程师能力地图](ch04-139-apache-rocketmq-5-5-0-litetopic-ai-agent.html)
- using claude
- MOC

---
