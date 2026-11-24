# Harness 工程 14 步路线图：从单 Agent 到自改进系统

> 📊 Level ⭐⭐⭐ | 11.2KB

## Harness 工程 14 步路线图

## 核心命题

循环工程（loop engineering）的上限取决于底下的 harness。Harness 是单个 Agent 运行的环境——模型、工具、权限、上下文四要素的总和。14 步路线图分三个层级渐进构建：先建地基，再配置，最后让它复利增长。

## 三层楼模型

| 层级 | 定义 | 特征 |
|------|------|------|
| **Harness** | 单 Agent 运行环境 | 静态配置：模型、工具、权限、上下文 |
| **循环** | harness + 定时器 + 辅助进程 | 按节奏自动 prompt Agent |
| **自改进系统** | 循环 + 复利记忆 | 每次运行让下次更精准 |

混淆这三层是 Agent 配置混乱的根源。常驻事实放上下文，强制规则放钩子，流程放技能，隔离放子 Agent。

## 第一层：什么是 Harness（步骤 01-04）

**Harness 全在一个文件夹 `.claude/` 里**：

```
.claude/
├─ CLAUDE.md          # 常驻事实（≤500 token）
├─ settings.json      # 权限、模型、钩子
├─ .mcp.json          # 外部工具连接
├─ rules/             # 按路径生效的行为规则
├─ agents/            # 子 Agent 定义
├─ skills/            # 可复用工作流
└─ agent-memory/      # 跨运行状态
```

区分干净 harness 和混乱 harness 的原则：保持它小到你能解释每个文件为什么存在。默认 harness（无配置）对一次性任务够用，但对重复任务意味着每次从头推导。

## 第二层：配置 Harness（步骤 05-09）

### CLAUDE.md（步骤 05）
主记忆文件 ≤500 token，只放常驻事实。流程移技能，路径专属规则移 rules/。检验标准：念出来，每行都该是"每次会话都需要的事实"。

### settings.json（步骤 06）
预批准安全操作、拒绝危险操作。判断标准：**撤回难度**。容易撤回→自动批准，难以撤回→始终拒绝。

### 子 Agent（步骤 07）
核心价值：**写作者 vs 检查者分离**。最有价值的子 Agent 是检查主 Agent 工作的那个——全新上下文窗口的独立审查者，能发现写作者看不到的问题。

### 技能（步骤 08）
创建信号：每次新对话粘贴同样指令。技能是可复用单元，也是 harness 随时间改进的关键载体——失败经验加入技能，下次运行继承。

### 钩子（步骤 09）
钩子 = 模型无法绕过的确定性规则。与 CLAUDE.md（建议）不同，钩子通过退出码强制执行。两个必留钩子：
- **PreToolUse 门控**：退出码 2 拦截危险命令
- **PostToolUse 格式化**：自动运行 linter

原则：好的 harness 有一两个精准钩子，而不是二十个。

## 第三层：复利增长（步骤 10-14）

### 循环（步骤 10）
循环不增加智能，复用 harness 中的一切。`/loop 30m /goal` 模式：独立评分器判断完成条件。好 harness 让循环简单，差 harness 让循环更快地产出垃圾。

### 动态工作流（步骤 11）
Agent 即时编写 JavaScript 编排逻辑：`agent()` 生成子进程、`parallel()` 扇出、`pipeline()` 流式处理。工作流是指挥，harness 是乐团——harness 空则无米下锅。

### 记忆（步骤 12）
三模式让记忆复利：
1. **走之前先写**：运行结束更新状态文件
2. **启动时先读**：续写而非重启
3. **提炼为技能**：通用教训从状态文件毕业进入技能

项目记忆文件示例包含已验证事实、经验教训、上次会话摘要。

### 闭合循环（步骤 13）
输出 → 教训 → 技能 → 更好的输出。自改进的真实含义：**不是模型在学习，而是 harness 在积累**。模型从未改变，围绕它的 harness 变得更精准。

### 交付（步骤 14）
技能+子Agent+规则打包为插件，团队一步安装。Harness 从个人配置变为共享基础设施。

## 常见 Harness 错误

1. **用默认配置运行**：无上下文、无规则、无记忆
2. **CLAUDE.md 臃肿**：流程塞进常驻上下文
3. **强制规则写 CLAUDE.md 而非钩子**：模型可以忽略建议，无法忽略退出码 2
4. **一个 Agent 既写又评**：缺审查子 Agent
5. **没有记忆**：每次运行从零开始
6. **给差 harness 套循环**：更快地产出低质量结果
7. **二十个钩子**：一两个精准钩子胜过一堆
8. **不扫描就发布**：泄露密钥和过宽权限

## 构建顺序（核心原则）

> 先在干净 harness 上让一次手动运行可靠 → 加上下文和权限 → 加审查子 Agent → 加记忆 → 最后套循环。好 harness 上的循环会复利增长，差 harness 上的循环只会更快地消耗资源。

## 与现有知识的关联

- [Claude Code 大型代码库配置](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-large-codebase-harness-configuration.md)：聚焦企业级大型代码库中的 harness 配置实践
- [软规则 vs 硬约束](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-governance-soft-rules.md)：深入分析 CLAUDE.md 软规则的治理陷阱

→ [原文存档](https://mp.weixin.qq.com/s/p1OeUgazStV_LL56zUfRfA)

## 深度分析

### 1. "自改进"的外置化：学习从权重转移到环境

这篇路线图最反直觉的论断是"不是模型在学习，而是 harness 在积累"。它把自改进的定义权从模型层挪走：模型权重冻结，改进以教训、技能、状态文件的形式沉淀在环境里。这与 [Agent Self Improvement Loops](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-self-improvement-loops.md) 中常见的权重更新路线形成方法论分叉。外置学习的独特优势是可审计、可版本控制、可团队共享——harness 的每次改进都是 git 里的一次 diff，而权重学习是黑箱。代价同样明显：harness 积累的是碎片化启发式（"Windows runner 用 bash"、"大表迁移分批"），依赖"状态文件→技能"的毕业机制做抽象，而这条提炼链的上限取决于审查者的判断力，不具备模型参数化知识那种泛化能力。自改进的复利在这里是记账式的，不是涌现式的。

### 2. 撤回难度作为权限设计的第一性原理

第 6 步把"出了问题撤回有多难"作为 autoApprove/deny 的唯一判据，这比常见的"风险等级"分级更根本：它衡量的是不可逆性，而非事故概率。这与分布式系统里"可补偿操作乐观执行、不可补偿操作悲观拒绝"的思想同源。更非显然的一点是：中间地带"如果有日志记录，也可以自动批准"——意味着可逆性不是操作的固有属性，而是基础设施投资建构出来的属性。审计日志越完善，可自动化的边界越宽。这条原理可以推广：harness 工程的很大一部分工作，本质是在为"让更多操作变得可撤回"购买基础设施。

### 3. 写作者 vs 检查者：独立性是一种会衰减的稀缺资源

第 7 步的核心机制是全新上下文窗口的审查子 Agent 能发现写作者自己看不到的问题——根因是模型对共享上下文中的自身产出过度宽容，分离上下文等于做一次无偏采样。这与 [Loop Engineering Methodology](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/loop-engineering-methodology.md) 中的对抗性验证、generator-critic 模式同构，也和 [Agentic Code Review Addyosmani](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentic-code-review-addyosmani.md) 的实践一致。但路线图没有展开一个隐含问题：审查者的独立性不是一次性的，而是随使用衰减的资源——审查子 Agent 若长期积累记忆、规则或偏好，它会逐渐与主 Agent 的产出分布趋同，"全新视角"的增益随之稀释。长期运行的自改进系统是否需要定期重置审查者、或在多个审查者之间轮换，是一个值得追踪的开放问题。

### 4. 循环是增益系数而非增量：放大的非对称性

"好 harness 上的循环会复利增长，差 harness 上的循环只会更快地消耗资源"——这句话的数学结构比修辞更重要：循环不添加任何智能（第 10 步明言"循环不增加智能"），它只是把 harness 质量×时间。因此循环是乘法算子，harness 质量为负时自动化的产出就是负复利。这解释了为什么构建顺序（先手动可靠、再配置、再记忆、最后套循环）是硬约束而非最佳实践建议：在未验证的系统上自动化，等于把错误锁定在定时器里。[When Not To Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/when-not-to-harness-engineering.md) 讨论的边界条件正是这一非对称性的另一面。

### 5. Harness 即配置即代码：从个人习惯到组织基础设施

第 14 步的深层含义常被"打包分享"一句带过：harness 把工程规范从口口相传的团队文化变成了可执行的工件——钩子是规范中不可协商部分的"编译产物"（模型无法绕过退出码），技能是最佳实践的打包分发，rules/ 是作用域化的编码规范。这与 [Claude Code Governance Soft Rules](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-governance-soft-rules.md) 的软规则治理形成互补：软规则负责判断性约束，硬约束交给钩子。与 [Claude Code Large Codebase Harness Configuration](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-large-codebase-harness-configuration.md) 的企业实践对照可见，真正的开放问题在组织层：各团队 fork 插件后 harness 会漂移，规范一致性如何长期维持；harness 作为共享资产的版本管理、兼容性和安全审计（路线图已警告"不扫描就发布"）都还没有成熟答案。harness 工程正在重复 DevOps 走过的路：先个人脚本，后基础设施即代码。

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/agent-engineering-guide.md)

---

