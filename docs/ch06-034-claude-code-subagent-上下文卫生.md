## Ch06.034 Claude Code Subagent 上下文卫生

> 📊 Level ⭐⭐⭐ | 10.1KB | `entities/claude-code-subagent-context-hygiene.md`

## 核心定位
Subagent 不是"多一个 Agent 帮忙"，而是**Agent Harness 的上下文卫生工具**——把必须发生但留在主窗口就是污染的探索过程，隔离到独立工作区，主窗口只拿回结果。

## 关键原则
### 上下文边界优先
**Design around context boundaries, not roles.**   ^["raw/articles/claude-code-subagents-context-hygiene"]

- 上下文边界的判断优先于角色划分
- 能按上下文边界切开的，才适合交给 Subagent；切不开时，多一个 Agent 不见得是好事

### fresh Subagent（默认）
子代理只拿到主 Agent 的任务描述，在**空白上下文**里完成工作。适合：   ^["raw/articles/claude-code-subagents-context-hygiene"]

- 查找代码模式
- 搜索影响面
- 阅读一批文件
- 安全审查、性能审查、测试覆盖率检查（配合明确任务描述）

### fork Subagent（按需）
继承父会话的完整上下文。适合：   ^["raw/articles/claude-code-subagents-context-hygiene"]

- 父窗口已经投入了大量上下文（项目理解、历史讨论、约束条件），子任务必须继承这些背景
- 需要从同一个起点并行比较几个分支方案
**注意事项**：fork 会继承噪音，不适合当默认选项；fork 出来的子代理与父代理共享 prompt cache 前缀，第二个之后 token 成本降低约 10 倍。

### 三层价值
1. **隔离**：子代理在独立窗口里完成所有工具调用，主会话完全看不到中间过程   ^["raw/articles/claude-code-subagents-context-hygiene"]
2. **压缩**：低密度探索过程（50次工具调用 → 3行结论）被自然压成高密度信号   ^["raw/articles/claude-code-subagents-context-hygiene"]
3. **并行**：互不依赖的调查路径可以同时跑   ^["raw/articles/claude-code-subagents-context-hygiene"]

### 最脏的是什么
**长任务里最"脏"的在探索阶段，不在执行阶段。**   ^["raw/articles/claude-code-subagents-context-hygiene"]

- 探索阶段产生大量临时路径：看过但无关的文件、试过但排除的方向、搜出来又没用的匹配项
- 这些对当下探索有价值，对后续主任务价值很低
- 执行阶段留下的是明确产出：改了哪些文件、跑了哪些测试、还剩什么问题

### 内置 Explore 和 Plan
- **Explore**：只搜索理解代码库，不做修改，主会话只拿"相关结果"
- **Plan**：在 plan mode 下做上下文调查，输出分步实施方案，中间过程主 Agent 完全不可见
这两个内置子代理已经帮你把最脏的探索阶段挡在主窗口之外。   ^["raw/articles/claude-code-subagents-context-hygiene"]

### description 是路由契约
Claude Code 根据 description 决定什么时候调用哪个子代理。写法：   ^["raw/articles/claude-code-subagents-context-hygiene"]

- 这个子代理负责什么问题
- 什么时候应该调用它
- 它**不**负责什么
**反面案例**：`description: "code reviewer"` → 太宽，什么都能接、什么都接不稳
**正面案例**：   ^["raw/articles/claude-code-subagents-context-hygiene"]
```  
description: "Review modified backend code for security, correctness, and maintainability. Use after implementation, not for planning or feature design."  
```  

## 四个高频自定义 Subagent 类型
| 类型 | 职责 | 工具范围 | 关键约束 |  
|------|------|---------|---------|  
| 代码审查 | 检查 diff 中的安全/正确性/可维护性问题 | Read, Grep, Bash | Do not modify files；返回 P0/P1/P2 + 文件路径 |  
| 影响面分析 | 接口/字段/配置变更的引用、调用链、测试覆盖 | Read, Grep, Glob | 只输出受影响文件列表，不做修改 |  
| 测试诊断 | 失败日志分析、定位可能原因、最小复现路径 | Read, Bash | 只给结论，不写代码 |  
| 文档一致性 | README、AGENTS.md、配置说明、示例命令是否过期 | Read, Grep, Glob | Do not edit files |  

## 最容易踩的四个坑
1. **任务写得太含糊** → 子代理发散变成另一个会跑偏的聊天窗口   ^["raw/articles/claude-code-subagents-context-hygiene"]
2. **返回太多过程** → 隔离价值归零，主 Agent 被无用信息淹没   ^["raw/articles/claude-code-subagents-context-hygiene"]
3. **硬切需要共享状态的任务** → 拆分后花更多成本合并和纠偏   ^["raw/articles/claude-code-subagents-context-hygiene"]
4. **fork 上瘾** → 长期依赖 fork 说明任务委派还不够清楚   ^["raw/articles/claude-code-subagents-context-hygiene"]

## 与其他 Harness 组件的关系
Subagent 是 Agent Harness 在**上下文管理层**的具体机制之一：   ^["raw/articles/claude-code-subagents-context-hygiene"]

- OpenClaw 的上下文管理理念：工作集 vs 聊天记录
- [Harness Engineering](ch05-049-harness-engineering-系统梳理.html) 的系统性框架：模型外的 harness 决定下限
- [Anthropic PM 的 Agentic 工作流](ch04-383-anthropic-pm-的-agentic-工作流.html)：任务委派和上下文边界的判断
> 原文链接：https://mp.weixin.qq.com/s/qy_zaCZTCs1Ql3BIFmBMgg

## 相关实体
- [Claude Code Session 管理与 1M 上下文最佳实践](ch03-002-obsidian-claude-code.html)
- [深度解析 Claude Code 在 Prompt / Context / Harness 的设计与实践](ch03-002-obsidian-claude-code.html)
- [Claude Code vs OpenClaw Agent 记忆系统对比](ch01-309-复杂度棘轮-ai编程的质量只升不降机制.html)
- [开源 AI 知识管理搭档 Obsidian + Claude Code 完整集成指南](ch03-076-开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.html)
- [CLAUDE.md 12 条规则：Karpathy 扩展模板](ch09-039-claude-md-12-条规则-karpathy-扩展模板.html)
- [两万字详解Claude Code源码核心机制](ch09-056-claude-code-routines-agent.html)

- MOC
## 深度分析
Subagent的本质被广泛误解——它不是"多一个Agent帮忙"，而是上下文卫生工具。这个认知转变是理解Subagent设计逻辑的关键。
**探索阶段vs执行阶段的不对称性**：长任务中最"脏"的部分在探索阶段（搜索、文件阅读、路径尝试），而非执行阶段（代码修改、测试运行）。探索阶段产生的50次工具调用可能只产生3行有用结论，如果不隔离，这些噪音将永久污染主会话。
**fresh vs fork的场景分离逻辑**：fresh是默认选择因为它提供最干净的上下文；fork是按需使用因为它解决的是"必要背景继承"而非"上下文管理"。fork的10倍token成本降低是附加好处但不应成为选择fork的理由。
**description作为路由契约的工程意义**：Subagent的description不是"角色描述"而是"接口定义"。清晰的description意味着精确的路由——Claude知道什么时候该调用、调用后期待什么输出。模糊的description导致Subagent变成另一个会跑偏的聊天窗口。
**四类高频自定义Subagent的设计模式**：代码审查（只读+分级输出）、影响面分析（只搜索不修改）、测试诊断（只给结论不写代码）、文档一致性（只检查不编辑）——它们共同遵守的原则是"限制工具集=限制越权可能"。
**Kaxil Naik的判断"Harness matters more than the model"在Subagent语境下的含义**：Subagent是Harness在上下文管理层最重要的具体实现——模型能力决定上限，Harness决定能否稳定发挥这个上限。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/qy_zaCZTCs1Ql3BIFmBMgg.md) ^["raw/articles/claude-code-subagents-context-hygiene"]

## 实践启示
1. **建立"上下文边界"思维而非"角色分工"思维**：判断任务是否适合Subagent的标准不是"谁来做"，而是"这个任务的探索过程留在主窗口会不会污染主会话"   ^["raw/articles/claude-code-subagents-context-hygiene"]
2. **从三个高频场景开始**：代码审查、影响面分析、测试诊断——这三个场景边界清晰、收益稳定、不需要共享上下文，适合作为Subagent入门的起点   ^["raw/articles/claude-code-subagents-context-hygiene"]
3. **description写作遵循"接口契约"原则**：明确子代理负责什么、不负责什么、使用条件——越清楚的接口定义，路由越稳定   ^["raw/articles/claude-code-subagents-context-hygiene"]
4. **工具集限制是安全约束**：只给Read/Grep/Glob而非Write/Bash，从权限层面堵住越权执行的可能   ^["raw/articles/claude-code-subagents-context-hygiene"]
5. **观察两个指标验证Subagent效果**：主会话是否减少了大量无用搜索和日志返回；子代理的结论主Agent能否直接使用无需回炉   ^["raw/articles/claude-code-subagents-context-hygiene"]
6. **fork上瘾是任务委派不清的信号**：长期依赖fork说明任务设计本身需要重新审视，而非通过更多fork解决   ^["raw/articles/claude-code-subagents-context-hygiene"]

---
