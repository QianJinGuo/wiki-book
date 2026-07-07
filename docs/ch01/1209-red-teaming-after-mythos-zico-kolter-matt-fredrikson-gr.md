# Red-Teaming after Mythos — Zico Kolter & Matt Fredrikson, Gray Swan

## Ch01.1209 Red-Teaming after Mythos — Zico Kolter & Matt Fredrikson, Gray Swan

> 📊 Level ⭐⭐⭐⭐ | 6.4KB | `entities/latent-space-p-gray-swan.md`

# Red-Teaming after Mythos — Gray Swan

## 摘要

Latent Space 对 Gray Swan 联合创始人 Zico Kolter（CMU 教授、OpenAI 董事会安全委员会成员）和 Matt Fredrikson（CMU 教授、Gray Swan CEO）的深度访谈。核心议题：在 Mythos 被美国政府列入出口管制后，AI red-teaming 的方法论演进、agent 安全的新威胁模型，以及 AI 安全产业的未来走向。这是当前 AI 安全领域最具实操价值的对话之一。

## 核心要点

### Gray Swan 公司画像

Gray Swan 是一家从 CMU 研究中孵化的 AI 安全公司，已完成 Series A 融资（Snowflake 为投资方）。其产品矩阵覆盖 AI 安全的多个层面：

| 产品 | 定位 | 核心能力 |
|------|------|---------|
| **Shade** | 自动化 red-teaming 工具 | AI 驱动的对抗性测试，已用于 Anthropic 模型评估 |
| **Cygnal** | AI guardrails 模型 | 策略执行、输入/输出过滤 |
| **Arena** | 社区 red-teaming 平台 | 全球最大的 AI red-teaming 竞技场 |

### AI 安全 ≠ 传统网络安全

Kolter 和 Fredrikson 的核心观点：**AI 安全不是"用 AI 做网络安全"，而是一个全新的安全范式**。

- **LLM 是"外星智能"**：它们的失败模式与人类直觉完全不同——人类认为安全的输入可能触发 LLM 的异常行为，反之亦然
- **规模不等于安全**：更大的模型不一定更鲁棒，某些攻击在更大模型上反而更有效
- **Agent 引入新威胁面**：当 LLM 获得工具调用能力（computer-use、代码执行），攻击面从"文本操纵"扩展到"系统操纵"

### Prompt Injection 的系统性威胁

访谈深入讨论了 prompt injection 作为 agent 时代的核心安全挑战：

1. **间接 prompt injection**：恶意内容嵌入在 agent 处理的数据中（网页、文档、邮件），agent 在处理时被劫持
2. **致命三角（Lethal Trifecta）**：Simon Willison 提出的框架——不可信数据 + 私有数据 + 外泄能力 = 灾难
3. **Computer-use agent 的噩梦**：当 agent 可以操作浏览器和桌面，prompt injection 的后果从"泄露文本"升级到"执行任意操作"

### Shade：AI 打败人类的 red-teaming

Gray Swan 的 Shade 工具在 red-teaming 领域实现了突破：**专用 red-teaming 模型在破解 AI 系统方面已经超过人类水平**。

- 自动化发现 jailbreak 路径，覆盖人类难以穷举的攻击空间
- Anthropic 在 Mythos 模型卡中引用了 Gray Swan 的评估结果
- 这意味着 AI 安全正在进入"AI 攻击 AI、AI 防御 AI"的阶段

## 深度分析

### 从 Jailbreak 到系统性安全评估的范式转移

传统 red-teaming 聚焦于"能否绕过安全过滤"——本质上是对齐问题的边界测试。Gray Swan 代表的范式转移在于：

1. **攻击分类学**：从零散的 jailbreak trick 到系统性的攻击模式分类
2. **评估标准化**：建立可重复、可量化的安全评估框架
3. **威胁建模**：针对 agent 场景的攻击面分析，而非通用的"安全过滤绕过"
4. **防御工程化**：从"更好的 prompt"到"工程化的 guardrail 系统"

这与 [Role Confusion](ch01/752-github.html) 研究形成互补——后者提供理论框架（prompt injection 本质是角色混淆），Gray Swan 提供实战工具和方法论。

### Agent 安全的新威胁模型

随着 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 的兴起，agent 获得了越来越多的工具调用能力。这带来了新的威胁模型：

```
传统 LLM 威胁面：
  用户输入 → LLM → 文本输出
  攻击目标：绕过安全过滤、生成有害内容

Agent 威胁面：
  用户输入 → LLM → 工具调用 → 系统操作
  + 不可信数据源（网页、文档、邮件）→ LLM → 工具调用
  攻击目标：劫持 agent 执行恶意操作（转账、删除、外泄）
```

Agent 的攻击面呈指数级扩展：
- **输入源**：从用户输入扩展到 agent 处理的所有数据
- **影响范围**：从"生成不当文本"扩展到"执行任意系统操作"
- **持久性**：恶意指令可以持久化在 agent 的记忆/上下文中

### AI 安全产业的演进方向

访谈暗示了 AI 安全产业的几个关键趋势：

1. **合规化**：AI 安全将进入保险和合规框架，类似网络安全的 SOC2/ISO27001
2. **自动化**：red-teaming 从人工劳动转向 AI 驱动的自动化评估
3. **平台化**：从点状工具到覆盖"评估-防护-监控"全链路的安全平台
4. **标准化**：行业需要统一的安全评估基准（类似 CVE 系统）

## 实践启示

### 对 Agent 开发者的建议

1. **默认不信任外部数据**：所有 agent 处理的外部数据都应被视为潜在的 prompt injection 载体
2. **最小权限原则**：agent 的工具调用权限应按需分配，而非全量授予
3. **分层防御**：输入过滤 + 输出审查 + 工具调用审批 = 多层防御
4. **持续 red-teaming**：安全评估不是一次性工作，需要持续的对抗性测试

### 投资视角

AI 安全赛道正在从"学术研究"转向"商业产品"。Gray Swan 的 Series A 和 Anthropic 对其工具的采用，表明头部 AI 公司已经开始系统性投资安全能力。

## 相关实体

- [Role Confusion](ch01/752-github.html) — Prompt injection 的理论框架
- [AFine CSP Injection](https://github.com/QianJinGuo/wiki/blob/main/entities/afine-csp-html-injection-password-exfiltration.md) — 具体的注入攻击案例
- [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) — Agent 架构工程
- [Claude Tag](ch01/1153-introducing-claude-tag.html) — Anthropic 的 agent 安全实践
- [OpenClaw](../ch11/214-openclaw.html) — 计算机使用 agent 的安全挑战

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/latent-space-p-gray-swan.md)

---

