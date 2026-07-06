# Perplexity 内部 Skill 设计指南：四维体系与维护方法论

## Ch07.018 Perplexity 内部 Skill 设计指南：四维体系与维护方法论

> 📊 Level ⭐⭐ | 11.8KB | `entities/perplexity-internal-skill-design-guide.md`

## 核心框架：Skill 的四个维度
### 1. Skill 是目录（hub-and-spoke）
Skill 不仅仅是一个 SKILL.md 文件，而是包含多个文件的目录结构：
```
skill-name/
├── SKILL.md           # 前置元数据和指令
├── scripts/           # Agent 运行的代码（不现场发明代码）
├── references/        # 厚重的参考文档，按条件加载
├── assets/            # 模板、架构和数据
└── config.json        # 用户首次运行时的设置
```
**枢纽与辐辏（hub-and-spoke）模式**：300 个主题 → 归纳为 20 个领域 → 再从 15 个主题中做选择，难度大幅降低。

### 2. Skill 是格式
SKILL.md 必须同时具备：

- **name**：必须全部小写，不能有空格，可用连字符
- **description**：这是「路由触发器」（routing trigger），告诉模型在什么时候加载这个 Skill
**描述不是说明文档，而是触发开关**——写的是「Load when...」而非「This Skill does...」。
前置元数据字段：

- `depends:`：层级化 Skill 依赖关系
- `metadata:`：用于评审和评估

### 3. Skill 是可调用的
Computer 中的加载过程：
1. `load_skill(name="...")` 调用
2. Skill 目录复制到隔离执行沙箱
3. 根据 `depends:` 递归加载所有依赖项
4. 剥离前置元数据，智能体只看到正文内容和附加文件

### 4. Skill 是渐进式的（三层 token 成本）
| 层级 | 成本 | 说明 |
|------|------|------|
| 索引层 | 每个 Skill ~100 tokens | 名称+描述，对话开始时注入，**所有人都为此支付成本** |
| 正文层 | 理想 ≤ 5,000 tokens | 完整 SKILL.md，每句话都要有意义 |
| 运行时层 | 0 到 20,000+ tokens | 脚本/条件分支逻辑，按需加载 |
**进入索引层的门槛极高**——每一个 token 都至关重要，描述必须极其稠密精炼。

## 什么时候需要 Skill？
### ✅ 需要 Skill
- **纠正错误或不一致**：Agent 在没有特殊语境的情况下会出错，或需要极高一致性
- **特定知识或流程**：知识耐用但不在模型训练数据中（如企业工作流）
- **审美品味**：模型无法仅从训练数据中学到的判断力（如字体/设计风格）

### ❌ 不需要 Skill
- **模型已知的任务**：Git 命令序列对人类是好文档，对模型是差 Skill
- **系统提示词的重复**：全局上下文已有的内容无需重复
- **变化太快的信息**：维护速度跟不上变化速度时会导致误判

## 每个 Skill 都是一份「税」
> 如果没有这条指令，Agent 会出错吗？
如果答案是否定，这句话就不该存在。每一个 Skill 都是一份「税」——每个会话、每个用户都在为此支付 token 成本。
写一个短小的 Skill 是很难的。5 分钟写完并提交的 Skill 大概率不合格。LLM 自动生成 Skill 效果通常很差——模型目前还无法可靠地编写出能让自己受益的过程性知识。

## 如何构建 Skill（五步法）
### Step 0：先写评测（Evals）
先写评测，再写内容。可从真实用户查询、已知失败案例、易与邻近领域混淆的情况中寻找素材。**负面案例（告诉模型什么时候「不该」加载）往往比正面案例更有力量。**

### Step 1：写好描述（Description）
这是 Skill 中最难写的一行：

- 必须以「Load when...」开头
- 目标在 50 个单词以内
- 描述用户意图，而非总结工作流程

### Step 2：编写正文（Body）
给 AI 写工作流 vs 给同事写文档：

- **跳过显而易见的事**：不写具体命令序列（如 `git log`、`git checkout`）
- **给出原则而非死板命令**：AI 会自己完成细节
- **专注于「坑」（Gotchas）**：信号量最高的内容

### Step 3：利用层级结构
将条件性/分支逻辑从主文件拆分到子文件夹。多层级结构可处理极复杂 Skill——仔细考虑是做成庞大单体还是拆分为一组有依赖关系的 Skill 集合。

### Step 4：迭代
先在没有该 Skill 的主分支上运行，构建核心查询集并运行大量评测。描述中微小的词语变化可能对路由产生巨大影响（包括对其他 Skill 的溢出效应）。

### Step 5：发布
正式发布。

## 如何维护 Skill：Gotchas 飞轮
Skill 应该是「只增不减」的。Gotchas 部分积累的价值最高：
| 场景 | 行动 |
|------|------|
| Agent 在某处失败 | 增加一个 Gotcha |
| Agent 错误加载了该 Skill | 收紧描述 + 增加负面评测案例 |
| Agent 该加载时没加载 | 增加关键词 + 正面评测案例 |
| 系统提示词变化 | 检查冲突或重复 |
**你应该把大部分内容追加到 Gotchas 部分，而不是增加更长的指令或修改描述。** 从 80/20 进步到 99.9% 甚至 99.99% 的过程中，Gotcha 列表会自然增长。

## 评测套件（Eval Suites）
1. **加载与文件读取评测**：加载准确率/召回率 + 禁区检查，确保新 Skill 不破坏现有边界
2. **渐进式加载评测**：Agent 是否正确读取附件文件（如金融 Skill 的格式化要求文件）
3. **端到端任务评测**：完整智能体循环 + LLM 作为裁判评分
**关键：必须在不同模型上运行评测**（GPT、Claude Opus、Claude Sonnet），因为不同模型处理 Skill 的表现差异很大。

## 深度分析
Perplexity 的 Skill 设计体系折射出 LLM 应用工程的根本性范式转移——从「代码即逻辑」到「语境即产品」。
**四维体系的工程含义**：将 Skill 定义为目录/格式/可调用/渐进式，绝非架构师的自说自话，而是工程压力的产物。300 个主题通过 hub-and-spoke 归纳为 20 个领域，再细分为 15 个主题——这种三层层级设计直接对应了 LLM 上下文窗口的结构性约束。索引层的 ~100 tokens 成本看似微小，但在多 Skill 并发的会话中，5 个 Skill 同时加载就意味着 500 tokens 的确定性开销，这解释了为什么 Perplexity 如此强调「进入索引层的门槛极高」。
**描述作为路由触发器的设计选择**：传统软件中，文档描述「做什么」；Perplexity 中，描述控制「何时加载」。这个区别的深层含义是：LLM 的推理过程不是确定性执行，而是概率性路由——Skill 的价值不在于完整性，而在于被正确调度的频率。描述写「Load when...」而非「This Skill does...」，本质上是将描述当作一个小型分类器，让模型在每个 token 生成前做一次轻量级的路由决策。
**Gotchas 的飞轮逻辑与negative learning**：最反直觉的设计是「负面案例比正面案例更有力量」。这对应了机器学习中的一个成熟洞察：在分布外（out-of-distribution）场景中，正面示例的召回边界很难定义，而负面示例的 precision 更容易通过排除法建立。Gotchas 本质上是在构建一个关于「误加载」的分布刻画——每一个新的 Gotcha 都是对模型「不该做什么」的显式约束。
**Token 税的经济学**：每个 Skill 都是一份税——这个说法将工程决策货币化。在传统软件开发中，代码的边际成本趋近于零；但在 LLM 应用中，每一个注入的 token 都参与运算，都消耗注意力，都影响推理延迟。这意味着 Skill 设计的核心优化目标不是覆盖率，而是「每 token 的路由正确率」。

## 实践启示
**对于 Skill 设计者**：
1. 在动笔之前先构建评测集，尤其是负面案例——告诉模型「何时不该加载」比告诉它「何时该加载」更有力量
2. 描述控制在 50 个单词以内且必须以「Load when...」开头——这是最小化索引层成本的工程实践
3. 正文每句话都必须通过「如果没有这条指令，Agent 会出错吗？」的过滤测试——做不到则删除
4. 优先将条件逻辑和分支写入 Gotchas 而非修改描述——Gotchas 是只增不减的，随着生产环境中的失败案例自然丰富
**对于平台架构师**：
1. 索引层设计决定全局 token 成本——每个 Skill 的描述字段应该被当作「广播信道」来对待，信噪比至关重要
2. 渐进式加载机制是控制成本的关键——运行时脚本层（0-20,000 tokens）应该是高频使用的无状态逻辑，而非低频引用的厚重文档
3. 多模型评测是必要条件——不同模型对 Skill 的路由行为存在显著差异，不能以单一模型的表现推断全平台行为
4. Skill 之间的超距作用是主要风险源——新增 Skill 可能破坏旧 Skill 的表现，需要在 Skill 加载评测中覆盖「邻居干扰」场景
**对于团队流程**：
1. 先写评测再写 Skill 应该是强制流程——没有评测基准的 Skill 就像没有测试用例的代码
2. 5 分钟写完并提交的 Skill 大概率不合格——这应该成为团队的共识基线
3. 迭代应在没有该 Skill 的分支上进行——避免已加载的 Skill 对新描述的评估产生污染

## 核心要点
1. **先写评测，再写 Skill**：包含负面示例，防止相邻领域技能误加载
2. **描述是最难的部分**：以「Load when...」开头的每一句话都在消耗注意力成本
3. **Gotchas 是极高价值内容**：从小处开始，随着智能体犯错不断丰富
4. **警惕「超距作用」**：添加新 Skill 容易破坏原有 Skill 表现，即便没碰过旧代码

## 关联阅读
- 原始文章：https://research.perplexity.ai/articles/designing-refining-and-maintaining-agent-skills-at-perplexity
- [Perplexity Internal Skill Design Guide Xiaojianke](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/perplexity-internal-skill-design-guide-xiaojianke.md) — 原始文章存档
- `Agent Skill Writing Guide` — 低配版 Skill 写作指南（质量较低，仅供参考）
- `Agent Skill Writing Evaluation` — Skill 评测相关

## 相关实体
- [LBS-IntentBench — 首个真实出行隐式意图评测基准](https://github.com/QianJinGuo/wiki/blob/main/entities/lbs-intentbench.md)
- [9个Agent技能模块化SageMaker微调生命周期](https://github.com/QianJinGuo/wiki/blob/main/entities/aws-sagemaker-ai-agent-guided-workflows-finetuning.md)
- [重新定义Skill开发：保姆级教程&一站式开发助手发布](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-development-guide-aliyun-2026.md)
- [SkillX — 层次化技能知识库](https://github.com/QianJinGuo/wiki/blob/main/entities/skillx-hierarchical-skill-library.md)
- [Anthropic 14 个 Agent Skills 设计模式](https://github.com/QianJinGuo/wiki/blob/main/entities/anthropic-agent-skills-design-patterns-14.md)
- [AI Skill 测评指标体系](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-skill-metrics-system.md)
- [SkillClaw](https://github.com/QianJinGuo/wiki/blob/main/entities/skillclaw.md)
- [Skill 系统：Agent 如何把经验沉淀成可复用能力](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-skill-system-winty.md)
- [Skills赏析：使用skills-refiner提升skill质量](https://github.com/QianJinGuo/wiki/blob/main/entities/skills-refiner-design-quality-evaluation-framework.md)
- [Trace2Skill: 轨迹经验蒸馏为可迁移 Agent Skills](https://github.com/QianJinGuo/wiki/blob/main/entities/trace2skill-trajectory-distillation-agent-skills.md)

- [Hermes Agent](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-agent.md)
- [Qoder Skills 完全指南](https://github.com/QianJinGuo/wiki/blob/main/entities/qoder-skills-complete-guide.md)
- [AgentEval：YAML驱动的Agent评测框架](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-eval-wallezhang-yaml-driven-agent-evaluation-framework.md)
- [你写的 Skill，及格了吗？](https://github.com/QianJinGuo/wiki/blob/main/entities/ni-xie-de-skill-ji-ge-liao-ma.md)
- [Hermes Agent Skill](https://github.com/QianJinGuo/wiki/blob/main/concepts/hermes-agent-skill.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/aeo-and-geo-for-ai-overviews-chatgpt-claude-gemini-and-perplexity.md)

- [Agent 原理、架构与工程实践](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-engineering-principles-architecture-practice.md)

---

