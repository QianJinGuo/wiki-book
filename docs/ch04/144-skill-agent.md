# Skill 系统：Agent 如何把经验沉淀成可复用能力

## Ch04.144 Skill 系统：Agent 如何把经验沉淀成可复用能力

> 📊 Level ⭐⭐ | 13.5KB | `entities/hermes-skill-system-winty.md`

# "Skill 系统：Agent 如何把经验沉淀成可复用能力"
## 核心命题
**Memory 解决的是"我记得这件事是这样"。**
**Skill 解决的是"我知道这件事该怎么做"。**
两者工程上完全不同：前者偏知识查询，后者偏过程复用。Hermes Agent 之所以能"越用越快"，靠的不是 Memory 越来越多，而是 Skill 越攒越准。
---

## Memory vs Skill：两种记忆的本质区别
| | Memory | Skill |
|--|--------|-------|
| 本质 | 陈述性记忆：你**知道**什么 | 过程性记忆：你**会做**什么 |
| 回答的问题 | 事实型（"上次用的是哪个配置？"） | 流程型（"先做什么、再做什么？"） |
| 物理形态 | 离散的便签名 | 带顺序的菜谱 |
| 超过3步 | 容易跳步/合并/遗漏 | 天然有序，可引用依赖 |
认知心理学一句话概括：**"会做事比知道事更值钱"**。人能写菜谱跟人会炒菜是两回事，Skill 做的就是后者。
---

## 为什么不能只用 Memory（三个坑）
### 坑 1：Memory 给"理解"用的，不是给"执行"用的
Memory 查询路径：把所有相关 Memory 注入 Prompt，让模型"看完再说话"。
但执行型任务不是说话，是动手。Agent 真正需要的是**"打开手册第 3 步、做完打勾、出错回到第 2 步"**。把流程塞 Memory 里，模型很容易跳步、合并步、漏一步。**任何超过 3 步的事情都会出问题。**

### 坑 2：Memory 没办法版本化
发布流程会变（今天 npm，明天 pnpm，后天加 changesets）。Memory 是离散事实的合集，没人知道"上次发布步骤"和"今天发布步骤"的差别。一改要么全删要么全留，没有中间态。
**Skill 是文件，天然可以打版本号、做 patch、回滚到上一版。**

### 坑 3：Memory 之间没有依赖关系
复杂任务是多流程互相调用："发布 npm 包"里要先"跑测试"、"写 changelog"、"打 tag"。Memory 是平的，没办法表达"做 A 之前先做 B"。
**Skill 不一样，它本身就是带步骤的文档，自然可以引用其他 Skill**——Hermes 里很多 Skill 顶部有 `depends_on: [run-tests, write-changelog]` 声明。
---

## SKILL.md 五区块结构
Skill 文件物理形态：普通 markdown 文件，存在 `.hermes/skills/` 目录下。一个项目一个 Skill 库。

### 第 1 块：元信息（trigger 是关键）
`trigger` 字段是匹配入口。Hermes 在用户提需求时，先扫所有 Skill 的 trigger 关键字粗筛 → 再用语义补一刀。为什么不用纯语义匹配？因为**太贵也太慢**。

### 第 2 块：适用场景
写明哪些场景能用、哪些不能用。省掉至少一半的误用。

### 第 3 块：步骤清单（核心）
带数字编号的真正流程。**越具体越好**：能贴命令就贴命令，能写参数就写参数。模糊的"做相关检查"基本等于没写。

### 第 4 块：坑位记录（最妙的设计）
不是写"正确做法"，而是写"上次错在哪"——"忘记 build""发到了错误的 tag"。
为什么有用？模型执行时会专门看这段，相当于**反向 checklist**，主动避开之前掉进去的坑。

### 第 5 块：校验方式
每一步做完怎么验证？整个流程跑完怎么知道成了？**没有校验就没办法判断这次跑得对不对**。
---

## Skill 检索四步流程
### 第 1 步：用户提需求
"帮我把项目发布到 npm"。自然语言，模型还没开始动。

### 第 2 步：Skill 索引匹配（两层）
- **trigger 关键字粗筛**：命中的被加权
- **语义打分 tie-breaker**：快且准

### 第 3 步：命中候选（通常 1~3 个）
只有一个就直接用；多个让模型看标题和适用场景选择。**trigger 写得够区分**才能避免撞车。

### 第 4 步：注入完整 Skill 到 Prompt
选定 Skill 被作为"执行手册"注入当前任务 system prompt。注意是**完整文件**不是摘要——执行时漏一步就崩。
**金句：找不到才创建，找到就复用。**
---

## Skill 修补哲学：patch 不是重写
Skill 不是只写一次，而是会反复修补。
第一次跑通后 → 写进 SKILL.md。第二次发现 changelog 没更新 → Review Agent 做一件事：**修补 Skill**，在原文件上 patch，不是重新生成。
**为什么是 patch 不是重写？** 因为 Hermes 的 Skill 修改是带 diff 的，每次 patch 留下"改了什么、为什么改"的记录。这个机制在 Skill Hub 里会变成"评估、灰度、回滚"。
---

## Skill 生命周期五阶段
| 阶段 | 状态 | 说明 |
|------|------|------|
| **Created** | 新建 | 第一次任务跑通后的初版，很"嫩" |
| **Used** | 被复用 | 被检索→注入→执行，每次都是实战检验 |
| **Patched** | 修补 | 发现遗漏/错误后增补步骤，版本号 +1 |
| **Aged** | 沉淀 | 多次成功复用后成为"成熟资产"，Hermes 提升信任度 |
| **Retired** | 退役 | 工具栈过时了→归档不删除，"上次踩的坑"仍有参考价值 |
**越用越准，过期就退。**
---

## 实操建议（5 条）
1. **Skill 写得越具体越好**：能贴命令就贴命令，能写参数就写参数，能附校验就附校验
2. **trigger 关键字要选区分度高的**：别用"发布"，用"发布 npm 包""发布 GitHub Release"
3. **定期清理 .hermes/skills/**：Skill 库膨胀的成本不是磁盘，是检索噪音
4. **Skill 写人能看懂的话**：Skill 是给人也是给 AI 看的，越像菜谱越容易上手
5. **别一上来追求"自动 Skill"**：前 5 个 Skill 自己手写，感受好 Skill 长什么样
---

## 深度分析
**1. 陈述性记忆与过程性记忆的工程分离**
Hermes 最核心的设计哲学是将"知道什么"（Memory）和"怎么做"（Skill）彻底分离。Memory 作为陈述性记忆，适合离散的事实查询，如配置参数、项目结构；Skill 作为过程性记忆，以有序步骤链形式存在，天然适合多步骤执行任务。这种分离解决了单一 Memory 架构在超过 3 步任务时的跳步、合并、遗漏问题。本质上，Skill 系统是在 Agent 内部重建了一个"经验沉淀→复用→迭代"的完整知识管理体系，而非简单的信息存储。
**2. 五区块结构的工程意图**
SKILL.md 的五区块设计（触发词→适用场景→步骤清单→坑位记录→校验方式）并非随意划分，而是对应了 Agent 执行过程的每个关键节点：触发词负责"什么时候用"的路由决策，适用场景防止误用，步骤清单是执行主体，坑位记录是逆向风险规避机制，校验方式则确保执行结果可验证。特别是"坑位记录"这一设计最值得注意——它不写"正确做法"而写"上次错在哪"，利用了模型在执行时会重点关注上下文中负面信息的认知特点。
**3. Patch 而非重写的维护哲学**
Skill 的修改采用 patch 而非重写，保留了两个关键资产：历史踩坑记录（不因重写丢失）和版本演化轨迹（支持增量评估和质量追踪）。这一设计直接对应了"组织知识沉淀"的真实需求——一个新 Skill 的价值不仅在于当前内容，更在于它经历了多少次验证、修补过哪些遗漏。这种思路借鉴了代码版本控制的思想，但应用于知识管理领域。
**4. 两层检索的工程折中**
Trigger 关键字粗筛 + 语义打分 tie-breaker 的两层检索机制，本质上是在"检索精度"和"检索成本"之间做的工程折中。纯语义匹配虽然精准，但 token 消耗大、响应慢；纯关键字匹配快但区分度不足。两层结构让大部分候选在第一层被快速过滤，只对少量候选做语义打分，既控制了成本又保证了准确性。这对于需要实时响应的大规模 Skill 库场景尤为重要。
---

## 实践启示
1. **手写前 5 个 Skill 再谈自动化**：在让 Agent 自动生成 Skill 之前，先手写 5 个完整的 Skill，亲身感受"好 Skill"的标准。这样后续 Review Agent 生成的 Skill 你才有判断能力，知道哪些需要修改、哪些可以直接用。
2. **trigger 关键字宁专勿泛**：区分度是 trigger 设计的唯一标准。"发布"太泛，"npm-publish-procedure"或"发布-npm包"才够区分。区分度不够的 trigger 会导致检索阶段多个 Skill 撞车，让模型在选择时产生犹豫，增加执行不确定性。
3. **每个 Skill 必须包含"校验方式"**：没有校验方式的 Skill 等于没有闭环。校验不需要复杂，但必须回答"怎么知道这一步做对了"和"怎么知道整个流程跑完了"这两个问题。建议校验命令直接可执行，如 `npm view <pkg> version` 而非模糊的"检查版本号是否更新"。
4. **坑位记录是最低成本的风控手段**：与其写"正确操作步骤"，不如写"上次踩的坑是什么"。因为模型在执行时对负面信息的注意力分配往往更充足，主动避开已知的坑比记住正确做法更高效。养成在每次 Review Agent 复盘后更新"坑位记录"的习惯。
5. **月度 Skill 库审计**：每月对 `.hermes/skills/` 目录做一次审计，识别连续 3 个月未被命中的 Skill 并归档。Skill 库超过 100 个时检索噪音会显著上升，降低 Agent 找到正确 Skill 的概率。
6. **跨 Skill 依赖显式声明**：当一个 Skill 的步骤需要依赖其他 Skill 时（如发布前先跑测试），在 Skill 顶部用 `depends_on: [skill-a, skill-b]` 显式声明，而非让模型自己推断依赖关系。显式声明让 Skill 的复用边界更清晰，也便于生命周期管理。
7. **退役 Skill 归档不删除**：过时的 Skill（如已废弃的 npm 发布流程）不要直接删除，而是移动到归档目录并保留完整内容。归档 Skill 不参与检索匹配，但其中的"坑位记录"和"步骤清单"在工具栈变更时仍有考古价值。
---

## 相关页面
→ [Hermes Agent 自进化机制](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-agent-self-evolving.md)（Skills 系统概述）
→ [winty·Hermes Self-Improving 概览](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/hermes-self-improving-overview-winty.md)（同系列）

## 相关实体
- [从 0 到 1 教你写 Agent Skill，让 AI 懂你的"潜规则"](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-skill-writing-guide.md)
- [企业级AI记忆基质三层架构：事实/交互/行动记忆](https://github.com/QianJinGuo/wiki/blob/main/entities/enterprise-ai-memory-substrate-three-layer-architecture.md)
- [9个Agent技能模块化SageMaker微调生命周期](https://github.com/QianJinGuo/wiki/blob/main/entities/aws-sagemaker-ai-agent-guided-workflows-finetuning.md)
- [Perplexity 内部 Skill 设计指南：四维体系与维护方法论](https://github.com/QianJinGuo/wiki/blob/main/entities/perplexity-internal-skill-design-guide.md)
- [Agent 自我改进的六条路](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-self-improvement-six-mechanisms.md)
- [GBrain](https://github.com/QianJinGuo/wiki/blob/main/entities/gbrain.md)
- [Demis Hassabis YC 专访：AGI / 记忆 / Agent / 创造性观点集](https://github.com/QianJinGuo/wiki/blob/main/entities/demis-hassabis-yc-interview-2026.md)
- [重新定义Skill开发：保姆级教程&一站式开发助手发布](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-development-guide-aliyun-2026.md)
- [SkillX — 层次化技能知识库](https://github.com/QianJinGuo/wiki/blob/main/entities/skillx-hierarchical-skill-library.md)
- [深度解析 OpenClaw 在 Prompt / Context / Harness 三个维度中的设计哲学与实践](https://github.com/QianJinGuo/wiki/blob/main/entities/openclaw-prompt-context-harness.md)
- [Anthropic 14 个 Agent Skills 设计模式](https://github.com/QianJinGuo/wiki/blob/main/entities/anthropic-agent-skills-design-patterns-14.md)
- [Agent Memory System 设计指南](https://github.com/QianJinGuo/wiki/blob/main/queries/agent-memory-system-design.md)
- [OpenHuman: AI Agent 持久记忆框架](https://github.com/QianJinGuo/wiki/blob/main/entities/openhuman-ai-agent-memory-tree-tokenjuice.md)
- [Trace2Skill: 轨迹经验蒸馏为可迁移 Agent Skills](https://github.com/QianJinGuo/wiki/blob/main/entities/trace2skill-trajectory-distillation-agent-skills.md)
- [上下文工程 - 三种Memory方案对比](https://github.com/QianJinGuo/wiki/blob/main/entities/context-engineering-three-memory-paradigms-comparison.md)

- [你写的 Skill，及格了吗？](https://github.com/QianJinGuo/wiki/blob/main/entities/ni-xie-de-skill-ji-ge-liao-ma.md)
- [深度解析LLM Wiki / Obsidian-Wiki / GBrain：Agent时代知识的"自组织"与"自进化"](https://github.com/QianJinGuo/wiki/blob/main/entities/llm-wiki-obsidian-wiki-gbrain-self-organization-self-evolution.md)
- [Hermes Agent](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-agent.md)
- [Qoder Skills 完全指南](https://github.com/QianJinGuo/wiki/blob/main/entities/qoder-skills-complete-guide.md)
- [Hermes Agent Skill](https://github.com/QianJinGuo/wiki/blob/main/concepts/hermes-agent-skill.md)
- [Karpathy LLM Wiki V2](https://github.com/QianJinGuo/wiki/blob/main/concepts/karpathy-llm-wiki-v2.md)
- [hermes-agent-self-evolving-source-analysis](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-agent-self-evolving-source-analysis.md)
- [Claude Code Prompt 提示词体系源码解析](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-prompt-source-analysis.md)
- [Agent 原理、架构与工程实践](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-engineering-principles-architecture-practice.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/hermes-skill-system-winty.md)

- [AI Agent 工程师能力地图](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-agent-engineer-capability-map.md)

---

