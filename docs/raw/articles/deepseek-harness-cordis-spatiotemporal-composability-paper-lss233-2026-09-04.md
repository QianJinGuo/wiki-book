---
title: "DeepSeek Harness 背后的「心脏」：Cordis 到底是什么（lss233 深度解析）"
source_url: "https://mp.weixin.qq.com/s/3vtCkp6EbA5MhRERD6f17A"
ingested: "2026-09-04"
sha256: b7a13a4c6b0e4947074e404b8e21e38699d01b1f8c2acbea7d37d11790b0bbbc
type: raw
---

# DeepSeek Harness 背后的「心脏」：Cordis 到底是什么

> 来源：腾讯技术工程（lss233）。DeepSeek Harness 的"一切皆插件"背后是 Cordis 框架——原 Koishi QQ 机器人底层，现被 DeepSeek 用作整个 Agent 运行时的地基。本文把 Cordis 的五概念（插件/上下文/注入/事件/可逆副作用）讲透，并深入解读其配套 88 页论文《A Programming Paradigm for Spatiotemporal Composability》（北大+DeepSeek，作者 Yifan Shi/Wei Zhang/Tianyi Cui）：把 effect/coeffect 提升为运行时机制，证明时间与空间可组合性构成新编程范式。

## 一、插件系统为什么需要框架

假设写聊天机器人，功能变多后拆模块，但模块化只解决"代码怎么组织"，解决不了四件事：安装（新功能怎么接进系统）、配置（同功能不同部署环境配置写哪）、卸载（功能下线时定时器/监听器/连接谁清理，清理不干净就是泄漏）、协作（功能 A 依赖功能 B，但 B 可能没启动、之后可能被替换）。插件系统是对这四个问题的回答。Cordis 的特点是：把"卸载"和"协作"从插件作者的自觉，上升为框架级保证。

作者 Shigma（QQ 机器人圈称"梦梦"），一个人撑起一套技术栈：Cordis 是骨架（生命周期与依赖）、Schemastery 管配置校验、Minato 管数据存取、Satorijs 管平台协议、Koishi 是集大成者。Cordis 诞生于 Koishi（2020-01 首个正式版），2022-04 cordis 上 npm，2024 底 Cordis 4 引入基于 fiber 的生命周期体系。Cordis 是拉丁语"心脏"（cor）所有格。当前 Cordis 配套论文由北京大学与 DeepSeek-AI 合著（第一作者 Yifan Shi），88 页预印本。

定位是 **meta-framework（元框架）**：不是机器人框架（Koishi 才是），也不是 DI 容器。传统 DI 回答"谁创建谁"，Cordis 回答"谁在什么时候活着"。它规定"副作用如何组合、依赖如何解析"，但不预设任何业务领域——QQ 机器人能用，Agent 运行时也能用。

## 二、核心机制：五个概念

### 1. 插件与上下文 Context
写 Cordis 插件完全不需要框架启动代码，插件只描述贡献（export function apply(ctx)），应用长什么样由配置（cordis.yml）决定 = 配置即组合。插件三形态：函数（最常见）/对象/类（对外提供 Service 时）。ctx 是上下文也是服务容器：ctx.on（监听事件，卸载自动移除）、ctx.effect（注册副作用，卸载自动回滚）、ctx.plugin（挂载子插件，随父卸载）、ctx.get/provide（读服务/提供服务）。ctx.plugin(child) 并非简单注册，而是派生一个子上下文——插件因此是一棵树：子上下文继承父的一切，卸载按层级（父卸载递归卸子，子卸载不影响兄弟父级）。

### 2. fiber 生命周期
Cordis 4 为每个已加载插件维护 fiber，状态机：PENDING（inject 服务未就绪等待）→ LOADING/ACTIVE → FAILED（异常/配置校验失败）→ UNLOADING/DISPOSED。插件因配置修改/热重载/dispose()/依赖消失被卸载，无论何种原因清理都自动。DSH 里 cordis_inspect 巡检的就是各 fiber 状态。

### 3. effect：可逆副作用（第一个核心机制）
ctx.effect(() => { const conn = createConnection(); return () => conn.close() })——主体加载时执行，返回的 disposer 卸载时执行，永远不用自己调清理函数。Cordis 内置 API 本身都是 effect：ctx.on 监听器随插拔、ctx.plugin 子插件递归卸载、服务注册随提供方消失。**关键结论：Cordis 中所有对上下文的变更都归结为 ctx.effect 这一个原语**，提供服务/挂载插件/注册监听器全是特例，因此"任何通过上下文的操作都自动可追踪、可恢复"是结构事实。插件作者铁律：凡自己创建、Cordis 不管的资源都包进 ctx.effect。副作用可逆 → 插件可安全卸载重装 → 获得热重载（HMR）、故障自动恢复、测试隔离。DSH"改配置不用重启"底层就是：改配置→旧插件卸载（effect 全回滚）→新插件加载，进程不重启。

### 4. 服务与注入：响应式依赖（第二个核心机制）
把能力挂到 ctx 上让别的插件按名取用就是 Service。消费方只声明 inject = ['greeter']，不 import 实现；inject 语义是插件保持 PENDING 直到所列服务全部就绪，配置文件顺序无关紧要、启动顺序由依赖决定。**与传统 DI 本质区别**：传统 DI 假设"一旦绑定服务一直在"；Cordis 假设"服务随时可出现、随时消失"——Agent 场景是常态（LLM 限流、MCP 崩溃、watcher 被杀）。Cordis：提供方卸载时依赖它的插件自动卸载（effect 回滚），新提供方就绪后自动重载，依赖方不需写任何重连代码。另有 ctx.isolate（隔离：作用域内服务解析到独立实例）与 ctx.intercept（拦截：给依赖访问附加元数据，外层约束内层不修改组件）。DSH 的 ctx.tools/ctx.llm/ctx.shell/ctx.sessions/ctx.skills 全是这类服务。

### 5. 事件：喊话与决策链
类型化事件系统，靠 TypeScript 声明合并获得全链路类型安全。分发模式是公开契约：emit（同步广播）、parallel（并发等待）、serial（按序，首个非空返回胜出停止）、bail（serial 同步版）、waterfall（环绕中间件 around-middleware）。waterfall 是 DSH 用得最多的模式（Koa/Express 中间件搬进事件系统）：每监听器收到参数和 next() continuation，不调 next()=否决短路，调 next()=放行，多个互不相识插件组成一条决策链。DSH 明文纪律：只观察/记录的 waterfall 监听器必须调 next()，否则无声吞掉下游默认行为。DSH 工具执行管道 tools/pre-execute→execute→post-execute 就是一条 waterfall 链；approval/request、agent/request 也是。

### 6. Schema 与声明式组合：配置即程序
cordis.yml 条目（entry）带 id（稳定身份，loader 靠它区分"修改"与"删了重加"；不带 id 每次读取得新 id，任何编辑都被当"先删后加"）、group（整组装卸）、isolate。Schema 校验（schemastery）在调用 apply 前校验，配置非法则加载失败给精确错误，插件绝不在配置不完整时半启动。DSH Loader 支持 !!js 运行时求值表达式（如 !!js process.env.X ?? 'default'），依赖就绪后才求值。配置即程序：改配置 = 局部热替换，无需重启。DSH 的 cordis.patch.yml 与 --patch 覆盖层就是这套声明式组合的生产使用。

## 三、在 DeepSeek Harness 中：一切皆插件

启动约 20 行代码：new Context() → ctx.plugin(Loader) → Include 挂载配置树 → 等整棵树稳定 → assertEntriesActivated 审计（不允许条目半死不活）→ return ctx。根 Context 只做三件小事，其余一切来自配置树。

Profile 把应用拆成可叠加的层：$DSH_HOME/profiles/<名>/ 目录含 manifest（dsh.profile.bundles 列出按顺序应用的组合包）+ 用户 cordis.patch.yml。Bundle 是一个 npm 包，package.json 声明 "dsh": {"bundle": {"patch": "./cordis.patch.yml"}}。核心组合包 @deepseek-ai/dsh-base 的 patch 就是把几十个插件一次 insert 进空根。部署方想改默认行为无需改源码，在自己的 patch 层按 id 覆盖一行即可（后写覆盖先写、可 insert、可 disabled）。"应用由哪些插件组成、各是什么配置"本身都是可叠加、可覆盖、可审计的声明，这就是"一切皆插件"的技术底座。

**工具流水线**：Agent 能力边界是 ctx.tools 服务，注册一个工具本质是 Cordis 插件（inject: ['tools'] 等待注册表就绪；ctx.tools.register 注册即 effect，插件卸载工具自动注销；tools/result 事件让任何插件观察每次工具调用）。**自指设计**：@deepseek-ai/dsh-tool-cordis 官方称"自指的 Cordis 工具集"，给 Agent 五个工具：cordis_inspect（只读巡检进程）、cordis_define（现场定义小插件包，只记录不执行）、cordis_run（宿主半放 node:vm 沙箱执行+浏览器半推送每个网页）、cordis_stop/cordis_undefine（卸载动态包）。Agent 可检查自己运行的框架、现场编写并运行动态插件、用完再卸载，全程不动 cordis.yml、不装 npm 包、不重启进程。DSH 信任立场：动态包与 bash 同权，沙箱隔离全局但不构成安全边界。"双半插件"：宿主半跑服务端管逻辑、浏览器半跑网页管 UI，经 host.call RPC。浏览器里也运行着独立的 Cordis 客户端运行时。"自省 + 现场改装"叠加 = 可进化 Agent 雏形，论文结论把"自进化 Agent 运行时"列为理论未来验证方向。

## 四、DSH 插件槽位（capability-seams）

扩展点不是"API 列表"而是一张 Cordis 服务注册表（任何插件可注册新服务/替换已有提供方）。常用槽位按类别：执行（shell/代码/子进程/lsp）、模型（llm 适配器注册表）、智能（agents/agentPresets/subagents）、数据（sessions/storage/attachments/spillStore/sessionQuery/sessionTitle）、环境（fs/web/credentials/settings/webServer）、治理（tools/approval/permissionPresets/sandboxPolicy）、编排（goals/jobs/workflowEngine/planMode）、自指（dynamicCordisRunner/cordisInspect）、前端（slots/clientModules/theme/locale）。每种类别都有可替换提供方列表（如 shell 有 bash-local/bash-sandbox/pwsh-local/E2B）。三种角色模式：Service Definition / Service Provider / Consumer，以 shell 为例——Definition 几乎不变，Provider 可独立替换（改一行配置换沙箱执行），Definition 和 Consumer 不变；每一项能力都是一个 seam（接缝），接缝两侧独立演进。开发入口：patch 覆盖层、profile 的 cordis.patch.yml、bundle 包。社区生态：awesome-dsh-plugin 截至 2026-08 收录 174 个插件，代表例含改界面（dsh-visualize/TUI/deep-whale）、改记忆（dsh-memento/mneme）、改能力（dsh-computer-use/data-agent/docker）、改协作（dsh-agent-teams/crosstalk）、自进化（dsh-evolve/continual-evolve）、插件基建（dsh-find-plugin/plugin-manager）。"惊艳"方向：会写插件的插件（ctx.loader.create() 动态挂载+ cordis_define/run 现场生成自进化闭环）、会话级隔离"分身"（ctx.isolate+agentPresets 一个进程多虚拟 Harness）、不停机换引擎（patch 层换 llm/shell 提供方，按 service broker 灰度滚动）、策略网关（waterfall 把审批→权限→限流→审计串成决策链）、专家 Agent 池、分层记忆系统、浏览器双半插件、工作流即插件。

## 五、论文：从"好用的框架"到"被证明的范式"

配套论文《A Programming Paradigm for Spatiotemporal Composability》（北大+DeepSeek，88 页）把 Cordis 核心机制形式化，证明其构成新编程范式——动态组合（运行时装卸组件）缺乏形式基础，Cordis 用两个运行时机制补上并证明性质。

**要解决的问题**：动态组合拆成两个正交维度——时间维度（temporal composability：组件被移除时对共享环境的修改必须完整安全逆转；静态对应 RAII 词法作用域，动态场景副作用可能长生命周期无词法边界）与空间维度（spatial composability：组件必须声明/发现/解析相互依赖，动态场景依赖会消失/更换身份）。传统粗粒度替代（进程粒度时间可组合 + 编排器空间可组合）代价沉重：每次重启丢全部进程内状态、跨地址空间依赖只能走网络。论文用 VS Code 做反例：前 100 热门扩展 87 个含可执行代码但无法运行时卸载单个扩展，deactivate 钩子只在进程退出时调用且把创建/清理效果分两处；extensionDependencies 只 7 个扩展使用（无类型 any）。

**两个支柱：effect 与 coeffect**（源自编程语言理论：effect 描述"计算对环境做了什么"源自 Moggi monad 理论；coeffect 描述"计算对环境要求什么"源自 Petricek 2013）。传统上都是编译期静态分析工具；Cordis 论文把它们提升为运行时机制，在组件随时到达/离开的动态场景下工作——这是论文区别于既有工作的出发点。

**可逆副作用（时间）**：把 effect 建模为 e: Γ → Γ × (Γ → Γ)（作用于当前上下文，返回新上下文+逆函数/undo），把逆交给运行时，恢复成为结构保证。定义效应上下文 ∂Γ=(γ,φ)：track 执行 effect 写状态并把逆复合进 φ；recover 卸载时把 φ 作用到当前状态，φ(γ)=γ0 为 soundness invariant；逆按相反顺序累积（twisted composition，天然 LIFO）。关键性质：精确恢复（LIFO 撤销时每逆面对其执行时上下文，Theorem 7/16）、独立性（两 effect 独立=变换互可交换且互不干扰产逆；独立族可任意顺序撤销 Corollary 21；不同 key 上操作天然独立 Theorem 40；有序链如中间件插入顺序则不独立需显式顺序语义——解释 ctx.on(event, listener, {prepend}) 和 waterfall 需要显式顺序）、恢复是"观察等价 ≃"而非字面相等（free 不会恢复 malloc 之前堆布局；观察者是 coeffect，每依赖键自带等价关系，Definition 33）——这是让可逆性在真实系统成立的关键让步。

**响应式余效应（空间）**：把 IoC 容器形式化为余效应上下文 Σ（类型化部分函数，键→类型化值，根治"依赖查找是 any"）。两个核心操作 get/set，set(k,v) 类型恰是 effect 函数（注册依赖本身可逆，撤销提供方依赖自动消失）——两层协同：coeffect 操作是 effect，effect 可逆。用规范 d⊆K 声明依赖集合，满足性 σ⊨d；每个上下文变化分类为 activating（之前不满足现在满足）/deactivating/neutral。**反应式不变量**：activating 触发组件执行（带完整 effect 追踪），deactivating 触发恢复；因所有变更经 effect 函数，满足性变化在每个 effect 边界可检测，"每依赖变化都被观察到"是代数层面保证非轮询——这是 inject 的数学形式。隔离（coeffect isolation）：realm 域表，get(k) 先解析 ρ(k) 得 realm，同键不同上下文解析不同值（运行时 ad-hoc 多态，多租户/测试/组件沙箱应用）；拦截（coeffect interception）：get(k,μ) 实际调 σ(k)(μ⊕ι(k))，元数据按各键幺半群合并右偏。

**统一上下文**：Γ∞=μΓ.Γ×(Γ→Γ)×Σ（当前状态×累加器×依赖表），自相似递归类型。每个操作可归因到具体上下文→归因到拥有组件的；Σ 包含一切共享可变状态。层次组合是递归结构推论：加载=插电执行 effect，卸载=拔电恢复，父聚合子 effect 任意嵌套（=插件树）。在 coeffect 上定义观察等价商掉后独立性可达（Theorem 42）——"可交换部分交给 effect（任意顺序）、对顺序敏感部分交给 coeffect（由依赖关系强制顺序）"。**范式定位两端之间的第三极**：显式状态传递（State monad/代数效应，函数式，效果可见但样板爆炸）vs 隐式变更（React useEffect/Spring getBean，命令式，易用但 effect 靠调用顺序、依赖是全局注册表+null检查+类型转换）——Context 范式 = 函数式可追踪性 + 命令式易用性，**"正确卸载、正确接线"从开发者纪律变成定理**。

**动态组合演算与元理论**：组件=(d,p,e)（声明依赖 d、声明提供 p、带见证的 effect e）；fiber 是实例化（携带生命周期状态/累加器/"已承诺视图"committed）；系统注册表是 fiber 树，coeffect 上下文从所有活跃 fiber 提供表联合推导（每键有且仅一个提供方，由声明决定非状态决定）。五条元理论性质：Preservation（保型：每迁移保持系统良构）、Temporal composability（全局：撤掉一 fiber 其贡献归零、周围原样，Corollary 62）、Spatial composability（全局：提供方离开前依赖它的 fiber 先停用，Theorem 63）、Progress（无死锁且必然终止，Theorem 66；前提 precedence ≺ 无环=依赖图不能成环）、Confluence（稳定状态只由最终配置决定与加载卸载中间顺序无关，Theorem 73——Loader 可增量对账任意顺序，配置对账必然收敛）。

**理论→代码对照**：上下文 Γ∞ → ctx；效应上下文/累加器 → ctx.effect + fiber.accumulator；get/set → ctx.get/ctx.set；isolate/intercept → ctx.isolate/ctx.intercept；fiber → fiber(uid/inject/provide/apply/parent/state/committed/inertia)；恢复 → fiber.dispose()。Loader 对应声明式配置：entry=id(url/isolate/intercept/config/disabled)，与 cordis.yml 条目一一对应；配置对账按字段差异选最小操作；group 子列表按 id 键控 diff 递归下探。**HMR 三阶段**：①依赖图不动点分类模块 accept/decline ②按 entry 传递依赖树检测过期条目 ③事务性重载（备份缓存、逐个 dispose 旧 fiber 挂载新，失败恢复缓存重建，永不在半重载状态）——不需开发者标注 accept 边界（对比 Webpack/Vite），因为 fiber 界定了组件全部效果边界。工程延伸：系统边界（可独占修改可恢复的在边界内，被外部程序读写的位置在边界外视作不可追踪；ctx.intercept 可把外部位置 reify 成可逆操作使边界内移，换取恢复性付每次访问开销）、补偿（对真正无法逆转的"发射"如邮件/扣款用应用级补偿，补偿按 LIFO 组合，删除的逆是再创建退款的逆是再扣款）、服务多路复用（独占绑定 vs service broker：常驻 broker 注入提供方消费方，多提供方共存 brooker 分发→负载均衡/滚动更新/跨进程调用；DSH 的 llm 适配器注册表与 pi-ai 多提供方机制的论文原型）。

**与 8 类系统对比**（时间维卸载×空间维依赖）：传统 DI（Spring/NestJS 绑定即永久，getBean 无生命周期管理，依赖运行时查找+类型断言）、React useEffect（effect 靠调用顺序登记目标隐式，deps 静态无运行时解析，捆绑渲染模型）、OSGi（最接近先驱：模块动态装卸+服务注册表，但服务消失 consumer 不自动重连=有动态机制无响应式语义）、VS Code（无法热卸载单扩展、跨扩展交互是 any=架构上没这条路径）、微服务/容器（进程粒度重启丢状态+编排器粒度无法表达共享地址空间依赖=粒度错配）、monadic effect ZIO/Effect-TS（追踪靠 monad 嵌入须把程序写进 effect 类型，服务撤走已执行操作留在原地）、代数效应（Effekt 能力默认 second-class 静态层纪律，目的不同：Effekt 为模块化解释、Cordis 为追踪与逆转）、Webpack/Vite HMR（需标注 accept 边界替换边界人工声明）。Agent 运行时视角：服务被替换卸载后自动清理（DI 不负责）→ effect 自动回滚；依赖提供方热替换自动重建（DI 做不到）→ 依赖方自动卸载重载；配置决定组合改配置即热重载（DI 配置启动时一次性）→ cordis.yml 即插件树；服务运行时消失视为异常（DI）→ 视为常态优雅降级；有序决策链需自搭 middleware（DI）→ waterfall 事件原生支持。

**结论**：论文明确把 **self-evolving agent harnesses（自进化 Agent 运行时）** 列为未来验证方向——AI 在少人监督下持续生成并替换自己组件，需要"快速替换下完整恢复保证"（时间维）+ "频繁拓扑变化下依赖协调保证"（空间维）。DSH 的 cordis_define/cordis_run 正是这一方向实践：Agent 现场生成动态插件、沙箱运行、随时卸载。Cordis 把"安全地动态装卸组件"从纪律变成定理——正是自进化软件唯一靠得住的地基。

## 六、生态

**Koishi**（第一个实战平台）：四年 4000+ 社区插件；@koishijs 官方 scope 155 包（插件 112/适配器 19 覆盖 QQ/Discord/Telegram/Lark）；koishi-plugin-* 前缀约 3951 包；npm 近一年 koishi ~34万、cordis ~51万下载（周均约1万）；GitHub koishijs/koishi ~5800 star、cordiverse/cordis ~2400 star；Koishi 以组织身份出现在中科院开源之夏 2025 项目列表。Koishi 的 Web 控制台是第二个独立 Cordis 应用（浏览器另一棵插件树），验证"跨独立作者协作"（插件与其依赖不同作者，仅通过服务契约 coeffect 协调）。Koishi 目前仍用 Cordis 3.x，论文与 DSH 用 4.x（2 代共享核心组合模型，4.x 重构 effect/coeffect 语义与 Loader）。**@cordisjs 独立通用生态**：101 个包（核心机制 loader/plugin-loader/include/hmr/group/config/schema/timer/logger；服务端 plugin-server/-acl/-proxy/-static/-webui；数据 plugin-database+sqlite/mysql/postgres/mongo/memory；业务 mail/sms/sso/webui/market/manager/insight/cli/components）。Cordis 不是"为 Koishi 定制的内核"，而是真正通用应用框架，Koishi 与 DSH 只是两个实例（一个 IM 领域、一个 Agent 领域）。小且可审计：核心几千行 TypeScript，DSH vendor 进仓库并约 18 处本地修改（生命周期加固/配置加载事务化/表达式延迟求值）；TypeScript-first 声明合并让扩展点全链路类型安全，DSH 从声明自动生成供模型阅读的 API 目录（类型系统变成 Agent 操作手册）。