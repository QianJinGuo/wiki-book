# 规格驱动开发与 Harness

## Ch05.076 规格驱动开发与 Harness

> 📊 Level ⭐⭐ | 8.0KB | `entities/spec-driven-development-harness.md`

# 规格驱动开发与 Harness

## 摘要

规格驱动开发的核心命题：意图到代码是有损管道，Harness 补上"桥梁"——把模糊意图压缩成可审、可执行、可验证的约束，再以机器验证闭环保证输出与意图一致。本文基于术哥 SSD 实战数据（编码提速 10 倍、端到端交付仅快 13%），推导规格契约、三层 Harness 与闸门管道的工程取舍。

## 核心要点

- **有损管道是结构性现实**：连续意图转成离散代码必然损耗；AI 时代写代码的是模型，它不持有隐性知识，换一次上下文就重新猜一次。
- **Spec 是"可接受实现空间"的最小、显式、可验证编码**：最小（约束太厚，维护成本逼近代码）、显式（不写出来的规则 AI 只能猜）、可验证（不能判定对错的不是 Spec）、实现空间（Spec 划边界而非复写代码）。
- **桥梁本身也有损**：每加一层自然语言转写就多一次编码—解码损耗；多数团队的问题不是上下文不够，而是 Control 过多。
- **四条设计约束**：减层、注入上下文（Context 比 Control 便宜）、机器验证（考生不能批改自己的卷子）、自适应强度（Spec 是光谱不是开关）。
- **SSD = Superpowers-enhanced SDD**：砍掉 OpenSpec 只留一套引擎，从侧面注入知识、验证、格式三类增强，不改流程引擎源码。
- **Harness 三层拆分**：Orchestrator（控制面）、Knowledge（Intent→Code，隐性知识显式化）、Delivery（Code→Production，独立于 Agent 的验证判据）。
- **验证律 evidence before claims**：8 步闸门管道任一步失败即停，Agent 自修复上限 3 次，超限升级人工。
- **跑通后指标**：端到端交付提速 13%→28%，需求返工率 34%→15%，首轮 review 通过率 41%→68%。

## 深度分析

### 结构化规格作为 Agent 输入的契约

两个核心假设：其一，结构化规格比隐式任务描述更精确、更可验证——把"大家都知道"的隐性知识显式化，模型不必从代码表象反向推断；其二，规格是 Agent 的"契约"，Harness 在规格-执行-验证循环中保证输出落在可接受的实现空间内，对应意图捕获与结果验证两大挑战。关键边界：Spec 不是写给 AI 的详细文档，也不是复写代码，而是划边界——把模糊意图压缩成可审、可执行、可验证的约束，一旦试图穷举实现细节，就会烂得比代码更快。

### Harness 在 规格-执行-验证 循环中的三层角色

规格解析层（Orchestrator 控制面）规定每阶段行为规则——Spec 格式、AC 编号、阶段转场，经 @import 注入而非自建引擎；任务执行层（Knowledge）将隐性知识显式化——按需注入上下文，让 Agent 从"猜"变成"查"，避免删掉配置中心注入的 RPC 依赖这类事故；验证反馈层（Delivery）提供独立于生成者的验证判据——manifest 驱动的多步闸门管道把"Spec 对不对"变成机器清点：ac-coverage 检查 AC 测试证据，drift-check 检查 schema、路由、错误码与 Spec 的一致性。三层拆开是为了抗变化：Orchestrator 会变，Knowledge 会积累，Delivery 必须独立于生成者。

### 减少 Vibe Coding 不确定性：验证取代生成成为新瓶颈

Vibe Coding 的不确定性来自意图到代码的"单步映射"——模型的最大风险不是不会写，而是不知道什么不能猜。Spec-Driven 插入"规格-执行-验证"三阶段循环，把不确定性分散到各阶段分别处理，本质是降低单步映射的复杂度。更深的判断是：生成已不是主要矛盾，返工多不是模型偷懒，而是验证能力没跟上生成能力；"没有外部证据，就不要允许任何人声称完成"被写成硬规则，因为 Agent 自查会失效到把失败的测试注释掉。推论有二：验证必须独立于生成者（测试、闸门、覆盖率、漂移检测兜底）；控制不如上下文——"More Context, Less Control"，强模型时代真正贵的不是让它按步骤做事，而是让它知道什么不能做错。

### 意图捕获与结果验证：即弃产物与复利资产的分离

SSD 的工程取舍本质是给两类资产定价：spec、design doc、plan 只负责把这次意图送进代码，过期即弃；测试、知识库、闸门管道才是长期增值的复利资产，是方法真正留下的验证基础设施。这解释了"默认重 + 手动降级"：默认轻把最贵的错误藏起来，默认重让痛感显性化，团队才会主动要求降级——降级决策的本质是确认失败能否被便宜地发现、修正；三问法（跨模块/平台边界、改 schema 或外部副作用、出错难被常规测试发现）任一为是就不降级。模型越强，框架越该做减法：变化的是 Spec 粒度，不变的是验证骨架和上下文骨架。

## 实践启示

1. **先做减法再谈增强**：评估方案先过四条判据；多引擎叠加多数时候不是双保险而是双重有损，砍到一套完整管道比再叠一层 spec 工具更有价值。
2. **Spec 是契约不是文档**：每个规格条目都应对应明确的验收标准——AC 编号全局唯一且直接对应测试函数名，把 review 焦点从"逐字读懂"转成"判断取舍"。
3. **让验证独立于生成者**：不依赖 Agent 自查，落地外部闸门管道，至少包含 AC 覆盖清点（ac-coverage）与漂移检测（drift-check）；自修复设上限（如 3 次），超限即升级人工。
4. **知识沉淀成一等公民**：把"规矩"（CLAUDE.md）和"事实"（knowledge/：隐式依赖、历史事故、迁移策略）分开管理；踩坑后 /learn 沉淀，brainstorming 前按关键词注入。
5. **Spec 是光谱不是开关**：默认重流程 + 显式降级通道（/plan）+ 三问法分流；降级由"失败能否被便宜地发现、修正"驱动，而非赶进度。
6. **长期资产与一次性产物分家**：specs/、plans/ 用完即弃，knowledge/ 版本化持久保存；换项目只改 manifest.yaml 声明，kernel 可整体升级，让项目随时可以拔掉 Harness。

## 相关实体

- [场景营销前端 AI Coding — 从问题到方案](ch05/121-ai-coding.html)
- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](../ch04/073-agentic.html)
- [AI Coding 入门指南：如何更好地让 AI 真正帮你干活](ch05/121-ai-coding.html)
- [Harness Engineering 详解：如何将 AI Coding 率提升至 90%](ch05/092-harness-engineering.html)
- [一文带你弄懂 AI 圈爆火的新概念：Harness Engineering](ch05/092-harness-engineering.html)
- [Spec-Driven AI 编程半年实战 — 有损管道、三工具比较与三大认知陷阱](../ch01/1199-spec.html)
- [OpenSpec 规范驱动开发（SDD）框架 — proposal/design/tasks/specs 四类文档意图锁定](ch05/055-openspec.html)
- [从渐进式 SDD 到 Lattice Harness：AI Coding 团队级闭环实践](ch05/121-ai-coding.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/ssd-spec-driven-development-harness-asd-shuge-2026-06-17.md)

---

