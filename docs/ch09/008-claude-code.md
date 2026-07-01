# Claude Code 在大型代码库中的实战经验：从哪里入手？怎么做对？

## Ch09.008 Claude Code 在大型代码库中的实战经验：从哪里入手？怎么做对？

> 📊 Level ⭐⭐ | 31.0KB | `entities/claude-code-large-codebase-harness-configuration.md`

# Claude Code 大型代码库套具配置

## 核心概述

Claude Code 已在生产环境中运行于数百万行的大型单体仓库、数十年历史的遗留系统、跨数十个仓库的分布式架构，以及拥有数千名开发者的组织中。这些环境带来了小型代码库所没有的挑战——无论是不用子目录构建命令就不同，还是散布在没有共享根目录的文件夹中的遗留代码。

本文涵盖在规模化采用 Claude Code 过程中观察到的模式。"大型代码库"指广泛的部署场景：包含数百万行的单体仓库、数十年构建的遗留系统、跨独立仓库的数十个微服务，或以上任意组合。这还包括使用团队不常与 AI 编码工具关联的语言（如 C、C++、C#、Java、PHP）运行的代码库。（Claude Code 在这些场景中的表现比大多数团队预期的要好，特别是最近的模型版本。）

## 如何在大型代码库中导航

Claude Code 导航代码库的方式与软件工程师相同：遍历文件系统、读取文件、使用 grep 精确定位所需内容，并跟踪代码库中的引用。它在开发者本地机器上运行，不需要构建、维护或上传代码库索引到服务器。

### Agent式搜索 vs RAG

基于 RAG 的 AI 编码工具通过嵌入整个代码库并在查询时检索相关块来工作。在大规模场景下，这些系统可能失效，因为嵌入管道无法跟上活跃工程团队的节奏。当开发者查询索引时，它反映的是代码库之前的状态——可能是数周、数天甚至数小时前的内容。检索返回的是团队两周前重命名的函数，或引用上个月 sprint 中删除的模块，且没有任何迹象表明两者都已过时。

**Agent式搜索避免了这些失败模式**。没有嵌入管道或集中式索引需要维护，随着数千名工程师提交新代码，每个开发者的实例都从实时代码库工作。但这种方法有权衡：它在 Claude 有足够的起始上下文来知道去哪里查找时效果最佳。这意味着 Claude 的导航质量取决于代码库的设置程度——通过 CLAUDE.md 文件和 Skills 分层提供上下文。

## 套具与模型同等重要

关于 Claude Code 最常见的误解之一是其能力完全由所使用的模型决定。团队关注模型的基准测试及其在测试任务中的表现。实际上，围绕模型构建的生态系统——即 **harness**——对 Claude Code 表现的影响比模型本身更大。

Harness 由五个扩展点构建：CLAUDE.md 文件、Hooks、Skills、Plugins 和 MCP 服务器，每个点都有不同的功能。团队构建它们的顺序很重要，因为每一层都建立在前一层的基础上。另外两个能力——LSP 集成和子 Agent——完成了整个设置。

## 五扩展点套具详解

### CLAUDE.md 文件

CLAUDE.md 文件是 Claude 在每个会话开始时自动读取的上下文文件：根目录文件提供全局概览，子目录文件提供本地规范。它们给予 Claude 所需的代码库知识。由于无论任务如何，它们在每个会话中都会加载，因此保持它们专注于广泛适用的内容将防止它们成为性能拖累。

**分层加载机制**：Claude 在代码库中移动时自动遍历目录树并累加读取所有沿途的 CLAUDE.md。根目录文件提供全局概览，子目录文件提供本地规范。核心原则是**只放真正普遍适用的内容**——过多内容会拖累会话性能。

### Hooks

Hooks 让设置自我改进。大多数团队将 Hooks 视为阻止 Claude 做错事的脚本，但更有价值的用途是持续改进。Stop Hook 可以在上下文新鲜时反思会话期间发生的事情并提议更新 CLAUDE.md。Start Hook 可以动态加载团队特定上下文，这样每个开发者都无需手动配置就能获得适合自己模块的设置。对于 lint 和格式化等自动化检查，Hooks 确定性执行规则，比依赖 Claude 记住指令产生更一致的结果。

**三种核心 Hooks 模式**：

- **Stop Hook**：会话结束时趁上下文新鲜反思并提议更新 CLAUDE.md（持续改进的核心）
- **Start Hook**：动态加载团队特定上下文，开发者自动得到适合自己模块的设置
- **Lint/格式化 Hook**：确定性执行，比让 Claude 记住指令更稳定

**常见误区**：把本该自动运行的机械检查用提示词处理。

### Skills

Skills 通过渐进式披露保持正确的专业知识按需可用，而不会让每个会话膨胀。在拥有数十种任务类型的大型代码库中，并非所有专业知识都需要在每个会话中都存在。Skills 通过渐进式披露解决这个问题，加载专门的工作流和领域知识，否则这些会竞争上下文空间，并且仅在任务需要时加载。例如，当 Claude 评估代码漏洞时加载安全审查技能，当代码更改且需要更新文档时加载文档处理技能。

Skills 还可以绑定到特定路径，这样它们只在代码库的相关部分激活。拥有支付服务的团队可以将他们的部署技能绑定到该目录，这样当有人在单体仓库的其他地方工作时它永远不会自动加载。

### Plugins

Plugins 分发有效的设置。大型代码库的一个挑战是好的设置可能停留在部落知识层面。Plugin 将 Skills、Hooks 和 MCP 配置捆绑到单个可安装包中，因此当新工程师在第一天安装该 Plugin 时，他们将立即拥有与已使用 Claude 的人相同的上下文和能力。Plugin 更新可以通过托管市场跨组织分发。

### LSP 集成

语言服务器协议（LSP）集成赋予 Claude 与开发者在 IDE 中相同的导航能力。大多数大型代码库 IDE 已经运行着 LSP，为"跳转到定义"和"查找所有引用"提供支持。向 Claude 公开这些给予它符号级精度：它可以跟随函数调用到其定义，跨文件跟踪引用，并区分不同语言中同名的函数。没有它，Claude 会进行文本模式匹配，可能落在错误的符号上。

**核心价值**：

- "跳转到定义"和"查找所有引用"
- grep 常见函数名返回几千条匹配，LSP 过滤在 Claude 读任何东西之前就完成
- 多语言代码库（C/C++/Java等）投入产出比最高

### MCP 服务器

MCP 服务器是 Claude 连接到内部工具、数据源和 API 的方式，这些是它无法以其他方式到达的。最复杂的团队构建 MCP 服务器，将结构化搜索作为 Claude 可直接调用的工具暴露。其他则将 Claude 连接到内部文档、工单系统或分析平台。

### 子 Agent

子 Agent 将探索与编辑分离。子 Agent 是一个隔离的 Claude 实例，有自己的上下文窗口，执行任务并仅将最终结果返回给父级。一旦 harness 到位，一些团队会启动只读子 Agent 来映射子系统并将发现写入文件，然后让主 Agent 用完整信息进行编辑。

## 组件对比表

| 组件 | 是什么 | 何时加载 | 最适合 | 常见困惑 |
|------|--------|----------|--------|----------|
| CLAUDE.md | Claude 自动读取的上下文文件 | 每个会话 | 项目特定规范、代码库知识 | 用于属于 skill 的可复用专业知识 |
| Hooks | 在关键时刻运行的脚本 | 由事件触发 | 自动化一致行为、捕获会话学习 | 用提示词处理应该自动运行的事情 |
| Skills | 特定任务类型的打包指令 | 按需加载，当相关时 | 跨会话和项目的可复用专业知识 | 将所有东西加载到 CLAUDE.md 而不是使用 skill |
| Plugins | 捆绑的 skills、hooks、MCP 配置 | 配置后始终可用 | 跨组织分发有效设置 | 让好的设置停留在部落知识层面 |
| LSP | 通过语言特定服务器获取的实时代码智能 | 配置后始终可用 | 符号级导航和在类型化语言中自动错误检测 | 假设它是自动的 |
| MCP 服务器 | 连接到外部工具和数据 | 配置后始终可用 | 给予 Claude 无法以其他方式到达的内部工具访问权限 | 在基础设置工作之前构建 MCP 连接 |
| 子 Agent | 用于特定任务的独立 Claude 实例 | 调用时 | 将探索与编辑分离、并行工作 | 在同一会话中运行探索和编辑 |

*LSP 通过插件层访问。子 Agent 是一种委托能力，而非配置的扩展点。

## 三种成功部署配置模式

如何为大型代码库配置 Claude Code 很大程度上取决于该代码库的结构。但在我们观察到的部署中，三种模式始终出现。

### 模式一：使代码库可规模化导航

Claude 在大型代码库中提供帮助的能力受限于其找到正确上下文的能力。太多的上下文加载到每个会话中会降低性能，而太少的上下文会让 Claude 盲目导航。最有效的部署在使代码库对 Claude 可读方面进行前期投资。几个模式始终出现：

**保持 CLAUDE.md 文件精简分层**
Claude 在代码库中移动时累加加载它们：根文件用于全局概览，子目录文件用于本地规范。根文件应该只是指针和关键陷阱；其他一切都会成为噪音。

**在子目录中初始化，而不是在仓库根目录**
Claude 在被限定到实际与任务相关的代码库部分时工作得最好。在单体仓库中，这可能感觉违反直觉，因为工具通常假设根访问，但 Claude 自动遍历目录树并加载沿途找到的每个 CLAUDE.md 文件，所以根级上下文永远不会丢失。

**每个子目录限定测试和 lint 命令**
当 Claude 只更改了一项服务时运行完整套件会导致超时，并浪费上下文在无关输出上。子目录级别的 CLAUDE.md 文件应指定适用于该部分代码库的命令。这对于每个目录都有自己测试和构建命令的服务导向型代码库效果很好。

**使用 .ignore 文件排除生成的文件**
在 `.claude/settings.json` 中提交 `permissions.deny` 规则意味着排除是版本控制的，所以团队中的每个开发者都无需自己配置就能获得相同的降噪效果。在某些代码库中，生成的文件本身就是开发工作的主题。处理代码生成器的开发者可以覆盖其本地设置中的项目级排除，而不影响团队其他成员。

**构建代码库地图当目录结构不能胜任时**
对于代码未集中在常规目录结构中的组织，仓库根目录的轻量级 markdown 文件列出每个顶级文件夹及其内容的单行描述，为 Claude 提供了可在打开文件之前扫描的目录表。

**运行 LSP 服务器让 Claude 按符号搜索，而不是字符串**
在大型代码库中 grep 常见函数名会返回数千条匹配，Claude 会消耗上下文打开文件来确定哪个重要。LSP 仅返回指向同一符号的引用，所以过滤在 Claude 读取任何内容之前完成。

### 模式二：随着模型智能演进主动维护 CLAUDE.md

随着模型演进，为当前模型编写的指令可能与未来模型背道而驰。指导 Claude 度过曾经挣扎模式的 CLAUDE.md 文件，在下一个模型发布时可能变得不必要或主动约束。例如，一个告诉 Claude 将每个重构分解为单文件更改的 CLAUDE.md 规则可能帮助过早期模型保持正轨，但会阻止更新模型进行其处理得好的协调跨文件更改。

为补偿特定模型限制而构建的 Skills 和 Hooks——无论是模型推理还是 Claude Code 本身工具的限制——一旦这些限制不再存在就成为开销。例如，一个拦截文件写入以在 Perforce 代码库中强制执行 p4 编辑的 Hook，在 Claude Code 添加原生 Perforce 模式后变得冗余。

**团队应该每三到六个月进行一次有意义的配置审查**，但在重大模型发布后以及性能感觉停滞时也值得进行一次。

### 模式三：分配 Claude Code 管理和采用的所有权

单纯的技术配置不能推动采用。做对的组织也在组织层面进行投资。

**推广最快的部署在广泛访问之前进行了专门的基础设施投资**。一个小团队，有时甚至只是一两个人，在广泛访问之前先连接好工具，这样当开发者第一次接触 Claude 时，它已经适合开发者工作流程。在一家公司，几名工程师构建了一套 Plugin 和 MCP，在第一天就可用。在另一家，一整个专注于管理 AI 编码工具的团队在推广开始之前就准备好了基础设施。在这两种情况下，开发者的第一次体验是高效的，而不是沮丧的，采用由此传播。

**DRI（负责人）模式**：一个人对 Claude Code 配置拥有所有权，对设置、权限策略、Plugin 市场和 CLAUDE.md 规范有决策权，并负责持续更新维护。

**受监管行业的治理问题**：明确已批准 Skills 集合、必要代码审查流程和有限的初始访问范围，随着信心建立再逐步扩展。跨职能工作组早期建立（汇集工程、信息安全 和治理代表）定义需求并构建推广路线图，这被证明是最顺畅的部署。

## 深度分析

### 核心洞察：上下文即护城河

本文最根本的洞见在于揭示了**Agent式搜索的本质是上下文工程**。与RAG依赖过去时态的代码库快照不同，Agent式搜索要求主动构建将来时态的上下文——这不是一个技术差异，而是哲学差异。RAG试图用相关性算法弥补上下文缺口，而Agent式搜索则通过harness设计来消除这个缺口。CLAUDE.md分层、Skills按需加载、Hooks自我改进，这三者共同构成了一个**自适应上下文供给系统**，使得Claude在任何时刻都拥有恰到好处的上下文。

### 架构层次的结构性关系

五个扩展点的顺序不是任意的：CLAUDE.md → Hooks → Skills → Plugins → MCP，构成了一个**从内省到外延的扩展链**。CLAUDE.md提供基础上下文层，Hooks实现自我观测和修正，Skills封装可复用专业知识，Plugins解决分发问题，MCP打通外部工具。这个层次揭示了一个重要原则：**每一层都建立在前一层的能力之上**，跳级往往导致系统不稳定。例如，没有充分的CLAUDE.md基础就上 Skills，Claude无法判断何时该激活哪个Skill；没有Hook积累的自我认知，Plugin的价值只停留在"设置同步"而非"知识传承"。

### 经济模型：上下文是稀缺资源

文章隐含了一个经济视角：**上下文空间是有限的，因此需要配置经济机制**。分层机制是分形定价——根目录CLAUDE.md对全局定价，子目录CLAUDE.md对局部定价，Skills对任务类型定价。Hooks的Stop Hook机制实质上是**会话学习的市场**：每次会话的洞见被定价为一次CLAUDE.md更新的提案机会。这个机制比让开发者手动维护文档更高效，因为它在知识最鲜活的时候完成定价和记录。

### 组织动态与采用曲线

模式三揭示了一个关键的非技术因素：**AI工具的采用率取决于首次体验质量**。这不是一个技术问题，而是一个组织行为学问题。当前的技术团队管理结构通常按技术栈划分（前端组、后端组、基础设施组），但Claude Code的价值发挥要求按**工作流程段**组织——探索、编辑、审查、部署。这意味着采用Claude Code可能倒逼组织结构调整，或者至少需要跨职能的协调角色（DRI模式）。

### 模型迭代与配置债务

每3-6个月审查配置的建议，揭示了一个被低估的风险：**配置债务**。与代码债务类似，harness配置也会积累。早期为补偿模型缺陷而写的CLAUDE.md规则，可能在模型升级后成为性能瓶颈甚至错误行为的诱因。这个问题在采用敏捷发布周期的模型供应商环境中尤其突出——每一次模型更新都可能使部分配置失效或产生新问题。LSP集成的价值因此更加突出：它是唯一不依赖提示词层级的上下文机制，对模型版本相对免疫。

### 子Agent的认知分工价值

子Agent不只是并行化工具，它实现了一个关键的认知分工：**探索层与执行层解耦**。主Agent在执行编辑时保持目标连续性，子Agent在探索时保持上下文纯净。这个模式的深层含义是：Claude Code不是单一AI实例，而是一个**多代理认知系统**，其效能取决于如何分配认知任务到合适的代理层级。

## 实践启示

1. **保持 CLAUDE.md 精简分层**：根目录只放关键指引和必须注意的坑，详细知识放到子目录 CLAUDE.md，让 Claude 自动按路径加载对应规范
2. **用 .ignore 排除噪音**：在 .claude/settings.json 中配置 permissions.deny 规则，排除生成文件、构建产物和第三方代码，团队自动获得一致的降噪效果
3. **每 3-6 个月审查一次配置**：为当前模型写的指令可能成为未来模型的障碍。建议在每次重大模型发布后、效果感觉瓶颈时都做一次有意义的配置审查
4. **Assign DRI（负责人）模式**：一个人对 Claude Code 配置拥有所有权，对设置、权限策略、Plugin 市场和 CLAUDE.md 规范有决策权，并负责持续更新维护
5. **受监管行业一开始就要明确边界**：明确已批准 Skills 集合、必要代码审查流程和有限的初始访问范围，随着信心建立再逐步扩展，避免合规问题
6. **在子目录中初始化而不是 repo 根**：Claude 被限定到与任务相关的代码库部分时工作得最好，它会自动遍历目录树加载所有 CLAUDE.md，所以根级上下文不会丢失
7. **LSP 集成优先**：对于多语言代码库，投入产出比最高，在 Claude 读任何东西之前就完成符号级精准导航

## 关键权衡

- **Agent 式搜索 vs RAG**：无中央索引，信息不过期；但需要足够起始上下文
- **CLAUDE.md 精简 vs 详尽**：太详尽会拖累会话性能
- **模型迭代 vs 配置维护**：每 3-6 个月审查一次，避免早期局限成为新模型障碍
- **集中治理 vs 分散实验**：受监管行业一开始就要明确边界，逐步扩展
- **部落知识 vs 可分发设置**：Plugin 机制解决好的设置无法传播的问题

## 边界情况与注意事项

**CLAUDE.md 分层方法失效的边缘情况**：

- 拥有数十万文件夹和数百万文件的代码库
- 使用非 Git 版本控制的遗留系统

在这些情况下，需要额外的配置工作。Claude Code 设计围绕conventional软件工程环境：工程师是主要代码库贡献者，repo 使用 Git，代码遵循标准目录结构。非传统设置（如带有大型二进制资产的游戏引擎、具有非传统版本控制的环境，或非工程师向代码库贡献）需要额外的配置工作。

## 与 Agent Harness Engineering 的关系

参见 [Agent Harness 架构](ch03/044-agent.md)（AHE框架）。

AHE 是通用的 Harness 工程方法论；本文是 Claude Code 的具体场景扩展点实现，两者互补。AHE 的"三层可观测"在大型代码库场景对应 LSP+Hooks 的调试能力。

核心判断不变：**真正决定产品能否落地、能否稳定交付的，往往是 Harness，而非模型**。Harness Engineering 框架的 Prompt ⊂ Context ⊂ Harness 层次同样适用：Claude Code 的五扩展点正是这个层次的具体实现——CLAUDE.md 提供基础 Context，Hooks/Skills/Plugins 构成 Harness 层，MCP 打通外部工具。

## QQ音乐 Harness Engineering 实践（黄欣欣/腾讯云开发者，2026-05-22）

**核心公式：** `代码产出 = AI能力 × 上下文质量`（乘法非加法）

上下文质量趋近于零时，模型再强产出也是零。模型能力提升依赖外部厂商，上下文质量提升完全掌握在团队自己手中——因此提升上下文质量是比提升模型能力更高效的杠杆。

**Vibe Coding 三大结构性缺陷：**

- **信息损耗** — 同一句话多次执行给出不同实现；需求→设计→代码每步都要有显式产出和可追溯关系
- **知识孤岛** — AI 只知训练语料里的通用知识，不懂团队历史决策和私有约束
- **验证断档** — "能跑"就直接提交；每个关键节点都要有可机读的质量门禁和审计记录

**真实业务仓五大上下文缺口：**
| 缺口类型 | 典型问题 | AI"盲区" |
|---------|---------|---------|
| 隐性规范 | 团队约定的锁机制、埋点规则、错误码空间 | AI 不知道这些规范存在 |
| 历史决策 | "为什么选了 A 方案不选 B" | 训练语料里没有团队内部决策记录 |
| 服务契约 | IDL 字段的冻结状态、下游是否强依赖 | AI 看到文本，不理解哪些字段动不得 |
| 跨服务依赖 | 同一需求要改哪几个服务、谁调谁 | AI 缺乏全局视角 |
| 演进轨迹 | 某个模块上次大改的坑、灰度策略 | AI 没有跨会话记忆 |

**QQ音乐 Harness Engineering 框架（50+微服务）：**

- **五阶段 + 四门禁：** 初始化→需求定义→设计→开发→交付；需求评审门禁/设计门禁/Dev进入门禁/服务仓库检查门禁
- **三层知识体系：** context/team/（团队级）/ context/harness-framework/（框架级）/ context/project/（服务级）
- **三仓联动：** 每个需求在 Harness仓/业务仓/IDL契约仓里用完全相同的分支名 `feature/{devops-name}/{tapd-id}`
- **.service-matrix/dependencies.yaml：** 服务拓扑单一真相源，57个服务的 repo_path 解析
- **Self-Refinement 闭环：** 每次"纠正"沉淀为团队资产experience/*.md，新人/新模型/新会话都能复用
- **Skill/Agent/Command 三件套：** 34 Skills + 24 Agents + 35 Slash Commands，全部版本化 markdown 文件，Knowledge as Code

**关键判断：**

- Harness Engineering 是治理层，不替代执行工具（Claude Code/Cursor/Gemini CLI等）；工程规范与 AI 工具解耦，今天用 Claude Code，明天换工具，流程和知识都不丢
- AI 写代码变快了，但快不等于对；错误越早拦住代价越低
- 真正决定能否稳定交付的是 Harness，而非模型

## 相关资源

- [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/how-claude-code-works-in-large-codebases-best-practices-and-where-to-start.md)
- [QQ音乐 Harness Engineering 实践原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/qq-music-harness-engineering-monorepo-microservices.md)

## 相关实体
- [Claude Code Best Practices Prompt Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/claude-code-best-practices-prompt-engineering.md)

- [Feishu Aily Agent Lobster](ch04/150-ai.md)
- [Colaos Listenhub Agency Native Organization Juzi](https://github.com/QianJinGuo/wiki/blob/main/entities/colaos-listenhub-agency-native-organization-juzi.md)
- [Red Sequoia Ai Summit Agi Declaration](ch04/150-ai.md)
- [Hermes Self Improving Overview Winty](ch04/212-hermes-self-improving-overview-winty.md)
- [Cursor.Com Composer 2 5](https://github.com/QianJinGuo/wiki/blob/main/entities/cursor.com-composer-2-5.md)
- [100 年压缩到 100 天红杉资本这就是 Agi](ch01/268-agi.md)
- [Stripe Agent Economic Infrastructure Emily Sands](ch03/044-agent.md)
- [Pilotdeck Data派Thu 2026](https://github.com/QianJinGuo/wiki/blob/main/entities/pilotdeck-data派thu-2026.md)
- [Four Sub Agent Patterns 2026](ch03/044-agent.md)
- [A Guide To Which Ai To Use In The Agentic Era](ch01/527-a-guide-to-which-ai-to-use-in-the-agentic-era.md)
- [Ai Xiaolaoliu Business Agent Augmentation Layer General Base 20260606](ch04/150-ai.md)
- [Cloud Agent Development Environments 1778979924](ch03/044-agent.md)
- [Volcengine Data Agent Product Overview](ch03/044-agent.md)
- [Ai Agent Engineer Learning Roadmap Backend 2026](ch04/150-ai.md)
- [Emergent Collaboration Ai High Quality Decision Agent Room](ch04/150-ai.md)
- [Iclr 2026 英伟达 普渡大学用Agent闭环实现文生3D](ch03/044-agent.md)
- [Agent Guide Core Concepts Overview](ch03/044-agent.md)
- [腾讯混元新里程碑Hy3 Preview 发布开源Agent 表现全面提升](ch03/044-agent.md)
- [Headroom Context Compression Agent Vibecoder](ch03/044-agent.md)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](ch03/044-agent.md)
- [Kimi Work Beta Foundation Model Company Advantage](https://github.com/QianJinGuo/wiki/blob/main/entities/kimi-work-beta-foundation-model-company-advantage.md)
- [Agent Paradigm Evolution Feipeng Alibaba](ch03/044-agent.md)
- [Hermes Agent Long Running Governance Five Cards Ruofei](ch03/044-agent.md)
- [Agentic Rl Token In Token Out Done Right C6Aaa4](ch03/044-agent.md)
- [Ai Techliwen Creaoai Cloud Agent Infrastructure Two Lessons 20260606](ch04/150-ai.md)
- [你不知道的 Agent原理架构与工程实践 V2](ch03/044-agent.md)
- [Kimi Work 300 Agent Cluster Yin John Agi Hunt](ch03/044-agent.md)
- [Your First Ai Agent Should Do One Thing Badly](ch04/341-your-first-ai-agent-should-do-one-thing-badly.md)
- [A Missing Layer In Agentic Systems](ch04/323-a-missing-layer-in-agentic-systems.md)
- [Announcing Genkit Middleware Intercept Extend And Harden Your Agentic Apps 1778979925](ch03/044-agent.md)
- [Hermes Agent Soul Md Personality Shugex](ch03/044-agent.md)
- [Lessons From 2 Billion Agentic Workflows](ch04/369-lessons-from-2-billion-agentic-workflows.md)
- [Local Vs Cloud Agent Onsite Context Debate Xingxiaozhao](ch03/044-agent.md)
- [Volcengine Data Agent Marketing Strategy Agent](ch03/044-agent.md)
- [Phoneworld Mobile Agent Scaling Mock Environments Tencent Hunyuan Arxiv 2605 29486](ch03/044-agent.md)
- [Hermes Agent Self Evolution 源码解析](ch03/044-agent.md)
- [Real Ai Agents And Real Work](ch04/212-real-ai-agents-and-real-work.md)
- [Volcengine Data Agent Intelligent Query Agent](ch03/044-agent.md)
- [Hermes Agent Tool System Analysis](ch03/044-agent.md)
- [How To Build Agents Where Data Already Lives](ch04/432-how-to-build-agents-where-data-already-lives.md)
- [Rocketmq 5 5 0 Litetopics Ai Agent Messaging](ch04/150-ai.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/claude-code-complete-guide.md)

---

