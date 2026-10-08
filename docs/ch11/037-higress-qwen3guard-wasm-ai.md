# Higress Qwen3Guard Wasm 插件：把 AI 内容安全做进网关数据面

> 📊 Level ⭐⭐⭐ | 14.2KB

## 概述

阿里云云原生以 Higress 项目为载体的开源 Wasm 插件，将 Qwen3Guard-Gen 安全审核模型接入 AI 网关数据面主链路。插件在**请求进入模型前**审核用户输入、在**模型返回后**审核非流式 JSON 或 SSE 流式输出，把内容提取、安全外呼、风险决策、流式缓冲和拒答整形放进请求与响应真正经过的路径——业务零改造（不改应用代码、不改上游模型服务、沿用 Chat Completions 协议），安全模型按官方方式自托管、独立扩缩容，风险阈值与拒答文案由网关统一配置。

这是「AI 网关安全护栏」从**设计原则**走向**数据面执行**的落地层：相比 [安全护栏的三域演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aliyun-cloud-native-safety-guardrails-three-domains.md) 抽象出的系统级设计模式（声明式/旁路/梯度响应/可观测/分层继承），本文提供的是把这些原则在 Envoy 数据面用 Wasm 插件逐条实现的具体工程。

## 双路审核：请求侧 + 响应侧

风险来源双向（用户输入 + 模型输出）。插件默认启用 `checkRequest` 与 `checkResponse`：

- **请求侧**：按 `maxBodyBytes` 缓冲请求体，用 GJSON Path `messages.@reverse.0.content` 取最后一条消息 content，按 Qwen3Guard-Gen 官方 Prompt Moderation 形态构造请求；命中 `riskLevelBar` 阈值直接返回拒答、不调用原模型（避免被拦截请求占用原模型推理资源），未命中才恢复转发。
- **响应侧**：HTTP 200 非流式响应缓冲完整 JSON，经 `choices.0.message.content` 提取，按 Response Moderation 提交（保留"问题+回答"对话关系，请求文本提取失败则仅审核 assistant 回复）；只处理 HTTP 200，其余状态码放行；启用响应检测时移除 `Accept-Encoding` 避免压缩响应无法提取。

## SSE 流式审核：双状态缓冲 + 分段送检

插件识别 `Content-Type: text/event-stream`，解析 SSE 事件边界与 `data:` 载荷，经 `choices.0.delta.content` 收集新增文本，维护**完整累计回复**与**自上次检查后的新增文本**两份状态，达 `streamBufferChars`（默认每 1000 个 Unicode 字符，按 UTF-8 rune 计）触发下一次检查。命中风险后只能丢弃尚未释放的数据并追加拒答 SSE——已发出的状态码和历史片段无法追回，因此**流式拦截时 denyCode 不生效**。

**关键边界**：当前实现是"网关分段缓冲 SSE + 重复调用 Qwen3Guard-Gen 审核累计文本"，**不是** Qwen3Guard-Stream 的原生逐 token 分类。Gen 反复处理累计文本产生重复计算；Stream 通过专用分类头和流状态避免重复处理历史 token。文章明确不把 Gen 能力包装成 Stream。

## 执行阶段与优先级：和 ai-proxy 的排序

phase 与 priority 由 WasmPlugin 资源决定（插件代码不声明），须在 CR 显式写清。阶段先比阶段，同阶段 priority 数值越大越先执行。推荐 qwen3guard 用默认阶段 + `priority: 300`：请求侧先于 ai-proxy 执行（看到应用发来的原始 OpenAI 请求体），响应侧 Envoy 按相反顺序穿过过滤器、在 ai-proxy 之后执行（看到已归一化为 OpenAI 格式的响应），从而三个 GJSON Path 能直接命中。若调整相对顺序，需同步调整三个 Path 匹配实际看到的报文结构。

## 服务发现与部署

Qwen3Guard 推理服务不嵌入网关进程，插件经 Higress Wasm Go SDK 构建 Envoy 外呼 cluster，支持四种 `serviceSource`（含 k8s 与 dns）。网关只依赖一个可访问的 OpenAI-compatible HTTP 服务，安全模型可独立扩缩容。产物导出 Proxy-Wasm ABI 0.2.100，需支持该 ABI 的 Higress 数据面镜像。部署三步：编译 Wasm 产物（`make local-build`/`build`/`build-push`）→ 让数据面取到产物 → 用 WasmPlugin 下发配置。

## fail-open：保护可用性 vs 风险窗口

安全服务超时/不可达/异常格式时插件 **fail-open**：记录警告并放行当前请求/响应，避免 Qwen3Guard 故障阻断全部 AI 业务。fail-open 降低了对可用性的影响，但失败窗口内不产生拦截，因此生产必须监控 Qwen3Guard 可用率/时延/非 200/插件警告日志。强制 fail-close 的合规场景当前版本不满足。Safety 为未知字符串时应解析失败并 fail-open，而非把未知标签猜成风险结果。

## 验收要点与工程陷阱

- **拒答默认 denyCode 是 200**：客户端不能只靠 HTTP 非 200 识别拦截，须看拒答内容或 `model: from-security-guard`。
- **"服务已启动"≠"网关数据面已可达"**：DNS/cluster 名/K8s 命名空间/出口网络/白名单/鉴权须从 Envoy 所在网络验证，而非开发机。
- 三个 JsonPath 字段实为 GJSON Path 语法（不加 `$` 前缀）；apiKey 填原始值（插件自动加 Bearer 前缀）。
- 上线前按「安全服务 → 网关外呼 → 插件策略 → 业务协议」四层逐级检查；调参顺序先内容路径/网络链路 → 阈值策略 → streamBufferChars/maxBodyBytes → timeoutMs。
- 安全配置可能含 apiKey，勿提交仓库；HTTP wrapper 在特定日志级别可能打印外呼 headers，生产需日志脱敏或组件日志控制在 warn。

## 深度分析

### 为什么内容安全属于网关数据面，而不是应用层

文章给出的核心论据是经济性而非技术炫耀：风险来源是双向的（用户输入 + 模型输出），如果每个应用各自维护审核 SDK、阈值和拒答逻辑，安全策略会散落在多个代码仓库，模型切换或策略升级时业务需要重复改造。网关是调用者与模型服务之间的必经路径，把审核放在这里意味着多个应用复用同一套接入与阈值，且业务零改造——不改应用代码、不改上游模型服务、沿用 Chat Completions 协议。这与 [安全护栏的三域演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aliyun-cloud-native-safety-guardrails-three-domains.md) 中"分层继承"的原则形成闭环：原则层说明为什么要收口，本文则展示了收口点具体选在 Envoy 过滤器链的哪个位置。选择 Wasm 插件而非修改 Envoy C++ 核心，是数据面扩展性的标准折衷——获得动态下发（WasmPlugin CR、matchRules 按路由生效）的能力，代价是受限于 Proxy-Wasm ABI 版本（0.2.100）。

### 流式审核的时延/覆盖权衡：窗口大小的三重代价

`streamBufferChars`（默认每 1000 个 Unicode 字符）的取值不是性能调优细节，而是三重权衡的支点：窗口越小，检查越频繁、Qwen3Guard 调用次数越多、端到端时延越高，但风险暴露的字节数越少；窗口越大则调用下降、吞吐更好，但两次检查之间可能有更多风险内容已经流出网关。文章没有回避这个方案的另一半代价：当前实现是"网关分段缓冲 SSE + 重复调用 Gen 审核累计文本"，Gen 模型反复处理累计文本产生重复计算，与 Qwen3Guard-Stream 原生逐 token 分类（专用分类头 + 流状态，避免重复处理历史 token）在计算复杂度上不可同日而语——作者明确拒绝把 Gen 能力包装成 Stream。这本质上是把"截断不可撤销"的流式语义强行套进"整体判断"的审核模型：命中风险后只能丢弃未释放数据并追加拒答 SSE，已发出的状态码和历史片段无法追回，所以流式拦截时 denyCode 根本不生效。同类"guardrail 放置位置 vs 流式时延"的权衡在 [LiteLLM + Bedrock Guardrail 的放置与流式时延分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/litellm-bedrock-guardrail-placement-streaming-latency-2026.md) 中独立出现过，说明这是流式安全审核的通用难题，而非 Higress 特有缺陷。

### fail-open 是策略决策，不是工程默认

插件在安全服务超时/不可达/异常格式时 fail-open（记录警告并放行），理由是避免 Qwen3Guard 故障阻断全部 AI 业务。但文章的措辞值得注意："降低了对可用性的影响"被陈述为事实，而"失败窗口内不产生拦截"被同样诚实地列为后果，强制 fail-close 的合规场景当前版本不满足。这说明 fail-open 在这里是**显式的可用性优先决策**，附带一个隐含契约：运维必须用监控补上风险窗口——Qwen3Guard 可用率/时延/非 200/插件警告日志缺一不可。一个容易忽视的设计细节强化了这个立场：Safety 字段为未知字符串时应解析失败并 fail-open，而不是把未知标签猜成风险结果——宁可放行也不基于捏造的判断拦截，这是"不猜测模型结果"原则在失败路径上的对称应用。

### 能力边界：插件解决"执行"，不解决"策略"

当前插件可解析 Safety/Categories/Refusal 三级结果，但真正参与放行决策的只有 Safety 与 riskLevelBar，尚未实现按类别（暴力/PII/政治敏感等）配置不同动作。也就是说，这个方案把"判断"外包给了 Qwen3Guard，把"执行"收进了网关，而"差异化策略"仍然是空白——所有命中一律同等处理。对需要梯度响应（不同风险等级不同动作）的场景，[三域演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aliyun-cloud-native-safety-guardrails-three-domains.md) 中抽象出的梯度响应模式在此实现中尚未落地，这是评估该方案能否直接复用时的关键检查项。

## 实践启示

1. **安全策略收口到网关，而不是复制到每个应用**：只要团队有多个应用调用 LLM，把审核放数据面的边际成本就低于逐应用维护 SDK——前提是流量走网关这一假设成立。
2. **流式审核不存在"免费"方案**：`streamBufferChars` 调小换覆盖、调大换时延，Gen 重复送检还有额外算力成本；对逐 token 级安全要求，应评估 Qwen3Guard-Stream 路线而非调参 Gen。
3. **接受 fail-open 就必须监控风险窗口**：上线时同步建立 Qwen3Guard 可用率/时延/非 200/插件警告日志的监控；合规要求 fail-close 的业务当前版本直接不满足，别硬套。
4. **插件 phase/priority 必须在 CR 显式声明**：推荐默认阶段 + priority 300，让请求侧先于 ai-proxy（看到原始 OpenAI 请求体）、响应侧在其后（看到归一化响应）；调整顺序就要同步调整三个 GJSON Path，否则提取静默失败。
5. **验收只看客户端 200 会得出错误结论**：默认拒答状态码本身也是 200，必须交叉验证原模型是否真的收到请求、Qwen3Guard 调用次数和 Wasm 警告日志。
6. **安全模型的故障域要与业务隔离**：Qwen3Guard 独立部署、独立扩缩容（四种 serviceSource），"服务已启动"≠"网关数据面已可达"，网络可达性要从 Envoy 所在网络验证而非开发机。

## 关系

- 与 [安全护栏的三域演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aliyun-cloud-native-safety-guardrails-three-domains.md) 是**同平台（阿里云 AI 网关安全）不同层**：该实体是设计原则/框架，本文是数据面执行实现，互补互链。
- 与 [AI Gateway vs MCP Gateway 安全分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-gateways-vs-mcp-gateways-what-security-teams-need-to-know.md) 同处"网关层安全"维度。
- Qwen3Guard 是通义千问家族首款专为安全分类设计的护栏模型（Gen/Stream 两路线），本文实现其 Gen 路线的网关接入。

→ [原文存档](https://mp.weixin.qq.com/s/FolCzOk-nnB52CLvUan41w)

---

