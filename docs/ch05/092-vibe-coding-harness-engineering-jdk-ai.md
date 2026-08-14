# 从 Vibe Coding 到 Harness Engineering：JDK 升级中可控演进的 AI 工程实践

## Ch05.092 从 Vibe Coding 到 Harness Engineering：JDK 升级中可控演进的 AI 工程实践

> 📊 Level ⭐⭐ | 6.8KB | `entities/vibe-coding-到-harness-engineering-jdk-可控演进.md`

# 从 Vibe Coding 到 Harness Engineering：JDK 升级中可控演进的 AI 工程实践

小米技术的实践分享：真正消耗工程时间的不是「写新代码」，而是框架迁移、版本升级、安全修复等维护性工程，这类工作的核心难点不在生成代码，而在于如何把系统安全、稳定地改正确。JDK 升级就是最典型的一类——从旧版本升到 JDK 21 看似只改一个版本号，实际牵一发动全身：Spring 框架兼容性、第三方依赖、编译插件、JVM 参数、启动脚本、测试用例，任何一个环节出问题都可能导致服务无法启动。团队每季度讨论一次 JDK 升级却很少真正启动，因为投入与风险的账算不清。用 Vibe Coding 直接尝试时，AI 在复杂依赖关系和长链路验证面前容易逐渐偏离目标：修改范围失控、依赖关系混乱、配置相互冲突。

答案不在模型能力上，在系统设计上：不过分依赖模型能力，而是通过系统设计约束 AI 的行为。如果把开发过程比作装修，Vibe Coding 更像告诉施工人员「你看着办」，Harness Engineering 则先给出施工图，把边界、规范和流程提前定义清楚。体系包含三部分：构建执行约束（让 AI 在明确边界内工作）→ 沉淀工程经验（将一次实践转化为长期可复用能力）→ 建立反馈闭环（让系统在实践中持续进化），串成「约束执行 → 经验复用 → 反馈进化」的链路。

## 构建执行约束：上下文工程与工具编排

Vibe Coding 失败的第一个问题不是 AI 不知道如何升级 JDK，而是 AI 在不了解项目约束的情况下就开始修改代码——不知道哪些文件由 Thrift 自动生成不能修改、不知道本地编译需加 -Plocal 参数、不知道 JVM 启动参数要从 start.sh 提取。这些散落在资深开发者经验中的隐性知识，对 AI 来说是看不见的暗礁，第一步就是把这些知识变成 AI 可消费的结构化规范（Harness Engineering 的起点：上下文工程，动态组装 Agent 每步所需的精确信息，避免过多或过少）。紧接着构建工具编排层：把工程动作（扫描依赖树、解析冲突链路、执行集成测试、读取测试结果）封装成输入输出明确、失败路径清晰的可调用工具，让 AI 只需要视情况决定「调用哪个工具」，保证对固定问题表现稳定。

## 沉淀工程经验：jdk-upgrade Skill

把执行过程中积累的工程经验沉淀成可复用的 Skill：jdk-upgrade。它明确定义能力边界——禁止修改业务逻辑代码、禁止优化或重构业务方法、禁止添加新功能、禁止删除原有功能、仅进行必要的兼容性修改（防止 AI「顺手优化」导致修改范围失控）；知识渐进式组织（SKILL.md 作为入口和导航，references/ 下分 maven.md、dependency.md、jvm.md、code.md 按需查阅）；执行流程是指令式的 5 个具体步骤（Maven 插件升级 → Pom 依赖处理移除 javax 迁移 Jakarta → JVM 参数调整 → 代码兼容修改 → 验证），关键步骤末尾包含反馈闭环。

## 建立反馈闭环：测试前置驱动的验证策略

验证反馈循环是 Harness Engineering 中 ROI 最高的机制：每步操作后进行检查，防止错误传播。JDK 升级场景采用测试前置驱动——升级前要求 AI 针对项目主要功能组件撰写集成测试（每个测试方法必须配置 @Timeout 防止挂起、必须真实完整加载 Spring 上下文避免 mock 假性通过、必须结构化输出通过与错误原因），升级后重新执行相同测试集，通过才说明升级没有破坏已有功能。AI 不再能够「谎报结果」——编译通过不代表升级成功，必须通过测试验证。这套机制不限于 JDK 升级，适用于绝大多数软件工程任务，一旦建立便能持续复用。

经验回流通过 jdk-upgrade-lessons Skill 实现：JDK 升级任务完成后主动触发，按 5 个维度（阻断性问题、隐蔽陷阱、配置遗漏、依赖冲突、代码迁移）引导经验回顾，生成结构化经验文档，并基于本次经验生成新版本升级 Skill（如 jdk-upgrade-21），让每次升级的经验反哺下一次升级。

## 效果验证

一次典型 JDK 升级：单个项目涉及 30+ 个文件修改、50+ 个依赖升级/新增/移除和大量配置、启动参数修改，AI 承担绝大部分工作，人工只需最终代码 Review。70% 的项目可一轮对话完成，剩余 30% 需在关键节点人工介入。升级完成后多个服务 CPU 使用率平均降幅约 22.5%，同等负载下堆内存平均下降约 23%，GC 每分钟停顿时间降至 1ms 以下，P99 平均降幅 18.1%、尾部延迟最大降幅 47%（548ms→288ms），60% CPU 负载下主要 Web 服务峰值 QPS 提升超过 30%。

实践最大的收获是三点认识转变：规范正在成为比代码更重要的资产（代码反而变成了产物）；文档的首要读者正在从人转变为 AI（目标是构建「AI 可执行的约束」而非「人类可读的文档」）；开发者的角色正在从代码编写者转变为约束设计者。工程的重心正在从「写代码」转向「定义约束」。

## 相关实体

- [Coding Harness 工程](https://github.com/QianJinGuo/wiki/blob/main/concepts/coding-harness-engineering.md)
- [Harness Engineering 范式转移](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-paradigm-shift.md)
- [Vibecoder Harness 调研](ch05/077-harness.html)
- [上下文工程](https://github.com/QianJinGuo/wiki/blob/main/concepts/context-engineering.md)
- [Agent 自改进闭环](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-self-improvement-loops.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/从-vibe-coding-到-harness-engineering-jdk-升级中可控演进的-ai-工程实践.md)

---

