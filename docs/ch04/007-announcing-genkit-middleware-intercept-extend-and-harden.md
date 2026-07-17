# Announcing Genkit Middleware: Intercept, extend, and harden your agentic apps

## Ch04.007 Announcing Genkit Middleware: Intercept, extend, and harden your agentic apps

> 📊 Level ⭐ | 8.6KB | `entities/announcing-genkit-middleware-intercept-extend-and-harden-your-agentic-apps.md`

> -> [Announcing Genkit Middleware: Intercept, extend, and harden your agentic apps](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/announcing-genkit-middleware-intercept-extend-and-harden-your-agentic-apps.md)
## 核心要点
- Genkit 是用于构建全栈 AI 应用和 Agentic 应用的开源框架，支持 TypeScript、Go、Dart 和 Python
- v=8, c=8

## 深度分析
### 1. 为什么 Agentic 应用需要中间件
传统的 AI 应用（聊天机器人、文本生成）可以在 API 调用层面处理大多数横切关注点（重试、日志）。但 **Agentic 应用的核心是工具执行循环（tool loop）**——模型输出 → 工具执行 → 结果回传 → 下一轮模型调用，这个循环会反复执行，过程中每个环节都可能出错或需要干预。
Genkit Middleware 的设计出发点是：**在工具执行循环的每一层注入横切行为，而不破坏循环本身的逻辑**。这比在应用层手动编写"如果 API 失败则重试"这样的条件判断要优雅得多——中间件是可组合、可复用、可测试的。

### 2. 三层 Hook 架构的设计意图
Genkit 定义了工具循环中三个不同粒度的 Hook 层：
| Hook 层 | 触发频率 | 设计意图 |
|---|---|---|
| **Generate Hook** | 每轮工具循环迭代一次 | 上下文注入、消息重写、对话级逻辑 |
| **Model Hook** | 每个模型 API 调用一次 | 重试、fallback、缓存、延迟日志 |
| **Tool Hook** | 每个工具执行一次 | 人工审批、沙箱化、按工具日志 |

这个分层设计的核心洞察是：**不同关注点需要不同粒度的拦截点**。想在 API 层做 retry 不需要知道上层有多少个 tool 在运行；想在 tool 层做 human-in-the-loop 不需要修改 model 的 prompting。这种关注点分离使中间件可以独立开发和组合。

### 3. Pre-built 中间件的战略布局
Genkit 官方提供的 5 个中间件覆盖了生产级 Agentic 应用的四类典型需求：
**可靠性（Reliability）**：Retry 和 Fallback 解决模型 API 的瞬时错误和配额限制——这在生产环境中是高频问题，模型服务商（尤其是 Gemini 等）的 quota 限制往往比技术故障更难预测。
**安全/控制（Security/Control）**：ToolApproval 实现 human-in-the-loop 的工具执行审批。这在企业场景中至关重要——Agent 调用外部工具（写文件、发送消息、删除资源）需要人类确认，而不是完全自主执行。
**知识增强（Knowledge Augmentation）**：Skills 中间件通过扫描目录中的 `SKILL.md` 文件并注入系统 prompt，解决了 Agent 知识更新的难题——无需重新训练模型，只需更新文件即可改变 Agent 的专业知识域。
**工具增强（Tool Augmentation）**：Filesystem 中间件授予模型受限的文件系统访问能力，解决了 Agent 无法操作本地资源的根本问题，并通过路径安全限制防止模型逃逸出根目录。

### 4. 自定义中间件的合约设计
Genkit 的自定义中间件合约极为简洁：提供一个名称和一个工厂函数，工厂返回你需要实现的 Hook。整个合约在 ~20 行 Go 代码中完成了一个功能完整的 content filter。
这个设计的关键价值在于：**用确定性规则替代 prompt 工程**。与其在 system prompt 里说"模型不应该提到竞争对手"，不如在中间件层直接过滤掉包含该词汇的响应。前者是概率性的（模型可能遵循也可能不遵循），后者是确定性的（包含就报错）。对于企业级应用，确定性的安全保障是必须的。

### 5. 中间件栈的顺序语义
Genkit 明确指出中间件从左到右组合，第一个列出的在最外层。Retry 包裹 ContentFilter，ContentFilter 包裹 model call——这个顺序语义对于正确实现至关重要：如果 Retry 在内层，那么 ContentFilter 的判断会被 retry 机制覆盖；如果在外层，则每次重试都会经过内容过滤。
这个设计选择让中间件的副作用变得可预测——开发者可以通过调整顺序来控制行为的正确性，而不是在文档中查找复杂的优先级规则。

### 6. 与其他 Agent 框架中间件能力的比较
对比主流 Agent 框架（LangChain LCEL、AutoGen、CrewAI），Genkit Middleware 的差异化在于：

- **语言支持广度**：TypeScript、Go、Dart、Python，而大多数竞品以 Python 为主
- **三层 Hook 分离**：大多数框架只在 Model 层提供拦截，缺乏 Generate 层和 Tool 层的原生分离
- **开箱即用的中间件集合**：Retry、Fallback、ToolApproval 等在 LangChain 中需要自行组合第三方库

## 实践启示
### 给框架开发者
1. **中间件是展示框架能力的最直接方式**：一个精心设计的中间件系统比一百个配置选项更能体现框架的可扩展性。开发者看到一个简洁的中间件合约，就会对整个框架的工程质量建立信任。
2. **Hook 粒度决定框架灵活性上限**：过早地在单一层面拦截（如只在 API 层）会限制后续扩展。如果你的框架未来可能需要 human-in-the-loop 或多模型 fallback，从一开始就设计多层 Hook 是值得的。
3. **Pre-built 中间件是降低采用门槛的关键**：LangChain 的一个痛点是"什么都需要自己写"。提供 Retry、Fallback、ToolApproval 等生产必需品可以显著减少开发者的初始认知负担。

### 给企业 AI 应用开发者
1. **生产环境必须启用 Retry + Fallback**：模型 API 的瞬时错误和配额耗尽是生产环境的常态，不是例外。建议至少配置 3 次重试和至少一个 fallback 模型。
2. **Human-in-the-loop 不要等到产品上线才加**：ToolApproval 中间件的价值在于，任何具有外部影响的工具（写文件、网络调用、数据库修改）都应该有人工审批节点。在设计早期就将其纳入架构，比后期补救要容易得多。
3. **自定义中间件的测试策略**：每个自定义中间件应该在 happy path、error path 和边界条件（空输入、恶意输入）上都有测试覆盖。由于中间件是确定性逻辑，单元测试的价值比集成测试更高。
4. **内容安全策略用中间件而非 prompt**：企业应用中涉及合规的内容过滤（竞品名称、内部定价、监管声明）必须用确定性规则实现，不要依赖模型遵循 system prompt 中的指令。

### 给 DevOps / ML Platform 团队
1. **中间件执行对开发者 UI 的可见性是关键**：Genkit DevUI 将中间件执行可视化——可以追踪每个 hook 层的执行轨迹。这对调试生产环境中的中间件行为非常有价值。
2. **Filesystem 中间件的路径安全是基础能力**：任何让 Agent 访问本地资源的实现都必须有路径安全机制。检查模型是否真的无法逃逸根目录——这在对抗性输入下尤其重要。

## 相关实体
> [主题导航](https://github.com/QianJinGuo/wiki/blob/main/queries/ai-model-research-latest-directions.md)

- [Task Queue Priority and Fairness: Your Task Queue, Your Way](../ch11/172-task-queue-priority-and-fairness-your-task-queue-your-way.html)
- [Task Queue Priority and Fairness: Your Task Queue, your way](../ch11/172-task-queue-priority-and-fairness-your-task-queue-your-way.html)
- [Exaforce | Agentic SOC Platform and MDR](ch04/610-agentic.html)

---

