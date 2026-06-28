## Ch02.007 Hermes Agent 深度解析（阿里云/飞樰）

> 📊 Level ⭐⭐ | 14.6KB | `entities/hermes-agent-deep-dive.md`

## Overview
飞樰（阿里云开发者）对 Hermes Agent 的深度源码解析文章，从 Self-Evolving / Prompt Engineering / Context Engineering / Harness Engineering 四个维度展开，附 Agent 演进三阶段框架。
原文：https://mp.weixin.qq.com/s/2xFei8dMx99lc-iyrZZrww

## Self-Evolving：内外双路径驱动
### 路径一：动态 Skill 沉淀（"外挂式"进化）
**核心**：Skill 从"静态调用"变为"动态生成"。OpenClaw/Claude Code 的 Skill 是用户预编写或下载安装，Hermes 则在每次任务完成后自动复盘，将试错经验抽象为结构化 Skill 文件包。
**触发机制**：`_iters_since_skill` 计数器连续 10 轮无 Skill 操作 → 系统提醒 Agent 整理经验。
**后台审查 Agent**：主 Agent 回复后，异步 Fork 轻量级审查 Agent，从三个维度复盘：

- **记忆审查**：提炼值得长期保留的关键经验 → 存入长期记忆库
- **技能审查**：判断任务解决路径是否值得固化为可复用 Skill
- **综合审查**：反思优化空间和潜在错误模式
→ "前台即时响应、后台异步进化"

### 路径二：RL 训练闭环（"内功式"进化）
Skill 沉淀是"记笔记"，RL 训练是"练内功"——改变模型权重，真正内化能力。
**完整闭环**：
| 阶段 | 关键实现 |
|------|---------|
| 任务定义 | 用户指定目标（"提升数学推理能力"等） |
| 轨迹捕获 | batch_runner.py 并行生成 ShareGPT 格式轨迹；默认 Claude Opus 4.6 Teacher；工具集随机采样防死记硬背；零推理过滤 |
| 轨迹压缩 | 精炼到 15250 Tokens；保护头部（任务定义）+ 尾部（最后4轮）+ 中间 LLM 摘要 |
| 渐进训练 | 小步快跑；验证可行性后再大规模训练 |
| 自动评估 | WandB 指标；未达标则反馈调整后继续迭代 |
| 固化 | 效果达标固化模型版本 |
**GRPO 算法**（DeepSeek R1）：同问题生成 8~16 个回答 → 奖励函数打分 → 学习多产出高分回答。无需单独训练 Reward Model。
**奖励函数设计原则**：

- 组合 3~5 个奖励维度：正确性（2.0最高）、格式规范（0.5）、渐进格式（0~0.5）
- 给部分分（如写了开标签但没闭合也给 0.125 分）
- 可执行真实验证（编译代码、读文件、访问网络）
**为什么不直接用用户对话数据做 RL**：
1. 隐私问题
2. 用户对话质量参差不齐，直接训练会让模型变差
3. 正确做法：人工导入 + Teacher Model 质量把关

## Prompt Engineering
### 工具使用强制指导（因"材"施教）
| 模型 | 问题 | 动态注入指令 |
|------|------|------------|
| Claude | 训练充分 | 无需额外提醒 |
| GPT/Codex | "只说不做" | 必须用工具执行，禁止幻觉 |
| Gemini/Gemma | 需要规范 | 绝对路径、先读后改、并行调用 |

### 生态兼容性（极低迁移成本）
- **OpenClaw 生态**：直接读取 AGENT.md、SOUL.md、USER.md
- **AI Coding 规范**：支持 CLAUDE.md、.cursorrules、.cursor/rules/*.mdc
- **多平台 IM**：WhatsApp、Slack 等适配

## Context Engineering
### 压缩：相对比例阈值 vs 绝对阈值
| | OpenClaw | Hermes |
|--|---------|--------|
| 触发 | 绝对 Token 数（如 18K） | 相对窗口比例（如 50%） |
| 优势 | 简单 | 自适应不同模型窗口大小 |
**裁剪策略**：保护头部（系统指令+任务定义）+ 保护尾部（最后几轮）+ 中间 LLM 摘要

### Memory：内外双层混合架构
**内部记忆**：

- Markdown 文件（MEMORY.md/USER.md）记录长期静态事实
- SQLite 存储所有每日对话历史 → 为 RL 训练提供原始轨迹素材
**外部记忆**：原生支持 Mem0、Honcho、Hindsight、Supermemory → 跨框架记忆流转

### 上下文注入：@ 语法
```bash
@file:main.py              # 注入完整文件
@file:src/utils.py:10-20   # 注入指定行
@folder:src/               # 列出目录树
@diff                      # git diff
@git:3                     # 最近3次提交
@url:https://...           # 抓取网页转 Markdown
```
本质：**工具调用 → 上下文预加载**，省去"是否调用工具"的中间推理环节，响应更快、Token 消耗更低。

## Harness Engineering
### 全生命周期 Hook
`on_agent_start` / `on_tool_call` / `on_tool_result` / `on_agent_end` / `on_turn_start` / `on_pre_compress` / `on_memory_write` / `on_delegation` / `on_session_end`

### 14 种错误分类与自愈
| 错误类型 | 含义 | 典型场景 |
|---------|------|---------|
| auth | 认证失败 | API Key 无效 |
| billing | 账单问题 | 额度用完 |
| rate_limit | 请求过多 | 被限流 |
| timeout | 请求超时 | 网络问题 |
| context_overflow | 上下文溢出 | 消息太长 |
| ... | ... | ... |
| unknown | 未知错误 | 需要重试 |

### 子 Agent 沙箱隔离
```python
DELEGATE_BLOCKED_TOOLS = {
    "delegate_task",  # 防递归委派
    "clarify",       # 防嵌套提问
    "memory",        # 防操纵记忆
    "send_message",  # 防消息劫持
    "execute_code"   # 防权限升级
}
MAX_CONCURRENT_CHILDREN = 3
MAX_DEPTH = 2
```

### 安全护栏
- 防 Prompt 注入攻击
- Skill 文件加载前静态安全扫描

## Agent 演进三阶段
| 阶段 | 代表 | 特点 |
|------|------|------|
| 被动 Agent | 早期 | 一问一答，无法执行复杂长周期任务 |
| 自主 Agent | OpenClaw / Claude Code | 自主规划 + 工具调用 + 复杂任务 |
| **自进化 Agent** | **Hermes** | 自主执行 + 执行中学习 + 越用越强 |

## Related
- [Hermes Agent](ch04-418-hermes-agent.html) — Nous Research 开源框架（4万+ Stars），核心亮点自进化
- OpenClaw 架构 — Hermes 竞品和参照系，Prompt/Context/Harness 设计高度相似
- [Claude Code 架构](ch01-571-claude-code-架构解析.html) — 同为 Agent 深度解析系列参照
- MemOS Hermes 插件 — 第三方记忆插件，与 Hermes 原生 Memory 形成互补
- Agent Skill 编写指南 — Skill 格式规范，与 Hermes 动态 Skill 沉淀机制高度相关
- [原始文章存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/hermes-agent-deep-dive-alibaba.md)
- Harness Engineering 七层框架
- [Claude Code vs OpenClaw 记忆系统 — 向量数据库必要性反思](ch01-342-读完-claude-code-和-openclaw-的-memory-源码-我对-agent记忆需要向量数据库-这件.html)
- [Harness Engineering：AI 从"聪明"到"可靠"的第三代工程范式](ch05-010-harness-engineering-ai.html)
- [Agent 原理、架构与工程实践](ch04-435-openclaw-3-2w.html)

## 深度分析
### 自进化架构的本质：记忆即智能
Hermes 的 Self-Evolving 颠覆了传统 Agent 的设计范式。传统 Agent（如早期 ReAct 框架）的"智能"是静态的——模型参数固定，工具集固定，只能依赖输入提示词中的零星示例来适应新任务。而 Hermes 将"进化"本身工程化为两个正交路径：**外挂式技能沉淀**和**内功式 RL 训练**，形成类似生物体的外显记忆 + 内隐学习双重机制。
这一设计的深层逻辑在于：模型权重的改变（RL）和显式知识的存储（Skill）是互补的。前者慢但泛化深，后者快但依赖检索。Hermes 通过 `_iters_since_skill` 计数器把技能生成变成一个自驱动的过程，而非用户手动触发，这解决了 OpenClaw/Claude Code 用户"想用 Skill 但懒得写"的根本痛点。

### GRPO 的工程意义：去 Reward Model 化
DeepSeek R1 提出的 GRPO 最大的工程贡献是**证明了 Reward Model 可以被绕过**。传统 RLHF 需要训练一个 Reward Model 来评价回答质量，这引入了额外的建模误差和训练成本。GRPO 让同一问题的多个采样回答相互竞争，直接用奖励函数打分来驱动优化。
对 Hermes 的实际影响：团队不需要维护一套单独的 Reward Model 标注流程，奖励函数可以直接对接可执行验证（编译、运行测试、访问网络），这使得奖励信号本身是**可信赖的**，而不是另一个模型的"猜测"。这解释了为什么 Hermes 的奖励函数设计强调可执行真实验证——它的奖励信号质量直接决定了训练效果。

### 上下文压缩的相对比例策略：窗口多样性的解法
OpenClaw 用绝对 Token 数（18K）触发压缩，在上下文窗口较小的模型上表现尚可，但遇到 200K 窗口的 Claude 或 Gemini 时，50% 触发阈值意味着要等到 100K Tokens 才压缩——这显然是浪费。Hermes 采用相对窗口比例（如 50%），自适应特性让它在任意窗口大小下都能保持一致的记忆管理策略。
这背后还有一个更本质的设计哲学：**让 Agent 自己管理自己的注意力资源**。OpenClaw 把压缩时机交给用户配置，Hermes 则内化为系统的自适应的行为。

### Harness Engineering 的护栏价值
14 种错误分类 + 子 Agent 沙箱隔离，是 Hermes 在**生产级可靠性**上的关键投入。大多数开源 Agent 演示只处理成功路径，真实环境中 auth 失败、rate_limit、context_overflow 才是常态。Hermes 的错误自愈不是简单重试，而是**按错误类型分类处置**——认证失败和额度用完的处理策略完全不同，这比"出错了就重试三次"的简单逻辑可靠得多。

## 实践启示
### 立即可用的设计模式
**1. 后台异步复盘机制值得借鉴**
主 Agent 同步响应 + 后台审查 Agent 异步进化的前台/后台分离模式，可以直接移植到任何需要"快速响应 + 持续优化"的 Agent 系统。实现要点：审查 Agent 必须是轻量的（只做分析不执行任务），且与主 Agent 完全解耦。
**2. Skill 自动生成的触发阈值设计**
`_iters_since_skill` 计数器是一个极佳的**低侵入性反馈机制**——它不打断主流程，只在安静期（连续 10 轮无技能操作）才提醒。这比强制用户填写反馈表单的体验好得多，且积累的数据质量更高（用户在任务刚完成后马上写的经验往往更准确）。
**3. 轨迹压缩的"头-尾-摘要"策略**
15250 Tokens 的精炼轨迹（头部任务定义 + 尾部最后 4 轮 + 中间 LLM 摘要）是处理长对话的标准范式。头部保护确保模型始终知道"我要做什么"，尾部保护保留了最近的上下文（对强化学习来说，尾部往往是最有信息量的），中间摘要则压缩了冗长的中间过程。这一策略对任何需要处理长上下文的系统都适用。

### 中期可探索的方向
**渐进式 RL 训练：小步快跑验证**
不要一开始就上大规模数据训练。先用小批量（如 32 条轨迹）验证奖励函数设计的合理性，确认信号质量后再扩大规模。这一原则在机器学习工程中普遍适用，但在 Agent RL 训练中往往被急于看到效果的团队忽视。
**多维度奖励函数的部分分设计**
给"写了开标签但没闭合"的部分分设计非常符合真实任务的连续性——现实中的解决方案很少是 0/1 的，而是有中间状态的。这种部分奖励的设计可以防止模型在遇到困难时完全放弃，而是尝试走到更接近正确答案的方向。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/05-11-the-great-memory-panic-of-2026.md)

### 长期需要注意的风险
**Skill 数量膨胀后的检索质量**
当 Skill 文件积累到数百个时，检索质量会成为系统瓶颈。OpenClaw 的 Skill 是用户主动安装的，数量可控；Hermes 的 Skill 是自动生成的，理论上会持续增长。需要提前设计 Skill 的生命周期管理（合并、废弃、版本化）机制。
**RL 训练的数据隐私**
文章明确指出不用用户对话做 RL，核心问题是隐私。但"人工导入 + Teacher Model"这条路径本身也有成本——Teacher Model（默认 Claude Opus 4.6）的 API 调用成本不容忽视。团队需要评估自进化带来的能力提升是否足以覆盖额外的训练成本。
**多模型支持的一致性挑战**
动态注入指令机制（Claude 无需提醒，GPT/Codex 禁止幻觉，Gemini 需要规范）意味着系统需要对每个模型有不同的行为假设。这在模型更新后可能需要重新调优，是多模型支持的真实成本。

## 相关实体

- MOC

---
