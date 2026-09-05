---
source_url: https://mp.weixin.qq.com/s/rKc0ny3nB_w-RWeTiDkK0Q
ingested: 2026-08-06
sha256: 73dcd7126795826bc1256039359f9fd9c09cfdd6014c48200f5d3a2ef40039d3
title: "Claude 新增推理钩子（Inference Hooks）：面向 DLP 企业数据泄露拦截"
author: Vibe编码
source: Vibe编码
type: raw
tags: [claude-enterprise, inference-hooks, dlp, security, governance, anthropic]
---

# Claude 新增推理钩子（Inference Hooks）：面向 DLP 企业数据泄露拦截

> 原始来源：https://mp.weixin.qq.com/s/rKc0ny3nB_w-RWeTiDkK0Q
> 作者：Vibe编码（2026-08）

## 核心机制

Claude Enterprise 新增 Inference Hooks。员工在 Chat、Cowork 或 Claude Code 里提交请求后，Anthropic 会暂停这次推理，把会话转录交给企业自己的安全服务器。安全服务器返回 allow，模型才开始工作；返回 deny，内容会在进入模型前被挡住。这道门覆盖了企业 API Gateway 经常看不到的员工直用流量。

**控制点位置**：企业过去常在自建应用前部署 LLM Gateway（鉴权、审计、DLP），但员工直接登录 claude.ai 或 Claude Code/Cowork 工作时请求未必经过网关。Inference Hooks 把控制点放进 Anthropic 服务端：请求已离开用户设备、Claude 模型还没运行。组织级配置覆盖多种 Claude 第一方入口，管理员不用在每台电脑安装拦截程序。安全架构语言：**Claude 充当 Policy Enforcement Point（PEP），企业的 AI security server 充当 Policy Decision Point（PDP）**。

一次请求链路：Anthropic 判断用户角色、排除规则和灰度比例 → 向企业端点发送签名 HTTPS POST → 企业端验签、去重并运行策略 → 合法 verdict 决定放行或阻断。拒绝会显示安全服务器提供的原因，并写入 Activity Feed。

## 文档不一致问题

8 月 5 日发布博客写的是 signed WebSocket，还称每次工具调用的响应会在回到模型前接受检查；同一篇博客后面又把协议称为 webhook-based。当前接入文档给出的可执行合同是 HTTPS POST（签名遵循 Standard Webhooks）；总览文档明确写着今天只有 prompt 事件（每个受治理的推理请求触发一次），响应侧事件以后再提供。两套描述无法用于同一个实现。当前 prompt 帧能携带先前的 tool_use/tool_result，因此工具结果可能在下一次推理前被策略服务看到，但这不等于工具响应拥有单独的拦截事件。

## 企业服务器会收到什么

prompt 帧顶层包含 request_id、tenant_id、actor、source、messages、session_id、model 和预留 metadata。request_id 与请求头 webhook-id 相同，可作为幂等键；source.application 已知值包括 claude-ai、claude-code 和测试用的 config-test。

messages 是用户可见的完整会话，内容块当前有四类：文本、工具调用、工具结果、附件。附件只给文件名、媒体类型、大小和可提取文本（PDF 抽取文字或音频转录）。**系统提示、工具定义、Claude 的隐藏推理、原始文件和图片字节都不会发送**——截图里的机密表格若没有 OCR 文本，策略服务看不到像素；工具返回的二进制图片也只有占位标记。**Inference Hooks 无法单独承担全模态 DLP。**

会话转录不截断，单次请求上限可到 10 MB。nginx 常见默认 body limit 是 1 MB，Express JSON parser 常见默认只有 100 kB——中间层拒绝大请求会被算成 webhook failure；组织选择 fail-open 时，这次请求可能未经检查就进入模型。

## 协议细节

- **放行**：`{"action":"allow"}`
- **阻断**：`{"action":"deny","deny_reason":"...","reference_id":"scan_01HXPT4R9V"}`（deny_reason 最多 500 字符直接显示给用户；reference_id 最多 50 字符关联企业扫描记录与 Activity Feed）
- allow/deny 都必须返回 HTTP 200；403/422/500/重定向/无法解析 JSON 都属 webhook failure 转交 failure handling
- Anthropic 最多读取 64 KiB 未压缩响应体
- **请求真实性**依赖三个头：webhook-id、webhook-timestamp、webhook-signature。签名内容是 ID、时间戳和原始 body 字节的拼接，算法 HMAC-SHA256。验签前解析 JSON 再重新序列化会改变字节导致签名失败；whsec_ 后的密钥要用标准 Base64 解码，不能用 URL-safe Base64；时间戳允许前后五分钟误差；签名比较要使用常量时间函数
- 官方公布调用源地址段 160.79.106.0/24，可加 allowlist，但该网段还承载 Anthropic 其他出站流量——IP 限制不能代替验签
- **密钥轮换坑**：后台生成新 secret 后立即切换，没有新旧双签过渡期；旧 secret 签名的在途请求仍可能在一分钟左右到达。安全服务器要短暂同时接受两把密钥，等在途请求排空后再移除旧值。新 secret 只展示一次，轮换必须和配置中心、值班人员及回滚流程一起安排

## 接入配置

需要 Claude Enterprise 和 organization:manage 权限。Organization settings → Data and privacy 中允许 Inference Hooks，配置公网可达的 HTTPS 443 端点（证书公共 CA 信任、URL 不能重定向）。最多 16 个静态请求头（值加密保存不再展示，更换 URL 会清空）。保存前可用合成 prompt 测试连接；首次保存生成只展示一次的 signing secret。故障策略：fail-open（端点失败时请求继续）/ fail-closed（阻断）；超时 1-10,000ms 默认 5,000ms（含连接、TLS、上传、判定、响应全部时间）。

Anthropic 只在连接失败时重试一次（等待 100ms，与原请求共享总预算、ID 和签名）。持续失败触发熔断，Anthropic 停止调用企业端点，随后所有受检查请求按 fail-open/fail-closed 处理；修复后管理员需重新打开 Enforce verdicts。

**上线顺序**：Shadow mode 起步（真实流量到达策略服务，deny 和故障都不影响用户）→ 误报率和延迟稳定后 → Requests inspected 从低比例逐步放量（抽样按每一轮请求独立进行，同一会话可能部分轮次检查、部分绕过）。角色排除只适合企业自建 custom roles（内置角色不会出现在列表）；机器凭据流量始终接受检查；Anthropic 无法解析请求者角色时请求被拦住并返回可重试错误。

管理页面显示 Healthy、Tripped、近两分钟失败均值、block rate 和最近错误（best-effort 计数）。企业端仍需独立监控请求量、P95/P99 延迟、验签失败、旁路次数、证书到期和熔断恢复。

## 适用场景与边界

**最直接用途是 DLP**：在客户数据、支付信息、密钥或受监管材料进入模型前阻断。也可始终返回 allow 把 transcript 推送到实时归档系统（应先回 verdict 再异步写存储，别把 SIEM 和对象存储拖进首 token 延迟）。还能做 prompt telemetry、模型 allowlist、项目范围和工作时间规则。

对 Claude Code/Cowork 这类多轮 Agent，策略服务会反复进入推理关键路径，几十毫秒会随工具循环累积——应按生产网关等级建设：多可用区、容量压测、证书与 DNS/TLS 监控、幂等存储、签名密钥轮换、可追踪的未检查放行。

**与 Compliance API 分工**：Inference Hooks 在推理前做实时准入（Anthropic → 企业服务器）；Compliance API 由企业事后拉取活动、聊天、文件、项目和用户。安全服务器返回的 reference_id 会进入拒绝活动，两边记录可连起来用于调查、申诉和规则调优。实时阻断 + 事后审计才构成完整治理闭环。

**能力盲区**：当前不能改写或自动脱敏 prompt、没有独立模型输出事件、看不到图片像素与原始二进制、不覆盖 Claude Platform API 组织、Amazon Bedrock、Google Cloud 和 Voice mode。危险命令、文件与网络权限仍要交给 Agent sandbox、Claude Code 本地 hooks 和权限系统。

## 总结

Inference Hooks 给企业增加了一个很硬的推理前控制点，也把安全服务器变成了组织级同步依赖。接入难点不在 allow/deny 两行 JSON，真正费功夫的是原始字节验签、10 MB 长请求、低延迟、误报治理、熔断恢复，以及 fail-open/fail-closed 的取舍。当前 beta 还谈不上完整的输入输出安全层——适合已有 DLP 与策略平台的 Claude Enterprise 组织补齐员工直用第一方产品的入口；没有成熟安全后端的团队，需要先把判定、申诉和高可用链路建好再打开全量强制执行。

（End）
