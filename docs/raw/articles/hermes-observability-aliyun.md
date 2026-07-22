---
title: 给 Hermes 装上显微镜：Agent 执行全知道
source_url: https://mp.weixin.qq.com/s/XQqbHr7EjH906vQhX8b6Cw
publish_date: 2026-04-27
tags: [wechat, article, agent]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 7802ca9dff6aff47d3c54f2af6aeaa1109e05ec0b1b3119ad7432250b290e095
---
# 给 Hermes 装上显微镜：Agent 执行全知道
**作者：** 蔡世鹏（流屿）
**来源：** 阿里云云原生
**发布时间：** 2026年4月26日 10:02 浙江
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
## 参考
- 演示示例：https://sls.aliyun.com/doc/playground/cmsdemo.html
- CMS 2.0 控制台：https://cmsnext.console.aliyun.com/