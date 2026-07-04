# Harness 工程 14 步路线图：从单 Agent 到自改进系统

## Ch04.392 Harness 工程 14 步路线图：从单 Agent 到自改进系统

> 📊 Level ⭐⭐ | 7.0KB | `entities/harness-engineering-14-step-roadmap.md`

# Harness 工程 14 步路线图

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

- [Claude Code 大型代码库配置](ch03/075-claude-code.md)：聚焦企业级大型代码库中的 harness 配置实践
- [软规则 vs 硬约束](ch03/075-claude-code.md)：深入分析 CLAUDE.md 软规则的治理陷阱

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/harness-engineering-14-step-roadmap.md)

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/agent-engineering-guide.md)

---

