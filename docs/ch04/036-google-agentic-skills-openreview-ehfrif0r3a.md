# Google Agentic Skills 系统综述：六元组定义 + 九阶段生命周期（openreview ehfRiF0R3a）

> 📊 Level ⭐⭐ | 7.7KB

## Google Agentic Skills 系统综述（46 页）

Google 2026-10 发布的 46 页系统综述《Agentic Skills》（openreview.net/pdf?id=ehfRiF0R3a），首次为 Agentic Skills 生态建立统一系统学框架：**六元组形式化定义 + 九阶段生命周期 + 10 张对比表梳理 100+ 代表性系统**。注意：与本库已有的 [Agent Skills 综述（arXiv:2605.07358，S=(M,R,C) 三元组）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-skills-comprehensive-survey.md) 是**两篇不同的论文**。

## 动机与形式化

LLM Agent 长程任务的两大短板：**可靠性瓶颈**与**复用性瓶颈**。把流程塞上下文窗口 → token 成本随指令集线性膨胀；微调进权重 → 工具/API 变化速度远超重训练周期。外置可执行技能（Externalized Executable Skills）为此而生：模块化工件存于模型外、按需加载、免重训练更新。

**六元组定义**：s = (A, I, C, T, π, E)——激活条件 A、程序指令 I、适用约束 C、工具接口 T、执行策略 π、预期效果 E。技能判定三元组标准：**封装模块化**（独立于权重与框架代码）/ **晚绑定动态调用**（A(x_t, g)→{0,1} 按状态与目标动态加载）/ **程序性状态转换**（编码"怎么做"的操作知识而非陈述性事实）。边界厘清：全局系统提示词不是技能（无晚绑定）、裸 API 不是技能（无程序控制流）、带超时重试+缓存降级+DOM 解析的 API 封装就是"工具执行技能"。

**安全约束形式化**：技能激活当且仅当其声明工具集 ⊆ 当前上下文允许工具集，否则即权限提升。

## 九阶段生命周期

发现（从轨迹日志抽取满足"结果持久+熵最小化"的子策略）→ 编写（自主 RL 诱导 SkillRL/Skill-Pro、AI 合成 Voyager/AutoSkill/Trace2Skill、人机混合 AgentClick、纯手工 EasyTool 四条路线）→ 存储 → 检索 → 编排 → 执行 → 演化 → 评估 → 安全。**技能发现的形式化**：发现算子 D 从历史轨迹 H 找最优子轨迹、归纳适用上下文 C，经获取算子优化后必须通过准入前验证 V(s*)=1（单元测试/静态分析/形式化证明）才能入库。表示格式对比覆盖自然语言、结构化 JSON/DSL、可执行规范、契约式与混合格式在可验证性/可移植性/注入面/加载成本上的权衡。

## 深度分析

### 编排结构决定失败恢复的代价

原文对技能组合三种基本结构（顺序流水线、动态 DAG 编排、层级递归调用）的比较揭示了一项常被忽视的经济学：扁平顺序链中任何中间节点失败都会触发全局重规划，代价随链长 O(N) 增长；而类型化 DAG 编排因节点间依赖被显式声明，失败可定位到子树内部做局部有界恢复——只修坏掉的依赖节点。这解释了为什么 MetaGPT、ChatDev、AutoGen 这类多智能体 SOP 流水线在长程任务上失败代价高：其编排拓扑本质上是扁平链。存储侧借鉴操作系统虚拟内存思想（MemGPT 式上下文分页、SKILL.state 可变执行状态、SkillOps 五维技能库健康度治理）的做法，可与 [三层 Agent 记忆基座](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-memory-substrate-three-layer.md) 对照理解。

### 表示格式是一条"灵活性换可验证性"的滑杆

五种表示格式的对比收敛为一个反比关系：自然语言最灵活但无法预验证，可执行代码可验证能力最强但注入面最大，结构化 JSON/DSL、契约式与混合格式在两端之间滑动取值。结合 [提示注入防御](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/prompt-injection-defense.md) 的视角看，选择表示格式实质上是在为安全审计定预算：越靠近自然语言，越依赖运行时护栏兜底；越靠近可执行规范，越能在准入前静态阶段拦截威胁。

### "调用前不可完全验证"是技能安全的根源困境

SkillSec-Eval 在 327 个真实技能上的审计显示漏洞横跨全部 5 个生命周期阶段，恶意技能可携带后门、窃取凭证、绕过护栏。论文的三层防御——准入前静态审计（SemiA 形式化审计、SkillAuditSAST 跨文件扫描）、运行时护栏（FlowGuard、RouteGuard）、市场治理（SecureAgentSkills 加密溯源签名）——各自截断不同攻击面，但都无法消除根本矛盾：技能只有被真正调用后才暴露完整行为。这与"声明工具集 ⊆ 当前允许工具集否则即权限提升"的安全约束形式化一起，构成 [Agent 安全架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-security-architecture.md) 在技能层的具体化。

### 环境反馈带宽假说解释技能的边际收益

生态部分的实证发现之间存在张力：SkillsInWild 测量 3.4 万个真实技能后发现技能效用相当脆弱；AgentSkillOS 却证明树状检索 + DAG 组合在 20 万技能规模下优于扁平池。"环境反馈带宽假说"给出统一解释——OffensiveCS-Eval 发现程序性技能在网络安全 CTF 任务上零增益，因为环境本身已能提供丰富诊断信息；外置技能的收益集中在反馈贫瘠的领域。该假说也为 [验证器驱动开发](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/verifier-driven-development.md) 提供了反面佐证：环境可验证性越高，技能作为"预打包经验"的相对价值越低。

## 实践启示

1. **按恢复代价选编排拓扑**：任务链长且中间失败概率高时，优先类型化 DAG 而非扁平顺序链——O(N) 全局重规划与子树局部恢复的差距在长程任务上会持续放大。
2. **用准入前验证把关技能入库**：新技能入库前强制通过 V(s*)=1（单元测试/静态分析/形式化证明），并以"结果持久 + 熵最小化"作为从轨迹日志中抽取子策略的过滤标准。
3. **表示格式与安全预算联动决策**：选结构化/可执行格式换取预验证能力时，若接受更大注入面，必须配套运行时护栏；纯自然语言技能默认视为不可信输入。
4. **主动偿还技能技术债**：引入 SkillOps 式健康度治理，定期剪除低价值技能——技能库不是只增不减的仓库，膨胀本身会拖垮检索与路由质量。
5. **先测环境反馈带宽再建技能**：若运行环境本身输出丰富诊断信息（编译错误、测试报告、形式化验证结果），不要投入技能建设，边际收益趋近于零。
6. **第三方技能双门禁激活**：从社区市场引入技能时，要求加密溯源签名与声明工具集白名单校验同时满足，任一不满足即视为权限提升拒绝激活。

## 定位

六元组+九阶段比 S=(M,R,C) 三元组覆盖更宽（从表示扩展到全生命周期与安全形式化）；与 [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-framework.md) 的"扩展边界"和 [Anthropic 14 模式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-14-skill-patterns-best-practices.md) 分别构成学术形式化 / 产业实践两侧。技能发现=轨迹挖掘的思想与 [OpenViking 经验记忆](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openviking-experience-memory-agent-evolution-loop-2026.md) 的 Session→Experience 提炼同构。

→ [原文存档](https://mp.weixin.qq.com/s/CPgOAPoBhbDyQorb0XRywA)

---

