# OpenWorker — 吴恩达开源桌面 Agent：Local-First 运行时与四层控制架构

## Ch04.277 OpenWorker — 吴恩达开源桌面 Agent：Local-First 运行时与四层控制架构

> 📊 Level ⭐⭐ | 11.2KB | `entities/openworker-desktop-agent-local-first-architecture-ruofei-2026.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/openworker-desktop-agent-local-first-architecture-ruofei-2026.md)

OpenWorker 是 Andrew Ng（吴恩达）团队开源（MIT 许可）的本地优先桌面 Agent，定位为"开源、模型提供方可替换、本地优先的桌面 Agent 参考实现"，与腾讯 WorkBuddy 目标相似但架构路线不同：WorkBuddy 是企业级工作台与托管运行（Tencent Agent Runtime + 安全沙箱），OpenWorker 是本地 Python 服务 + LocalExecutor。其核心价值是把桌面 Agent 的关键部件（模型、工具、权限、后台任务、交付物）放进一个可读、可运行的仓库。

## 四层运行架构（源码职责划分）

官方 README 画的是三层（桌面应用 → 本地 Agent 服务 → 文件/工具/模型），源码梳理后可按运行职责细分为四层：

- 交互层：React 与 Tauri 组成桌面 Surface，承载会话、进度、交付物、审批卡片和设置；
- Agent 运行层：Python 服务组织任务循环、模型调用、Skills、工具编排与工作区；
- 控制层：风险分类、权限决策、Inbox 和 Audit Store 共同约束动作；
- 资源与执行层：文件、终端、连接器、MCP 和模型提供方构成真实工作环境。

六条运行线相互配合：任务线（目标拆步骤+进度）、模型线（多模型接入与工具层解耦）、工具线（文件/搜索/命令/外部系统统一调用）、权限线（直接执行 vs 人工批准）、状态线（前台会话/后台任务/待审批/审计衔接）、交付线（结果落成文件/消息/日历变更）。

关键源码模块：coworker/agents/cowork.py（Agent 目标、能力与交付约定）、coworker/agent.py（组装模型、工具、Skills、工作区、执行器）、coworker/engine.py（模型调用、工具授权、执行与结果回填）、coworker/risk.py + coworker/permissions.py（风险分类与权限决策）、coworker/inbox.py + coworker/audit.py（人工待办与审计事件）、coworker/skills/base.py + coworker/tools/shell.py（技能加载与本机命令执行）。

## 执行链路：一句需求 → 可追溯交付物

1. **桌面端把目标交给本地服务**：桌面应用建立会话和工作区上下文，把需求交给本地 Python Agent 服务。桌面端是 Surface（人看见和操作的界面），Python 服务才是运行时；未来增加 Slack/命令行等入口可复用同一任务引擎。模型密钥、连接器令牌和会话状态默认保存在本机应用存储。
2. **Agent 先建立可见进度**：Cowork Agent 默认四组核心能力 `COWORK_CAPABILITIES = ["files", "search", "shell", "todo"]`；任务需要调用工具时，系统指令要求先使用 todo_write 建立步骤且只保留一个 in_progress 状态，桌面 Progress 面板直接读取。解决桌面 Agent 常见反馈问题：人至少知道它在查什么、卡在哪里、下一步准备做什么。
3. **模型提议动作，工具层负责执行**：模型生成工具调用，Agent Engine 把调用交给文件、搜索、终端或连接器（自带 20+ 连接器 + MCP）。多个工具调用时逐个完成授权判断，通过的才进执行队列，再按风险决定并发/串行：低风险读取可并行，有副作用的写入和命令保持顺序执行（牺牲表面速度换取可解释顺序与可还原执行记录）。
4. **每个动作先经过风险分类**：四类风险——READ（读文件/搜索/查询，无副作用可直接执行）、WRITE_LOCAL（写文件/修改内容，受写入模式与允许目录约束）、EXEC（运行命令，受命令内容/允许规则/审批约束）、EXTERNAL（发消息/改日历/更新外部系统，需明确授权）。Permission Engine 结合工作模式、可写目录、命令允许列表和工具元数据决策；命令检查处理 `;`、`&&`、管道、重定向和命令替换等 shell 操作符（字符串前缀匹配会漏掉拼接危险动作）。
5. **前台审批与后台 Inbox 共用一套机制**：人在电脑前审批卡片出现在当前会话；后台任务遇到同样动作停在 Inbox，等人批准/拒绝/补充信息再继续。"定时生成周报"（本机草稿）与"定时发送周报"（改变外部系统状态，需单独授权）是两件不同的事。Inbox 是跨会话的人类注意力队列，任务先做无须人工介入的部分，遇授权/信息缺口暂停，把接力棒交回给人。
6. **结果进入 Artifacts 和审计记录**：指令要求把文档/分析/计划/数据集/小脚本写成文件，用 artifact: 链接交付，Artifacts 面板独立展示/打开/刷新。Audit Store 记录工具、执行阶段、状态、审批结果、参数摘要和资源引用，敏感字段只留摘要或脱敏。一次"任务完成"至少有三份状态：Progress（走到哪）、Artifacts（交付物在哪）、Audit（执行过哪些动作、谁批准了什么）——聊天记录不再承担全部事实。

## 模型可替换，运行时合同稳定

可接 OpenAI、Anthropic、Gemini、GLM、DeepSeek、Kimi、Qwen、MiniMax，也可通过 Ollama 本地运行。Agent Engine 构建在 aisuite 之上，用统一接口适配不同模型提供方并复用工具、Toolkit 和 MCP 能力。模型不直接绑定文件系统和外部服务——它看到的是工具定义，输出的是下一步调用建议；动作能否执行、在哪里执行、是否需要审批、怎样记录，由运行时决定。

模型更换后仍保留的运行时合同：工具参数与返回值；风险分类和权限策略；工作区和可写目录；进度状态；审批与 Inbox；交付物链接和审计记录。

## Skills 负责方法，权限仍由运行时掌握

使用 SKILL.md 组织技能（YAML 元数据 + Markdown 指令 + 可选资源）。会话开始时只把技能名称和描述放进上下文，Agent 真正需要时再通过 load_skill 加载完整内容——渐进式加载避免把所有工作说明一次性塞给模型。Skill 解决任务方法，不会自动扩大工具权限：即使技能说明里写着"把报告发到 Slack"，发送动作仍要经过连接器配置、风险分类和审批。方法层与执行层分开，才能复用专业流程，又不让一份 Markdown 说明绕过安全控制。

## 边界与局限

- **执行器还在本机**：命令工具建立在 Executor 抽象之上，当前接入 LocalExecutor（持久 shell，cd/环境变量/虚拟环境跨命令保留）；源码为 ContainerExecutor 和 VMExecutor 留了接口，但当前版本不能直接按"已有系统沙箱"理解。审批代表用户同意执行某个动作，不自动证明命令安全，也不提供隔离、幂等、补偿和业务正确性。
- **local-first 不等于数据永不出设备**：Agent 循环、会话、密钥和连接器令牌默认保存在本机；用 Ollama 模型可完全本地运行。但选云模型时必要上下文会发给模型提供方；调用 Slack/邮箱/CRM 集成时数据进入对应服务；可选账号的一键连接还需要云端代理 OAuth 握手。本地优先描述的是运行时和状态的默认归属。

## 与 WorkBuddy 对比

| 观察角度 | 腾讯 WorkBuddy | OpenWorker |
|---|---|---|
| 产品形态 | 腾讯云产品与企业生态 | MIT 许可的开源桌面应用 |
| 模型与账号 | 平台提供的模型与服务体系 | 用户自带模型、密钥，也可接 Ollama |
| 工具接入 | 腾讯生态与平台能力 | 本地文件、终端、连接器与 MCP |
| 运行基础 | 官方强调 Agent Runtime 与安全沙箱 | 本地 Python 服务，当前 shell 使用 LocalExecutor |
| 观察重点 | 企业级工作台与托管运行 | 桌面 Agent 的模块、协议和源码实现 |

两者共同回答"AI 怎样把任务做完"，基础设施选择不同。 参见 [WorkBuddy 产品实践：从模型到 Harness 的 Agent 可用产品架构](../ch05/043-agent-harness.html)。

## 试用建议：四类低风险场景 + 边界清楚的任务模板

四类检验场景：工作（会议资料→简报，检验文件读取/进度/交付物/引用）、生活（行程→计划，看"生成文件" vs "改外部日历"为什么不同风险）、架构（ADR/接口文档/事故记录→架构评审草稿，检验 Skill 复用与限定资料范围）、研发（仓库状态/Issue/测试输出→发布风险清单，最完整路径：文件+搜索+终端+权限+审计）。

首次试用任务模板（对应运行时合同）：目标 / 输入（只使用指定目录）/ 允许访问（读哪些、写哪里）/ 不要做（不发送邮件、不改日历、不读其他目录）/ 交付物（具体文件）/ 完成条件（可打开、含进展风险计划来源）/ 遇到情况先问我（资料矛盾、需要运行命令、需要访问外部系统）。

## 相关实体

- → [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/openworker-desktop-agent-local-first-architecture-ruofei-2026.md)
- [从 Prompt 到 Graph：一文理解五层 Agent 工程](../ch01/1129-20.html)（同作者姊妹篇：五层框架 → OpenWorker 源码样本）
- [WorkBuddy 产品实践：从模型到 Harness 的 Agent 可用产品架构](../ch05/043-agent-harness.html)（对比对象）
- [Fable 5 的信号：Agent 开始拼 Runtime](../ch01/475-claude-fable-5.html)（Runtime Contract 工程化拆解）
- [Harness 之后：状态边界与失败闭环](../ch05/077-harness.html)（同作者可靠性续篇）

---

