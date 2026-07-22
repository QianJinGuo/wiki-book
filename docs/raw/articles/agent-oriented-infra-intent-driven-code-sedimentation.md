---
title: "晓斌：从 People-Oriented 到 Agent-Oriented Infra —— 意图驱动 + 代码沉淀的进化体"
source_url: "https://mp.weixin.qq.com/s/fOONHtYDAJ39BojQxJ2-qg"
publish_date: 2026-06-04
tags: [wechat, article, agent, infra, agent-oriented, harness, people-oriented, intent-driven, code-sedimentation, jit, dry-run, credential-brokering, alibaba, claude, anthropic, drm]
review_value: 10
review_confidence: 9
review_recommendation: strong
sha256: pending
---

# 晓斌：从 People-Oriented 到 Agent-Oriented Infra
> "Agent 的自主程度是 infra 安全能力的函数。" —— 晓斌（阿里巴巴研发基础设施负责人）
>
> "从 People-Oriented 到 Agent-Oriented，本质上是把安全模型从'依赖人的自我约束'重建为'依赖 infra 的机制保证'。**给 infra 补能力，而非给 agent 加限制**。Infra 的安全能力越强，agent 的自主空间越大。"

**晓斌**（阿里巴巴研发基础设施负责人）发表的深度长文。从一个 30 行架构的"周报系统"出发，**抽象出"意图驱动 + 代码沉淀"的统一框架**，提出 **从 People-Oriented 到 Agent-Oriented 的基础设施设计转向**——这是 2026 年 6 月对 AI Agent 基础设施设计最系统化的论述。

→ [[raw/articles/agent-oriented-infra-intent-driven-code-sedimentation|原文存档]]
→ 阅读时间：约 30 分钟 · 6 大节 + 1 节致谢 + 3 篇参考资料

## 一句话定位

**"软件一直是'意图驱动 + 代码沉淀'的进化体"**——这个模式从未改变，改变的只是**驱动和沉淀的速度与机制**。Agent 革命的本质是**把循环速度从月级压缩到分钟级**。

## 0. 从一个周报系统说起

**架构**（一句话）：connector 打通异构系统 → 规范化成统一活动流 → 用一个**意图（skill）**驱动聚合与排版 → 生成单文件 HTML → 推送到 Pages

**三类组成部分**：
- **Agent** —— 核心驱动力，读取 SKILL.md 意图，**运行时动态生成 Python 脚本 + 动态生成 HTML**
- **代码** —— Python / Shell 脚本，但**大部分代码是 agent 每次运行时按需生成**，生命周期极短
- **Infra** —— 内部 Pages / CI / Git，**几乎"不可见"**——Agent 直接 push 并触发部署，不需要关心 CI 配置或部署流程

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

**模式没变，桥梁从"人"变成"agent"，循环速度从周/月压缩到分钟级**。^[raw/articles/agent-oriented-infra-intent-driven-code-sedimentation.md]

### 用这个视角重新看两个案例

**案例 A：周报系统（Agent ≈ 90%）**
- 一轮迭代里改了多次意图：加会议决策模块 / 加交叉洞察 / 调整模块顺序 / 改标题
- 每次修改后 agent 立即重新生成代码并部署
- **意图 → 执行的循环周期 = 分钟级**
- 桥梁几乎完全是 agent，人只负责表达意图和验收
- 副产品：每加一个 connector = 给团队定义一种工作模式。**"系统对人的要求从'按流程执行'变成了'按规范沉淀'"**

**案例 B：镜像仓库建站运维（Agent ≈ 50%）**
- 跨 6+ 异构平台、12+ 配置文件的结构化 SOP
- 传统排期 2 人日，AI 辅助后 1-1.5 小时
- 桥梁 = agent + 人。Agent 执行全部技术操作，人处理风控（生产环境配置推送 + 白名单变更）
- 意图 → 执行的循环周期 = 1.5 小时
- **人机边界由出错代价决定，由风控机制决定**

> "**两者的差异不在模式，在速度。**"

## 2. 三个核心推论

### 推论一：Agent 不是革命，是加速
> "它没有改变软件进化的基本结构，只是把'意图 → 代码'的循环速度提高了几个数量级。"

**这意味着**：我们不需要推翻已有的认知框架来理解 agent，只需要追问：**当速度变化之后，原来在慢速下成立的假设是否还成立？**

### 推论二：静态沉淀不会消失
> "不确定性被消除后，确定性的东西就应该用确定性的方式表达——**这就是代码存在的理由**。用一个巨大的概率模型去逼近一个已经确定的函数，在信息论意义上是荒谬的浪费。"

**Agent 占比应该呈锯齿形**：
- 意图涌入时陡升（不确定性高，agent 探索）
- 逻辑固化时缓降（不确定性消除，代码沉淀）
- **两个案例分别代表了两条典型路径**

**两条线的最终态**：
- 周报系统（agent-native）：从接近 100% 高位出发 → 几轮迭代后 connectors.yaml 稳定 / CI 固化 → agent 占比下降 → 新意图涌入又上升
- 镜像服务（存量系统）：从低位出发 → 逐步让 agent 接管 → 每次接管都是一个小锯齿
- **两条线最终都在震荡中趋向各自的均衡点**
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

> "**这些假设在慢循环下全部成立，在快循环下全部失效。**"^[raw/articles/agent-oriented-infra-intent-driven-code-sedimentation.md]

## 3. 三个关键变量（从传统研发到 agent 研发的完整差异）

### 变量 1：桥梁带宽 —— 从人到 agent
> "**'意图 → 代码'的桥梁从人换成了 agent，带宽提升了几个数量级。人的角色从'桥梁'后退为'意图的表达者'和'结果的验收者'。**"

**镜像仓库建站案例最直接地体现**：
- 跨 6+ 平台、12+ 配置文件的编排 → 对人的认知带宽要求极高
- 关键细节：不同环境的密钥加密实例不同 / 密文不可互换 / 不同 region 镜像同步走不同流水线 / 缓存要刷新才能生效
- **Agent 的优势**恰恰在于此：**不丢上下文（12+ 个配置文件不混）、不漏步骤（6+ 个系统全部覆盖）、不混配置**
- "**这跟'聪明'无关——Standard 级别的模型就够了——这是认知带宽上的碾压**"
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
| 离散事件（每次发布是一个节点，两次发布之间系统静止） | **连续过程**（在意图和反馈的驱动下持续演化，"发布"概念本身变得模糊） |
| 1-2 周到 1-2 月 | **分钟级** |

> "**三个变量同时变化的效果是乘法而非加法。** 桥梁带宽提升让意图可以更快地进入系统，沉淀粒度变细让代码可以更灵活地生成和丢弃，循环频率跃迁让整个'意图 → 代码 → 反馈'的循环从离散事件变成了连续过程。**这就是为什么原有 infra 会系统性失配——整个节奏变了，每个环节的设计假设都在同时失效。**"^[raw/articles/agent-oriented-infra-intent-driven-code-sedimentation.md]

## 4. 三个实践案例：agent 与 infra 的摩擦

### 案例一：多角色 agent 研发系统
- 基于内部研发 CLI 搭建多角色 agent 系统（discovery / delivery / examiner）
- 覆盖从需求理解到发布上线的完整研发链路
- 跑起来的痛点非常密集：

**痛点 1：运行环境全靠手工搭建** —— 一台云服务器上同时维护多个模型入口 / 多套 CLI 工具 / 多个 agent profile / 多套凭证和代理配置
- 完整工作环境需要：workspace + 目标 repo + 前序环节 artifact + 工具和副作用范围 + 隔离凭证 + 对应 skill + 沟通和 handoff 通道
- **"这远不是一个'沙箱'能覆盖的——它需要的是一个根据角色、任务、权限范围自动组装的完整工作环境。我们姑且把这个概念叫做 harness"**^[raw/articles/agent-oriented-infra-intent-driven-code-sedimentation.md]

**痛点 2：研发规范没有机器可读的稳定承载** —— "这个应用到底应该怎么研发、测试、发布"散在人的经验 / 历史任务 / 平台页面 / 仓库文档里。Agent 只能临场猜，或者靠 prompt 硬编码

**痛点 3：接口还带有偏"人用"的痕迹** —— MR 的全局 id 和项目 iid 缺少强类型化区分，agent 经常传错。某些隐性规则散落在团队口头知识里（"回复 MR 评论必须回复 root 评论"）。--dry-run 只停留在研发 CLI 层，无法穿透到底层平台。Pipeline 报错或超时后，agent 不知道下一步该干什么

**痛点 4：验证的难度梯度极大** —— CLI 验证很简单（确定性高） / app 验证困难（UI 交互） / **web 验证超级困难**（浏览器环境、异步渲染、用户交互路径爆炸）。目前只能靠人为打 skill 补丁勉强解决 app 验证

**痛点 5：Code Review 缺上下文** —— 当 agent 产出的 MR 数量爆炸式增长，reviewer 不知道需求是什么 / 为什么这么改 / 哪些能力必须保留 / MR 在系统设计里承担什么角色。真正危险的缺陷在更上层（需求理解错了 / scope 漏了 / 方案方向错了 / 破坏了系统整体设计）。**Review 同样需要 harness** —— 自动准备原始需求 + discovery 产出 + 验收标准 + 研发规范 + MR diff + CI 状态 + 上下游影响

**痛点 6：没有可重复的实验场** —— 很多验证只能拿真实仓库 / 真实 MR / 真实 CI 来跑。**生产任务变成了集成测试**

### 案例二：配置推送——agent 的自主程度取决于什么
- 镜像仓库建站案例中，一个同事**不敢让 agent 推送配置**
- 顾虑：配置推送的权限管控几乎没有——**agent 逻辑上可以误推任何配置，包括其他高风险业务的配置**
- "**这是对 infra 安全能力缺失的精确识别，跟'不信任 AI'无关**"

**反转**：如果配置推送做了**严格资源归属治理** + **强 dry-run 能力**：
```bash
$ config-tool publish data=xxx.json --dry-run
output:
  diff: xxx
  affected apps: xxxxx, yyyy, zzz
  affected pods: about 1,024
```
- 同事回答："**如果是这样，就比较放心让 agent 自己推送配置了**"

> "**阻碍 agent 自主操作的瓶颈在哪里？不在 agent 侧——agent 的能力足够完成这个操作。瓶颈在 infra 侧**——没有资源归属治理、没有 dry-run、没有分级策略、回滚能力不足。"

> "**Agent 能不能自主操作，不取决于 agent 有多聪明，而取决于 infra 提供了多强的安全护栏。**"^[raw/articles/agent-oriented-infra-intent-driven-code-sedimentation.md]

**这个判断可以推广**：所有生产环境的资源变更（应用发布 / 数据库 migration / 网络策略 / DNS 修改）—— 每种变更类型在"**资源归属 × 影响可预知 × 渐进信任 × 可回滚**"四个维度上的安全保证强度不同，agent 的自主空间也就不同。**回滚能力把不可逆操作变成可逆操作，等于降低了风险等级——这是 infra 能为 agent 做的最有杠杆的事之一**

### 案例三：身份与鉴权的碎片化
> "Agent 在使用基础设施时，最常遇到的阻塞往往是'**身份不对**'——比'不会用'更频繁。"

- 公司基于统一鉴权框架统一了多个 CLI 身份，但 **git 仍用独立的 SSH 体系**
- 对人来说配一次就行；对 agent 来说是两套凭证管理逻辑 / 两套轮转机制 / 两套报错模式

**沙盒环境的问题更尖锐**：
- Agent 7×24 无人值守运行时，**传统鉴权全部失效** —— Web SSO 需要浏览器（沙盒没有），短期 Token 2-8 小时过期（凌晨 3 点 token 过期，agent 直接卡死，需人工介入刷新）
- 解法：**引入长效 Private Token** —— 一次生成、长期有效、完全 headless、后端零侵入
- "**这是一个正确的方向：从'以人为中心的短会话'，向'以 token 为中心的长效凭据'演进**"

**身份碎片化的结构性原因**：
> "原来人分为前端、后端、运维、设计、数据等角色，各系统为各自角色设计，各自有各自的身份体系。但每个人实际只接触自己角色对应的 2-3 套系统——**人的角色分工是一种天然的关注点分离，把身份碎片化的复杂度屏蔽在了各自的工作边界内**。"

**Agent 打破了角色边界** —— 一个 delivery agent 要 git clone（SSH）+ 研发 CLI 提 MR（统一鉴权）+ 操作中间件配置（中间件身份）+ 查监控（监控平台身份）—— 它一个"角色"横跨了原来多个人类角色的身份体系。**身份体系数量从"每人 2-3 套"膨胀到"每 agent 5-8 套"**

> "**然后第二层放大效应是频率**——人一天切换身份体系的次数可能就几次，每次切换的摩擦被工作间隙吸收。Agent 一分钟内可能连续调 git → 研发 CLI → 中间件 → 监控，**摩擦被放大成了瓶颈**。两个乘法因子：角色融合导致身份体系数量膨胀 × 工作频率导致切换次数膨胀。"

> "**理想状态是 agent 拿到一个身份，这个身份在所有 infra 上都能用。**"^[raw/articles/agent-oriented-infra-intent-driven-code-sedimentation.md]

## 5. 设计原则：从 People-Oriented 到 Agent-Oriented

> "**Agent 的自主程度是 infra 安全能力的函数。**"

### 传统 People-Oriented infra
- 安全靠**人的自我约束**加**事后审计**
- 假设：操作者有常识（不会手贱推别人业务的配置）/ 有责任心（出错后能人工修复）/ 操作频率低 / 能从口口相传的隐性知识中填补系统概念的裂缝
- 系统靠人的自我约束来弥补安全机制的缺失

### Agent-Oriented infra
- 安全靠**机制化保证**——资源归属 / 权限管控 / dry-run / 分级策略 / 自动回滚
- 假设翻转：**"agent 不是可信的操作者（The agent is not a trusted operator）"**——它会 hallucinate、会生成 `../../.ssh` 这样的路径穿越

> "**从 People-Oriented 到 Agent-Oriented，本质上是把安全模型从'依赖人的自我约束'重建为'依赖 infra 的机制保证'。给 infra 补能力，而非给 agent 加限制。**"

> "**人容忍概念的裂缝，agent 需要概念的闭合**"（认知层面）+ "**人容忍安全机制的缺失（靠常识弥补），agent 需要安全机制的闭合（靠 infra 保证）**"（安全层面）= **面向 agent 的 infra 设计，就是把原来隐式依赖人的东西——无论是认知、常识还是责任心——显式化为系统机制**"^[raw/articles/agent-oriented-infra-intent-driven-code-sedimentation.md]

### 四层递进设计

| 层次 | 含义 | 关键能力 |
|---|---|---|
| **可理解（Comprehensible）** | agent 能建立正确的心智模型 | 概念自包含 / 显式化 / 不依赖口口相传 / **用 manifest / devcontainer 声明依赖、输入、输出、允许工具** |
| **可操作（Operable）** | agent 能安全可靠地行动 | 可试探（dry-run / preview）/ 幂等重试 / **操作原子可组合**（输入输出类型化）/ 隔离执行（每个任务一个 sandbox）/ **凭证不进 sandbox**（通过 vault / egress proxy 注入）/ 渐进信任（低风险 agent 自主，高风险人来点按钮） |
| **可感知（Observable）** | infra 把状态和结果清晰地交回 agent | 状态必须 API 可查 / 结构化 / 实时（Unix 的"Silence is golden"对 agent 有害）/ 每次响应提供足够语义让 agent 决定下一步 / 结果要可判定（CI pass/fail） |
| **可追溯（Traceable）** | 过程不丢失、可恢复、可回放 | 状态可恢复（snapshot / checkpoint）/ 过程可回放（保存 artifact / execution trace，可 fork/replay）/ **通过 agent 的行为来观测 infra 本身的设计质量** |

> "**Agent 反复重试某个 API → 反馈语义不足；调用顺序混乱 → 前置条件没有显式化；用错身份 → 身份体系碎片化。人遇到这些问题会默默绕过去（问同事、手动修、记住坑），不产生可观测信号。Agent 每次都会忠实地撞上去，频率极高——agent 的失败模式是 infra 设计缺陷的放大器。**"^[raw/articles/agent-oriented-infra-intent-driven-code-sedimentation.md]

## 6. 行业趋势与我们可以做什么

### 行业在做什么

**① 并行 agent 需要并行 infra** —— Vercel Superset IDE [1]
- 每个开发者同时跑最多 **12 个 coding agent**
- 三人团队每天产生约 **600 个 preview deployment**，平均构建时间约 30 秒
- 关键洞察：**当开发者同时运行多个 agent 时，底层 infra 的任何一层如果变慢，上层的并行性就会崩塌**——十二个工作流压缩成一个队列
- "**Harness 的供给必须是即时的**"——"环境初始化需要 5 分钟"在 12 个并行 agent 面前就是 60 分钟的等待
- "**Agent 数量对 infra 的压力是乘法关系**：1 个开发者 → 12 个 agent → 12 套隔离环境 → 12 条并行 pipeline → 12 个即时部署。Infra 的吞吐量必须线性 scale with agent 数量"^[raw/articles/agent-oriented-infra-intent-driven-code-sedimentation.md]

**② Human DX 和 Agent DX 是正交的** —— Google Workspace CLI (gws) [2]
- 作者提出精确的区分：**Human DX 优化的是可发现性（discoverability），Agent DX 优化的是可预测性（predictability）**
- 关键实践：
  - **schema 自省替代静态文档**（gws `schema drive.files.list` 输出完整方法签名，CLI 成为 API 运行时状态的权威来源）
  - **输入加固防 hallucination**（路径沙箱化 / 拒绝控制字符 / 资源 ID 校验——**因为 agent 会 hallucinate 出 `../../.ssh` 这样的路径穿越**）
  - **发布 SKILL.md 文件编码 agent 无法从 `--help` 推断的不变量**（"写操作必须先 dry-run" / "list 调用必须加 --fields"）
  - **响应消毒防 prompt injection**

> "**'agent 不是可信的操作者（The agent is not a trusted operator）'**——它会 hallucinate，会生成 `../../.ssh` 这样的路径穿越，会在资源 ID 里嵌入查询参数。**面向 agent 的设计需要把 Unix 哲学里'Trust the user'的假设翻转过来**。"

**③ Credential Brokering 的行业趋同** [3]
- 核心判断：agent 需要凭证来访问外部服务，但 **agent 本身不能被信任持有这些凭证**——因为 prompt injection 可能导致凭证泄露
- 解法：**在 agent 和凭证之间画一条信任边界** —— 引入 credential broker（代理层）
  - agent 发出请求时携带**占位符**（如 `__github_token__`）而非真实凭证
  - broker 认证 agent 身份后将占位符替换为真实凭证转发请求
  - **agent 全程未见到真实凭证**
- 行业趋同：Anthropic（Managed Agent Infrastructure）/ Vercel（Sandbox 凭证注入）/ Cloudflare（Outbound Workers）/ LangChain（Sandbox Auth Proxy）各自在不同层实现同一范式
- "**多家公司独立趋同到同一范式，说明这是 agent 安全模型的必然走向**"^[raw/articles/agent-oriented-infra-intent-driven-code-sedimentation.md]

### 我们可以做什么（4 大高杠杆行动方向）

**① Harness 平台化**
- 把 agent 运行环境从"每个团队自己在云服务器上搭"变成**平台的内建能力**
- Harness spec 声明式定义——角色 / 工具 / 凭证 / workspace / skill
- handoff 时自动初始化，完成后自动回收
- **核心约束 = 即时供给**：并行 agent 数量对环境供给是乘法压力，初始化时间直接决定并行效率
- "**本质上还是云原生 / serverless 的思路，但组装的对象从'应用'变成了'agent 工作环境'**"

**② 统一身份体系**
- **Agent-native 的身份**——不是借用人的 token，而是 agent 拥有自己的机器人身份
- 这个身份在所有 infra 上通用（消除统一鉴权 vs SSH 的碎片化）
- 自动轮转 / 最小权限 / 操作可追溯到具体的 agent 实例和意图
- 身份与 harness 联动：harness 初始化时注入角色对应的凭证，不同角色天然隔离
- 远期方向：**credential brokering**——agent 能使用凭证但不持有凭证

**③ Dry-run 基础设施**
- 在基础设施层提供**统一的"变更预览"能力**，而非每个工具各自实现
- **资源归属治理**（这个配置属于哪个应用 / 哪个团队 / 哪个环境）是 dry-run 的前提
- Dry-run 的输出应该标准化：**diff + 影响范围 + 影响规模 + 风险等级 + 是否可回滚**
- 这是**渐进信任机制的基础**——根据 dry-run 输出的风险等级，决定 agent 自主执行还是交给人审批
- "**配置推送案例中同事的判断逻辑——'有 dry-run 就放心'——应该被泛化为一种 infra 能力，覆盖所有生产环境资源变更**"^[raw/articles/agent-oriented-infra-intent-driven-code-sedimentation.md]

**④ 验证体系的演进**
- 传统软件测试和 agent 评测**正在从两端走向融合**
- 传统测试验证"代码是否正确实现了意图"，agent 评测验证"模型是否正确理解了意图"——**当系统是 agent + code 的混合体，两者融合成同一件事：从意图到结果的端到端验证**
- 融合后的形态：
  - 断言方式从**精确匹配**（output == expected）演进到**约束满足**（输出满足一组约束——类型正确 / 不违反安全策略 / 业务逻辑自洽）
  - **确定性验证与概率性验证分层共存**（同一个测试中，确定性部分用传统断言，概率性部分用 LLM-as-judge 或统计方法）
  - **测试从独立阶段变成持续验证**——CI 管固化代码（低频 / 确定性），嵌入式验证运行时管 on the fly 代码（高频 / 概率性 / 约束验证）

> "**一个判断：验证基础设施的投资优先级应该高于生成能力。**生成能力的提升是模型厂商在推的事，验证能力的提升是 infra 团队该做的事——而验证的可靠性直接决定了 agent 的自主空间。"

**⑤ Agent 行为驱动的 Infra 质量度量**
- 通过 agent 的行为模式（重试频率 / 错误类型 / 绕路路径）来**度量 infra 的 agent 友好程度**
- Agent 反复重试某个 API → 反馈语义不足
- 调用顺序混乱 → 前置条件没有显式化
- 频繁在两个系统之间做格式转换 → 接口不可组合
- **"Agent 成为 infra 设计的持续压测者。用得越多，暴露的设计缺陷越多，改进方向越清晰"**^[raw/articles/agent-oriented-infra-intent-driven-code-sedimentation.md]

> "今天的 Git / CI/CD / Code Review 系统不会消失，但它们的管辖范围会收缩到'持久化代码'的领域——而那个领域的面积在缩小。**真正需要被建设的，是支撑 agent + code 动态混合体的新一代基础设施。方向已经清晰：给 infra 补能力。Infra 的能力边界，就是 agent 的自主边界。**"

## 核心金句

- "**Agent 的自主程度是 infra 安全能力的函数。**"
- "**给 infra 补能力，而非给 agent 加限制。Infra 的安全能力越强，agent 的自主空间越大。**"
- "**代码的生命周期从'月/年'缩短到了'分钟'** —— 类似 JIT 编译。"
- "**三个变量同时变化的效果是乘法而非加法** —— 整个节奏变了，每个环节的设计假设都在同时失效。"
- "**人容忍概念的裂缝，agent 需要概念的闭合** + **人容忍安全机制的缺失（靠常识弥补），agent 需要安全机制的闭合（靠 infra 保证）**"
- "**agent 不是可信的操作者（The agent is not a trusted operator）**——面向 agent 的设计需要把 Unix 哲学里'Trust the user'的假设翻转过来。"
- "**回滚能力把不可逆操作变成可逆操作，等于降低了风险等级**——这是 infra 能为 agent 做的最有杠杆的事之一。"
- "**Agent 反复撞上设计缺陷 → agent 的失败模式是 infra 设计缺陷的放大器** → 让 infra 的设计质量从主观判断变成了可度量的东西。"
- "**Harness 的供给必须是即时的** —— '环境初始化需要 5 分钟'在 12 个并行 agent 面前就是 60 分钟的等待。"
- "**验证基础设施的投资优先级应该高于生成能力** —— 而验证的可靠性直接决定了 agent 的自主空间。"
- "**Infra 的能力边界，就是 agent 的自主边界。**"

## 与已有 wiki 实体的关系

### vs [[entities/agent-harness-architecture|Agent Harness 架构]]
- 7 层 harness 模型 = 抽象框架
- 晓斌 = "**harness = 根据角色、任务、权限范围自动组装的完整工作环境**"——具体落地 + 工具、凭证、workspace、skill 4 维组装
- 共同点：harness 决定 agent 自主空间

### vs [[entities/wow-harness-v3-governance-protocol|wow-harness v3]]
- v3 = 跨 session 事件时间线 + 概念图（**协议层**治理）
- 晓斌 = "harness 平台化"（**运行环境层**变革）——"组装的对象从'应用'变成了'agent 工作环境'"
- 共同点：都强调"infra / 协议"是 AI Agent 落地的关键

### vs [[entities/kimi-work-codex-vibe-working-paradigm-shift|Kimi Work]]
- Kimi Work = Harness 搬到本地桌面
- 晓斌 = Harness **平台化**（云上"组装对象从应用变成 agent 工作环境"）
- 共同点：harness 决定一切

### vs [[entities/pilotdeck-agent-os-openbmb-tsinghua|PilotDeck]]
- PilotDeck = WorkSpace + Always-on + Dream 模式（**多项目隔离**）
- 晓斌 = harness 包含 workspace、skill、工具、凭证 4 维组装（**多角色多任务**）
- 共同点：都强调"为 AI 套上家"

### vs [[entities/rein-go-agent-4-modules-5-type-boundaries|Rein]]
- Rein = 4 模块 + 5 类型边界（**代码层**架构）
- 晓斌 = 4 层 Agent-Oriented Infra 设计（**infra 层**架构）
- 共同点：都强调"边界 / 接口"是工程化关键

### vs [[entities/microsoft-build-2026-mai-models-scout-agent|Microsoft Build 2026]]
- MAI = "从零训练 + 无蒸馏"（**模型层**独立）
- Scout = 企业级智能体（**应用层**）
- 晓斌 = "**给 infra 补能力**"（**基础设施层**转向）—— **三件互补：模型 + 应用 + infra**

### vs [[entities/agent-harness-context-management-working-set|Agent Harness 上下文管理]]
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

## 相关对照
- [[entities/agent-harness-architecture|Agent Harness 架构]] —— 7 层 harness 模型
- [[entities/wow-harness-v3-governance-protocol|wow-harness v3]] —— 跨 session 事件时间线
- [[entities/kimi-work-codex-vibe-working-paradigm-shift|Kimi Work]] —— 本地桌面 Agent
- [[entities/pilotdeck-agent-os-openbmb-tsinghua|PilotDeck]] —— 多项目隔离
- [[entities/rein-go-agent-4-modules-5-type-boundaries|Rein]] —— 4 模块 + 5 类型边界
- [[entities/microsoft-build-2026-mai-models-scout-agent|Microsoft Build 2026]] —— 全栈 AI
- [[entities/claude-code-20000-char-source-analysis|Claude Code 20000 字符源码分析]] —— 98.4% 基础设施

→ [[raw/articles/agent-oriented-infra-intent-driven-code-sedimentation|原文存档]]
