# OpenAI Skills/Shell/Compaction：终结提示词工程的三位一体Agent原语

## Ch05.024 OpenAI Skills/Shell/Compaction：终结提示词工程的三位一体Agent原语

> 📊 Level ⭐⭐ | 17.0KB | `entities/openai-skills-shell-compaction-agent-primitives.md`

> -> [OpenAI Skills/Shell/Compaction：终结提示词工程的三位一体Agent原语](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/openai-skills-shell-compaction-agent-primitives.md)

## 核心命题

OpenAI 发布 Skills + Shell + Compaction 三位一体 Agent 原语，将 AI 从"陪你聊天的黑盒"重构为"为你干活的基础设施"。这组原语的核心价值在于：将稳定的程序和示例移入可重用包（Skills），提供完整的执行环境（Shell），并自动管理上下文窗口（Compaction）。三者组合使用，从根本上解决了"提示词乱炖"（Prompt spaghetti）、执行环境碎片化和上下文窗口限制三大痛点。

## 三大原语定义

### Skills（技能）："按需加载"的程序

技能是**文件包 + SKILL.md 清单文件**。你可以把它想象成一个**版本化的操作手册**，模型在需要执行实际工作时可以参考。

- 平台向模型展示每个技能的名称、描述和路径
- 模型利用元数据决定是否调用该技能
- 如果调用，读取 SKILL.md 获取完整操作流程

### Shell 工具：智能体的"执行引擎"

Shell 工具允许模型在真实终端环境中工作： ^[https://mp.weixin.qq.com/s/S1juTn1FAd2MbifDrAuO4Q]

- **托管容器（Hosted Shell）**：由 OpenAI 管理，具有受控网络访问权限
- **本地 Shell 运行时**：工具语义相同，机器受你控制
- 托管的 Shell 通过 Responses API 运行，自带状态、工具调用、多轮持续对话和 artifact 制品

### 压缩（Compaction）：保持长周期运行

服务端压缩通过自动管理上下文窗口和压缩对话历史，确保长周期运行不中断： ^[https://mp.weixin.qq.com/s/S1juTn1FAd2MbifDrAuO4Q]

- **服务端压缩（新）**：上下文超过阈值时在流式输出中自动运行
- **独立压缩端点**：`/responses/compact` 端点，显式控制压缩时机

## 十大非直观技巧

### 1. 技能描述 = 决策边界，而非营销文案

技能描述应回答三个问题： ^[https://mp.weixin.qq.com/s/S1juTn1FAd2MbifDrAuO4Q]
- 我什么时候应该使用它？
- 我什么时候**不应该**使用它？
- 输出结果和成功标准是什么？

实用模式：描述中直接加入简短的"**使用场景 vs. 禁用场景**"区块，保持具体（涉及的输入、工具、预期的 artifact 制品）。

### 2. 负面示例 + 边缘情况覆盖减少误触发

一个令人惊讶的失败模式：**提供技能初期反而可能降低正确触发率**。 ^[https://mp.weixin.qq.com/s/S1juTn1FAd2MbifDrAuO4Q]

解决方案：在描述中显式写出"当……时不要调用此技能"的案例（以及此时该做什么），帮助模型更清晰进行路由。

**Glean 经验**：基于技能的路由最初导致触发率下降约 20%，加入负面示例和边缘情况后触发率得到恢复。

### 3. 模板和示例放入技能内部（不使用时不占成本）

停止把模板塞进系统提示词里。在技能内部放置模板和实操案例的两个优势： ^[https://mp.weixin.qq.com/s/S1juTn1FAd2MbifDrAuO4Q]

1. 仅在需要时（技能被调用时）才可用 ^[https://mp.weixin.qq.com/s/S1juTn1FAd2MbifDrAuO4Q]
2. 不在处理无关查询时增加 Token 消耗 ^[https://mp.weixin.qq.com/s/S1juTn1FAd2MbifDrAuO4Q]

**Glean 反馈**：这一模式在生产环境中带来了最大的质量和延迟改善，因为示例仅在技能触发时才被加载。

### 4. 及早针对长周期运行设计（容器复用 + 压缩）

长周期智能体很少能通过"一劳永逸"的提示词获得成功。从一开始就要考虑连续性： ^[https://mp.weixin.qq.com/s/S1juTn1FAd2MbifDrAuO4Q]

- 不同步骤间**复用同一个容器**（稳定的依赖、缓存文件、中间产出）
- 传递 `previous_response_id`，使模型能在同一线程中继续工作
- 将压缩作为长周期运行的**默认配置**，而非应急方案

### 5. 需要确定性时，明确命令模型使用该技能

默认由模型决定何时使用技能（灵活但不确定）。对于具有明确契约的生产工作流，直接命令： ^[https://mp.weixin.qq.com/s/S1juTn1FAd2MbifDrAuO4Q]

> "使用 <skill name> 技能。"

这是你能动用的最简单的可靠性杠杆，将模糊的路由逻辑转变为明确的执行契约。 ^[https://mp.weixin.qq.com/s/S1juTn1FAd2MbifDrAuO4Q]

### 6. "技能 + 网络访问"是高风险组合

将技能与开放的网络访问结合会为数据外泄创造高风险路径。推荐默认安全姿态： ^[https://mp.weixin.qq.com/s/S1juTn1FAd2MbifDrAuO4Q]

- Skills：允许
- Shell：允许
- 网络：仅在每个请求中通过最小化白名单启用，且仅用于范围明确的任务

### 7. `/mnt/data` 作为 artifact 制品的交接边界

对于托管的 Shell 工作流，将 `/mnt/data` 视为写入输出的标准位置（报告、清洗后的数据集、完成的电子表格）。

**核心模型**：工具写入磁盘，模型基于磁盘推理，开发者从磁盘检索。 ^[https://mp.weixin.qq.com/s/S1juTn1FAd2MbifDrAuO4Q]

### 8. "双层白名单"网络系统

网络控制分两个层面： ^[https://mp.weixin.qq.com/s/S1juTn1FAd2MbifDrAuO4Q]

- **组织级白名单**（管理员配置）：设定允许访问的最大范围
- **请求级网络策略**：必须是组织级白名单的子集

保持组织级白名单小而稳定，请求级白名单更小（仅限该任务所需的域名）。 ^[https://mp.weixin.qq.com/s/S1juTn1FAd2MbifDrAuO4Q]

### 9. `domain_secrets` 进行身份验证（避免凭据泄露）

如果允许的域名需要认证请求头，使用 `domain_secrets`。模型运行时只看到占位符（如 `$API_KEY`），只有发送到获批目的地时，侧车（Sidecar）才注入真实值。

### 10. 云端和本地使用相同的 API

- Skills 同时适用于托管 Shell 和本地 Shell 模式
- Shell 提供本地执行模式（自己执行 `shell_call` 并将 `shell_call_output` 返回给模型）
- 在两种模式下保持技能不变（执行环境变了，工作流保持稳定）

**实用开发循环**：本地快速迭代 → 迁移到托管容器（可重复性、隔离性、部署一致性）。 ^[https://mp.weixin.qq.com/s/S1juTn1FAd2MbifDrAuO4Q]

## 三种构建模式

### 模式 A：安装 → 获取 → 写入 artifact 制品

利用托管 Shell 最简单的方式：智能体安装依赖、获取外部数据、生成具体交付物。 ^[https://mp.weixin.qq.com/s/S1juTn1FAd2MbifDrAuO4Q]

```
安装几个库 → 爬取或调用 API → 将报告写入 /mnt/data/report.md
```

这一模式创建了清晰的审查边界：应用可向用户展示 artifact 制品、记录日志、进行差异对比或传入后续步骤。

### 模式 B：技能 + Shell 处理可重复工作流

当提示词发生漂移时，可靠性会下降——这就是 Skills 的用武之地： ^[https://mp.weixin.qq.com/s/S1juTn1FAd2MbifDrAuO4Q]

1. 将工作流（步骤、护栏、模板）编码进技能 ^[https://mp.weixin.qq.com/s/S1juTn1FAd2MbifDrAuO4Q]
2. 将技能挂载到 Shell 环境中 ^[https://mp.weixin.qq.com/s/S1juTn1FAd2MbifDrAuO4Q]
3. 让智能体遵循技能确定性地生成 artifact 制品 ^[https://mp.weixin.qq.com/s/S1juTn1FAd2MbifDrAuO4Q]

对以下工作流特别有效：电子表格分析/编辑、数据集清洗+摘要生成、周期性业务流程的标准化报告生成。 ^[https://mp.weixin.qq.com/s/S1juTn1FAd2MbifDrAuO4Q]

### 模式 C（高级）：技能作为企业工作流的载体

Skills 可以弥补单工具调用与多工具编排之间的准确性鸿沟。 ^[https://mp.weixin.qq.com/s/S1juTn1FAd2MbifDrAuO4Q]

**Glean 案例**：针对 Salesforce 的技能将评测准确率从 73% 提高到 85%，首 token 延迟（TTFT）降低 18.1%。

实用策略：精细路由 + 负面示例 + 在技能内部嵌入模板和示例。 ^[https://mp.weixin.qq.com/s/S1juTn1FAd2MbifDrAuO4Q]

**技能成为活的 SOP**：随着组织演进而更新，并由智能体一致地执行。 ^[https://mp.weixin.qq.com/s/S1juTn1FAd2MbifDrAuO4Q]

## OpenAI vs OpenClaw 全方位对比

| 维度 | OpenAI（Shell + Skills） | OpenClaw |
|------|--------------------------|----------|
| 定位 | 企业级/开发者 Agent 平台 | 极客/个人 AI 全能管家 |
| 基础设施 | 托管容器（Hosted Shell） | 本地 runtime / 个人服务器 |
| 上下文管理 | 服务端自动压缩（Compaction） | 本地持久化存储 / 向量记忆 |
| 安全性 | 极高（多重沙盒隔离） | 风险较高（拥有 Host Shell 权限） |
| 交互界面 | API / CLI / Responses 界面 | WhatsApp / Telegram / Signal |
| 适用场景 | 大规模数据分析、自动化编程、SaaS 集成 | 本地文件管理、个人生活自动化、跨平台消息路由 |
| 核心优势 | 稳定、安全、上下文无限扩展 | 私有隐私、直接操控硬件/本地环境、完全掌控 |

**意外的共识**：OpenAI 的 Agent Skills 开放标准与 OpenClaw 兼容——你在 OpenAI 平台上开发的一个技能包，理论上可无缝迁移到 OpenClaw 上使用。

## 核心原则

> "上下文不是免费的。每一个 token 都会影响模型的行为，而那些对任务无用的 token 会积极地挤占掉那些有用的 token。"

Skills 解决了 Prompt spaghetti 问题；Compaction 解决了上下文爆炸问题；Shell 解决了执行环境碎片化问题。三者组合，AI Agent 从"对话助手"正式转向"操作助手"。

## 深度分析

### 1. 三位一体原语解决的是不同层次的失败模式，而非同一问题的三个方面

Skills、Shell、Compaction 分别针对 AI Agent 部署中的三类核心痛点：提示词杂乱（Prompt spaghetti）、执行环境碎片化、上下文窗口耗尽。 这意味着三者组合使用时产生的是正交效应——单独使用 Skills 已能改善可靠性；加上 Shell 才能赋予模型真实终端能力；再加入 Compaction 才能支撑真正长周期的任务。这种分层设计使团队可以按需取舍，而不是被锁定在全套方案中。

### 2. Token 成本最优解与提示词工程直觉相悖：模板应位于技能内部而非系统提示词

一个违反直觉的生产发现：把模板和示例从系统提示词移到技能内部，不仅没有损失功能，反而带来了最大的质量和延迟改善。 这背后的逻辑是，上下文中的每一个 token 都影响模型行为，无关 token 对任务有负面作用。技能内部示例仅在触发时才被加载，不会在无关查询中浪费上下文配额。这一模式直接挑战了"把所有指令塞进系统提示词"的传统做法。

### 3. 技能路由存在初期触发率下降的反直觉现象，负面示例是恢复关键

Glean 的生产经验表明，基于技能的路由在初期会导致正确触发率下降约 20%，这个反直觉结果的原因是模型在没有足够负面案例时无法精确区分何时该调用技能。 解决路径是在技能描述中显式写出"何时不应调用"的边缘情况。这一经验与传统的机器学习分类器设计高度一致：正例只能定义决策边界，负例才能收紧决策面。

### 4. `/mnt/data` 模式代表 Agent 架构从"内存推理"到"磁盘推理"的范式转变

将工具输出写入 `/mnt/data`、模型基于磁盘文件进行下一步推理、开发者从磁盘检索 artifact 制品——这一模式的核心意义在于将模型的"工作记忆"外部化。  传统 Agent 中模型依靠上下文窗口内的信息推理，当上下文被压缩后信息丢失；而磁盘推理模式下压缩仅影响元数据，核心产出物的完整性不受影响。这与 [Harness Engineering Long Term Agent Tasks](ch05/092-harness-engineering.md) 中"持久化中间状态"的设计原则一致。

### 5. 技能作为企业 SOP 载体，压缩了"多工具编排"与"单工具调用"之间的准确性鸿沟

Glean 针对 Salesforce 的技能将准确率从 73% 提升至 85%，首 token 延迟降低 18.1%。  这一结果说明，在单工具调用（精确但功能有限）和多工具编排（功能强大但错误累积）之间，技能化的工作流封装是一种有效的中间层解决方案。技能将模糊的提示词执行转化为结构化的 SOP 执行，将可靠性问题从"模型是否理解指令"转变为"技能是否被正确调用"。

## 实践启示

### 为每个技能编写"使用场景 × 禁用场景"描述块，将其作为决策边界而非营销文案

技能描述的第一个原则是回答三个问题：该何时使用、何时不该使用、输出成功标准是什么。 在描述中直接加入"使用场景 vs. 禁用场景"区块，比通用描述更能帮助模型进行精确路由。对于企业级技能，建议在技能创建时就固定这一模板，而非在发现路由错误后再补充。

### 将负面示例和边缘情况覆盖作为技能发布的必要条件，而非可选项

基于 Glean 的经验，技能初期触发率下降 20% 是一个可预见的问题，而非偶发问题。  正确的开发流程是：在技能上线前就准备至少 3-5 个负面案例，明确描述"当 X 时不要调用此技能，而应改用 Y"。这应作为技能编写 checklist 的标准项，而非在上线后根据日志补充。

### 及早为长周期运行设计：容器复用 + Compaction 默认开启

长周期 Agent 的成功很少来自"一劳永逸"的提示词，而需要在架构设计初期就考虑连续性。  具体实践：在设计技能时就将 `previous_response_id` 的传递纳入考量；将 Compaction 配置为默认开启而非手动触发；跨步骤复用同一个容器实例以保持依赖和缓存的稳定性。参见 [Harness Engineering Reliable Long Term Agent](ch05/092-harness-engineering.md) 的持续性设计模式。

### 对于需要确定性的生产工作流，使用显式命令而非依赖模型路由

当工作流具有明确契约时，直接命令"使用 \<skill name\> 技能"是最简单且最有效的可靠性杠杆。  这将模糊的路由决策转变为明确的执行契约，适用于数据清洗、报告生成、SaaS 集成等高可靠性要求的场景。在这些场景中，模型自主决定何时调用技能的灵活性不值一试。

### 默认拒绝网络访问，使用 `domain_secrets` 进行认证凭据隔离

Skills + Shell + 开放网络访问是高风险组合。  推荐默认安全姿态：Skills 允许、Shell 允许、网络访问默认关闭。如果任务需要特定域名的 API 认证，应通过 `domain_secrets` 使用占位符注入，而非将真实凭据暴露在提示词或技能定义中。组织级白名单应保持小而稳定，请求级白名单仅覆盖任务所需的最少域名。

### 建立"本地快速迭代 → 托管容器迁移"的标准化开发循环

Skills 同时适用于托管 Shell 和本地 Shell 模式，且在同一 API 下保持行为一致。  推荐的开发节奏是：本地环境下快速迭代技能定义和示例 → 验证无误后迁移到托管容器获得可重复性和部署一致性。对于企业级技能，建议在 CI/CD 流程中加入"本地验证 → 托管验证"的双阶段门禁。

## 相关主题
- [Skills Anthropic Openai Comparison Frontend Design](../ch01/652-skills-anthropic-openai-comparison-frontend-design.md) — Anthropic/Google Skills 设计模式对比
- [Claude Code Openclaw Memory Comparison](../ch03/075-claude-code.md) — OpenClaw vs Claude Code 内存对比
- [Context Window Management Comparison](https://github.com/QianJinGuo/wiki/blob/main/entities/context-window-management-comparison.md) — 上下文窗口管理方案对比
- [Harness Engineering Long Term Agent Tasks](ch05/092-harness-engineering.md) — 长周期 Agent 的 Harness 设计

---

