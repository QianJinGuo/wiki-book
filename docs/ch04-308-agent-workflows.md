# Agent Workflows

## Ch04.308 Agent Workflows

> 📊 Level ⭐⭐ | 8.1KB | `entities/agent-workflows.md`

## 核心要点
- GitHub Agentic Workflows 运行在每个 PR 上，成本会悄然累积
- 工作流的工作在 YAML 中完全指定，每次执行都会重复——这使得优化比交互式桌面会话更容易
- token 效率优化的关键：消除未使用的 MCP 工具、将 MCP 调用替换为 CLI、用 pre-agentic 数据下载
- GitHub 内部用"工作流优化工作流"：每日 Token 使用审计师 + 每日 Token 优化器
- Effective Tokens (ET) 指标：考虑模型成本差异，输出 token 加 4 倍权重

## 深度分析
### token 效率问题的本质
Agentic workflows 的 token 效率问题不是简单的"用少一点"，而是结构性问题。GitHub 的经验表明，最大效率来源是**消除不必要的 LLM 调用**，而不是减少单次调用的 token 消耗。最便宜的 LLM 调用是根本不做的调用。

### 优化飞轮的设计
GitHub 构建了一套自动化的优化飞轮：Token 审计器监控生产工作流 → 发现异常时触发优化器 → 优化器分析源码和日志 → 生成具体的修复建议 → 人工确认后实施 → 结果回流到下一轮审计。这个飞轮本身也是 agentic 的，自身的 token 使用也会出现在每日报告中，形成小的良性循环。

### 三种主要优化模式的工程含义
**1. 消除未使用的 MCP 工具注册**
LLM API 无状态，所以 agent 运行时通常在每次请求中包含完整 MCP 工具函数名和 JSON schema。对于有 40 个工具的 GitHub MCP server，每个 turn 可能增加 10-15KB schema。如果 agent 只用两个工具，剩下 38 个就是纯开销。通过交叉引用工具清单和实际工具调用来识别这个模式是可行的。
**2. 将 GitHub MCP 替换为 GitHub CLI**
MCP 工具调用不仅是数据检索，还是一个推理步骤。Agent 必须决定调用工具、构造参数、在上下文中接收输出——这是完整的 LLM API 往返，消耗工具调用 JSON schema、参数块和响应的 token。调用 `gh pr diff` 则是一个对 GitHub REST API 的确定性 HTTP 请求，没有 LLM 参与。
两种策略：pre-agentic 数据下载（YAML 中 setup 步骤在 agent 启动前运行 `gh` 命令）和 in-agent CLI 代理替换（轻量透明 HTTP 代理路由 CLI 流量）。
**3. 区分不同类型的 token 成本**
```
ET = m × (1.0 × I + 0.1 × C + 4.0 × O)
```
其中 m 是模型成本乘数（Haiku=0.25×, Sonnet=1.0×, Opus=5.0×），I 是新处理输入 token，C 是缓存读取 token，O 是输出 token。输出 token 权重 4× 是因为它是所有主要提供商中最贵的 token 类型。缓存读取 token 只有 0.1× 权重。这个公式将消耗归一化，使得 10% ET 减少意味着无论使用哪种模型都是真正的 10% 成本降低。

### 测量效率提升的困难
效率提升测量有三个混淆因素：

- **不是所有 token 生来平等**：相同 token 数量在不同模型上成本差异很大（Haiku 约比 Sonnet 便宜 4×）
- **工作负载本身在变化**：同一个工作流有时处理 5 行修复，有时处理 200 行 PR
- **质量问题最难衡量**：process-level 信号（每 LLM 调用的输出 token、每次运行的 turn 数、工具调用完成率）只是近似，不是 outcome 信号

## 实践启示
### 1. 从可观测性开始
在优化 token 效率之前，必须先知道 token 用在哪里。GitHub 的经验是：每个 agent 框架（Claude CLI、Copilot CLI、Codex CLI）输出不同格式的日志，使用 API 代理统一捕获所有运行的 token 使用情况是可行的第一步。关键数据：每次 API 调用的输入 token、输出 token、缓存读取 token、缓存写入 token、模型、提供商、时间戳。

### 2. 建立优化飞轮
不要一次性优化所有工作流。GitHub 的策略是：

- 每日 Token 审计器：读取最近工作流运行的 token 使用清单，按工作流聚合消费，标记显著增加的工作流
- 每日 Token 优化器：分析被标记工作流的源码和最近日志，创建描述具体低效和提出具体优化的 GitHub issue
- 优先级：运行频率高的更重要，6.8 次/天 × 62% 节省的复合效应比 1 次/天 × 20% 节省大得多

### 3. 先消除不必要的 LLM 调用
最低挂的果实是：

- 未使用的 MCP 工具（从 40 个工具 prune 到实际使用的 2 个）
- 总是需要的数据（PR diff、变更文件列表）用 pre-agentic CLI 步骤获取
- 安全敏感的变更过滤在 LLM 之外完成（ relevance gate 直接跳过）

### 4. 用正确的指标
不要只看原始 token 数量。使用 Effective Tokens (ET) 考虑模型成本差异：

- 输出 token 是 4× 权重，是最贵的部分
- 缓存读取只有 0.1× 权重
- 相同 token 数量在不同模型上可能代表完全不同的成本

### 5. 区分效率提升和负载变化
当看到 ET 变化时，需要问：

- 是工作流更高效了，还是只是工作负载变轻/变重了？
- 跟踪 LLM 调用次数配合 token 数量：恒定的 LLM turns/次 + 下降的 tokens/次 = 真正的效率提升
- 两者同时下降可能意味着完成的工作更少，而不是更高效

### 6. 识别配置错误的灾难性影响
一个配置错误可能导致灾难性的效率问题。GitHub 的案例：工作流复制测试文件到 /tmp/，然后调用 `gh aw compile *`，但沙箱的 bash allowlist 只允许相对路径 glob 模式。每次编译尝试都被阻止，agent 陷入 64 turn 后备循环手动阅读源码重建编译器会告诉它的内容。一行修复消除了循环。这类问题的特征是极高 ET 和明显的循环模式。

## 相关页面
> Stub page — 内容待补充。

## 相关实体
- [9个Agent技能模块化SageMaker微调生命周期](/ch04-345-aws-sagemaker-ai-agent-guided-workflows-finetuning/)
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/github-token-efficiency-agentic-workflows.md)
- [十年老技术开发的 AI Agent 探索之路](/ch04-266-十年老技术开发的-ai-agent-探索之路/)
- [要实现一个工作流选择-agent-skills-还是-ai-表格](/ch04-192-要实现一个工作流选择-agent-skills-还是-ai-表格/)
- [Garry Tan](/ch01-497-garry-tan/)
- [Hermes Agent 新手上手指南](/ch04-418-hermes-agent/)
- [重新定义Skill开发：保姆级教程&一站式开发助手发布](/ch07-045-重新定义skill开发-保姆级教程-一站式开发助手发布/)
- [四种 Sub Agent 模式](/ch04-302-四种-sub-agent-模式/)
- [Qoder Skills 完全指南：从零开始，让 AI 按你的标准执行](/ch04-024-qoder-skills-完全指南-agent-skill-迭代式编写-ai-按你的标准执行/)
- [AI 行业就业八大变化（腾讯研究院纵向对比）](/ch01-218-我们刚过了人类最后一个劳动节-ai新职业的八个变化/)
- [Agent Skill 设计模式](/ch04-406-从-anthropic-到-google-agent-skills-正在进入-设计模式-阶段/)
- [柚漫剧 AI 全流程提效拆解](/ch01-356-柚漫剧-ai-全流程提效拆解/)
- [CDP Bridge MCP：真实浏览器直连 MCP 工具](/ch01-548-cdp-bridge-mcp-让-llm-操作真实浏览器/)
- MOC

---

