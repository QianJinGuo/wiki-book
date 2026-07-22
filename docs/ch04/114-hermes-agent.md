# 给 Hermes 装上显微镜：Agent 执行全知道

## Ch04.114 给 Hermes 装上显微镜：Agent 执行全知道

> 📊 Level ⭐⭐ | 15.6KB | `entities/hermes-observability-aliyun.md`

[原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/hermes-observability-aliyun.md)

## 背景
Hermes 是 Nous Research 打造的一套自治式 AI Agent 运行框架。它不是单次问答式的模型封装，而是一个能够持续运行、调用工具、积累经验、并随着使用过程不断成长的 Agent Runtime。
当一个 AI Agent 真正开始解决问题，无论它是正确完成，还是出现偏差，真正困难的问题往往都不是结果对不对，而是它到底做了什么。
Hermes 的一次运行并不是一次普通的模型调用。一次看似简单的交互，背后可能包含多轮推理、工具调用、结果回注、上下文膨胀，以及新的推理循环。如果系统只能提供最终回复、几条分散的日志，或者一次调用的 usage 汇总，那么 Hermes 依然是一个黑盒。

## 要解决的四个核心问题
**第一类：过程不可见**
很多系统在接入大模型之后，依然只能看到用户输入、最终输出和一条 usage 汇总。Hermes 的真实运行远不止如此。没有调用链时，中间过程基本就是空白的。
**第二类：成本不可归因**
Token 账单本身不是最难的问题，最难的是你不知道钱到底花在哪里。一次 Hermes 运行之所以贵，可能是某一轮上下文突然膨胀，也可能是某个工具返回了过大的结果，还可能是最后一轮回答输出过长。
**第三类：性能不可拆解**
用户只会告诉你"它变慢了"，但"慢"本身其实没有信息量。真正需要区分的是：首 Token 慢还是整体生成慢？是工具执行慢，还是多轮 ReAct 推理本身就跑得太长？
**第四类：结果不可复盘**
很多时候最难处理的并不是明确报错，而是"看起来成功了，但结果不对"。没有链路，复盘几乎无从下手；有了链路，问题才能从"猜原因"变成"看路径"。

## 技术方案：OpenTelemetry 链路追踪
阿里云为 Hermes 构建的是一套基于 OpenTelemetry（开放遥测框架）的链路追踪能力。
**核心原理：** 在 Hermes 所在的 Python 环境中安装 runtime instrumentation，围绕 Hermes 的关键执行边界建立 span，再通过 OTLP（OpenTelemetry Protocol）标准协议把 Trace 和指标上报到观测后端。

### 五大优势
1. **遵循 GenAI 标准规范** — 对齐 OpenTelemetry GenAI 语义约定；对于 Agent runtime 中更贴近执行过程的结构，则结合 LoongSuite Semantic Conventions 做扩展
2. **Trace + Metrics 双信号** — 除单次请求调用链外，还能从趋势上看到调用次数、错误次数、调用耗时、Token 使用量等指标
3. **Streaming TTFT 单独记录** — Time To First Token，首字延迟，帮助区分"首字慢"还是"整体生成慢"
4. **不绑定单一云服务** — 底层走 OTLP 标准协议，可接入阿里云 ARMS，也可迁移到其他兼容 OTLP 的后端
5. **高危行为安全审计** — 采集 Hermes 系统全量操作日志、访问记录及用户行为数据，结合异常检测算法识别越权访问、异常数据导出、恶意提示词注入等可疑行为

## 可观测内容
### ReAct 结构化 Trace
当前版本的 Hermes 可观测能力，已经可以把一次真实的 Agent 运行还原成 ReAct 结构化 Trace。
一次执行到底跑了几轮，哪一轮触发了工具，工具又是怎样影响后续推理的，现在都可以在同一条 Trace 中展开查看。

### 模型调用（chat span）
```
gen_ai.request.model
gen_ai.usage.input_tokens
gen_ai.usage.output_tokens
gen_ai.usage.total_tokens
gen_ai.response.time_to_first_token
```
按"每一次真实模型调用"来看 Token 和时延，而不只是看一次会话的总账。

### 工具调用（execute_tool span）
```
gen_ai.tool.name
gen_ai.tool.call.arguments
gen_ai.tool.call.result
```
能够看到 Hermes 在什么时候决定调用工具、调用了哪个工具、传了什么参数，以及返回了什么结果。

### Agent 级汇总
根节点 `invoke_agent Hermes` span 当前已经可以记录整次运行的聚合结果：

- 累计 Token
- 最终输出消息
- 总时耗信息

### 高危行为审计
全链路记录 Agent 行为，智能生成审计视图，让危险操作无处遁形。

## 接入部署
### 前提条件
- 已有运行中的 Hermes 实例
- 可访问阿里云 ARMS 或其他 OTLP 兼容后端

### 部署步骤
**第一步：获取安装命令**
登录 CMS 2.0（Cloud Monitor Service 2.0）控制台（https://cmsnext.console.aliyun.com/），进入对应的应用监控 Workspace，选择接入中心 → AI 应用可观测，点击 Hermes。输入应用名，点击获取，生成接入命令，复制。
**第二步：执行安装命令**
```bash
curl -fsSL https://arms-apm-cn-hangzhou-pre.oss-cn-hangzhou.aliyuncs.com/hermes-agent-cms-plugin/hermes-cms.sh | bash -s -- install \
  --x-arms-license-key "auto" \
  --x-arms-project "你的Project" \
  --x-cms-workspace "你的Workspace" \
  --serviceName "hermes" \
  --endpoint "https://你的ARMS-OTLP地址/apm/trace/opentelemetry"
```
首次执行后，系统会在本机注册 `hermes-cms` 命令，供后续执行 enable、disable、uninstall 等操作。
**第三步：开启可观测并启动 Hermes**
```bash
hermes-cms enable
hermes   # 前台运行

# 或
hermes gateway start  # 后台运行
```
**第四步：确认埋点生效**
启动后终端出现以下提示，说明可观测埋点已生效：
```
loongsuite-site-bootstrap: started successfully (OpenTelemetry auto-instrumentation initialized).
```

### 日志接入
在接入卡片配置应用信息，设置应用名并初始化资源，填入 Project 名，并配置机器组，一键完成 Hermes 审计功能。完成后在"审计"→"Hermes 洞察"→"Hermes 审计"查看审计大盘。

### 验证
向 Hermes 发送几条测试请求（触发多轮推理和工具调用的真实任务），等一两分钟后，在 CMS 2.0 控制台 AI 应用可观测中查看。

## 总结与展望
**已解决：**

- 链路追踪（ReAct 结构化 Trace）
- Token 归因（按调用拆分）
- 基础性能拆解（模型调用+工具执行+总耗时）
- 基础 Metrics 信号（趋势分析）
**下一步方向：**
| 方向 | 内容 |
|------|------|
| 数据面 | 从 Trace、Span 属性和基础指标向更完整的日志审计与运行诊断能力扩展 |
| 链路面 | 细化 memory lifecycle（记忆管理生命周期）、delegation orchestration（委托编排）、runtime recovery（运行时恢复）等 Hermes 特有执行阶段 |
| 治理面 | 加强内容采集控制、更细粒度的数据治理能力、统一脱敏和安全策略建设 |
**目标：** 从"可用的 runtime 可观测基础设施"演进为"更完整、更细致、更适合真实生产环境的 Agent 可观测体系"。

## 深度分析
### 1. Agent 可观测性的本质挑战
传统的微服务可观测性（Logging、Metrics、Tracing）解决的是"发生了什么"，但 Agent 运行的核心困境在于**意图链路的不确定性**。一次 Hermes 运行可能包含：

- **多轮 ReAct 循环**：Think → Action → Observation → ... → 最终响应
- **动态工具链**：哪一轮调用了什么工具，工具结果如何反作用于下一轮推理
- **上下文膨胀**：每轮的结果回注可能导致上下文呈指数级增长
阿里云方案的核心价值在于，它用 OpenTelemetry 的标准 span 体系，忠实地还原了这条动态推理链。这不是简单地在 API 调用前后打时间戳，而是对 Hermes 内部执行边界的精确插桩。

### 2. OpenTelemetry + GenAI Semantic Conventions 的战略选择
选择遵循 OpenTelemetry GenAI 语义约定是一个关键的生态位选择：

- **供应商中立**：OTLP 协议意味着可以无缝迁移到任何兼容后端（ARMS、Jaeger、Datadog、Grafana）
- **行业标准对齐**：GenAI Semconv 目前仍在快速演进中，提前对齐意味着未来可以直接复用社区的 query 模板和 dashboard 模板
- **与 LoongSuite 扩展的互补**：LoongSuite SemConv 对 Agent Runtime 特有概念的扩展，填补了通用 GenAI 语义约定无法覆盖的空白
这与 OpenAI 内部的可观测方案（结构化 logprobs + tokenizer usage）相比，视野更广、Vendor Lock-in 更低。

### 3. TTFT 单独记录的工程意义
Time To First Token 的单独记录是一个看似小但实际非常关键的 feature。在 LLM 推理中：

- **TTFT 高、TPOT 低**：模型冷启动慢，但一旦开始生成就很快 → 可能是 KV Cache 未命中或模型加载慢
- **TTFT 低、TPOT 高**：首字很快但后续生成慢 → 可能是生成长度过长或注意力机制计算量大
- **两者都高**：端到端都慢 → 可能是模型本身或服务端的吞吐量问题
没有 TTFT 单独埋点，这三种情况根本无法区分，cost optimization 就成了盲猜。

### 4. 安全审计的滞后性风险
文章提到"高危行为安全审计"，但从技术方案看，当前阶段主要是**全量日志采集 + 异常检测**的组合。这在理论上可以识别越权访问、恶意提示词注入等行为，但：

- **实时性**：如果检测是异步的（采集→存储→分析→告警），那么在真正发生数据泄露时可能已经太迟
- **误报率**：Agent 的工具调用行为本身就有较高的方差，异常检测的 baseline 建模难度大
- **隐私合规**：全量操作日志采集在金融、医疗等强监管场景下面临 GDPR/个人信息保护法的合规挑战
这是方案下一步"治理面"需要重点解决的方向。

### 5. 生产落地的关键前提
文章提到需要"已有运行中的 Hermes 实例"，这意味着当前方案是 **Python instrumentation 层面的**，不是 sidecar 也不是 remote receiver。对于：

- **容器化部署**：需要确保 instrumentation 脚本在容器启动时执行
- **多实例场景**：每个实例的 OTLP endpoint 需要统一汇聚
- **Hermes 版本兼容性**：runtime auto-instrumentation 强依赖 Hermes 的内部 API 稳定性
这些在生产环境中都可能成为运维的隐藏成本。

## 实践启示
### 给 AI Infra 团队的落地建议
1. **从 TTFT 埋点开始建立 cost intuition**：在接入完整 ARMS 之前，可以先用最小的 instrumentation 成本（只需在每次模型调用时记录 TTFT 和 token count），建立一个 token 消耗的 baseline，直观感受"钱花在哪了"。
2. **ReAct Trace 是调试复杂 agent 任务的核心工具**：当 agent 出现"看起来对但实际错"的问题时，ReAct Trace 可以让你逐轮还原推理路径，比单纯看 final output 效率高出一个数量级。
3. **OTLP 协议确保厂商无关性**：即使当前使用 ARMS，在选型阶段就应确保架构上是 OTLP-native 的，这样未来切换到自建的 Jaeger+Grafana 组合时不需要重新埋点。
4. **安全审计要提前规划数据治理**：在启用全量日志采集之前，必须明确：日志保留多久？哪些字段需要脱敏？谁有访问权限？这些决定了后续"治理面"的建设难度。

### 给 Agent 开发者的日常洞察
1. **用 chat span 追踪 token 消耗的轮次分布**：不要只看一次会话的总 token 数，按"每轮真实模型调用"拆分后，往往能发现某一轮上下文异常膨胀，这是压缩 prompt 的关键信号。
2. **execute_tool span 帮助识别"工具滥用"**：如果某轮 ReAct 调用了不必要的工具（比如读文件只是为了获取一个常量），可以通过 trace 定量确认，然后针对性优化 prompt。
3. **首字延迟（TTFT）是模型推理性能的黄金指标**：在调参或换模型时，TTFT 的变化比最终生成速度更能反映底层 kernel 级别的性能差异。

### 给平台/风控团队的治理视角
1. **全链路行为记录是合规审计的必要条件**：在金融、医疗等场景下，"Agent 做了什么"是审计的核心。OpenTelemetry 的结构化 trace 比非结构化日志更适合生成审计报告。
2. **异常检测需要 agent 行为的 baseline**：建议在生产初期先积累 2-4 周的正常行为数据，再开启异常检测规则，避免初期误报率过高。
3. **提示词注入的检测窗口极短**：恶意提示词注入往往在单次调用内完成，要求安全检测具备实时性。如果当前方案是异步分析，则需要评估是否需要额外的 real-time guardrail 层。

## 参考
- 演示示例：https://sls.aliyun.com/doc/playground/cmsdemo.html
- CMS 2.0 控制台：https://cmsnext.console.aliyun.com/
## 相关实体
- [Hermes Agent Operator上手 把一个 Agent 养成可运营系统 若飞](../ch03/092-hermes-agent.html)
- [Hermes Agent Memory System Vs Openclaw](../ch03/092-hermes-agent.html)
- [Hermes Agent Vs Openclaw Comparison](../ch03/092-hermes-agent.html)
- [Hermes Agent Self Evolving Source Analysis](../ch03/092-hermes-agent.html)
- [Small Hermes Self Evolving Agent Architecture](../ch03/046-agent.html)
- [opentelemetry ebpf instrumentation (obi) — 零代码全栈可观测性的内核级实现](../ch01/885-20.html)

---

