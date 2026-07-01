# Claude Code 多智能体协作体系设计：从单Agent到多Agent工作流

## Ch01.954 Claude Code 多智能体协作体系设计：从单Agent到多Agent工作流

> 📊 Level ⭐⭐⭐ | 17.4KB | `entities/claude-code-multi-agent-collaboration-多智能体协作体系设计.md`

## 概述

Claude Code 的源码揭示了一个核心趋势：**单Agent架构有其能力边界，多Agent协作是突破这一边界的关键路径**。本文综合 Claude Code 的设计模式、行业多Agent实践案例，系统梳理多智能体协作的核心架构、分工模式与实现机制。

---

## 为什么需要多Agent协作？

单Agent面临的核心困境：

1. **上下文污染**：长会话中，调研内容、规划讨论、代码修改、日志输出全混在一起，等真正开始改代码时，很多无关信息已经在干扰判断了。

2. **能力错配**：研究任务需要信息整合和引用能力，执行任务需要直接操作和工具调用能力，两者对模型能力的要求不同，混在一起会互相拖累。

3. **单点失败**：一个Agent承担所有职责时，任何环节的瓶颈都会拖垮整体效率。

4. **资源无法复用**：不同任务对模型能力要求不同，但单Agent只能用同一个模型处理所有任务。

---

## 多Agent协作的核心架构模式

### 1. 父子层级架构（Parent-Child Hierarchy）

最常见的多Agent架构，由一个**Orchestrator（编排器）**负责协调多个**Worker Agent**工作。

```
Parent Orchestrator
├── Worker Agent 1 (调研)
├── Worker Agent 2 (规划)
└── Worker Agent 3 (执行)
```

**Claude Code 的实现**：

- 主Agent负责整体决策和上下文管理
- 子Agent通过**上下文隔离子智能体模式**（Context-Isolated Subagents Pattern）运行，每个子Agent有独立上下文和权限
- 工具执行权限按需分配：做调研的只读不写，做规划的只设计不执行

**关键设计**：

- 父Agent决定每步传什么信息给子Agent
- 信息传少了会丢细节，传多了又回到上下文污染问题

### 2. 水平分工架构（Horizontal Division）

按专业能力横向分工，每个Agent是独立的专业单元：

```
┌─────────────┬─────────────┬─────────────┐
│  代码Agent   │  文档Agent   │  测试Agent   │
│ (Code)      │  (Docs)     │  (Test)     │
└─────────────┴─────────────┴─────────────┘
        │              │            │
        └──────────────┴────────────┘
                      │
              共享上下文/结果汇总
```

**适用场景**：可以完全拆分的专业任务，如并行处理多个独立模块。

### 3. 流水线架构（Pipeline Architecture）

任务像工厂流水线一样经过多个处理阶段：

```
输入 → Stage 1 (预处理) → Stage 2 (分析) → Stage 3 (生成) → 输出
```

**Claude Code 的 Explore-Plan-Act 循环**：
1. **探索（Explore）**：只读代码、查信息、摸清结构
2. **规划（Plan）**：和用户对齐思路
3. **行动（Act）**：最后再动手改代码

---

## 多Agent协作的核心设计模式

### 模式一：上下文隔离子Agent（Context-Isolated Subagents）

**问题**：会话一长，所有内容堆在同一个上下文里，干扰判断。

**解决方案**：

- 做调研的Agent只负责看和分析，不能改代码
- 做规划的Agent只负责设计方案
- 真正执行的才有完整工具权限
- 每个子Agent只接触自己需要的信息

**实现要点**：
```javascript
// 每个子Agent有独立上下文
const researchContext = {
  tools: ['read', 'search', 'grep'],  // 只读工具
  systemPrompt: '你是一个研究助手，负责分析代码结构...'
}

const executionContext = {
  tools: ['read', 'write', 'bash', 'edit'],  // 完整工具
  systemPrompt: '你是一个执行助手，负责修改代码...'
}
```

### 模式二：分支-合并并行（Fork-Join Parallelism）

**问题**：跨很多文件的改动，如果Agent一次只能处理一件事，最后会变成一条一条顺序执行。

**解决方案**：

- 把任务拆成多个分支并行处理
- 每个子Agent在独立的工作副本里工作（如用 `git worktree`）
- 互不干扰，等都完成后再合并回来

**Claude Code 的实现**：

- 只读操作打包并发执行（默认最多10个）
- 写操作串行执行以避免冲突

### 模式三：研究与执行分离（Research-Execution Separation）

**核心洞察**：研究任务和执行任务对模型能力要求不同，应该用不同的Agent处理。

**分工设计**：

| 维度 | 研究Agent | 执行Agent |
|------|----------|-----------|
| 职责 | 信息收集、学习、形成报告 | 实际操作、工具配置、任务完成 |
| 能力要求 | 信息整合、引用能力 | 工具调用、代码执行 |
| 模型选择 | 长上下文、擅长推理 | 强推理、工具稳定 |
| 实时性要求 | 低（可异步） | 高（需同步） |

### 模式四：确定性生命周期钩子（Deterministic Lifecycle Hooks）

**问题**：有些步骤是每次都必须执行的，但不能指望模型每次都记得。

**解决方案**：

- 改完代码自动运行格式化
- 执行前自动做校验
- 切换目录时自动重新加载配置
- 后台定期做记忆整理（Dream Consolidation）

---

## 多Agent通信协议

### 消息传递模式

```
Agent A                    Agent B
   │                          │
   │──── 新任务 ────────────→  │
   │                          │
   │←─── 状态更新 ────────────  │
   │                          │
   │──── 工具调用请求 ───────→  │
   │←─── 执行结果 ────────────  │
   │                          │
```

### 共享状态模式

多个Agent共享同一个状态存储：

```javascript
// 共享状态
const sharedState = {
  taskQueue: [],        // 任务队列
  results: {},           // 执行结果
  context: {},           // 共享上下文
  locks: {}             // 资源锁
}
```

### 事件驱动模式

```
Event Bus
    │
    ├── Agent A: 任务完成事件
    ├── Agent B: 资源就绪事件
    └── Agent C: 结果汇总事件
```

---

## 权限与安全模型

### 分层权限设计

Claude Code 的四层递进权限模型：

```
拒绝规则 → 允许规则 → Bash分类器 → 交互提示
```

- 上一层做出决定就结束，不会继续往下走
- 日常操作（读文件、搜代码、跑测试）无感通过
- 危险操作才需要人工确认或直接拦截

### 子Agent权限隔离

```javascript
// 子Agent权限配置
const subAgentPermissions = {
  researchAgent: {
    canRead: true,
    canWrite: false,
    canExecute: false,
    allowedTools: ['grep', 'find', 'read', 'glob']
  },
  executionAgent: {
    canRead: true,
    canWrite: true,
    canExecute: true,
    allowedTools: ['*']  // 全量工具
  }
}
```

---

## 上下文管理策略

### 分层记忆模式（Tiered Memory）

Claude Code 的三层记忆架构：

```
┌─────────────────────────────────────┐
│  Layer 1: 精简索引（始终在上下文）   │  ← 几百行以内
├─────────────────────────────────────┤
│  Layer 2: 相关内容（按需加载）       │
├─────────────────────────────────────┤
│  Layer 3: 完整历史（留在磁盘）       │  ← 需要时再查
└─────────────────────────────────────┘
```

### 上下文压缩策略

对话一长，会触发**渐进式上下文压缩模式**：

- 新的对话尽量保留细节
- 稍旧的内容做轻量总结
- 再往前的逐步压缩，甚至折叠成很短摘要

### 子Agent独立上下文

每个子Agent维护自己的上下文空间：

```javascript
// 子Agent上下文隔离
const agentContexts = {
  researchAgent: {
    workingSet: ['src/api/*.ts', 'docs/*.md'],
    memory: { ... },
    history: []
  },
  codingAgent: {
    workingSet: ['src/**/*.ts'],
    memory: { ... },
    history: []
  }
}
```

---

## 冲突解决与一致性

### 多Agent写入冲突

分支-合并并行的主要挑战：

- 不同分支改到同一部分代码时，冲突可能比顺序处理更难解决
- 需要有机制检测冲突并协调解决

### 版本控制集成

```bash

# 分支工作流
git worktree add worktree-1 feature-branch-1
git worktree add worktree-2 feature-branch-2

# ... 并行处理 ...
git merge worktree-1 feature-branch-1
git merge worktree-2 feature-branch-2
```

### 决策一致性

通过共享记忆和检查点机制：

```javascript
// 决策日志
const decisionLog = [
  { agent: 'planner', decision: '重构API层', reason: '降低耦合', timestamp: ... },
  { agent: 'executor', decision: '先改auth模块', reason: '依赖其他模块', timestamp: ... }
]
```

---

## 实践案例：Claude Code 的多Agent实现

### 场景：复杂代码重构

```
用户: 重构整个用户认证模块

Orchestrator (Parent Agent)
│
├── Research Agent
│   ├── 分析现有认证代码结构
│   ├── 识别依赖关系
│   └── 输出: 代码地图 + 风险评估
│
├── Plan Agent  
│   ├── 设计重构方案
│   ├── 规划执行顺序
│   └── 输出: 重构蓝图
│
└── Execution Agents (并行)
    ├── Auth Agent: 处理 auth 模块
    ├── Token Agent: 处理 token 相关
    └── Session Agent: 处理 session 管理
    
合并结果 → 测试 → 提交
```

### 关键实现细节

1. **工具批次并发**：

   - 只读操作默认最多10个并发
   - 写操作串行执行

2. **上下文修改函数**：

   - 工具可以返回「上下文修改函数」
   - 后续执行受影响

3. **权限递进开放**：

   - 先探索只读，再规划确认，最后执行写操作

---

## 工具与资源协调

### 渐进式工具扩展

如果一开始就把所有工具都开放给Agent，反而会变得更难用：

- 先给一小部分常用工具
- 其他工具按需再打开
- 用到再加载，减少选择成本

### 资源锁机制

```javascript
// 资源协调
const resourceLocks = {
  'src/auth/login.ts': 'executionAgent',
  'src/auth/logout.ts': 'executionAgent',
  'docs/api.md': null  // 可用
}
```

---

## 监控与可观测性

### Agent执行追踪

```javascript
const agentTrace = {
  orchestrator: {
    start: '2026-05-21T10:00:00Z',
    subAgents: ['research', 'plan', 'execute'],
    status: 'running'
  },
  research: {
    status: 'completed',
    duration: '30s',
    output: '代码地图已生成'
  },
  plan: {
    status: 'completed', 
    duration: '15s',
    output: '重构方案已确认'
  }
}
```

### 性能指标

| 指标 | 单Agent | 多Agent | 提升 |
|------|---------|---------|------|
| 平均任务时间 | 10min | 4min | 60%↓ |
| 上下文长度 | 80K tokens | 30K/Agent | 62.5%↓ |
| 错误率 | 15% | 8% | 46.7%↓ |

---

## 常见问题与解决

### Q1: 子Agent之间如何传递信息？

**方案**：通过结构化消息或共享上下文

- 父Agent协调信息的传递
- 关键决策点需要父Agent汇总

### Q2: 如何避免上下文污染？

**方案**：严格隔离子Agent上下文

- 每个子Agent只加载相关文件
- 使用只读工具限制写入风险

### Q3: 合并冲突怎么处理？

**方案**：版本控制 + 人工审核

- git worktree 提供隔离环境
- 最终合并需要人工确认

### Q4: 怎么决定用单Agent还是多Agent？

**判断标准**：

- 任务是否可以并行拆分？
- 不同阶段对模型能力要求是否不同？
- 是否有明显的上下文污染问题？

---

## 深度分析

多智能体协作体系设计的核心理念在于**专业化分工与上下文隔离的平衡**。Claude Code的设计揭示了一个关键洞察：单Agent架构并非能力不足，而是任务性质与模型能力之间的错配问题。研究任务需要的是信息整合与引用能力，执行任务需要的是工具调用与精确操作能力，将这两种异质任务强行塞入同一Agent必然导致效率损耗和上下文污染。

父子层级架构与水平分工架构代表了两种不同的分解思路。层级架构强调**中心化决策**——Orchestrator掌握全局视野，负责信息分发与任务协调，适合复杂、需要全局规划的场景。水平分工则强调**专业化独立**，每个Agent成为某个领域的专家，适合可以完全解耦的并行任务。Claude Code实际采用的是混合策略：顶层用父子层级组织工作流程，底层执行层用水平分工并行处理多个独立模块。

上下文管理是多Agent系统中最具挑战性的工程问题。Claude Code提出的三层记忆架构（精简索引、相关内容、完整历史）本质上是在**上下文容量与信息完备性之间寻找动态平衡点**。上下文压缩策略则进一步引入了时间维度——越新的信息越详细，越旧的信息越精简，这与人脑的记忆机制高度一致。子Agent独立上下文的实现则从技术层面保证了隔离性，避免不同任务的上下文相互污染。

权限模型的设计体现了**最小权限原则与渐进式开放**的结合。四层递进权限架构（拒绝→允许→Bash分类→交互提示）确保了安全检查的纵深防御特性，而子Agent权限隔离则进一步将权限控制细化到任务级别。研究Agent只能读，执行Agent可以写，这种设计不仅提升了安全性，更从架构层面防止了误操作——让模型没有机会犯错比教模型不要犯错更可靠。

分支-合并并行模式是提升多Agent系统吞吐量的关键，但也带来了冲突解决的复杂性。git worktree提供的工作副本隔离机制是一个优雅的解决方案，但合并冲突的检测与协调仍需要人工介入。这反映出当前多Agent系统在**复杂决策**方面的局限性——对于真正复杂的冲突，还是需要人类判断。监控与可观测性设计（agentTrace、性能指标）则为系统提供了必要的透明度，使得多Agent协作的状态可追踪、问题可诊断。

---

## 实践启示

**设计多Agent系统时，首先根据任务性质选择合适的架构模式**。如果任务存在明显的先后依赖或需要全局协调，选择父子层级架构；如果任务可以完全拆解为独立子任务，选择水平分工架构；对于复杂重构等场景，可以采用混合架构——顶层用层级组织研究→规划→执行三阶段，底层执行层用水平分工并行处理多个文件或模块。架构选择应基于任务特性而非技术偏好。

**上下文隔离是防止多Agent系统退化为单Agent系统的关键**。每个子Agent应该有明确的职责边界和受限的工具集。研究Agent只给只读工具，执行Agent才给写工具。父Agent在向子Agent传递信息时要严格筛选——只传递任务相关的最小信息集，避免上下文污染的传递。这一原则同样适用于Agent之间的通信：信息传递应该是结构化的、受控的，而非无差别的广播。

**工具权限的渐进式开放比一次性全量开放更有效**。一开始就暴露所有工具会增加Agent的选择成本和误操作风险。正确的做法是：先给一小部分核心工具（如read、grep），其他工具按需打开。研究阶段只读不写，规划阶段讨论方案不执行，执行阶段才开放完整工具。这种递进式权限设计既符合Claude Code的Explore-Plan-Act循环，也符合最小权限安全原则。

**并行化应该区分只读任务和写操作**。只读任务（如代码搜索、文件读取、信息检索）天然具有幂等性，可以安全地批量并发执行——Claude Code默认最多10个并发。写操作必须串行执行以避免冲突。如果必须并行处理多个写任务，应该使用git worktree或类似机制为每个写操作创建隔离的工作副本，最终通过版本控制系统合并。合并过程需要人工审核，确保没有逻辑冲突。

**建立完善的监控与决策追踪机制**。每个Agent的执行状态、完成时间、输出结果都应该被记录，形成完整的执行链路日志。关键决策点（任务分配、方案确定、合并冲突处理）应该记录决策日志，包含决策内容、决策者、决策原因和时间戳。这些日志不仅有助于问题诊断和性能优化，也为人工复盘和系统改进提供了数据基础。

---

## 延伸阅读

- `12个可复用Agentic Harness设计模式`
- `深入理解Claude Code源码中的Agent Harness构建之道`
- `我给Hermes配了4个Agent真正有用的是这些事`
- `企业级多 Agent 规模化落地怎么做群虾智能 Ai 沙龙 Ppt 限时领取`
- `Yidian Tianxia Context Engineering Agentic Ai`

---

## 相关实体

- [Claude Code Prompt Context Harness](ch03/074-claude-code.md) - Claude Code Prompt/Context/Harness设计
- [Hermes Agent Memory System](ch03/044-agent.md) - Hermes记忆系统
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/multi-agent-coordination.md)

---

