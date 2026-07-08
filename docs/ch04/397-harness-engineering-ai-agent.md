# Harness Engineering 驾御工程：AI Agent 系统性约束设计

## Ch04.397 Harness Engineering 驾御工程：AI Agent 系统性约束设计

> 📊 Level ⭐⭐ | 7.2KB | `entities/harness-engineering-concept.md`

# Harness Engineering 驾御工程：AI Agent 系统性约束设计

Harness Engineering（驾御工程/运行约束工程）是在 LLM 外部设计一整套机制，让 Agent 的行为能够被约束、被验证、被纠偏。它解决的重点是确保 Agent 在长期运行中持续做对，而非仅仅纠结于单次输出质量。

## 核心定义

**关键区分**：

| 维度 | Context Engineering | Harness Engineering |
|------|---------------------|---------------------|
| 优化对象 | 单次任务输入质量 | 整个系统的持续运行质量 |
| 核心问题 | Agent 应该看到什么 | 系统应该阻止、验证、修正什么 |
| 常见症状 | 回答偏题、信息缺失 | 多轮漂移、规则失效、质量波动 |
| 常见手段 | Prompt、RAG、Memory、文档 | Lint、CI、Hooks、权限、流程控制 |
| 变化频率 | 随任务动态变化 | 相对稳定，偏基础设施 |

> **Prompt 决定 Agent 听到什么，Context 决定 Agent 看到什么，Harness 决定 Agent 能不能把事做稳。**

## 为什么需要 Harness

### Prompt 调优的局限性

当 Agent 进入工程现场，任务可能持续几十轮对话，或多个 Agent 并行推进：

- Prompt 里的提醒会被上下文稀释
- 文档规范会被局部目标覆盖
- 人工要求在长链路中逐渐失效

### 典型的“捷径”行为

Agent 为完成眼前目标可能选择看似更短的路径，实际却在制造技术债务：

- lint 不通过 → 改 lint 配置
- 类型不匹配 → 放宽类型
- 测试失败 → 改测试断言
- 架构边界卡住 → 绕过去直接引用

**当问题在长期运行、多轮协作、并行执行中反复出现时，本质已升级为环境设计层面的系统性挑战。**

## 四大工程能力

Harness 表现为四类工程能力的组合：

### 1. 架构约束

**回答**：什么必须被阻止？

- 模块不能反向依赖
- 跨层访问不能随意出现
- 某些目录不能被 Agent 直接改写

**手段**：lint、dependency rule、结构测试机械拦截。只要能自动判定，就不要留给人肉提醒。

### 2. 反馈回路

**回答**：什么必须尽快被看见？

**原则**：越早反馈，越容易自我修正；越晚反馈，越容易把错误带进下一轮。

| 阶段 | 方式 | 速度 | 用途 |
|-----|------|------|------|
| 即时 | PostToolUse Hook | 几乎实时 | 文件一改完就跑检查 |
| 提交前 | pre-commit | 提交前 | 阻止低级错误进入仓库 |
| 合并前 | CI | 合并前 | 统一验证保证主干质量 |
| 人审 | Code Review | 合并时 | 处理取舍、设计和业务判断 |

### 3. 工作流控制

**回答**：任务该怎被组织？

- 复杂问题拆成小任务
- 让 Agent 在清晰边界内工作
- Commands 固化流程，Permissions 限制自动动作，目录隔离支持并行执行

**目标**：工作流越清楚，Agent 越不容易在目标之间来回漂移。

### 4. 改进循环

**回答**：怎么对抗熵增？

Agent 长期参与会导致 AI slop、过期规范、重复实现出现。需要把清理动作变成系统的一部分：

- 定期归档
- 自动重构
- 规则回写
- 文档刷新

## 实证效果

### Can.ac 实验

仅仅改变 harness 的工具格式，没有改模型权重：

- Grok Code Fast 1: 6.7% → 68.3%（提升 10 倍）
- 输出 token 下降约 20%

### LangChain Terminal Bench 2.0

同一模型靠 harness 调整：

- 排名从第 30 名升到第 5 名
- 分数提升 13.7 分

### OpenAI 实践

团队用五个月靠 Codex Agent 做出约一百万行代码，几乎没有手写。说明当 harness 设计成熟，Agent 的价值从「帮你补几行代码」变成「帮你维持一整套开发节奏」。

## 落地建议（Claude Code 用户）

### 组件分层

| 组件 | 作用 | 层级 |
|-----|------|------|
| CLAUDE.md | 汇总项目规则、约定和背景 | Context |
| Skills | 注入特定任务的方法 | Context |
| MCP Servers | 接入外部工具与数据 | Context |
| Commands | 固化可重复的工作流 | Harness |
| Hooks | 在关键事件后自动执行检查 | Harness |
| Permissions | 限定 Agent 可自动执行的动作 | Harness |

### 最小可行 Harness 四步走

1. **写清楚项目规范**，让仓库变成事实源
2. **把 lint、type check、test 接成自动门禁**
3. **把高频动作封装成 Commands**
4. **给关键节点加 Hook**，让错误尽量在最早阶段暴露

### 最小 PostToolUse Hook 示例

```json
// .claude/settings.json (minimal example)
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write",
      "hooks": [{ "type": "command", "command": "npx oxlint $CLAUDE_FILE_PATH" }]
    }]
  }
}
```

## 问题诊断

**如果问题表现为**：单次输出还行，但重复使用后质量漂移、架构被打破、旧问题反复出现 → 属于 Harness 层问题。此时继续加提示词的收益通常很有限，应该转向机制设计。

## 核心论断

> **模型能力决定上限，Harness 设计决定这个上限能否稳定释放。**

> 未来真正有竞争力的工程团队，不只是会「用 AI 写代码」，更会设计 AI 能可靠工作的工程环境。

## 参考资源

- [Phil Schmid: The importance of Agent Harness in 2026](https://www.philschmid.de/agent-harness-2026)
- [Mitchell Hashimoto: My AI Adoption Journey](https://mitchellh.com/writing/my-ai-adoption-journey)
- [OpenAI: Harness engineering](https://openai.com/index/harness-engineering/)
- [Martin Fowler: Harness Engineering](https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html)
- [Can.ac: Only the Harness Changed](https://blog.can.ac/2026/02/12/the-harness-problem/)
- [LangChain: Improving Deep Agents with harness engineering](https://blog.langchain.com/improving-deep-agents-with-harness-engineering/)
- [Anthropic: Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/harness-engineering-deep-dive.md)

---

