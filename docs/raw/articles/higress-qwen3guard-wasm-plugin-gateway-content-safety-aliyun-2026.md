---
title: "Higress 接入 Qwen3Guard：不改一行业务代码，把 AI 内容安全做进网关主链路"
source_url: "https://mp.weixin.qq.com/s/FolCzOk-nnB52CLvUan41w"
source_name: "阿里云云原生"
author: "王建伟(正己)"
ingested: 2026-08-22
sha256: c1aa723158a5d5e40bf5d97aa9e4b0def0b47faa65d7461a79556ab271e313f9
---

# Higress 接入 Qwen3Guard：把 AI 内容安全做进网关主链路

> 来源：阿里云云原生（作者：王建伟/正己，2026-08-22）。Higress 项目以 Wasm 插件形式接入 Qwen3Guard-Gen，实现请求/响应/SSE 流式全覆盖的 AI 内容安全审核，业务零改造、安全模型自托管。

## 三句话总结

- **业务零改造**：不修改应用代码、不改动上游模型服务，应用继续使用 Chat Completions 协议；
- **输入、输出、流式全覆盖**：请求进入模型前审核用户输入，模型返回后审核非流式 JSON 或 SSE 流式输出；
- **安全模型自托管**：Qwen3Guard 按官方方式独立部署和扩缩容，不依赖云端内容安全服务，风险阈值和拒答文案由网关统一配置。

把安全控制放到网关的原因：风险来源双向（用户输入 + 模型输出），若每个应用各自维护审核 SDK/阈值/拒答逻辑，安全策略会散落在多个代码仓库；模型切换或策略升级时业务需重复改造。

## 01 Qwen3Guard 提供判断，Higress 负责执行

Qwen3Guard 是基于 Qwen3 构建的安全审核模型系列（官方仓库/模型卡/技术报告），使用超 119 万条带安全标注的提示词和回复数据训练，提供 0.6B/4B/8B 三种规模，分 Gen 与 Stream 两条技术路线。

本插件默认调用 `Qwen/Qwen3Guard-Gen-4B`：Gen 模型可通过 vLLM 或 SGLang 暴露 OpenAI-compatible `POST /v1/chat/completions` 接口，与 AI 网关协议自然衔接。

Qwen3Guard 输出三级风险；插件将官方三级结果映射为两档网关策略。官方安全策略覆盖暴力、非暴力违法行为、性内容、PII、自杀与自伤、不道德行为、政治敏感主题、版权侵权等类别，输入审核含 Jailbreak 检测。当前插件可解析 Safety/Categories/Refusal，但真正参与放行决策的只有 Safety 与 riskLevelBar；尚未实现按类别配置不同动作。

## 02 一次完整调用怎样被保护

网关是调用者与模型服务的必经路径，多个应用可复用同一套审核接入与阈值。

### 请求侧：先审核，再决定是否访问原模型
插件默认启用 `checkRequest`。按 `maxBodyBytes` 缓冲，用默认 GJSON Path `messages.@reverse.0.content` 取最后一条消息 content，按 Prompt Moderation 形态构造请求（model/messages/max_tokens:128）。命中阈值直接返回拒答、不再调用原模型；未命中才恢复转发。

### 响应侧：结合问题与回答共同判断
默认启用 `checkResponse`。HTTP 200 非流式响应缓冲完整 JSON，经 `choices.0.message.content` 提取，按 Response Moderation 提交（原始用户输入 + 模型回复）。请求文本提取成功则保留"问题+回答"对话关系，失败则仅审核 assistant 回复。只处理 HTTP 200，其余状态码放行；启用响应检测时移除请求的 `Accept-Encoding` 避免压缩响应无法提取。

## 03 SSE 流式回复如何被审核

识别 `Content-Type: text/event-stream`，解析 SSE 事件边界与 `data:` 载荷，经 `choices.0.delta.content` 收集新增文本。维护两份状态：完整累计回复 + 自上次检查后的新增文本，达 `streamBufferChars` 时触发检查（默认每 1000 个 Unicode 字符一次，按 UTF-8 rune 计算）。窗口越小检查越频繁、Qwen3Guard 调用越多；窗口越大调用下降但缓冲更多。命中风险后只能丢弃尚未释放的数据并追加拒答 SSE，已发出的状态码/历史片段无法追回，故流式拦截时 denyCode 不生效。

**重要区分**：当前实现是"网关分段缓冲 SSE + 重复调用 Qwen3Guard-Gen 审核累计文本"，不是 Qwen3Guard-Stream 的原生逐 token 分类。Gen 反复处理累计文本产生重复计算；Stream 通过专用分类头和流状态避免重复处理历史 token。两者不能混为一谈。

## 04 四种服务发现方式，模型服务独立扩缩容

Qwen3Guard 推理服务不嵌入网关进程，插件经 Higress Wasm Go SDK 构建 Envoy 外呼 cluster，支持四种 `serviceSource`。网关只依赖可访问的 OpenAI-compatible HTTP 服务。"服务已启动"≠"网关数据面已可达"——DNS/cluster 名/K8s 命名空间/出口网络/白名单/鉴权仍需从 Envoy 所在网络验证。

## 05 安装与启用：编译、挂载、下发配置

三步：编译 Wasm 产物 → 让数据面取到产物 → 用 WasmPlugin 下发配置。

- 编译：`PLUGIN_NAME=qwen3guard make local-build`（main.wasm）或 `make build`（plugin.wasm）或 `make build-push`（OCI 镜像，REGISTRY 需以 `/` 结尾；不指定 PLUGIN_VERSION 时 tag 退化为"构建时间-commit"，不利于回滚，生产应显式指定）。
- 挂载：`make install-dev-wasmplugin` 走文件挂载路径（设 `global.volumeWasmPlugins=true`）。
- 下发：WasmPlugin CR 配置 `serviceSource/serviceName/servicePort/namespace/requestPath/model/timeoutMs/checkRequest/checkResponse/riskLevelBar`；只对特定 AI 路由生效时关 defaultConfig、用 `matchRules`。

**执行阶段与优先级**：phase 与 priority 由 WasmPlugin 资源决定，插件代码不声明，必须在 CR 显式写清。阶段先比阶段，同阶段 priority 数值越大越先执行。推荐 qwen3guard 用默认阶段 + priority:300：请求侧先于 ai-proxy（看到原始 OpenAI 请求体），响应侧 Envoy 反向穿过滤器、在 ai-proxy 之后（看到归一化 OpenAI 响应）。

**完整配置字段**：serviceSource/serviceName/servicePort/namespace/requestPath/apiKey/model/timeoutMs/checkRequest/checkResponse/requestContentJsonPath/responseContentJsonPath/streamingResponseContentJsonPath/streamBufferChars/riskLevelBar/denyCode/denyMessage/maxBodyBytes。三个 JsonPath 字段实为 GJSON Path 语法（不加 `$` 前缀）；apiKey 填原始值（插件自动加 Bearer 前缀）。产物导出 Proxy-Wasm ABI 0.2.100，需支持该 ABI 的 Higress 数据面镜像。

## 06 部署安全服务并验证链路

- 用 vLLM 启动：`pip install "vllm>=0.9.0"; vllm serve Qwen/Qwen3Guard-Gen-4B --port 8000 --max-model-len 32768`。
- 先验证安全服务本身（curl /v1/chat/completions，返回 `Safety: Safe / Categories: None`），不要一开始把问题归因于网关。
- 验证输入：未命中阈值时继续转发到原模型；命中 Unsafe 时原模型不被调用，客户端收到 `model: from-security-guard` 的拒答。
- 验证 SSE 流式拦截：命中风险后追加拒答 chunk 与 `[DONE]`。
- DNS 接入集群外服务：`serviceSource: dns`，Envoy cluster 名为 `outbound|<port>||<name>.dns`，配 ServiceEntry，serviceName 不要再填 `.dns`。

**不猜测模型结果的验收要点**：安全模型对具体样本的判断以真实返回为准；Safety 为未知字符串应 fail-open 而非猜成风险；流式超 maxBodyBytes 后释放缓冲切直通；上游非 200 跳过输出审核放行。三类边界需单独覆盖。验收同时观察客户端响应、原模型是否收到请求、Qwen3Guard 调用次数、Wasm 警告日志。**只看客户端返回 200 不能证明请求通过了原模型——默认拒答状态码本身也是 200**。

调参顺序：先确保内容路径与网络链路正确 → 阈值策略 → streamBufferChars/maxBodyBytes → timeoutMs。

## 07 上线前检查：四层逐级确认

按"安全服务 → 网关外呼 → 插件策略 → 业务协议"逐层检查。常见故障：非流式响应未审核、SSE 超长后不再审核、测试路由收不到请求体回调。安全配置可能含 apiKey，勿提交仓库；HTTP wrapper 在特定日志级别可能打印外呼 headers，生产需日志脱敏或将组件日志控制在 warn。

## 08 fail-open：保护可用性，也要监控风险窗口

安全服务超时/不可达/异常格式时插件 fail-open：记录警告并放行，避免 Qwen3Guard 故障阻断全部 AI 业务。默认 maxBodyBytes 10 MiB。fail-open 降低了对可用性的影响，但失败窗口内不产生拦截，生产必须监控 Qwen3Guard 可用率/时延/非 200/插件警告日志。强制 fail-close 的合规场景当前版本不满足。

## 结语

Qwen3Guard 提供公开可部署的安全判断能力；Higress Qwen3Guard Wasm 插件完成另一半：从真实 OpenAI-compatible 流量提取内容、调用 Qwen3Guard-Gen、映射为网关动作、处理普通与 SSE 流式协议细节。最终形成可复用的安全链路：用户输入 → 网关前置审核 → 原大模型 → 网关输出审核 → 安全回复或兼容协议的拒答。不要求应用改协议、不把安全逻辑复制到每个业务、不把 Gen 能力包装成 Stream。

## 参考资料
- Qwen3Guard 官方仓库：github.com/QwenLM/Qwen3Guard
- Qwen3Guard-Gen-4B 模型卡：huggingface.co/Qwen/Qwen3Guard-Gen-4B
- Qwen3Guard Technical Report：arxiv.org/abs/2510.14276
- 插件仓库：github.com/higress-group/higress/tree/main/plugins/wasm-go/extensions/qwen3guard
- Qwen 博客：Qwen3Guard: Real-time Safety for Your Token Stream
- Higress 文档：使用 Go 语言开发 Wasm 插件
