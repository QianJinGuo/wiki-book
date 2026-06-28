## Ch02.006 Hermes Agent 自进化机制源码解析

> 📊 Level ⭐⭐ | 15.3KB | `entities/hermes-agent-self-evolving.md`

## 核心定位
Hermes Agent 是一个通用日常 AI Agent 脚手架，相比 Claude Code（专注文档编程），定位更广泛：覆盖问答、代码、分析、创作、工具执行等全场景任务，支持 Telegram/Discord/微信多平台。
**Self-Evolving 不等于 RL**：Hermes 虽提供 `rl_start_training` / `rl_get_results` 等工具调用自家 Tinker-Atropos 训练平台，但文章解析的 self-improve 机制**不依赖模型权重更新**，而是通过以下三层记忆系统实现能力积累：

## 三层记忆架构
| 层级 | 机制 | 作用 | 
|------|------|------| 
| **Memory** | 会话自动加载，Agent 无需主动调用 | 被动回忆用户偏好 | 
| **Skills** | 主动 `skill_view` 加载 + 自主维护（create/patch/delete） | 主动调用、显式管理复杂操作流程 | 
| **Session Search** | FTS5 全文索引 + 相关性排序 + 会话分组 | 从历史会话中找回具体经验 | 

## Skills 系统设计
Hermes 为 Skills 设计了三种工具：

- **`skills_list`**：列出所有可用技能
- **`skill_view`**：加载特定技能（回复前通读所有相关技能）
- **`skill_manage`**：维护技能（create/patch/edit/delete/write_file/remove_file）

### skill_manage Schema
支持六种操作：create / patch / edit / delete / write_file / remove_file
触发条件（写入 System Prompt）：
> 完成复杂任务（调用工具 ≥5 次）、修复棘手报错、或摸索出实用流程后，要用 `skill_manage` 保存这套方法为技能

### Skill 加载原则
> 回复前，请先通读所有技能。若某项技能与任务匹配，哪怕部分相关，都必须 `skill_view` 加载并严格遵循指令执行。宁可多加载无关技能，也绝不遗漏关键流程、坑点和工作规范。

## Session Search 技术方案
- **FTS5 全文索引**：所有消息实时索引到 SQLite FTS5 虚拟表
- **相关性排序**：按关键词匹配度排序结果
- **会话分组**：取最相关的几个会话
- **LLM 提取**：从候选会话中提取与当前任务相关的经验

## 完整 Self-Improve 流程示例
以"整理 HN 头条摘要发到 Telegram"为例：
1. 用户发起任务
2. Agent 启动会话，加载 Memory（用户偏好）
3. Agent 查看 Skills（是否有相关沉淀流程）
4. Agent 执行任务，过程中调用工具 ≥5 次 → 触发 skill_manage 沉淀流程
5. 任务完成，结果写入 Session
6. 下次类似任务：Memory 提供偏好 + Skills 提供流程 + Session Search 找回经验
→ 每次任务起点比上一次更高

## 与 Claude Code / OpenClaw 的关键差异
|| 维度 | Claude Code | Hermes Agent | OpenClaw || 
||------|-------------|--------------|-----------|| 
|| 定位 | Code Agent 专用 | 通用日常助手 | 消息网关+Agent || 
|| System Prompt | 静态为主 | 大量动态 skill/memory 注入 | 动态 skill || 
|| 自进化 | 依赖 skill 机制 | Memory + Skills + Session Search 三层 | 无 || 
|| 工具集 | 开发工具为主 | Web/浏览器/多模态/多平台 | MCP 扩展 || 
|| 架构 | 单一 Agent | 多 profile 隔离 | 消息网关为核心 || 
**架构区别**：

- **OpenClaw**：围绕消息网关包了一层 Agent（消息→Agent→工具）
- **Hermes**：围绕学习型 Agent 包了一层消息网关（Agent 能力→多平台出口）

## 多 Agent Profiles 配置
Hermes 支持创建多个完全隔离的 profile，每个拥有独立的配置、记忆、skill、会话和 SOUL.md。

### 典型团队配置
```bash 
hermes profile create designer --clone 
hermes profile create programmer --clone 
hermes profile create researcher --clone 
``` 

### 各角色 SOUL.md 示例
**设计师** (`~/.hermes/profiles/designer/SOUL.md`)：
```markdown 

# Soul
You are an expert at creating hand-drawn illustrations that explain 
AI, machine learning, and software engineering concepts. 
``` 
**程序员** (`~/.hermes/profiles/programmer/SOUL.md`)：
```markdown 
You are my staff engineer. Terse, direct, pragmatic. 
You read code before you write code. 
Always check: does this already exist? Are there tests? 
``` 
**研究员** (`~/.hermes/profiles/researcher/SOUL.md`)：
```markdown 
You are my deep researcher for AI/ML space. 
Cover four streams: GitHub trending, big tech announcements, 
fresh papers, social pulse. Lead with what changed since yesterday. 
``` 

## 目录结构
``` 
~/.hermes/ 
├── config.yaml           # 主配置 
├── .env                  # API keys 
├── SOUL.md               # Agent 身份 (#1 system prompt) 
├── memories/ 
│   ├── MEMORY.md         # Agent 事实记忆 (2200 字符) 
│   └── USER.md           # 用户画像 (1375 字符) 
├── skills/               # 所有 skill 
├── sessions/             # 会话元数据 
├── state.db              # SQLite + FTS5 全文搜索 
├── cron/ 
│   ├── jobs.json         # 定时任务 
│   └── output/           # 任务输出 
└── logs/ 
``` 

## 自然语言 Cron
Hermes 内置 scheduler，用自然语言描述即可自动转换：
```bash 

# 工作日早上 9 点
/cron add "0 9 * * 1-5" "Prepare daily digest" 

# 每两小时
/cron add "every 2h" "Check server status" 

# 附加 skill
/cron add "every 1h" "Summarize feeds" --skill blogwatcher 
``` 

## 自进化 skill 与 Curator
### 触发条件
- 完成复杂任务（≥5 次工具调用）
- 遇到错误并找到可行路径
- 用户纠正了做法
- 发现非平凡工作流

### Curator 维护
- **触发**：空闲 2 小时 + 距上次运行 7 天
- **自动转换**：30 天未用 → stale，90 天未用 → archive
- **LLM 审查**：最多 8 轮迭代决定保留/patch/合并/归档
- **快照**：每次运行前自动 tar.gz 备份

## GEPA 离线优化
GEPA（Genetic-Pareto Prompt Evolution）是独立于 Hermes runtime 的离线优化管线：
1. 读取当前 skill
2. 生成评估数据集（合成/真实会话/golden set）
3. LLM-as-judge 按 rubric 评分
4. 约束门：测试 100% 通过、<15KB、缓存兼容
5. 以 PR 形式提交最优变体
成本：每次优化 $2-10（无需 GPU）

## 深度分析
1. **Self-Evolving ≠ RL：不改权重的进化范式**
   主流认知将 Agent 能力提升等同于 RLHF 或模型微调，但 Hermes 的 self-improve 机制完全不触及模型权重。它通过三层记忆系统（Memory 记结论、Skill 存方法、Session Search 召回试错过程）实现渐进式能力积累，每次会话起点比上一次更高。这种「显式知识沉淀」路线的计算成本远低于训练，且结果可审计、可回滚，对生产环境更友好。
2. **三层记忆激活模式的三要素设计**
   Memory（被动注入）、Skill（主动加载）、Session Search（按需召回）构成互补的三要素：Memory 保证关键事实常驻上下文，Skill 让 Agent 主动调用经过验证的流程，Session Search 在用户提及历史时触发原始推理轨迹回溯。三者激活频率和方式各异但互相增强，共同避免「重复发明轮子」。这一设计与 Claude Code 的七层记忆架构（7-layer-memory-architecture）形成有趣对照——两者都通过多层记忆解决上下文有限问题，但 Hermes 更强调 Agent 自主维护而非被动积累。
3. **Memory 写入的 Prompt 注入防线是 Self-Improving 的安全基座**
   Hermes 在 MEMORY.md / USER.md 写入前增加了正则匹配防护层，拦截 prompt injection、role hijack、凭据泄露等威胁模式。这个设计常被忽略，但它实际上是 self-improving 能否安全运转的前提——若攻击者能通过「remember this」持久化污染 system prompt，整个进化机制反而会成为攻击载体。相比之下，多数 Agent 框架将 memory 视为纯存储问题，忽略了写入安全。
4. **Skill_Manage 的「宁可多加载」原则重构了工具调用语义**
   System Prompt 明确要求 Agent「宁可多加载无关技能，也绝不遗漏关键流程」。这将 skill 加载从「精准匹配」转变为「保守加载」，本质是用少量额外 token 换取了漏检风险的急剧下降。该原则与 Claude Code 的工具设计哲学（将常用操作封装为独立工具而非用通用 shell 替代）一脉相承——降低模型调用复杂度和出错率是跨框架共识。
5. **Session Search 的价值在于捕获「失败的推理轨迹」**
   Memory 记结论、Skill 记方法，但真正有价值的往往是试错过程中的错误假设和顿悟时刻。Session Search 的核心创新在于：它不是返回原始对话，而是用廉价模型（如 Gemini Flash）生成「问题→尝试过程→最终解法」的摘要，实现信息提炼的同时控制 token 成本。这一设计对错误模式学习和经验传承尤为重要。

## 实践启示
1. **为 Agent 设计 skill 触发规则时，以「工具调用次数」而非「任务时长」为阈值**
   复杂任务往往体现为连续工具调用，而非单次长时间操作。Hermes 以 ≥5 次工具调用作为沉淀 skill 的触发条件，直接关联认知负荷而非表面耗时，更精准。自行搭建 Agent 时可参考此阈值，并根据领域任务复杂度适当调整。
2. **Memory 文件写入前必须加注入检测，不可用作纯存储**
   若在生产环境中为 Agent 添加 memory 机制，必须同步实现 prompt 注入防护。正则匹配虽非完美但足够轻量，可覆盖「ignore previous instructions」「you are now」等典型模式。若已有更完善的 LLM-based 安全方案（如 dual-llm guard），可替代正则方案。
3. **Session Search 应作为会话结束后的自动归档步骤，而非用户触发才运行**
   Hermes 的 session_search 是用户主动触发（提及「上次」「还记得」等），但更高效的做法是在每次会话结束时自动索引本次对话。这样当用户问起历史时，搜索结果已经就绪，不需要依赖用户的显式回忆措辞。实现上可在会话关闭钩子中调用 FTS5 索引 API。
4. **Skill 的 Curator 机制值得直接复用：空闲触发 + LLM 迭代审查 + 快照备份**
   Hermes Curator 的三要素——空闲 2 小时触发、LLM 8 轮迭代决定保留/patch/合并/归档、运行前自动 tar.gz 快照——是一套可独立移植的技能生命周期管理方案。Curator 的存在解决了「技能越积越多、无人维护」的维护困境，而非仅在 creation 时提供价值。
5. **Profile 隔离机制是团队多角色场景的必要设计**
   Hermes 的多 profile（designer / programmer / researcher）支持完全隔离的配置、记忆、skill 和 SOUL.md。对应到工程实践：为每个角色维护独立身份定义（SOUL.md）和专属技能集，可避免通用 Agent 在混合任务中的上下文污染问题。这是比单一 system prompt 更可扩展的多租户方案。

## 相关页面
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/hermes-agent-self-evolving-source-analysis.md)
→ Claude Code Prompt Source Analysis — Claude Code 提示词体系对比
→ [Agent Context Management Architecture Patterns](ch04-460-the-ui-is-dead-long-live-the-agent-servicenow-goes-headles.html) — Agent 上下文管理工程模式
→ Agent Harness Context Management Working Set — Agent Harness 上下文管理

## 相关实体
- [Memento-Skills — 技能外部记忆让 Agent 自进化（arXiv 2603.18743）](ch04-343-memento-skills-让-agent-通过技能外部记忆持续进化.html)
- [SkillOS: Learning Skill Curation for Self-Evolving Agents](ch04-133-slim-arxiv-2605-10923.html)
- [Self-Evolving Agents 系统性综述](ch04-203-doris-mcp-on-agentcore-runtime-vpc-mcp.html)
- [Hermes Self-Improving 闭环详解（winty）](ch04-193-agent-skills-ai.html)
- [Agent 自我改进的六条路](ch04-047-agent-自我改进的六条路.html)
- [SkillOS: Learning Skill Curation for Self-Evolving Agents](ch04-133-slim-arxiv-2605-10923.html)

## Related

- `Hermes Agent Loop 架构`

---
