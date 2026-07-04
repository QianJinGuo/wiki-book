# Hermes Self-Improving 闭环详解（winty）

## Ch04.199 Hermes Self-Improving 闭环详解（winty）

> 📊 Level ⭐⭐ | 11.1KB | `entities/hermes-self-improving-loop-winty.md`

## 核心定义
**自进化的工程标准：** 同一个用户，同一个 Agent 实例，不同时间做同类任务，后做的明显比先做的更准更快。排除 prompt 优化、模型升级、任务难度变化三个干扰因素。按这个标准，市面上 95% 的 Agent 不算自进化。

## 四组件闭环
| 角色 | 类比 | 功能 |
|------|------|------|
| **Memory** | 团队 wiki | 存储事实级认知，自动注入 system prompt |
| **Skill** | 流程 SOP | 存储操作级经验，按步骤执行 |
| **Nudge Engine** | 周会复盘提醒 | 到时间/事件/轮次，强制提醒学习 |
| **Review Agent** | 同事 code review | 独立复盘，只看快照，判断什么值得保存 |

## 反馈环：
任务执行 → Nudge 触发 → Review Agent fork → 落盘 (Memory/Skill) → 下次任务 Prompt Assembly 加载 → 更顺更快更准 → 循环

## 关键洞察
### 三层分水岭（winty 概念篇）
Agent 系统分三层：**聊天层**（会不会说）→ **工具层**（能不能做）→ **学习层**（会不会变强）。大多数 Agent 停在第二层，Hermes 走向第三层。

### Memory ≠ 日志
Memory 是高密度事实层，不是日志系统。适合存的：用户偏好、项目规范、工具怪癖。不适合存的：临时错误、单次对话细节、会话噪声。记忆越稀缺，越要逼 Agent 学会筛选和淘汰。

### Memory 与 Skill 分离设计
Memory 管事实，Skill 管流程。混在一起 Agent 会把临时信息当规则、把操作步骤塞进长期记忆。Skill 是给 Agent 用的可执行操作手册（触发条件+步骤+坑点+验证），不是给人看的文档。

### Skill = 企业级资产
Skill 不应只是 Markdown 文件，而应是有版本、有 owner、有上线流程、有回滚机制的企业软件资产。企业落地时，自进化必须配治理——没有评估/版本/灰度/回滚/审计的自进化，容易变成自污染。

### 主动触发 > 被动学习
被动学习依赖用户反馈，但用户 99% 不会主动教 Agent。Nudge Engine 强制到时间就复盘，不依赖人。

### 复盘必须独立
主 Agent 自己 review 有天然偏差（"做得不错" → 不学；"有点尴尬" → 不记；"用户没说不满意" → 不改。独立 Review Agent 没有执行滤镜，唯一任务就是保存有价值信息。

### 复利式学习
第 1 周每 5-6 任务沉淀 1 个 Skill → 第 2 周 Skill 间互相调用 → 第 3 周自动 patch 过时 Memory → 第 4 周执行前先扫 Skill。学习不是线性的，是复利的。

### 进化 = 高质量精简，不是膨胀
Memory 有上限，Skill 有触发条件，Review Agent 会否决。好的系统只学有复用价值的东西，并且持续修剪。

### Review Agent 的学习过滤器
Review Agent 只在任务使用了工具且有判断标准时才主动沉淀。纯聊天/hello-world 任务不会触发 Memory/Skill 写入（不值得保存）。

### 实践体验：第一次跑 vs 第三次跑（winty 上手篇）
用真实任务（整理文件按发布状态分目录）测试：第一次 12 步工具调用 → 第三次因 Skill 已沉淀，压到 ~6 步。不是因为模型变快，是因为做法已沉淀到 Skill，下次直接抄答案。
新手四个常见坑：
1. **Memory 没生成** → 任务太简单（纯聊天），Review Agent 判断不沉淀
2. **Skill 写得很糙** → 正常，Hermes 设计允许持续 patch，第一版有骨架就行
3. **Review Agent 塞噪声** → 随口说的无关信息被写入，直接手动删 MEMORY.md 即可（设计成可读可写纯文本就是为了方便人工干预）
4. **Token 涨太快** → Memory 太啰嗦 / Skill 太多，要定期清理过期事实和按场景打 tag
真正用顺需跑过 5-10 个真实任务，让 Memory 有几条干货 + Skill 目录有 3-5 个可复用能力。

### 四个反例
## 核心哲学
> 自进化不是模型变强，是 Agent 变熟练。
> Hermes 的设计哲学不是 AI 哲学，是组织学。
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/hermes-self-improving-overview-winty.md)

## 深度分析
### 组织学隐喻背后的设计意图
winty 将 Hermès Self-Improving 的设计哲学定性为"组织学而非 AI 哲学"，这一判断值得深入拆解。Memory 对应团队 wiki（事实沉淀）、Skill 对应 SOP（流程固化）、Nudge Engine 对应周会提醒（定时触发）、Review Agent 对应 Code Review（独立审计）——每一角色都在模仿人类组织中已被验证的知识管理机制。选择这些类比并非修辞技巧，而是刻意将 AI 自进化锚定在有成熟实践经验的结构上，降低设计试错成本。

### 四组件为何必须分离
Memory 和 Skill 的分离是整个系统最容易被低估的设计决策。大多数 Agent 系统将"知识"视为单一存储，混用事实与流程。winty 指出这会导致两个问题：临时信息被当作长期规则（例如用户某次随口提到的偏好变成了永久约束）、操作步骤被埋进记忆碎片导致检索失效。分离后，Memory 负责高密度、低噪音的事实层（如用户偏好、工具怪癖、项目规范），Skill 负责可执行的操作手册（触发条件 + 步骤 + 坑点 + 验证），各自的信息密度和更新频率天然不同。

### 独立 Review Agent 的认知偏差过滤价值
主 Agent 自行复盘的三个典型偏差——"做得好不学"、"尴尬步骤不记"、"用户没说不满意不改"——本质上是执行者角色与评估者角色的利益冲突。winty 引入独立 Review Agent 的逻辑不是"多一个 Agent"的技术方案，而是将角色分离这一组织学原则在 AI 层的对等实现。Review Agent 无执念、只看快照的属性，使其成为闭环中唯一的无偏判断节点。这个设计参照了 Code Review 在工程团队中的价值：审查者与执行者的视角重叠是代码质量问题的常见根源。

### 复利式学习的结构性意义
第 1 周"每 5-6 任务沉淀 1 个 Skill"到第 4 周"先扫 Skill 再执行"的演进路径，描述的不是学习速度的线性增长，而是知识资产的网络效应。Skill 互相调用产生组合创新，Memory 与 Skill 对照产生自我修正，这一结构使学习从加法变成乘法。值得注意的是，第 3 周"自动 patch 过时 Memory"这一能力并非自动实现——它需要 Memory 与 Skill 之间存在版本对照机制，暗示 Skill 的触发条件中需要包含对应的 Memory 失效条件。

### 进化上限：Memory 的稀缺性与修剪机制
winty 明确指出"进化 = 高质量精简，不是膨胀"，这一定义直指大多数自进化系统的根本缺陷——随着任务增多，Memory 持续膨胀，有用信号被噪声淹没。Hermes 的防御机制是三层过滤：Review Agent 否决（主观判断）、Skill 触发条件限制（场景匹配）、Memory 上限挤出旧事实（容量约束）。但三层过滤的失效条件值得思考：当任务领域快速切换时，三层都可能被绕过（Review Agent 被大量边缘任务冲击，Skill 触发条件无法覆盖新领域，Memory 被高频新事实覆盖旧规范）。

## 实践启示
### 落地路径：从小场景可复用任务开始
winty 在上手篇中验证了真实任务（文件按发布状态分目录）中第一次 12 步工具调用压缩到第三次 ~6 步的效果。这个案例的重要前提是：任务是真实可复用的。如果任务是一次性的，Skill 沉淀的价值趋近于零。建议从"用户在同一种文件处理、同一类代码审查、同一模式的信息抽取"等高频可复用场景切入，避免用 hello-world 任务测试自进化——后者会让 Review Agent 判断不沉淀，导致"Memory 没生成"的坑。

### Skill 治理是企业级落地的必备条件
winty 将 Skill 定义为"企业软件资产"而非 Markdown 文件，要求版本、owner、上线流程、回滚机制四要素。这一判断来自对"自污染"风险的前瞻：没有评估/版本/灰度/回滚/审计的 Skill 体系，会在运行足够长时间后积累大量过期/冲突/错误的操作流程。在团队协作场景中，这意味着每个 Skill 需要明确 owner（谁维护）、触发条件（什么场景用）、验证标准（怎么算做对了），并且支持人工干预——而 Hermes 设计成纯文本可读写，正是为了降低人工干预门槛。

### Token 膨胀的主动管理
Token 涨太快是 winty 列举的四个常见坑之一，根因是 Memory 太啰嗦或 Skill 太多。实践中建议两种缓解策略：定期清理过期事实（Memory 的时间衰减）和按场景打 tag（Skill 的精准召回）。前者需要在 Memory 设计中加入时间戳和失效条件字段，后者需要在 Skill 的触发条件中明确场景标签，使 Prompt Assembly 阶段能精准加载而非全量注入。

### 人工干预的合法性
Hermes 设计成纯文本读写是刻意降低人工干预门槛。winty 建议"Review Agent 塞噪声 时直接手动删 MEMORY.md"，这一定程度违反了"自进化系统应自主运行"的主流观点，但这恰恰是 Hermes 的务实之处：系统初期运行质量不可控，完全依赖系统自净化会放大噪声影响。人工干预的边界建议限定在"明显错误写入"的纠正，而非主动教导——后者会破坏 Review Agent 的独立判断价值。

## 相关实体
- [Hermes Agent 自进化机制源码解析](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-agent-self-evolving.md)

- [review agent 机制深度解析（winty）](https://github.com/QianJinGuo/wiki/blob/main/entities/review-agent-deep-dive-winty.md)

## Related

- `Hermes Agent Loop 架构`

---

