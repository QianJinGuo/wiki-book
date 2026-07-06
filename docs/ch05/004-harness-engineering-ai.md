# Harness Engineering：AI 从"聪明"到"可靠"的第三代工程范式

## Ch05.004 Harness Engineering：AI 从"聪明"到"可靠"的第三代工程范式

> 📊 Level ⭐⭐ | 31.1KB | `entities/harness-engineering.md`

## 核心命题
**AI 不缺能力，缺的是一套让它不翻车的系统。**
核心公式：`Agent = Model + Harness`

- Model 决定 AI 有多聪明
- Harness 决定 AI 有多可靠
**Harness = 环绕 AI 模型的完整控制基础设施**（记忆系统、工具接口、编排逻辑、安全护栏、可观测性管道、评估回路）。

## 三大工程缺陷
| 缺陷 | 表现 | 工程后果 |
|------|------|---------|
| 概率性输出 | 同一输入，输出不确定 | 难以通过测试、无法保证 SLA |
| 短时记忆 | 上下文窗口之外的内容全部遗忘 | 跨任务状态丢失 |
| 幻觉倾向 | 可能伪造数据、捏造引用 | 不可直接接入生产系统 |

## AI 工程三代进化
| | Prompt Engineering | Context Engineering | Harness Engineering |
|--|---|---|---|
| 核心关注 | 如何表达指令 | 如何管理信息 | 如何构建控制系统 |
| 管理范围 | 单轮 Prompt | 上下文窗口 | 任务全生命周期 |
| 工程师角色 | Prompt 撰写者 | 信息管道设计者 | **控制系统架构师** |
| 典型工具 | ChatGPT 对话框 | LangChain、LlamaIndex | LangGraph、AutoGen、CrewAI |

## 六层架构
### 信息层
1. **记忆与状态管理** — 外部状态管理 + 按需加载（不是塞满 context）

   - 短期：Context Window 直接注入
   - 长期：向量数据库（Pinecone/pgvector）
   - 情节：Redis/DynamoDB
   - 过程：PostgreSQL
2. **知识传递系统** — 静态知识（Git+向量库）vs 动态知识（MCP 实时注入）

### 执行层
3. **工具与技能体系（Tool Sandbox）** — Schema + 权限控制 + 执行边界
4. **编排与协调（Verifiable Loop）** — 每个子任务完成标准必须机器可验证；多 Agent 交接状态（Handoff State）必须序列化并持久化

### 反馈层
5. **约束与验证（Guardrails）** — 输入/执行/输出三层护栏；金融/医疗/法律行业强制 Chain-of-Thought
6. **追踪与可观测性（Observability）** — Trace + Metrics + Logs + Evals；熵控制

## 核心运营逻辑：用错误喂养规则库
```
AI 犯错 → 转化为规则/测试/约束 → 更新规则库 → AI 永不再犯 → 系统自我进化 ♻️
```

## 七大反模式
1. **层级混淆** — 把 Harness 逻辑写进 Prompt
2. **工具堆砌** — 给模型 50+ 个工具
3. **过早自治** — 跳过验证回路直接追求完全自动化
4. **忽视验证** — 只看输出是否"像对的"
5. **静态规则库** — 规则写完就不更新
6. **无状态设计** — 每次对话重新开始
7. **忽视熵管理** — Agent 无限制产生副作用

## 分级决策树
| 场景 | 必须做 | 可暂缓 |
|------|--------|--------|
| 内部知识问答 Bot | ② 知识传递、⑤ 输出护栏 | ③ 工具沙箱 |
| 代码审查 Agent | ①③⑤⑥ 全做 | 无 |
| 自动化运维 Agent | **全部六层 + 人工审核节点** | 无 |

## 成本模型
| 方案 | 延迟 | 可靠性 |
|------|------|--------|
| 无 Harness | ~1-2s | 低 |
| 最小 Harness | ~2-4s | 显著提升 |
| 完整 Harness | ~5-15s | 高，适合生产 |
**三条成本控制策略**：① 按风险分级调用 ② 约束库缓存（节省 10-20% Token）③ 验证回路短路

## 核心评估三指标
1. **任务成功率**（目标 > 85%）
2. **错误重犯率**（应趋向 0，滚动 7 日窗口）
3. **系统熵增速度**（Trace 状态大小变化趋势）

## 与 AI Skill 测评体系的关系
Harness Engineering 是 AI Skill 测评体系的**上位工程框架**：

- AI Skill 测评体系解决的"如何验证 Agent 输出的正确性"是 Harness 第④层（可验证循环）和第⑤层（约束验证）的核心内容
- skill-creator 的四层验证体系是 Harness 在评测垂直场景的具体实现
- 测评体系本身是 Harness 反馈层（Eval）的核心组件
**关系**：Harness Engineering 回答"如何构建可靠的 AI 系统"，AI Skill 测评体系回答"如何验证 AI 系统的输出质量"。两者是"控制系统"与"验证手段"的关系。

## 深度分析
1. **Harness 是 AI 可靠性的决定性因素** — 原文提出 `Agent = Model + Harness`，Model 决定 AI 有多聪明，Harness 决定 AI 有多可靠。这与 Martin Fowler 的"非确定性引入研发链路"观点形成呼应：Harness 才是真正承重的部分。 → 见 [Martin Fowler AI 研发提醒](ch05/009-harness.md)
2. **六层架构的信息层核心洞察：上下文窗口不是数据库** — LLM 的上下文窗口天然会"忘记"，必须通过外部状态管理（短期用 Context 直接注入、长期用 Pinecone/pgvector 向量库、情节记忆用 Redis/DynamoDB、过程记录用 PostgreSQL）来补足。 → 见 [AI Agent 记忆系统](../ch04/120-agent-memory.md)
3. **MCP（Model Context Protocol）是动态知识实时注入的关键基础设施** — 静态知识通过 Git+向量库版本控制，动态知识通过 MCP 实时注入，这是信息层区分"慢知识"与"快知识"的核心能力。 → 见 [Anthropic MCP 设计模式](../ch01/833-anthropic.md)
4. **"用错误喂养规则库"是 Harness 最核心的运营哲学** — AI 每次犯错不仅仅修正这一次输出，而是转化为规则/测试/约束更新约束库，形成"AI 永不再犯、系统自我进化"的正循环。这使得 Harness 与 Fine-tuning 相比具有可解释性和迭代速度优势。 → 见 [Agent 自我改进六机制](../ch03/045-agent.md)
5. **七大反模式揭示了 Harness 工程中的高频失败路径** — 层级混淆（把 Harness 逻辑写进 Prompt）、过早自治（跳过验证回路）、无状态设计（每次对话重新开始）、忽视熵管理（Agent 无限制产生副作用）都是实践中极易犯的错误。 → 见 [Harness Engineering 系统化框架](ch05/092-harness-engineering.md)

## 实践启示
1. **从最小可行 Harness（MVH）起步，先跑通反馈闭环** — 按"定义边界（harness_config.yaml）→ 建立验证回路 → 设计错误捕获管道"三步走，用 YAML 声明式管理约束而非硬编码，快速验证核心假设后再逐步叠加复杂度。 → 见 [Agent Harness 12 组件 7 决策](ch05/038-agent-harness.md)
2. **高风险场景（运维/金融/医疗）必须部署完整六层并加人工审核节点** — 不能心存侥幸。自动化运维 Agent 需额外配备回滚机制和变更审计日志，确保任何 destructive 操作都有可逆路径。
3. **建立"错误→规则"的自动化管道，把每次失败变成系统进化机会** — AI 犯错后，不仅修正这一次的输出，还要把这次错误转化为一条规则/测试/约束，更新到约束库。让错误数据成为 Harness 迭代的核心燃料。
4. **约束库内容缓存可节省 10-20% Token** — 约束库变化不频繁，缓存为系统提示前缀，避免每次推理都重新注入完整约束定义。按风险分级调用：低风险读/查询用轻量 Harness，高风险写/执行用完整 Harness。
5. **用 Trace 监控熵增速度，在失控前主动干预** — 追踪 Agent 状态大小变化趋势，通过 LangSmith/Arize Phoenix 等工具建立熵增预警阈值。当系统熵增速度超过阈值时触发人工复核，防止副作用无限累积。 → 见 [多 Agent 深度思考交易系统](https://github.com/QianJinGuo/wiki/blob/main/entities/构建基于多智能体架构的深度思考交易系统.md)

## Harness Engineering 的未来演进

来源：郭美青，2026-05-21，基于一线 AI 行业实践经验的预测分析。

### 核心分界线：主权线（非技术线）

模型能力提升不会消灭 Harness Engineering，但会把它从"技术实现"推向"治理设计"。

**被取代的工作（回答"怎么做"/how）**——本质是弥补模型能力不足的补丁：
1. **工具选择与调用：** 工具调用错误率从~40%降到<5%，1-2年内工具描述"质量"不再是瓶颈——编译器够好了
2. **格式适配：** 主流模型已具备上下文自动判断输出格式能力
3. **Context Window 管理：** "怎么塞信息"不重要了——100万token窗口，"Lost inMiddle"好了一个数量级。但"什么信息该进入context"是业务决策，不会消失
4. **基础规划：** o1/o3/Claude推理模式让简单规划成为内置能力。但复杂跨系统规划仍需外部支架
5. **基础自验证：** 模型self-critique部分取代Generator-Evaluator模式。但Anthropic 2024研究发现agent自我评估有系统性正面偏差——模型倾向于认为自己做得比实际更好
6. **通用Skill封装：** 通用Skill和垂直Skill都会变成模型能力。只有**组织专属Skill**（销售怎么判断客户优先级、法务怎么定义不可接受风险）会留下来——因为是组织意志问题，不是能力问题

**不会被取代的工作（回答"该不该做"/whether）**——主权问题，非智力问题：
1. **意志注入：** Agent服务于谁的目标？目标函数由人定义，模型是"员工"
2. **权限授予：** 权限是被赋予的，不是学会的。GPT-10不会自己给自己发放写入权限。即使授权模型做权限决策，"授权"本身也是人的决策
3. **环境供给：** Agent能力上限由工具集决定。不给浏览器就不能上网。永远由Harness构建者决定
4. **边界划定：** "元Harness"——约束进化本身的规则。Agent能自我改进，但"改进到什么程度该停"由人划定。像宪法修改需要更高层级共识
5. **治理与审计：** 评估框架越来越像治理工具，从"衡量模型能力"演变为"约束模型行为"

**核心结论：主权不可自生。** 权力来源永远在权力行使者之外。三个类比：员工不能自己定KPI、自动驾驶需要人类预设伦理框架、法官合法性来源在立法机关之外。

### 三阶段演进

| 时间 | 变化 | Harness Engineer角色 |
|------|------|---------------------|
| **短期（1-2年）** | 工具描述精雕细琢变不重要；Context管理变声明式配置 | "Agent 架构师"——设计系统，非实现细节 |
| **中期（3-5年）** | 模型开始自动构建部分Harness（Automated Harness Engineering） | 从"构建Harness"变为"审核和约束自动生成的Harness" |
| **长期** | 不可消亡内核固化为"Agent 宪法" | **治理工程**，非实现工程 |

> "不是教模型怎么做，而是决定模型为谁做、做什么、做到什么程度就该停。"

## 相关实体
- [Harness Engineering - 让 Coding Agent 可靠完成长程任务](ch05/092-harness-engineering.md)
- [Harness Engineering 四根支柱与四要素架构](ch05/092-harness-engineering.md)
- [Harness Engineering 指南（字节跳动TRAE）](../ch01/634-trae-harness-engineering.md)
- [清华大学 Harness Engineering 研究报告](ch05/092-harness-engineering.md)
- [Hermes Agent 深度解析（阿里云/飞樰）](../ch03/090-hermes-agent.md)
- [harness-engineering-systematic-explainer](ch05/092-harness-engineering.md)
- [Agent 原理、架构与工程实践](../ch03/045-agent.md)
- [AI Agent 工程师能力地图](../ch04/030-ai-agent.md)

- [Harness Component Expiry Evidence](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-component-expiry-evidence.md)
- [Harness Component Expiry Build To Delete](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-component-expiry-build-to-delete.md)
- [Harness Engineering Theory To Practice Helen](ch05/092-harness-engineering.md)
- [Evaluating Netflix Show Synopses With Llm As A Judge](../ch01/336-evaluating-netflix-show-synopses-with-llm-as-a-judge.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/llm-core-technology.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/agent-engineering-guide.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/loop-engineering.md)
## Related

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-engineering-survey-2026.md)

- `Harness Engineering 优化理论`

---

## 第 3 来源：AI技术立文「Harness Engineering 2026 版」（2026-06-09）

AI技术立文发布的系统性综述，将 OpenAI/Anthropic/ThoughtWorks 三家实践提炼为**5 种制品 + 三大阵营 + 5 条共识原则**，并首次量化 Harness 衰减的成本影响。

### 核心创新 / 关键数据

- **5 种制品分类**：AGENT.md/CLAUDE.md 引导文件、JSON 特性列表（进度追踪器）、会话初始化例程（7 步启动序列）、Sprint 契约（Generator-Evaluator 协商）、结构化任务模板（基于真实代码库的影响图）
- **三大阵营**：OpenAI 环境优先（Sora 4人28天→Play Store #1，崩溃率<0.1%）、Anthropic 执行评审分离（Generator-Evaluator-Planner 三 Agent）、ThoughtWorks 2×2 前馈/反馈框架
- **Harness 衰减成本数据**：Opus 4.5→4.6 去掉 Sprint 分解节省 38% 成本；Opus 4.7 模型自验证→Evaluator 角色缩小
- **A/B 成本对比**：无 Harness $9/20min（核心功能有缺陷）vs 完整 Harness $200/6h（功能完备）

### 对照表：三篇来源维度对比

| 维度 | 第 1 来源（第三代工程范式） | 第 2 来源（未来演进） | 第 3 来源（2026 版综述） |
|------|--------------------------|----------------------|------------------------|
| 核心叙事 | 六层架构 + 七大反模式 | 主权线 + 三阶段演进 | 5 制品 + 3 阵营 + 5 原则 |
| 架构分层 | 信息/执行/反馈三层六层 | 被取代 vs 不被取代 | OpenAI/Anthropic/ThoughtWorks 三派 |
| Harness 制品 | 未分类 | 未分类 | 5 种：引导文件/JSON 特性列表/初始化例程/Sprint 契约/任务模板 |
| 衰减/退化 | 未涉及 | 概念提及 | 量化：Opus 4.5→4.6 节省 38%，4.7 Evaluator 缩小 |
| 成本数据 | 三级延迟模型（1-15s） | 未涉及 | $9 vs $200 A/B 对比 |
| ThoughtWorks | 未涉及 | 未涉及 | 2×2 前馈/反馈框架（计算型/推理型） |
| 共识原则 | 未提炼 | 未提炼 | 5 条：上下文>指令、规划执行分开、反馈不可商量、一次一事、代码库即文档 |

### 与已有 source 呼应

- **5 种制品**（第 3 来源独有）与第 1 来源"六层架构"互补：制品是六层架构在代码库中的**具体物理形态**——AGENT.md 对应信息层，JSON 特性列表对应执行层（可验证循环），初始化例程对应编排层。
- **5 条共识原则**（第 3 来源独有）与第 2 来源"主权线"深度呼应："上下文胜过指令"对应"环境供给永远由 Harness 构建者决定"，"反馈回路不可商量"对应"治理与审计不可自生"——三方独立得出的共识验证了这些原则的稳定性。
- **Harness 衰减量化**（第 3 来源独有）为第 2 来源"被取代的工作"提供了实证：Sprint 分解在 Opus 4.6 后被取代，与"基础规划成为内置能力"的预测完全一致。

### 实践启示

- **Build to delete**：设计每个组件时就考虑它可移除，定期关掉看质量变化——Manus 6 个月重构 5 次，LangChain 1 年调整 3 次，Vercel 砍 80% 工具性能反而更好
- **JSON > Markdown 进度文件**：Agent 意外覆盖 JSON 的概率比 Markdown 低得多——6 小时无人值守中这种差异累积可观
- **Sprint 契约先于代码**：Generator 和 Evaluator 先协商"什么叫完成"，再开始实现——独立规划环节显著提升输出质量
- **22 倍成本差距换可交付产品**：$9 demo ≠ $200 产品——是否值得取决于一次失败发布的实际代价
- **趋势线**：更好模型 = 更简单 Harness = 更便宜运行 = 更快产出——这是当前最乐观的 Harness 经济学判断

→ [第 3 原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/harness-engineering-everything-2026-ai-tech-article.md)

---

## 第 4 来源：若飞「Harness Engineering：可删除的工程现场」（2026-05-24）

若飞从工程化裁员视角，论证 Harness Engineering 的核心矛盾——**不删会变胖，乱删会瘫掉**。核心立场：Harness 应被设计为"可删除"而非"可积累"，与 6 个月前 AI 工程师的乐观预期形成显著背离。

### 核心创新

- **Harness 衰减（Decay）现象**：Harness 不是静态配置，模型升级后会出现"旧规则阻碍新能力"——Opus 4.5 有效的复杂 Sprint 分解，到 4.6 反而拖慢速度 38%
- **可删除性原则**：每个 Harness 组件应从设计之初就可被移除，且移除后系统仍能工作
- **删除即验证**：定期强制删掉一个 Harness 组件看是否仍工作——Manus 6 个月重构 5 次、LangChain 1 年调整 3 次

### 与已有 source 呼应

- **第 1 来源"六层架构"**：若飞视角揭示每层都有衰减风险，信息层最先衰减（CLAUDE.md 内容过时），执行层次之（工具描述冗余）
- **第 2 来源"被取代的工作"**：若飞提供实操框架——Build to Delete 而非 Build to Last，与"主权线"互补

### 关键论断

- "**不是先建好 Harness 再优化，而是先建一个能删的 Harness**"——可删除性是设计原则而非事后优化
- Harness 工程的真正护城河不是积累了多复杂的规则，而是"**删规则的判断力**"
- 与 Build to Last 的传统软件工程思维根本对立

→ [第 4 原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/harness-engineering-deletable-worksite-ruofei.md)

---

## 第 5 来源：机器之心 Panda「Harness 套具：Loop 是心脏、Harness 是整辆车」（2026-06-17）

Panda 用汽车比喻把 Loop 和 Harness 的关系说透：Loop 是发动机（让 Agent 跑起来），Harness 是方向盘+刹车+安全带+护栏（让它跑得安全）。从代码泄露事件切入，给出 Harness 工程的**最反直觉洞察**：管住 AI 靠的不是"把话说清楚"，而是"让它根本做不到"。

### 核心创新 / 关键数据

- **汽车比喻 + 四件套拆解**：手（工具）/ 记事本（上下文）/ 护栏（权限）/ 反馈回路（Loop）——四件套缺一不可，Loop 仅占 1/4
- **Claude Code 代码泄露事件**：2026年3月底，50万行 TypeScript 源码意外泄露，全行业看清"最值钱的不是模型，是 Harness"
- **ETH Zurich 138 任务实测**：人写说明文档只提 4% 成功率，AI 自动生成反而降 3% 还多烧 20% 成本——**说明文档的边际效用近乎为零**
- **Hook vs 说明文档的本质区别**：CLAUDE.md 写一万遍"不许 rm -rf"都不如一个 hook——说明是"请求别做"，hook 是"让它根本做不到"
- **HumanLayer 60 行 CLAUDE.md 实践**：少写废话，多上硬拦截
- **Anthropic 自动模式分类器**：只看 Agent 要执行的动作，看不到嘴上说的那些话——故意设计，防止花言巧语忽悠安全门
- **Ghostty 规则生成规律**：文件里每一条规则，对应着过去 Agent 真实犯过的一次错——**每条规矩都是结过痂的伤疤**
- **Anthropic 反直觉观察**：模型越强，Harness 设计空间不但没缩小反而更大——能放手做更复杂危险的事，越需要精密缰绳

### 四件套对照表

| 组件 | 比喻 | 核心职责 | 失效后果 |
|------|------|---------|---------|
| 工具 | 手 | 读文件/跑命令/调服务 | 模型只能"说"不能"做" |
| 记忆+上下文 | 记事本 | 上下文窗口管理/压缩 | 长任务必爆 |
| 权限+安全 | 护栏 | 边界划定/危险拦截 | 一条 rm -rf 毁一切 |
| 反馈回路 | 心脏 | 验证/回滚/Loop | 错误累积不可逆 |

### 与已有 source 呼应

- **第 1 来源"六层架构"**：Panda 的四件套是六层架构的"功能视角"——工具对应执行层、记忆对应信息层、护栏对应权限层、反馈对应反馈层
- **第 2 来源"主权线"**：Panda 强调的"hook > 说明文档"完美印证"权限授予是被赋予的不是学会的"主权命题
- **第 3 来源"5 条共识原则"**：与"上下文>指令"和"反馈回路不可商量"深度呼应——ETH 4% 数据为"上下文胜过指令"提供了残酷的实证
- **第 4 来源"Build to Delete"**：Panda 补充——Harness 不仅要可删，每条规则本身要"少写废话多上硬拦截"（HumanLayer 60 行实践）

### 5 个新洞察

1. **代码泄露事件 = Harness 工程的"麦穗时刻"**：50万行 TypeScript 揭示 Harness 才是真正护城河，模型只是心脏
2. **说明文档边际效用近乎零**：ETH 4% 数据颠覆"写文档=控制 AI"的直觉
3. **Hook > Documentation**：贴告示 vs 装门锁的本质区别
4. **每条规则背后是一次翻车**：Harness 是"防御工程"——不是设计出来的，是喂出来的
5. **模型越强 Harness 设计空间越大**：反"模型=解决一切"叙事

### 实践启示

- **Harness = 方向盘+刹车+安全带+护栏 + Loop=发动机**：4:1 的人体工程学配比
- **CLAUDE.md 写 60 行以内**：HumanLayer 实践，少废话多硬拦截
- **Hook 才是硬控制**：所有危险动作必须 hook 拦截，不能依赖文档劝说
- **Anthropic 自动模式分类器设计**：只输入 action，不输入 agent 的话——安全门设计反 prompt injection
- **Harness 的每个组件都要可删**：与第 4 来源"Build to Delete"形成跨来源共识

→ [第 5 原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/harness-engineering-loop-vs-harness-machine-heart-2026-06-17.md)

---

## 第 6 来源：微信文章「深入理解 AI Agent 时代的驾驭工程：Harness Engineering」（2026-07-01）

本文从 **Context Engineering vs Harness Engineering 的分层诊断**出发，提供了 Can.ac/LangChain/OpenAI 三组实证数据，并提出了**四类 Harness 能力组合**框架，与现有 6 层架构互补。本文也是唯一用 Coding Agent 用户视角组织 Harness 组件对照表的来源。

### 核心数据

- **Can.ac 实验**：仅改 harness 工具格式（模型权重不动），Grok Code Fast 1 编码分数 6.7% → 68.3%，输出 token 下降约 20%
- **LangChain Terminal Bench 2.0**：同一模型靠 harness 调整，排名第 30 → 第 5，分数提升 13.7 分
- **OpenAI 实践报告**：5 个月从空仓库做到约 100 万行代码，几乎无手写代码，主要靠 Codex Agent + PR 合并

### Context vs Harness 对照表

| 维度 | Context Engineering | Harness Engineering |
|------|-------------------|-------------------|
| 优化对象 | 单次任务输入质量 | 整个系统的持续运行质量 |
| 核心问题 | Agent 应该看到什么 | 系统应该阻止、验证、修正什么 |
| 常见症状 | 回答偏题、信息缺失 | 多轮漂移、规则失效、质量波动 |
| 常见手段 | Prompt、RAG、Memory、文档组织 | Lint、CI、Hooks、权限、流程控制 |
| 变化频率 | 随任务动态变化 | 相对稳定，偏基础设施 |

Context 解决「看什么」，Harness 解决「如何被约束和验证」。

### 四类 Harness 能力组合

1. **架构约束** — lint / dependency rule / 结构测试机械地拦住边界违反（"只要自动判定，就不留给人肉提醒"）
2. **反馈回路** — PostToolUse Hook（即时）→ pre-commit（提交前）→ CI（合并前）→ 人审（取舍判断）的多级反馈链路
3. **工作流控制** — Commands 固化流程 / Permissions 限制自动动作 / 目录隔离支持并行
4. **改进循环** — 定期归档 / 自动重构 / 规则回写 / 文档刷新，持续对抗熵增

四类组合与第 1 来源「六层架构」互补：六层是结构化视图，四类是功能组织视图。

### Coding Agent 组件对照表

| 组件 | 作用 | 偏向 |
|------|------|------|
| CLAUDE.md | 汇总项目规则 | Context |
| Commands | 固化可重复工作流 | Harness |
| Hooks | 关键事件后自动检查 | Harness |
| Skills | 注入特定任务方法 | Context |
| MCP Servers | 接入外部工具与数据 | Context |
| Permissions | 限定自动执行动作 | Harness |

此表是唯一按 Coding Agent 用户视角组织 Harness 与 Context 分类的实用参考资料。

### 与已有 source 呼应

- **第 1 来源「三代进化」**：本文 Context vs Harness 对照表与三代进化（Prompt → Context → Harness）完全一致，但提供了更细粒度的诊断维度——不再是进化阶段划分，而是每个维度上的两两对比
- **第 3 来源「5 种制品」**：本文的「四类能力」与制品视图互补——5 种制品是物理形态，四类能力是功能视图
- **第 4 来源「Build to Delete」**：本文的「改进循环」呼应「对抗熵增」命题，但更偏主动设计而非被动清除
- **第 5 来源「Hook > Documentation」**：本文的 PostToolUse Hook 代码示例（.claude/settings.json）是第 5 来源「钩子 > 说明文档」论点的具体实现

### 新洞察

1. **模型能力决定上限，Harness 设计决定这个上限能否稳定释放**——与第 5 来源「模型越强 Harness 设计空间越大」互补
2. **Can.ac 实证：仅改 harness，不动模型，6.7%→68.3%**——直接量化 harness 对 coding 得分的独立贡献
3. **四类能力 = 功能组织视图**：架构约束（阻止坏的）→ 反馈回路（尽快看见）→ 工作流控制（正确组织）→ 改进循环（长期保持）——Agent 工程组织新框架
4. **最小 Harness 路径**：4 件事起步（项目规范 → 自动门禁 → Commands → Hooks），PostToolUse Hook 代码示例直接可用

### 实践启示

- **不要把所有的 Agent 问题都当作 Prompt/Context 问题**：先检查 Harness 是否足够好，而不是急着换模型
- **最小 Harness 搭建路径**：规范（CLAUDE.md）→ 门禁（lint/type/test）→ 固化（Commands）→ 拦截（Hooks）
- **Hook 代码示例可直接复用**：.claude/settings.json 的 PostToolUse 配置可使 Agent 写文件后自动跑 oxlint

→ [第 6 原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/deep-dive-harness-engineering-context-vs-harness.md)

---

