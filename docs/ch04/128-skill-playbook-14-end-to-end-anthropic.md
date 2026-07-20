# 鹅厂 Skill 写作完整 Playbook：14 章节 end-to-end 实战 + 工程化评估（腾讯一线踩坑 + Anthropic 官方做法整合）

## Ch04.128 鹅厂 Skill 写作完整 Playbook：14 章节 end-to-end 实战 + 工程化评估（腾讯一线踩坑 + Anthropic 官方做法整合）

> 📊 Level ⭐⭐ | 14.7KB | `entities/tencent-skill-writing-complete-playbook-jackjchou.md`

# 鹅厂 Skill 写作完整 Playbook：14 章节 end-to-end 实战 + 工程化评估

> 原文存档：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/tencent-skill-writing-complete-playbook-jackjchou.md)

腾讯 jackjchou（2026-06-05）发布 **14 章节完整 Skill 写作 Playbook**——鹅厂一线团队踩坑经验 + Anthropic 官方做法整合。覆盖**从 0 入门到调试排错到团队管理**全流程，提供**5 大评估指标**（触发准确率 90% / 误报 5% / 一致性 85% / Token -30% / 完成 80%）和**Skill Creator 工程化评估 3 阶段**（触发评估 + 效果评估 + 综合报告）。

## 14 章节目录

| 章节 | 主题 | 目标读者 |
|------|------|----------|
| 1 | **Skill 是什么**（本质 + 5 大痛点 + 渐进式加载） | 全部 |
| 2 | **Skill 长什么样**（基本结构 + 目录） | 入门 |
| 3 | **Description 是灵魂**（触发精准） | 提升质量 |
| 4 | **Skill 主体写作原则**（开头 + 祈使句 + Before/After + Few-Shot + Checkpoint） | 提升质量 |
| 5 | **模块化拆分**（主 Skill + 子 Skill） | 团队管理 |
| 6 | **MCP 集成**（外部服务调用） | 进阶 |
| 7 | **安全设计**（4 大风险 + 防御写法） | 进阶 |
| 8 | **Skill Creator + 工程化评估**（5 步工作流 + 3 阶段评估） | 进阶 |
| 9 | **验证与评估**（5 大指标 + 评估循环） | 全部 |
| 10 | **调试与排错**（触发问题 + 冲突问题） | 排查 |
| 11 | **团队管理**（分发 + 版本 + 评审 + 共享市场） | 团队管理 |
| 12 | **反模式**（常见错误清单） | 提升质量 |
| 13 | **检查清单**（安全 + 质量） | 全部 |
| 14 | **附录**（术语速查 + 参考资源） | 全部 |

## Skill 本质

**Skill = 给 AI 编程助手"加装"的能力包 = 结构化 Prompt Engineering**。物理上看是**文件夹 + `SKILL.md`**。核心三样：
- **指令（Instructions）**：告诉 AI 怎么干活
- **上下文（Context）**：给 AI 补课（项目背景、团队规范）
- **工具（Tools）**：辅助脚本、配置模板

> "**裸着的 AI 就像一个刚入职的新人，啥都得问；装了 Skill 之后，就像拿到了老员工整理的操作手册**。" 

## 5 大痛点

| 痛点 | Skill 怎么解决 |
|------|----------------|
| **知识太散**（藏在 TAPD/Wiki/注释/脑子） | 全部整理进 Skill，结构化封装 |
| **重复搬砖** | 写成 Skill 让 AI 自动跑 |
| **做出来不统一**（张三一个样李四一个样） | 用 Skill 固定流程 |
| **新人上手慢** | Skill 本身就是培训材料 |
| **人走知识也走** | 经验沉淀，知识完整留存 |

## 渐进式加载 3 层（Anthropic 设计）

| 层级 | 加载时机 | 内容 | Token 成本 |
|------|----------|------|------------|
| **Level 1** | 常驻 | name + description，≤100 字 | **50-150 Token / 个** |
| **Level 2** | 匹配触发时一次性 | SKILL.md 正文，≤500 行 | **2,000-5,000 Token** |
| **Level 3** | 执行中按需 | 脚本 + 参考文档 + 模板 | 按实际引用大小 |

**Token 估算**：
- 英文：~1 Token / 4 字符
- 中文：~1 Token / 1.5-2 字符
- 不同模型 tokenizer 差异 ±20%

**核心原则**：
- **Level 1 越精准越好**（决定触发时机）
- **Level 2 越精简越好**（减少 Token 消耗）
- **Level 3 放心放**（按需加载不占常驻空间）

## 4 大写作原则

### 4.1 开头说清三件事

每个 Skill 上来就该说清**做什么 + 为什么 + 怎么判断是否需要做**。

### 4.2 祈使句下指令 + 解释"为什么"

> "**AI 要是理解了背后的道理，遇到你没想到的情况也能做出合理判断。光靠'MUST'只是死记硬背，换个场景就傻了**。"

### 4.3 Before/After 对比（最关键）

3 种方式：**注释标注**（简单）/ **完整文件对比**（复杂）/ **Diff 格式**（推荐）。

### 4.4 Few-Shot 3-5 个示例

**关键原则**：
- 覆盖典型场景（正常/边界/错误各一个）
- 输入输出成对出现
- 示例之间有差异
- 先放最典型的（AI 倾向模仿前面的）

## 5 大评估指标（Anthropic 推荐）

| 指标 | 说明 | 参考目标 |
|------|------|----------|
| **触发准确率** | 该触发时正确触发的比率 | **90%** |
| **触发误报率** | 不该触发时误触发的比率 | **5%** |
| **输出一致性** | 同一输入多次执行的相似度 | **85%** |
| **Token 效率** | 完成相同任务所消耗 Token | **比无 Skill 减少 30%+** |
| **完成准确率** | 输出结果符合预期的比率 | **80%** |

> "不需要每个指标都精确测量。重点关注**触发准确率**和**完成准确率**，这两个直接决定 Skill 是否可用。"

## Skill Creator 工程化评估 3 阶段

**Skill Creator** = Anthropic 官方的"帮你写 Skill 的 Skill"——用对话方式引导你一步步做出 Skill + 自动测试和优化。

### 5 步工作流

1. **定义意图**（用大白话描述）
2. **生成草稿**（SKILL.md + 可选 scripts/ + references/）
3. **对比测试**（2-3 用例 + "有 Skill vs 无 Skill"对比 + 自动评分）
4. **反馈迭代**（2-3 轮调整）
5. **工程化评估**（新增）

### 3 阶段评估

| Phase | 名称 | 关键能力 |
|-------|------|----------|
| 1 | **触发评估** | 自动生成正例/反例/边界用例 → 计算 Precision/Recall → 标注漏触发和误触发 |
| 2 | **效果评估** | 预定义测试用例 + "有 Skill vs 无 Skill"对比 + 按评分标准（格式/准确性/完整性）自动打分 |
| 3 | **综合报告** | 汇总两阶段数据 → 自动标注薄弱环节 → 给出针对性优化建议 → 可选自动应用并重评 |

## 4 大安全风险 + 防御

| 风险 | 防护 |
|------|------|
| 文件名嵌入 AI 指令（路径穿越） | 路径格式校验 + 拒绝 `..` |
| API 返回值注入 | 标记为"数据"而非"指令" |
| 环境变量 shell 注入 | 引号包裹 + 格式校验 |
| 路径操作 | 拒绝 `..` + 路径校验 |

**核心原则**："**区分'指令'和'数据'。数据永远不应该被当成指令来执行**。"

## 调试排错链

```
Skill 没触发
  ↓
1. Skill 加载了吗？ ── 没有 → 检查文件路径
  ↓ 加载了
2. Description 匹配吗？ ── 不匹配 → 调整措辞
  ↓ 匹配
3. 是否被其他 Skill 抢了？ ── 是 → 检查冲突
  ↓ 否
4. 用户提问太模糊？ ── 是 → 补充触发关键词
```

## 核心金句

> "**写 Skill 这件事，说到底就是把你脑子里'知道怎么做'的经验，变成 AI 也能'照着做'的格式**。"

> "**第一版肯定不完美，但没关系，用着用着就知道哪里需要改了。好的 Skill 都是在实际使用中一点点打磨出来的**。"

## 与现有 skill 实体差异化

**本实体关注"鹅厂一线 14 章节 end-to-end 完整 Playbook + 5 大评估指标 + Skill Creator 工程化评估 3 阶段"**。

- [Anthropic 14 Skill Patterns Best Practices](../ch01/348-anthropic-14-skill.html) — 60KB，14 patterns 5 类（发现与选择/上下文经济/指令校准/工作流控制/可执行代码）。本实体是**鹅厂实战版完整 Playbook**（14 章节顺序结构），那个是**14 设计模式分类索引**。两者互补：patterns 提供分类视角，playbook 提供流程视角。
- [Agent Skill Writing Guide](ch04/607-agent-skill.html) — 21KB，"从 0 到 1" 入门级（岗位职责说明书 + SOP + 避坑指南）。本实体是**进阶 + 团队管理 + 工程化评估**的扩展版。
- [Ai Skill Skill Creator 源码拆解](ch04/315-skill-skill.html) — 28KB，skill-creator 源码深度拆解（3 Agent 评审）。本实体是 Skill Creator **5 步工作流 + 3 阶段评估的实战使用**视角，那个是**源码内部机制**视角。
- [Ai Skill 四层验证体系](../ch01/472-ai-skill.html) — Skill 四层验证体系（已覆盖部分质量评估）。本实体是**5 大指标 + 工程化评估 3 阶段**的补充扩展。
- [Ai Skill 测评指标体系](../ch01/472-ai-skill.html) / [Ai Skill 测评报告解读](../ch01/472-ai-skill.html) / [Ai Skill 测评体系进阶指南](../ch01/472-ai-skill.html) / [Ai Skill 测试用例设计](../ch01/472-ai-skill.html) / [Ai Skill 测评指标体系](../ch01/472-ai-skill.html) — AI Skill 测评系列（覆盖部分指标体系）。本实体是**腾讯视角的工程化评估**，与系列互补。
- [Anthropic 官方技能最佳实践14 个可复用的 Agent Skills 设计模式](ch04/394-agent-skills.html) — Anthropic 官方 14 patterns 译本。命名相似但内容不同。
- [Agent Skill Writing Practices](ch04/607-agent-skill.html) / [Agent Skill Writing Advanced](ch04/607-agent-skill.html) / [Agent Skill Writing Evaluation](ch04/607-agent-skill.html) — 系列其他 skill 写作视角。本实体是**鹅厂完整 Playbook 视角**。

## 深度分析

1. **渐进式加载是 Anthropic 的核心设计哲学** — 三层加载机制 (Level 1/2/3) 体现了"按需加载"原则：Level 1 常驻精准触发 (50-150 Token)，Level 2 按需一次性加载 (2K-5K Token)，Level 3 执行中按需引用。三层分离使 Skill 既能快速响应又不被大文件拖累，这是工程化设计而非简单功能堆砌。

2. **Skill 本质是知识工程化的系统性解决方案** — 五大痛点（知识分散、重复劳动、标准不统一、新人上手慢、人走知识流失）指向的是组织级知识管理问题，而非个人效率问题。Skill 的价值在于将散落在 TAPD/Wiki/注释/头脑中的经验结构化封装，使其成为可复制、可执行的数字资产。

3. **五大评估指标构成完整质量度量矩阵** — 触发准确率 (90%)、误报率 (5%)、一致性 (85%)、Token 效率 (-30%)、完成准确率 (80%) 五个指标覆盖了"触发→执行→结果"全链路。关键洞察：触发准确率和完成准确率是核心指标，其他指标可按需测量——不是所有指标都需要精确追踪。

4. **Skill Creator 将"元技能"概念工程化落地** — 5 步工作流（定义意图→生成草稿→对比测试→反馈迭代→工程化评估）配合 3 阶段评估（触发评估→效果评估→综合报告）形成闭环，使 AI 辅助 Skill 开发从"靠感觉"升级为"可量化、可迭代"的工程流程，把"帮你写 Skill 的 Skill"从概念变成可量产的工具。

5. **安全设计的核心原则是"指令与数据严格区分"** — 四类风险（路径穿越/注入/shell注入/路径操作）的防御策略全部围绕这一原则：数据永远不应该被当成指令执行。这个原则在 MCP 集成场景下尤为重要，因为外部服务返回的内容更容易被误认为指令。

## 实践启示

1. **用"20 问题测试法"验证 Description 质量** — 准备 20 个测试问题（10 个该触发、10 个不该触发），让 AI 判断是否激活该 Skill。命中率低于 90% 就回来调整 description 措辞和关键词。这是最低成本的 Description 调优方法。

2. **每个 Skill 必须经过"编写→测试→评估→优化"循环** — 不满意就不扩大测试规模，直到触发准确率和完成准确率达标才正式发布。评估循环是关键质量门禁，不能跳过。

3. **Few-Shot 示例优先覆盖"正常/边界/错误"三种场景，且先放最典型的** — AI 倾向模仿前几个示例，因此典型场景要放前面。同时示例之间要有差异，才能覆盖不同触发条件。3-5 个高质量示例比 20 个低质量示例更有价值。

4. **Description 撰写遵循"做什么+触发场景+不做什么+具体关键词"四要素** — 100 字以内，包含 Go/HTTP/迁移等具体关键词，加入反例避免误触发。Description 是 Level 1 常驻内容，决定了 Skill 的生死，必须精准。

5. **团队 Skill 必须纳入 Code Review 和版本控制** — Skill 是团队知识资产，不是个人工具。从一开始就建立评审流程和版本管理规范，防止"人走技能失"的资产流失问题。

## 相关主题

- Skill 系统综述 — [Agent Skills Comprehensive Survey](ch04/394-agent-skills.html)
- Skill 元技能 — [Meta Skill](../ch07/025-meta-skill.html)
- Skill vs Coze/Dify/n8n — [Agent Skills Vs Coze Dify N8N Lowcode Yexiaocha](ch04/394-agent-skills.html)
- Skill 质量优化 — [Skills Refiner Design Quality Evaluation Framework](../ch03/070-skills.html)
- Anthropic 95% 数据分析 Skill 栈 — [Anthropic 95Pct Data Analysis Skill Stack Architecture](../ch01/1291-anthropic.html)
- AI 技能自动演进 — [Ai Skill Evolution Framework](../ch07/010-ai-skill-evolution.html)
- Claude Code 架构 — [Claude Code Architecture](../ch03/076-claude-code.html)
- AHE 通用 Harness — [Ahe Agentic Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/ahe-agentic-harness-engineering.md)

---

