# Claude Code Subagents 深度指南：上下文卫生实战

## Ch04.163 Claude Code Subagents 深度指南：上下文卫生实战

> 📊 Level ⭐⭐ | 12.3KB | `entities/claude-code-subagents-context-hygiene.md`

# "Claude Code Subagents 深度指南：上下文卫生实战"
# Claude Code Subagents 深度指南：上下文卫生实战
> Source: https://mp.weixin.qq.com/s/qy_zaCZTCs1Ql3BIFmBMgg

## 核心论点
Subagent 的本质不是"多一个 Agent 帮忙"，而是把**必须发生但留在主窗口就是污染的探索过程**，隔离到独立工作区，主窗口只拿回结果。

## 三层价值
1. **隔离**：子代理在自己的上下文窗口里读20个文件、跑30次搜索，主会话完全不看见过程，只接收结论
2. **压缩**：50次工具调用的过程被压成3行结论，噪音被自然丢弃
3. **并行**：几条调查路径互不依赖时可以并行跑

## 长会话为什么会变脏
- 探索阶段产生的低密度内容（搜索结果、目录列表、日志、排除的代码路径）堆积
- compaction 时噪音和关键事实被混在一起压缩
- 真正重要的决策依据在压缩中被磨掉

## 内置 Explore 和 Plan
- **Explore**：只搜索和理解代码库，不做修改，主会话只拿"相关结果"
- **Plan**：在 plan mode 下做上下文调查，输出分步实施方案，中间过程主 Agent 完全看不到
这两个内置子代理背后的设计逻辑：**长任务里最"脏"的部分在探索阶段，不在执行阶段**。

## fresh vs fork
| 场景 | 推荐方式 |
|------|---------|
| 查找代码模式、搜索影响面、阅读一批文件 | fresh Subagent |
| 安全审查、性能审查、测试覆盖率检查 | fresh Subagent + 明确任务描述 |
| 已有很长项目背景，子任务必须继承这些约束 | 按需 fork |
| 想从同一个起点并行比较几个方案 | fork 可以考虑 |
| 子任务之间需要持续共享中间状态 | 不适合普通 Subagent，考虑主循环或共享状态结构 |
| 父窗口已经很乱，只是想并行加速 | 先清理主任务，再考虑拆分 |
**fork 的隐藏好处**：fork 出来的子代理跟父代理共享 prompt cache 前缀，第二个之后的子代理在输入 token 上的成本可以低大概 10 倍。
**fork 的注意事项**：会继承噪音，不适合当默认选项。

## context-timeline 钩子
Daniel San 开发的监控钩子，实时展示主代理上下文窗口状态和子代理运行情况：
```bash
npx claude-code-templates@latest --hook monitoring/context-timeline
```

## 四类高频自定义 Subagent
### 1. 代码审查
- 只检查 diff 中的安全问题、正确性问题
- 返回带文件路径、问题等级、证据和建议

### 2. 影响面分析
- 专门搜索接口/字段/配置的引用、调用链、测试覆盖
- 输出"哪些地方受影响"

### 3. 测试诊断
- 单独看失败日志、定位可能原因、给出最小复现路径

### 4. 文档一致性检查
- 代码改完后检查 README、AGENTS.md、配置说明、示例命令有没有过期

## Subagent 模板示例
```markdown
---
name: backend-impact-analyzer
description: Analyze the impact of backend API or schema changes. Use before implementation or after changing shared contracts. Do not modify files.
tools: Read, Grep, Glob
model: sonnet
---
You analyze impact scope for backend changes.
Return:
1. Affected files and why they matter
2. Compatibility risks
3. Tests that should be added or updated
4. Unknowns that require human or main-agent confirmation
Do not edit files.
Do not propose broad refactors.
```
**关键细节**：

- `Do not modify files` 写进描述和正文，避免分析代理越权执行
- 工具集只给 Read, Grep, Glob，从权限层面堵住"顺手改一改"的可能
- description 是路由契约，越清楚路由越稳

## 最容易踩的四个坑
1. **任务写得太含糊**：「帮我看一下这个模块有没有问题」→ 子代理会发散。应该是：「只检查认证模块最近 diff 中的安全风险，重点看 token 校验、权限绕过和敏感日志，返回 P0/P1/P2 级别问题。」
2. **返回太多过程**：把搜索结果、完整日志、读过的文件都倒回主窗口，隔离价值归零
3. **硬切需要共享状态的任务**：前端、后端、测试、文档每步都互相影响时，强行拆成隔离 Subagents 会花更多成本做合并和纠偏
4. **fork 上瘾**：fork 解决的是"必要背景继承"，不是"上下文管理"。长期依赖 fork 说明任务委派还不够清楚

## context 还是工作集
- **聊天记录**：保存发生过什么
- **工作集**：关心下一轮推理到底需要什么
Subagent 正好挡住了其中一类污染：那些必须做、但做完之后不值得长期留在主窗口里的探索过程。

## Kaxil Naik 的判断
> Harness matters more than the model.
模型能力当然重要，但长任务能不能稳定跑下去，更多看外面那层 harness：规则怎么沉淀，工具怎么暴露，权限怎么限制，失败怎么被发现，探索过程怎么隔离。

## 实用起步建议
先放两三个高频、边界清楚、收益稳定的子代理：
1. 一个只做代码审查
2. 一个只做影响面搜索
3. 一个只做测试失败诊断
跑一段时间观察两件事：

- 主会话是不是少了大量无用搜索和日志
- 子代理返回的结论，主 Agent 能不能直接接着用

## 参考来源
- Daniel San，Keep your Claude Code context clean with Subagents，2026-04-27
- Claude Code Docs，Create custom subagents
- Kaxil Naik，I Haven't Written a Line of Code in 4 Months，2026-03-27
- Metabase，How we built ten custom subagents to tame a 500K-line Clojure codebase，2026-04-16

## 深度分析
### Subagent 的本质是"上下文垃圾填埋场"
从工程角度看，Subagent 解决的不是"并行化"问题，而是**上下文新陈代谢**问题。Claude Code 文章揭示了一个关键洞察：长会话变脏的根本原因是探索阶段的低密度内容（搜索结果、日志、目录列表）和高密度决策事实在 compaction 时被混在一起压缩，导致关键信息被噪音稀释。
Subagent 的价值在于它充当了一个**有损压缩前的预处理层**：把"脏活"隔离在外，主窗口只接收已被子代理提炼过的结论。这比在主会话内部做 compaction 更干净，因为 compaction 本质上是在噪音里找信号，而 Subagent 是在噪音产生之前就把它扔掉了。

### fork 的 token 成本逻辑被低估
大多数资料只提 fork 的"继承背景"优势，但文章指出了一个更实际的数字：fork 共享 prompt cache 前缀，从第二个子代理开始输入 token 成本降低约 10 倍。这意味着在需要并行比较 3-4 个方案时，fork 的总体成本可能反而低于启动 3-4 个 fresh Subagent（后者各自需要完整的 context 加载）。
这是一个反直觉的结论：继承噪音的 fork 在特定场景下反而更划算，因为省的是 token 成本，而噪音在独立分析任务中可以被子代理自己过滤掉。

### 四类自定义 Subagent 的边界逻辑
代码审查、影响面分析、测试诊断、文档一致性检查——这四类的共同特征是**它们都是"只读分析，不做修改"的任务**，且输出格式相对标准化。这不是巧合：Subagent 的最佳实践是让工具权限和任务性质严格匹配。代码审查只需要 Read/Grep/Glob，影响面分析不需要写权限，测试诊断不需要写文件。权限越小，隔离越彻底，主 Agent 越不可能被"顺手改一改"的诱惑干扰。

### context-timeline 是运维层面的必需
Daniel San 的 context-timeline 钩子解决了 Subagent 的可观测性问题。没有监控的情况下，子代理在后台跑了什么、用了多少 context，主 Agent 完全不知道。实时展示主代理上下文窗口状态和子代理运行情况，把 Subagent 从一个"黑盒"变成了"白盒"。 这对于在团队中推广 Subagent 至关重要——没有可观测性，开发者无法信任子代理的输出质量。

## 实践启示
### 立即可落地的起步策略
1. **先从"只读分析"类 Subagent 开始**：代码审查、影响面搜索、测试失败诊断，这三类最安全——子代理只读不写，出问题的概率最低
2. **任务描述必须极具体**：不能用"帮我看看这个模块"，要用"检查 auth 模块最近 diff 中的 token 校验问题，返回 P0/P1/P2 级别"
3. **强制限制工具集**：代码审查 Subagent 只给 Read/Grep/Glob，影响面分析只给 Read/Grep/Glob+Bash(只读)，从权限设计上堵住越权
4. **观察两件事**：主会话是否减少了无用搜索/日志回填；子代理结论主 Agent 能否直接使用

### fork vs fresh 的决策树
```
任务需要继承父窗口背景吗？
├── 否 → fresh Subagent
└── 是 → 父窗口已经"脏"了吗？
    ├── 否 → fork Subagent（共享cache前缀，token成本低10x）
    └── 是 → 先清理主任务，再考虑拆分
        └── 还需要并行比较方案？
            └── 是 → fork（成本优于多个fresh）
```

### Subagent 的边界判定
不适合 Subagent 的场景：

- 任务之间需要持续共享中间状态（强行拆分会导致大量合并/纠偏成本）
- 父窗口已经很乱，想用 Subagent 并行加速（本末倒置，应先清理主任务）
- 任务边界模糊，无法给出具体任务描述（子代理会发散）

### 企业落地的关键非技术因素
Kaxil Naik 的判断"Harness matters more than the model"是本文最被低估的一句话。团队推广 Subagent 的最大阻力不是技术，而是**开发者不信任子代理的输出质量**。解决路径：
1. 先用 Subagent 处理低风险只读任务建立信任
2. 用 context-timeline 展示子代理在做什么
3. 逐步扩大子代理职责范围
---
## 相关实体
- [Subagents 详解Claude Code 如何避免上下文污染 V2](ch03/073-claude-code.md)
- [Subagents 详解Claude Code 如何避免上下文污染](ch03/073-claude-code.md)
- [打造可靠的 Ai 编程环境Claude Code Hooks 完整开发者指南 V2](ch04/150-ai.md)
- [Claude Code Source Architecture](ch03/073-claude-code.md)
- [Claude Code Openclaw Memory Vector Db Doubt](ch03/073-claude-code.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-code-subagents-context-hygiene.md)

---

