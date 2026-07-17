# Claude Code 七大模块详解

## Ch01.512 Claude Code 七大模块详解

> 📊 Level ⭐⭐ | 8.8KB | `entities/claude-code-architecture-modules.md`

### 1. 入口与启动链路
**问题**：多启动模式各自长出运行语义，系统裂成多套。
**解法**：三段式启动
1. **入口分流** — 先判断启动类型，动态加载
2. **进程初始化** — 配置/telemetry/远程设置，不碰会话语义
3. **会话准备** — 定型工具面/权限模式/恢复方式
**关键设计**：进程状态与交互状态**分开下沉**。

### 2. REPL / UI Orchestration
REPL 是 runtime 的**操作台**，用户输入进入后，先判断快捷指令、组装执行上下文、合并能力面、准备约束，最后才进入 `query()`。
REPL 消费的是**带语义的事件流**，归并成用户能理解的会话视图。

### 3. Query Loop
- **Compact 机制**：上下文超阈值时自动压缩历史
- **恢复机制**：错误/取消/超时都有兜底路径
- **状态机设计**：Pending/Running/Waiting/Done 各有明确语义
> 把"上下文治理"和"失败恢复"从 prompt 层挪到**运行时层**。

### 4. Tool Runtime
工具是带完整运行时语义的对象。执行链四段式：**schema 校验 → 调用前准备 → permission 决策 → 执行 → 归一化结构化反馈**
两个关键判断：1) 并发策略由工具语义决定；2) 流式工具执行必须被认真建模。

### 5. Permission System
完整决策链：`规则层 → 运行时自动判定 → 交互层 → 沙箱执行隔离`
关键是把**逻辑授权**和**执行隔离**分开。Auto mode 是**收紧危险能力后尽量自动**。

### 6. Task / 多 Agent
子 Agent 是**带邮箱的任务对象**。前台/后台差别变成调度与可见性差异，而不是两套世界观。

### 7. Extensibility
**外部可以动态多变，内部必须尽量收敛**。MCP tool → 本地 Tool，MCP prompt → Command。Skill 是轻量能力声明对象。
→

## 深度分析
Claude Code 的七大模块设计，本质上是在回答一个问题：**当 Agent 系统从 Demo 走向生产，复杂度从哪里来，如何控制？**
**入口与启动链路**的三段式设计，解决了"多启动模式长出多套语义"的问题。关键洞察是把**进程状态**（配置、telemetry、远程连接）和**交互状态**（工具面、权限模式、会话恢复）分开下沉——两者生命周期不同，混在一起就会互相污染。
**REPL / UI Orchestration** 被定位为 runtime 的操作台，而不是消息展示壳。这意味着用户输入进入后，REPL 承担了上下文组装、能力面合并、约束准备的职责，query() 收到的是已经过语义清洗的执行上下文。这与简单的 ChatGPT-style REPL 有本质区别。
**Query Loop** 的状态机设计（Pending/Running/Waiting/Done）把"上下文治理"和"失败恢复"从 prompt 层挪到了运行时层。Compact 机制解决上下文溢出，恢复机制解决错误/取消/超时——这些都是 prompt 层无法优雅处理的问题。
**Tool Runtime** 四段式执行链（schema 校验 → 调用前准备 → permission 决策 → 执行 → 归一化结构化反馈）把工具从"野生函数"变成受控对象。关键判断：并发策略由工具语义决定，流式工具必须被认真建模。
**Permission System** 的决策链（规则层 → 运行时自动判定 → 交互层 → 沙箱执行隔离）把逻辑授权和执行隔离分开。Auto mode 是"收紧危险能力后尽量自动"——这是一种有节制的自动化哲学。
**Task / 多 Agent** 的核心洞察：子 Agent 是带邮箱的任务对象，前台/后台的差别是调度与可见性差异，而不是两套世界观。多 Agent 从 demo 走向系统，靠的是任务抽象能否把分出去的执行重新收回来。
**Extensibility** 体现了"外部可以动态多变，内部必须尽量收敛"的原则：MCP tool → 本地 Tool，MCP prompt → Command，Skill 是轻量能力声明对象。

## 实践启示
1. **进程状态与交互状态必须分离**。当启动模式变多时，先问自己：新模式的运行语义是新建还是复用现有状态？答案决定了架构选择。
2. **上下文治理和失败恢复属于运行时层**，不应该用 prompt engineering 来弥补。如果发现 prompt 里写了大量"如果出错请重试"的指令，说明运行时层缺失。
3. **工具是带语义的对象**。不是函数签名，而是包含权限、并发策略、执行约束的完整运行时单元。设计工具接口时，同步/异步、流式/非流式、幂等性都是第一公民属性。
4. **权限系统的本质是决策链，不是弹框**。每一个"是否允许"的判断，背后都应该有明确的规则层 → 自动判定 → 交互层的链条。弹框只是交互层的末端，隔离执行才是最后防线。
5. **多 Agent 的核心挑战是任务回收，不是 prompt 分工**。子 Agent 的结果如何被主 Agent 理解、接纳、继续使用，决定了整个系统的上界。
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-architecture-analysis.md)

## 相关实体
- [Claude Code 设计原则与对照分析](../ch03/076-claude-code.html)
- [Claude Code 源码拆解：从启动到多 Agent 扩展层](../ch03/076-claude-code.html)

- [Claude Code vs OpenClaw Agent 记忆系统对比](../ch03/076-claude-code.html)
- [开源 AI 知识管理搭档 Obsidian + Claude Code 完整集成指南](../ch03/075-obsidian-claude-code.html)
- [CLAUDE.md 12 条规则：Karpathy 扩展模板](../ch09/083-claude-code-1.html)
- [Claude Code 架构深度分析](https://github.com/QianJinGuo/wiki/blob/main/concepts/claude-code-deep-architecture-analysis.md)
- [Hermes-Agent Kanban 实测 — 商业 CLI 作为上层 Orchestrator](../ch03/092-hermes-agent.html)

---

