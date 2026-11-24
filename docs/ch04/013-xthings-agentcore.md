# Xthings 智能家居自然语言控制：AgentCore 托管 + 预加载异步下发的四段式架构

> 📊 Level ⭐⭐ | 13.6KB

> 来源：AWS China Blog，2026-10-15，Xthings 全球平台架构师姜胜鹏 + AWS 解决方案架构师郑绍杰。一条"把模型塞进已有可信控制平面"的生产案例：百万级在网设备、千万级日常交互的智能家居 SaaS，用 Amazon Bedrock AgentCore（Runtime/Memory/Gateway/Identity/Observability）+ Amazon Nova Lite，2-3 周交付可灰度版本，受理延迟目标 P95 < 1 秒。

## 相关实体
- [Amazon Bedrock Agentcore Runtime Deep Dive And Scenario Analysis](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-bedrock-agentcore-runtime-deep-dive-and-scenario-analysis.md)
- [Agentcore Harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentcore-harness.md)
- Agentcore Managed Harness
- [Amazon Bedrock Agentcore Gateway Mcp Extension](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-bedrock-agentcore-gateway-mcp-extension.md)
- [Amazon Nova Lite Fine Tuning Cost Effective Vision Detection Model Tuning Case And Practice](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-nova-lite-fine-tuning-cost-effective-vision-detection-model-tuning-case-and-practice.md)
- [Agent Memory System Design](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-memory-system-design.md)
- [Context Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-engineering.md)

→ [原文存档](https://aws.amazon.com/cn/blogs/china/xthings-based-on-amazon-bedrock-agentcore-amazon-nova-lite)

## 三条立项约束：不重构、不越权、不自动开锁

这个案例最值得复用的不是技术选型，而是先定约束再选架构。第一条是**不重构既有基础设施**——设备接入、权限体系与指令下发全部沿用现有系统，因为接入链路上跑着百万级在网设备，为一个新功能动它的回归成本远超功能本身价值；团队只有几个人、两三周。第二条是**模型只解释意图，权限与执行仍由既有控制平面裁决**，这划出了方案的适用边界：如果控制平面本身也要和 Agent 一起从零建，风险结构完全不同。第三条是安全底线——**开锁类动作不由自然语言自动触发**，因为关错灯可以再开一次，开错锁没有补救动作。

需求侧的做法也值得记一笔：立项前先对约 1 万个家庭做了设备数分布统计（P50=2 台、P90=5 台），发现只装一两个灯泡的家庭并不需要"一句话控制"，真正痛的是 5 台以上设备的家庭，于是首轮灰度按 P90 圈选而不是按平台平均值推功能。

## 四段式架构：上下文预加载 + 异步下发

一条"我要睡觉了"的请求经过六步：接入层路由（App 走既有 Xthings Cloud 网关，自研音箱作为 IoT 设备经 MQTT 直连 AWS IoT Core）→ 汇入同一个 Lambda 做 JWT 校验与会话管理 → **上下文预加载**（调用模型前先从 ElastiCache 读取该用户的设备清单、可用指令集与状态集，随请求一起交给 Runtime；缓存命中约 5ms，未命中回源 API 约 80ms）→ 托管推理（Nova Lite 结合预加载清单与 Memory 偏好，单次推理输出结构化 JSON）→ 校验后并行下发（Lambda 过硬校验后交 DCS，经 IoT Core 下发，fire-and-forget 不等设备回执）→ 立即返回受理响应。

核心优化点很具体：**预加载让本流程的模型调用从两轮减到一轮，省下约 300 毫秒**，用户 400-500ms 内收到受理响应。`getUserDevices` 最终没有作为工具被调用，而是改成应用侧预加载注入——这是一个"把工具调用挪到编排层"的可迁移手法，在自建方案里同样可采用。

分段耗时口径值得单独记：接入 15-25ms、预加载 5-80ms、推理约 300ms、下发约 50ms、端到端受理 400-500ms、异步回推 200ms-2s。作者明确写了**分位数不可相加**，P50/P95/P99 必须独立测量，不能由上表推算——这种口径纪律在大量"性能优化"文章里是缺失的。

## 把"模型的克制"做成可读数据：skipped[]

模型输出不只包含要执行的动作，还包含**主动放弃操作的设备与原因**：`actions[]` 列出 uuid/name/action，`skipped[]` 列出 uuid/name/reason（如"安全考虑，睡觉场景不自动操作门锁"）。作者认为这是自己比较满意的决定——模型的克制变成可读、可审计、客服和监控可直接消费的数据。

与之对照的是 `message` 字段的诚实披露：那句"晚安！已为您下发指令"由模型在推理时生成，采用 fire-and-forget 下发时它可能早于 DCS 确认受理，因此**只是交互提示，不是执行确认**。作者的区分构成一条通用原则：让模型输出"打算做什么"（可审计的声明），让执行链路回来"做完了什么"（可信信号），两者贴着放在同一段 JSON 里，读者很容易误给同一份信任。

## 四道工程护栏：提示词是软约束，代码是硬约束

1. **UUID 白名单 + 指令域校验**（硬约束）。即使在提示词里反复强调只能用已返回设备，模型仍可能编造或拼接 UUID，因此在 Lambda 层过滤不在白名单内的 uuid、校验 action 是否落在该设备 `commands[]` 范围内（避免"给锁 setBrightness"这类非法指令）。JSON 解析失败时返回固定兜底文案 + 后台 warning，模型原始输出只进排障日志、不回显给终端用户（回显会暴露提示词结构）。
2. **别名的权威来源只能有一个**。App 显式别名是权威配置，Memory 中的口头昵称只作辅助上下文，且最终必须映射到当前用户有权限控制的 UUID；无法唯一匹配时要求用户确认而不直接执行。
3. **Memory 写入治理（上线两周推翻重写）**。最初每次开关灯都写一条偏好，两周后 Memory 被无区分度样本淹没。重写后的三条原则：只存显式偏好（有非默认参数如亮度/色温/音量才写，纯开关不写）、同设备同类偏好去重覆盖保留最新、三个月未触发自动老化。结论是"长期记忆存得多不如写得挑，关键在写入口有没有判断力"。
4. **敏感动作的边界按动作定义而非设备类型**（尚未完全落实）。按设备类型一律禁止门锁会误伤"睡前落锁"，正确做法是按动作定义敏感度；当前仅在提示词层约束"睡觉场景不自动开锁"+ 强制写入 `skipped[]`，执行层的独立敏感动作校验被作者明确标注为**最清楚的一处缺口**。

## 组件级采用理由：按约束逐项对照

五个 AgentCore 组件的采用理由强弱不同，作者逐项给了性质：Memory 是**功能定义的一部分**（没有偏好记忆功能不成立）；Runtime 解决的是执行环境、会话隔离（MicroVM 级、最长 8 小时独立会话）与扩缩容的自建成本；Gateway 把既有 SaaS REST API（getUserDevices/controlDevice/queryDeviceStatus）封装为工具，后端一行未改；Identity 接管 JWT→Agent 身份→后端 API 的整条凭证链（注意边界：它管身份与凭证，业务授权仍在 Xthings 权限系统）；Observability 覆盖 Agent 侧 Trace 与 Token/工具成功率和延迟分布，但 DCS 与设备回执这段仍需自行插桩。

一个被否决的中间方案也很有信息量：只接 Memory、Agent 执行代码继续留在现有 Lambda。它满足偏好存储且改动最小，被否的原因是执行环境、会话隔离与扩缩容仍要自建——"要存偏好"只说明需要 Memory，不能顺带说明执行代码也该搬进 Runtime，后者是另外算的一笔账。

## 效果口径与未完成项

工程侧数字明确：模型调用 2→1 轮、受理响应 400-500ms、P95 目标 <1 秒、MVP 2-3 周（第 1 周跑通骨架，第 2 周迭代提示词与记忆策略）。成本上作者给了一条反直觉提示：**调用轮次减半会降成本，但预加载让每个请求都携带完整设备清单、input token 增加，两者方向相反，净效果只能按 token 级账目算，不能按调用次数推断**。业务效果（转化/留存）明确拒绝归因——首轮灰度只圈不到一成家庭、样本期只有几周、平台本身还在迭代，内部规矩是"没做过 A/B 隔离的指标变化，只写同期观察到，不写成由此带来"。

## 深度分析

### 一、适用人群由设备密度分布决定，而不是由模型能力决定

立项前的动作不是选模型，而是对约 1 万个家庭做设备数分布统计（P50=2 台、P90=5 台），再据此把首轮灰度圈在"5 台以上"这一侧。这背后的判断值得展开：自然语言控制的价值并不随用户规模线性增长，而是设备密度跨过某个阈值后才出现——只有一两台设备的家庭，在 App 里点卡片本来就比说话快，模型再聪明也创造不了新价值。换句话说，这类 IoT Agent 功能的目标人群由物理世界的状态分布刻画，模型能力只是让这条曲线右侧的体验成立；功能定位应该先测分布、再谈模型。

### 二、预加载是延迟优化与安全收窄的同一枚硬币

`getUserDevices` 从推理中的工具调用改为调用前由应用层预加载注入，直接收益是省一轮模型调用、约 300 毫秒；但它还有一个不太被强调的第二重效果：模型从此失去在推理过程中主动探查用户设备清单的能力，其可操作空间被收窄到应用层注入的这份白名单之内。一个为延迟而做的编排层改动，同时天然充当了一道隐性护栏——降延迟手段与缩小模型自由度在这里是同一个动作。这与 [Working Set Vs Long Term Memory](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/working-set-vs-long-term-memory.md) 的划分一致：每请求必需且可预知的上下文放进请求前注入的工作集，可选信息才留给工具调用。

### 三、延迟约束 → 异步架构 → 语义风险，是一条因果链

P95<1 秒的受理目标源自用户对既有 App 响应速度的习惯，于是下发选择 fire-and-forget、不等设备回执；正是这个异步决定制造了 `message` 文案"看着像执行确认、实则只是受理提示"的语义风险，也放大了重复指令的危害——用户超时重说一遍，灯无所谓，门锁连收两条相反指令就是事故。因此"开锁不由自然语言自动触发"并非一条独立于架构的安全条款，而是异步架构的伴生约束。这提示一种分析方法：给 Agent 系统列护栏时，先顺着"约束 → 架构选择 → 新增风险"的链条推演护栏该落在哪一层，而不是把安全需求当成孤立清单。

### 四、长期记忆的价值在写入口的信噪比，而非存储量

上线两周就被无区分度的开关灯样本淹没、整个写入逻辑推翻重写，是本案例返工最彻底的一处；重写后的三条原则（只存显式偏好、同设备去重覆盖、三个月自动老化）共同指向一件事：检索信噪比优先于记录覆盖度。这与 [When Not To Memory Architecture](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/when-not-to-memory-architecture.md) 的问题意识互补——先回答"哪些东西不配进长期记忆"，再设计写入管道。别名"权威来源只能有一个"的原则与之同构：App 显式别名与 Memory 昵称两处可写就必然冲突，记忆系统和其他状态存储一样，需要显式声明谁是权威、谁只是辅助上下文。

### 五、数字纪律：工程口径与业务归因分开记账

两处容易被略过的写作纪律其实是一对：分段耗时的分位数不可相加、端到端 P50/P95/P99 必须独立测量，防的是用分段表"推算"出并不存在的优化结论；"没做过 A/B 隔离的指标变化只写同期观察到、不写由此带来"，防的是把季节性波动记成新功能的功劳。前者是工程侧的口径纪律，后者是业务侧的归因纪律，合起来等于把实验设计的最低要求带进了生产案例写作——多数案例文章至少破其一，这篇两处都守住了。

## 可迁移的四条经验

1. 让模型解释意图，让既有系统裁决权限——可靠性来自模型之外存在权威权限与执行系统。
2. 提示词是软约束，代码是硬约束——任何"绝对不能发生"的动作都需要模型之外的确定性校验，且落实程度要逐项盘点而不是笼统声称"有护栏"。
3. 让模型输出"打算做什么"，让系统确认"做完了什么"——结构化 `skipped[]` 属于前者可审计，`message` 文案看着像后者实则不是。
4. 按组件采用托管服务——按自己的约束逐项对照比整体采纳或整体拒绝更有效。

---

