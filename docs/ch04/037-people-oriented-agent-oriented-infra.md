# 晓斌：从 People-Oriented 到 Agent-Oriented Infra —— 意图驱动 + 代码沉淀的进化体

## Ch04.037 晓斌：从 People-Oriented 到 Agent-Oriented Infra —— 意图驱动 + 代码沉淀的进化体

> 📊 Level ⭐⭐ | 30.1KB | `entities/agent-oriented-infra-intent-driven-code-sedimentation.md`

# 晓斌：从 People-Oriented 到 Agent-Oriented Infra
> "Agent 的自主程度是 infra 安全能力的函数。" —— 晓斌（阿里巴巴研发基础设施负责人）
>
> "**给 infra 补能力，而非给 agent 加限制。Infra 的安全能力越强，agent 的自主空间越大。**"

**晓斌**（阿里巴巴研发基础设施负责人）发表的深度长文。从一个 30 行架构的"周报系统"出发，**抽象出"意图驱动 + 代码沉淀"的统一框架**，提出 **从 People-Oriented 到 Agent-Oriented 的基础设施设计转向**——这是 2026 年 6 月对 AI Agent 基础设施设计**最系统化的论述**。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/agent-oriented-infra-intent-driven-code-sedimentation.md)
→ 阅读时间：约 30 分钟 · 6 大节 + 1 节致谢 + 3 篇参考资料

## 一句话定位

**"软件一直是'意图驱动 + 代码沉淀'的进化体"**——这个模式从未改变，改变的只是**驱动和沉淀的速度与机制**。Agent 革命的本质是**把循环速度从月级压缩到分钟级**。

## 0. 从一个周报系统说起

**架构**（一句话）：connector 打通异构系统 → 规范化成统一活动流 → 用一个**意图（skill）**驱动聚合与排版 → 生成单文件 HTML → 推送到 Pages

**两类组成部分**：
- **Agent** —— 核心驱动力，读取 SKILL.md 意图，**运行时动态生成 Python 脚本 + 动态生成 HTML**
- **代码** —— Python / Shell 脚本，但**大部分代码是 agent 每次运行时按需生成**，生命周期极短
- **Infra** —— 内部 Pages / CI / Git，**几乎"不可见"**——Agent 直接 push 并触发部署

**两个观察**：
1. **代码是 generated on the fly** —— 每次运行时根据当前意图和数据动态生成、执行、丢弃。**代码的生命周期从"月/年"缩短到了"分钟"** —— 类似 JIT 编译
2. **Infra 变得"不可见"** —— Git / CI / Pages 退到后台。**"告诉 agent 我要什么 → 拿到结果"**，中间透明

## 1. 统一观察：软件一直是"意图驱动 + 代码沉淀"的进化体

> "无论是传统研发还是 agent 研发，软件系统一直都是由'**意图（不确定性）驱动 + 代码（确定性）沉淀**'的进化体。这个模式从未改变，改变的只是驱动和沉淀的速度与机制。"

### 传统研发的循环
用户有意图（不确定的、模糊的、变化的）→ 产品经理压缩意图 → 研发翻译成代码（确定性沉淀）→ 代码上线运行 → 新的意图涌入 → 下一个循环

**桥梁 = 人**。**人的认知带宽** = 物理约束 → 循环速度 = 周或月级

### Agent 研发的循环
意图（SKILL.md / 自然语言）→ agent 理解意图并生成代码 → 代码执行 → 结果反馈 → 意图修正 → 下一个循环

**模式没变，桥梁从"人"变成"agent"，循环速度从周/月压缩到分钟级**。

### 两个案例

**案例 A：周报系统（Agent ≈ 90%）**
- 一轮迭代里改了多次意图：加会议决策模块 / 加交叉洞察 / 调整模块顺序 / 改标题
- **意图 → 执行的循环周期 = 分钟级**
- 副产品：每加一个 connector = 给团队定义一种工作模式。**"系统对人的要求从'按流程执行'变成了'按规范沉淀'"**

**案例 B：镜像仓库建站运维（Agent ≈ 50%）**
- 跨 6+ 异构平台、12+ 配置文件的结构化 SOP
- 传统排期 2 人日，AI 辅助后 1-1.5 小时
- **人机边界由出错代价决定，由风控机制决定**

> "**两者的差异不在模式，在速度。**"

## 2. 三个核心推论

### 推论一：Agent 不是革命，是加速
> "它没有改变软件进化的基本结构，只是把'意图 → 代码'的循环速度提高了几个数量级。"

**这意味着**：我们不需要推翻已有的认知框架来理解 agent，只需要追问：**当速度变化之后，原来在慢循环下成立的假设是否还成立？**

### 推论二：静态沉淀不会消失
> "不确定性被消除后，确定性的东西就应该用确定性的方式表达——**这就是代码存在的理由**。"

**Agent 占比应该呈锯齿形**：
- 意图涌入时陡升（不确定性高，agent 探索）
- 逻辑固化时缓降（不确定性消除，代码沉淀）
- **锯齿形本身就是一个系统健康度的诊断工具**（如果某条线是平线 = 要么需求真在持续变化（健康），要么该做的代码固化没做（不健康））

### 推论三：模式没变，但模式对基础设施的要求彻底变了
> "**当循环速度从月级到分钟级，原来为慢循环设计的基础设施就会成为瓶颈或变得不适用。**"

| 传统假设 | 慢循环下 | 快循环下 |
|---|---|---|
| **Git** | 假设每次变更都值得 commit | 假设失效 |
| **CI/CD** | 假设构建和部署是离散事件 | 假设失效 |
| **测试环境** | 假设代码是稳定的、可以提前准备好环境来跑 | 假设失效 |
| **发布系统** | 假设发布是低频的、需要人工审批 | 假设失效 |
| **Code Review** | 假设有人来看每一行代码 | 假设失效 |

> "**这些假设在慢循环下全部成立，在快循环下全部失效。**"

## 3. 三个关键变量（从传统研发到 agent 研发的完整差异）

### 变量 1：桥梁带宽 —— 从人到 agent
> "**'意图 → 代码'的桥梁从人换成了 agent，带宽提升了几个数量级。人的角色从'桥梁'后退为'意图的表达者'和'结果的验收者'。**"

**"这跟'聪明'无关——Standard 级别的模型就够了——这是认知带宽上的碾压"**
- 结果：**"新手 + AI = 老手的产出"**。SOP 从"面向人的菜谱"变成了"面向 agent 的可执行意图"

### 变量 2：沉淀粒度 —— 持久代码与瞬态代码的分化
> "Agent 没有消灭代码，而是让代码分化成了两种形态。"

| 类型 | 生命周期 | 例子 | 是否需要 Git |
|---|---|---|---|
| **瞬态代码** | 分钟级（用完即弃） | 周报系统每次运行时生成的 Python 数据处理脚本 | ❌ 不提交（类似 JIT 机器码不进版本库） |
| **沉淀代码** | 长期 | connectors.yaml / CI 部署配置 / check_connectors.sh | ✅ 需版本控制 + 测试 |

> "**越是动态的系统，越需要坚固的静态约束**——类型系统、沙箱、权限边界——这些确定性的约束成为 agent 系统可靠运行的护栏。"

### 变量 3：循环频率 —— 从发布周期到运行时反馈
> "**迭代的性质变了**——从离线的、批量的、有审批流的变更，变成了**在线的、增量的、实时反馈的演化**。"

| 传统迭代 | Agent 迭代 |
|---|---|
| 需求评审 → 开发（天/周）→ 测试 → 发布 | 意图表达 → 代码生成 → 结果验收 = **同一个会话** |
| 离散事件 | **连续过程**（"发布"概念本身变得模糊） |
| 1-2 周到 1-2 月 | **分钟级** |

> "**三个变量同时变化的效果是乘法而非加法。** 整个节奏变了，每个环节的设计假设都在同时失效。"

## 4. 三个实践案例：agent 与 infra 的摩擦

### 案例一：多角色 agent 研发系统
- 基于内部研发 CLI 搭建多角色 agent 系统（discovery / delivery / examiner）
- 跑起来的痛点：**运行环境全靠手工搭建 / 研发规范没有机器可读承载 / 接口偏"人用" / 验证难度梯度极大 / Code Review 缺上下文 / 没有可重复实验场**

> "**这远不是一个'沙箱'能覆盖的——它需要的是一个根据角色、任务、权限范围自动组装的完整工作环境。我们姑且把这个概念叫做 harness。**"

### 案例二：配置推送——agent 的自主程度取决于什么
- 同事**不敢让 agent 推送配置**——"**这是对 infra 安全能力缺失的精确识别，跟'不信任 AI'无关**"
- 反转：如果做了**严格资源归属治理** + **强 dry-run 能力**（`config-tool publish data=xxx.json --dry-run`），同事答："**比较放心让 agent 自己推送**"

> "**Agent 能不能自主操作，不取决于 agent 有多聪明，而取决于 infra 提供了多强的安全护栏。**"

**可推广**：所有生产环境的资源变更在"**资源归属 × 影响可预知 × 渐进信任 × 可回滚**"四个维度上的安全保证强度不同，agent 的自主空间也就不同。**回滚能力把不可逆操作变成可逆操作，等于降低了风险等级——这是 infra 能为 agent 做的最有杠杆的事之一**

### 案例三：身份与鉴权的碎片化
> "Agent 在使用基础设施时，最常遇到的阻塞往往是'**身份不对**'——比'不会用'更频繁。"

**沙盒环境的问题更尖锐**：
- Web SSO 需要浏览器（沙盒没有），短期 Token 2-8 小时过期（凌晨 3 点 token 过期，agent 直接卡死）
- 解法：**引入长效 Private Token** —— 一次生成、长期有效、完全 headless、后端零侵入

**结构性原因**：人的角色分工屏蔽了身份碎片化的复杂度（前端 / 后端 / 运维 / 数据各自 2-3 套系统）。**Agent 打破了角色边界** —— 一个 delivery agent 要 git（SSH）+ 研发 CLI（统一鉴权）+ 中间件（中间件身份）+ 监控（监控平台身份）—— **身份体系数量从"每人 2-3 套"膨胀到"每 agent 5-8 套"**

> "**两个乘法因子：角色融合导致身份体系数量膨胀 × 工作频率导致切换次数膨胀。**"

## 5. 设计原则：从 People-Oriented 到 Agent-Oriented

> "**Agent 的自主程度是 infra 安全能力的函数。**"

### 传统 People-Oriented infra
- 安全靠**人的自我约束**加**事后审计**
- 假设：操作者有常识 / 有责任心 / 操作频率低 / 能从口口相传的隐性知识中填补系统概念的裂缝

### Agent-Oriented infra
- 安全靠**机制化保证**——资源归属 / 权限管控 / dry-run / 分级策略 / 自动回滚
- 假设翻转：**"agent 不是可信的操作者（The agent is not a trusted operator）"**——它会 hallucinate、会生成 `../../.ssh` 这样的路径穿越

> "**从 People-Oriented 到 Agent-Oriented，本质上是把安全模型从'依赖人的自我约束'重建为'依赖 infra 的机制保证'。**"

> "**人容忍概念的裂缝，agent 需要概念的闭合**"（认知层面）+ "**人容忍安全机制的缺失（靠常识弥补），agent 需要安全机制的闭合（靠 infra 保证）**"（安全层面）= **面向 agent 的 infra 设计，就是把原来隐式依赖人的东西——无论是认知、常识还是责任心——显式化为系统机制**"

### 四层递进设计

| 层次 | 含义 | 关键能力 |
|---|---|---|
| **可理解（Comprehensible）** | agent 能建立正确的心智模型 | 概念自包含 / 显式化 / 不依赖口口相传 / **用 manifest / devcontainer 声明依赖、输入、输出、允许工具** |
| **可操作（Operable）** | agent 能安全可靠地行动 | 可试探（dry-run / preview）/ 幂等重试 / **操作原子可组合**（输入输出类型化）/ 隔离执行（每个任务一个 sandbox）/ **凭证不进 sandbox**（通过 vault / egress proxy 注入）/ 渐进信任（低风险 agent 自主，高风险人来点按钮） |
| **可感知（Observable）** | infra 把状态和结果清晰地交回 agent | 状态必须 API 可查 / 结构化 / 实时（Unix 的"Silence is golden"对 agent 有害）/ 每次响应提供足够语义让 agent 决定下一步 / 结果要可判定（CI pass/fail） |
| **可追溯（Traceable）** | 过程不丢失、可恢复、可回放 | 状态可恢复（snapshot / checkpoint）/ 过程可回放（保存 artifact / execution trace，可 fork/replay）/ **通过 agent 的行为来观测 infra 本身的设计质量** |

> "**Agent 反复重试某个 API → 反馈语义不足；调用顺序混乱 → 前置条件没有显式化；用错身份 → 身份体系碎片化。Agent 每次都会忠实地撞上去，频率极高——agent 的失败模式是 infra 设计缺陷的放大器。**"

## 6. 行业趋势与我们可以做什么

### 行业在做什么

**① 并行 agent 需要并行 infra** —— Vercel Superset IDE [1]
- 每个开发者同时跑最多 **12 个 coding agent**
- 三人团队每天产生约 **600 个 preview deployment**，平均构建时间约 30 秒
- 关键洞察：**当开发者同时运行多个 agent 时，底层 infra 的任何一层如果变慢，上层的并行性就会崩塌**——十二个工作流压缩成一个队列
- "**Agent 数量对 infra 的压力是乘法关系**：1 个开发者 → 12 个 agent → 12 套隔离环境 → 12 条并行 pipeline → 12 个即时部署"

**② Human DX 和 Agent DX 是正交的** —— Google Workspace CLI (gws) [2]
- 作者提出精确的区分：**Human DX 优化的是可发现性（discoverability），Agent DX 优化的是可预测性（predictability）**
- 关键实践：
  - **schema 自省替代静态文档**（gws `schema drive.files.list` 输出完整方法签名）
  - **输入加固防 hallucination**（路径沙箱化 / 拒绝控制字符 / 资源 ID 校验——**因为 agent 会 hallucinate 出 `../../.ssh` 这样的路径穿越**）
  - **发布 SKILL.md 文件编码 agent 无法从 `--help` 推断的不变量**（"写操作必须先 dry-run" / "list 调用必须加 --fields"）
  - **响应消毒防 prompt injection**

> "**面向 agent 的设计需要把 Unix 哲学里'Trust the user'的假设翻转过来。**"

**③ Credential Brokering 的行业趋同** [3]
- 核心判断：agent 需要凭证来访问外部服务，但 **agent 本身不能被信任持有这些凭证**——因为 prompt injection 可能导致凭证泄露
- 解法：**credential broker（代理层）** —— agent 发出请求时携带**占位符**（如 `__github_token__`）而非真实凭证；broker 认证 agent 身份后将占位符替换为真实凭证转发请求；**agent 全程未见到真实凭证**
- 行业趋同：Anthropic（Managed Agent Infrastructure）/ Vercel（Sandbox 凭证注入）/ Cloudflare（Outbound Workers）/ LangChain（Sandbox Auth Proxy）各自在不同层实现同一范式
- "**多家公司独立趋同到同一范式，说明这是 agent 安全模型的必然走向**"

### 4 大高杠杆行动方向

**① Harness 平台化** —— 把 agent 运行环境从"每个团队自己在云服务器上搭"变成**平台的内建能力**
- Harness spec 声明式定义——角色 / 工具 / 凭证 / workspace / skill
- handoff 时自动初始化，完成后自动回收
- "**本质上还是云原生 / serverless 的思路，但组装的对象从'应用'变成了'agent 工作环境'**"

**② 统一身份体系** —— **Agent-native 的身份**——不是借用人的 token，而是 agent 拥有自己的机器人身份
- 这个身份在所有 infra 上通用（消除统一鉴权 vs SSH 的碎片化）
- 远期方向：**credential brokering**

**③ Dry-run 基础设施** —— 在基础设施层提供**统一的"变更预览"能力**
- **资源归属治理**（这个配置属于哪个应用 / 哪个团队 / 哪个环境）是 dry-run 的前提
- Dry-run 的输出应该标准化：**diff + 影响范围 + 影响规模 + 风险等级 + 是否可回滚**
- "**'有 dry-run 就放心'——应该被泛化为一种 infra 能力，覆盖所有生产环境资源变更**"

**④ 验证体系的演进** —— 传统软件测试和 agent 评测**正在从两端走向融合**
- 断言方式从**精确匹配**（output == expected）演进到**约束满足**（输出满足一组约束——类型正确 / 不违反安全策略 / 业务逻辑自洽）
- **确定性验证与概率性验证分层共存**
- **测试从独立阶段变成持续验证**——CI 管固化代码（低频 / 确定性），嵌入式验证运行时管 on the fly 代码（高频 / 概率性 / 约束验证）

> "**一个判断：验证基础设施的投资优先级应该高于生成能力。**生成能力的提升是模型厂商在推的事，验证能力的提升是 infra 团队该做的事——而验证的可靠性直接决定了 agent 的自主空间。"

**⑤ Agent 行为驱动的 Infra 质量度量** —— 通过 agent 的行为模式（重试频率 / 错误类型 / 绕路路径）来**度量 infra 的 agent 友好程度**
- "**Agent 成为 infra 设计的持续压测者。用得越多，暴露的设计缺陷越多，改进方向越清晰**"

> "**Infra 的能力边界，就是 agent 的自主边界。**"

## 核心金句

- "**Agent 的自主程度是 infra 安全能力的函数。**"
- "**给 infra 补能力，而非给 agent 加限制。**"
- "**代码的生命周期从'月/年'缩短到了'分钟'** —— 类似 JIT 编译。"
- "**三个变量同时变化的效果是乘法而非加法** —— 整个节奏变了，每个环节的设计假设都在同时失效。"
- "**人容忍概念的裂缝，agent 需要概念的闭合** + **人容忍安全机制的缺失（靠常识弥补），agent 需要安全机制的闭合（靠 infra 保证）**"
- "**agent 不是可信的操作者（The agent is not a trusted operator）**——翻转 Unix 哲学'Trust the user'。"
- "**回滚能力把不可逆操作变成可逆操作，等于降低了风险等级**——这是 infra 能为 agent 做的最有杠杆的事之一。"
- "**Agent 反复撞上设计缺陷 → agent 的失败模式是 infra 设计缺陷的放大器**"
- "**Harness 的供给必须是即时的** —— '环境初始化需要 5 分钟'在 12 个并行 agent 面前就是 60 分钟的等待。"
- "**验证基础设施的投资优先级应该高于生成能力**"
- "**Infra 的能力边界，就是 agent 的自主边界。**"

## 与已有 wiki 实体的关系

### vs [Agent Harness 架构](ch03/045-agent.md)
- 7 层 harness 模型 = 抽象框架
- 晓斌 = "**harness = 根据角色、任务、权限范围自动组装的完整工作环境**"——具体落地 + 工具、凭证、workspace、skill 4 维组装
- 共同点：harness 决定 agent 自主空间

### vs [wow-harness v3](ch05/009-harness.md)
- v3 = 跨 session 事件时间线 + 概念图（**协议层**治理）
- 晓斌 = "harness 平台化"（**运行环境层**变革）——"组装的对象从'应用'变成了'agent 工作环境'"
- 共同点：都强调"infra / 协议"是 AI Agent 落地的关键

### vs [Kimi Work](ch01/436-codex.md)
- Kimi Work = Harness 搬到本地桌面
- 晓斌 = Harness **平台化**（云上"组装对象从应用变成 agent 工作环境"）
- 共同点：harness 决定一切

### vs [PilotDeck](ch03/045-agent.md)
- PilotDeck = WorkSpace + Always-on + Dream 模式（**多项目隔离**）
- 晓斌 = harness 包含 workspace、skill、工具、凭证 4 维组装（**多角色多任务**）
- 共同点：都强调"为 AI 套上家"

### vs [Rein](ch03/045-agent.md)
- Rein = 4 模块 + 5 类型边界（**代码层**架构）
- 晓斌 = 4 层 Agent-Oriented Infra 设计（**infra 层**架构）
- 共同点：都强调"边界 / 接口"是工程化关键

### vs [Microsoft Build 2026](ch04/150-ai.md)
- MAI = "从零训练 + 无蒸馏"（**模型层**独立）
- Scout = 企业级智能体（**应用层**）
- 晓斌 = "**给 infra 补能力**"（**基础设施层**转向）—— **三件互补：模型 + 应用 + infra**

### vs [Agent Harness 上下文管理](ch03/045-agent.md)
- 上下文管理 = 工作集视角
- 晓斌 = 工具输出可预知 + 隔离执行 = 上下文在多 agent 并行时不被串扰

## 启示

1. **"Agent 不是革命，是加速"** —— 不需要推翻已有认知框架，只需要追问"当速度变化后，原来的假设是否还成立"
2. **锯齿形 agent 占比是系统健康度诊断工具** —— 平线 = 不健康
3. **三变量乘法效应** —— 桥梁带宽 × 沉淀粒度 × 循环频率 同时变化 = 整个节奏变
4. **回滚能力 = 最大杠杆** —— 把不可逆变可逆 = 降低风险等级 = 扩大 agent 自主空间
5. **Agent 失败模式 = infra 设计缺陷的放大器** —— 持续压测者 = 可度量
6. **"agent 不是可信的操作者"** —— 翻转 Unix 哲学"Trust the user"
7. **验证基础设施投资 > 生成能力投资** —— 验证可靠性直接决定 agent 自主空间
8. **Credential brokering 是行业必然趋同** —— agent 持有凭证 = 不可信；broker 代理 = 信任边界

## 局限

- 文章是阿里内部基础设施负责人视角，主要案例是"研发链路 agent 化"——其他领域（客服 / 销售 / 内容创作）的 infra 设计挑战未涉及
- "Agent 占比 90% vs 50%" 的对比主要来自两个内部案例，**样本量小**
- 行业趋势部分引用了 Vercel / Google / Infisical 三家资料，**更多公司的 agent-oriented infra 实践需要继续观察**
- **"三个变量乘法效应"是定性判断**，缺乏量化模型

## 参考资料
- [1] Vercel Blog, "How Superset built the IDE for AI agents on Vercel", 2026-05-10
- [2] Justin Poehnelt, "You Need to Rewrite Your CLI for AI Agents", 2026-03-04
- [3] Tony Dang, "Credential Brokering for AI Agents", Infisical Blog, 2026-05-23

## 深度分析

1. **"意图驱动 + 代码沉淀"统一框架的核心洞察**：文章从一个 30 行架构的周报系统出发，抽象出软件进化的统一模式——意图（不确定性）驱动代码（确定性）沉淀。这个框架解释了为什么 agent 革命不是颠覆性创新，而是循环加速：模式没变，桥梁从人换成 agent，带宽提升几个数量级，循环速度从月级压缩到分钟级。

2. **三个关键变量的乘法效应**：桥梁带宽、沉淀粒度、循环频率这三个变量同时发生变化，其效果不是简单相加而是相乘。整个节奏变了，每个环节的设计假设都在同时失效——Git/CI/CD/测试环境/发布系统/Code Review 在慢循环下成立的假设，在快循环下全部崩塌。

3. **People-Oriented 到 Agent-Oriented 的安全模型翻转**：传统模式依赖人的自我约束和事后审计；Agent-Oriented 依赖机制保证（资源归属/权限管控/dry-run/分级策略/自动回滚）。核心翻转是"agent 不是可信的操作者"——它会 hallucinate，会生成 `../../.ssh` 这样的路径穿越。面向 agent 的设计需要把 Unix 哲学"Trust the user"翻转过来。

4. **Credential Brokering 是行业必然趋同**：多家公司（Anthropic/Vercel/Cloudflare/LangChain）独立趋同到同一范式——agent 不能直接持有凭证，必须通过 broker 代理。Agent 发出请求时携带占位符（如 `__github_token__`），broker 认证后将占位符替换为真实凭证转发；agent 全程未见到真实凭证。这个范式是 agent 安全模型的必然走向。

5. **Harness 即时供给是并行 agent 的刚性约束**：Vercel 案例揭示——1 个开发者 × 12 个 agent = 12 套隔离环境 × 12 条并行 pipeline × 12 个即时部署。任何一层变慢，上层并行性就会崩塌。Harness 的供给必须是即时的——"环境初始化需要 5 分钟"在 12 个并行 agent 面前就是 60 分钟的等待。

## 实践启示

1. **把 dry-run 能力泛化为 infra 内建能力**：配置推送案例的启示——"有 dry-run 就放心"应该被推广为所有生产环境资源变更的标准能力。Dry-run 输出应标准化：diff + 影响范围 + 影响规模 + 风险等级 + 是否可回滚。这是在 agent 和高风险操作之间建立渐进信任机制的基础设施层保障。

2. **建立资源归属治理作为 dry-run 的前提**：在统一变更预览能力之前，必须先建立资源归属治理——明确每个配置属于哪个应用/团队/环境。没有资源归属治理，dry-run 无法输出有意义的"影响范围"，agent 的自主空间也就无法扩大。这是 infrastructure 层必须先行的基础工作。

3. **设计 agent-native 的统一身份体系**：人靠角色分工屏蔽了身份碎片化的复杂度，agent 打破角色边界后横跨 5-8 套身份体系。理想状态是 agent 拿到一个身份，在所有 infra 上通用。短期用长效 Private Token 解决 7×24 无人值守的 token 过期问题；长期靠 credential brokering 实现"agent 能用凭证但不持有凭证"。

4. **用 agent 行为模式度量 infra 的 agent 友好程度**：Agent 的失败模式是 infra 设计缺陷的放大器。反复重试某个 API → 反馈语义不足；调用顺序混乱 → 前置条件没有显式化；频繁在两个系统之间做格式转换 → 接口不可组合。通过重试频率/错误类型/绕路路径等指标，把 infra 设计质量从主观判断变成可度量的工程数据。

5. **验证基础设施的投资优先级应高于生成能力**：生成能力的提升是模型厂商在推动的事；验证能力的提升是 infra 团队该做的事。断言方式从精确匹配（output == expected）演进到约束满足（输出满足类型正确/不违反安全策略/业务逻辑自洽等约束）。验证的可靠性直接决定了 agent 的自主空间。

## 相关对照
- [Agent Harness 架构](ch03/045-agent.md) —— 7 层 harness 模型
- [wow-harness v3](ch05/009-harness.md) —— 跨 session 事件时间线
- [Kimi Work](ch01/436-codex.md) —— 本地桌面 Agent
- [PilotDeck](ch03/045-agent.md) —— 多项目隔离
- [Rein](ch03/045-agent.md) —— 4 模块 + 5 类型边界
- [Microsoft Build 2026](ch04/150-ai.md) —— 全栈 AI
- [Claude Code 20000 字符源码分析](ch03/075-claude-code.md) —— 98.4% 基础设施

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/agent-oriented-infra-intent-driven-code-sedimentation.md)

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/observability-monitoring.md)

---

