---
title: 你的 AI Agent 真的在受控运行吗？
source_url: https://mp.weixin.qq.com/s/Se0zFNDdwIQ5d2ahEg6Qmw
source: wechat
publish_date: 2026-04-28
tags: [wechat, article, claude, agent, openclaw]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: 4cfaf7cc103427572676d7559afed005f05c722951df402d2017abfa7b8acd84
---

## 一、为什么必须回答「Agent 真的在受控运行吗？」
「受控」至少包含四件事：
1. 谁在触发调用
2. 花了多少钱
3. 做了哪些操作（尤其是高危工具）
4. 行为是否可追溯、可审计
**AI Agent 与传统后端服务的本质差异**：行为是非确定的。同样的用户输入，模型可能产生完全不同的工具调用序列，无法通过代码审查预判所有行为路径。
### 1.1 行业安全事件：Summer Yue 案例
Meta 超级智能实验室 AI 对齐总监 Summer Yue 给 OpenClaw 下达清理邮件指令并设置"未经批准不得操作"限制，但上下文窗口压缩机制导致关键安全指令被"遗忘"，大量邮件被永久删除。
### 1.2 代码审计数据（OpenClaw 60 天）
- 时间范围：2026-01-05 至 2026-03-05
- 总 commits：14,254 个
- 日均安全修复：约 2.45 个
- Critical + High 合计 50 个，占比 34%
- **风险集中点**：`tools/` + `gateway/` 合计 61%（对应"能执行什么"与"谁来调"两条主线）
---
## 二、运行时防护的固有局限
OpenClaw 提供的预防性控制（Preventive Controls）：
- 工具策略管道（Tool Policy Pipeline）：调用前做策略决策
- Owner-only 封装：敏感操作权限绑定
- 循环检测器：识别无进展会话
- 命令 allowlist/denylist：限制可执行命令集合
**局限**：同信任域内的执行时校验，无法覆盖未知绕过与逻辑性误用。
**结论**：运行时防护相当于"城墙"，需要可观测作为"哨兵"互补。
---
## 三、可观测三支柱与全景架构
### 3.1 三支柱在 AI Agent 场景的映射
| 类型 | 回答的问题 |
|------|-----------|
| **Logs（Session 审计日志）** | Agent 做了什么？调了哪些工具？传了什么参数？花了多少钱？ |
| **Logs（应用运行日志）** | 系统哪里出了问题？Webhook 失败、认证被拒、网关异常？ |
| **Metrics** | 现在花了多少钱？延迟正常吗？有没有会话卡死？ |
| **Traces** | 单条消息从接收到响应经历了哪些步骤？调用链如何串起来？ |
### 3.2 数据 Pipeline
OpenClaw Gateway 三个独立数据生产者：
1. **SessionManager**：每轮对话完整结构化数据 → 磁盘 JSONL 文件
2. **tslog Logger**：应用运行日志
3. **diagnostics-otel 插件**：通过 OTLP/HTTP 直接推送 Metrics + Traces 到 OTLP 兼容后端
### 3.3 数据源对照表
| 数据类型 | 生产者 | 导出方式 | 用途 |
|---------|-------|---------|------|
| Session 审计日志 | SessionManager | JSONL 文件 → 日志采集器 | 安全审计、成本归因、行为分析 |
| 应用运行日志 | tslog Logger | JSONL 文件 → 日志采集器 | 运维排障、安全事件 |
| Metrics + Traces | diagnostics-otel | OTLP/HTTP 直推 | 实时监控、告警、链路追踪 |
### 3.4 为什么选阿里云 SLS
- OTLP 友好接入（LoongCollector 原生支持 OTLP）
- SPL 算子丰富，对 Session 日志 JSON 嵌套字段解析便捷
- 安全与合规：日志访问审计、RAM 权限管控、敏感数据脱敏
- 告警可对接钉钉、短信、邮件
---
## 四、Session 审计日志：行为链还原与威胁检测
### 4.1 数据格式
每个会话对应一个 `.jsonl` 文件，每行是一个 JSON 对象，通过 `type` 字段区分条目类型。
**典型日志序列**（用户请求读取系统文件）：
```json
// 用户消息
{"type": "message", "id": "70f4d0c5", "parentId": "b5690259", "message": {"role": "user", "content": [{"type": "text", "text": "帮我读取 /etc/passwd 文件"}]}}
// Assistant 回复（含工具调用）
{"type": "message", "id": "3878c644", "parentId": "70f4d0c5", "message": {"role": "assistant", "content": [{"type": "toolCall", "id": "call_d46c7e2b...", "name": "read", "arguments": {"path": "/etc/passwd"}}], "provider": "anthropic", "model": "claude-4-sonnet", "usage": {"totalTokens": 2350}, "stopReason": "toolUse"}}
// 工具执行结果
{"type": "message", "id": "81fd9eca", "parentId": "3878c644", "message": {"role": "toolResult", "toolCallId": "call_d46c7e2b...", "toolName": "read", "content": [{"type": "text", "text": "root:x:0:0:root:/root:/bin/bash..."}], "isError": false}}
// Assistant 最终回复
{"type": "message", "id": "a025ab9e", "parentId": "81fd9eca", "message": {"role": "assistant", "content": [{"type": "text", "text": "文件 `/etc/passwd` 的内容如下..."}], "usage": {"totalTokens": 12741, "cost": {"total": 0.0401}}, "stopReason": "stop"}}
```
### 4.2 核心审计场景
#### 场景一：敏感数据外泄检测
```sql
type: message and message.role : toolResult
  | extend content = cast(json_extract(message, '$.content') as array<json>)
  | project content | unnest
  | extend content_type = json_extract_scalar(content, '$.type'), content_text = json_extract_scalar(content, '$.text')
  | where content_type = 'text' | project content_text
  | where content_text like '%BEGIN RSA PRIVATE KEY%' or content_text like '%password%' or content_text like '%ACCESS_KEY%' or regexp_like(content_text, 'LTAI[a-zA-Z0-9]{12,20}')
```
#### 场景二：Skills 调用审计
```sql
type: message and message.role : assistant and message.stopReason : toolUse
  | extend content = cast(json_extract(message, '$.content') as array<json>)
  | project content, timestamp | unnest
  | extend content_type = json_extract_scalar(content, '$.type'), content_name = json_extract_scalar(content, '$.name'), skill_path = json_extract_scalar(content, '$.arguments.path')
  | project-away content
  | where content_type = 'toolCall' and content_name = 'read' and skill_path like '%SKILL.md'
  | stats cnt = count(*), latest_time = max(timestamp) by skill_path | sort cnt desc
```
#### 场景三：高危工具调用监控
```sql
type: message and message.role : assistant and message.stopReason : toolUse
  | extend content = cast(json_extract(message, '$.content') as array<json>)
  | project content, timestamp | unnest
  | extend content_type = json_extract_scalar(content, '$.type'), content_name = json_extract_scalar(content, '$.name'), content_arguments = json_extract(content, '$.arguments')
  | project-away content
  | where content_type = 'toolCall' and content_name in ('exec', 'write', 'edit', 'gateway', 'whatsapp_login', 'cron', 'sessions_spawn', 'sessions_send', 'spawn', 'shell', 'apply_patch')
```
**高危工具分类**：
- **Gateway HTTP 默认禁止**：`exec`, `shell`, `apply_patch` 等
- **ACP 必须显式审批**：`sessions_spawn`, `sessions_send`, `whatsapp_login`, `cron` 等
#### 场景四：成本分析
```sql
type: message and message.role : assistant
  | stats totalTokens = sum(cast("message.usage.totalTokens" as BIGINT)),
            inputTokens = sum(cast("message.usage.input" as BIGINT)),
            outputTokens = sum(cast("message.usage.output" as BIGINT)),
            cacheReadTokens = sum(cast("message.usage.cacheRead" as BIGINT)),
            cacheWriteTokens = sum(cast("message.usage.cacheWrite" as BIGINT))
    by "message.provider", "message.model"
```
### 4.3 审计大盘设计
- **安全审计统计概览**：高危命令执行数、网页请求外发数、命令行外发数、通信工具外发数、敏感文件访问数、提示词注入事件数
- **Token 分析大盘**：今日 vs 昨日环比、按 Provider/Model 时序趋势、Top 消耗会话、按主机分摊
- **行为分析大盘**：工具调用类型分解、错误率趋势、外部交互记录
---
## 五、应用日志：系统运行状态与安全事件
### 5.1 数据格式
OpenClaw Gateway 使用 tslog 库写结构化 JSONL 日志：
```json
{"0": "{\"subsystem\":\"gateway/channels/telegram\"}", "1": "webhook processed chatId=123456 duration=2340ms", "_meta": {"logLevelName": "INFO", "date": "2026-02-27T10:00:05.123Z", "name": "openclaw", "path": {"filePath": "src/telegram/webhook.ts", "fileLine": "142"}}, "time": "2026-02-27T10:00:05.123Z"}
```
### 5.2 按子系统的错误聚合分析
```sql
_meta.logLevelName: ERROR or _meta.logLevelName: WARN or _meta.logLevelName: FATAL
  | project subsystem = "0.subsystem", loglevel = "_meta.logLevelName"
  | stats cnt = count(1) by loglevel, subsystem
  | sort loglevel
```
### 5.3 典型安全审计场景
| 场景 | subsystem | 告警关键词 |
|------|-----------|-----------|
| WebSocket 未授权连接 | `gateway/ws` | `unauthorized`, `token_mismatch` |
| HTTP 工具调用被拒/失败 | `tools-invoke` | `EACCES`, `permission denied` |
| 连接/请求处理失败 | `gateway` | `Connection reset`, `Invalid JSON` |
| 设备权限升级 | `gateway` | `role-upgrade`, `roleTo=owner` |
| FATAL 核心异常 | 任意 | `bind`, `config`, `listen` |
---
## 六、OTEL 遥测：实时监控与告警
### 6.1 接入配置
```json
{
  "plugins": {
    "allow": ["diagnostics-otel"],
    "entries": {
      "diagnostics-otel": {"enabled": true}
    }
  },
  "diagnostics": {
    "enabled": true,
    "otel": {
      "enabled": true,
      "endpoint": "<YOUR_OTLP_ENDPOINT>",
      "protocol": "http/protobuf",
      "headers": {"Authorization": "Bearer <YOUR_TOKEN>"},
      "serviceName": "openclaw-gateway",
      "traces": true,
      "metrics": true,
      "logs": false,
      "sampleRate": 1.0,
      "flushIntervalMs": 60000
    }
  }
}
```
### 6.2 导出指标与 Span
| 类别 | 指标 |
|------|------|
| **成本与用量** | `openclaw.cost.usd`, `openclaw.tokens`, `openclaw.run_duration_ms` |
| **Webhook 处理** | `openclaw.webhook.received`, `openclaw.webhook.error`, `openclaw.webhook.duration_ms` |
| **消息队列** | `openclaw.queue.depth`, `openclaw.queue.enqueue`, `openclaw.queue.dequeue`, `openclaw.queue.wait_ms` |
| **会话管理** | `openclaw.session.stuck`, `openclaw.session.count` |
### 6.3 核心告警规则
```sql
# Token 消耗增速
sum(rate(openclaw_tokens[10m]))
# Token 消耗趋势（按模型）
sum(rate(openclaw_tokens[5m])) by (openclaw_model)
# 卡死会话（告警 > 0）
sum(rate(openclaw_session_stuck[5m]))
# 执行耗时 P95（告警 > 5 分钟）
histogram_quantile(0.95, sum(rate(openclaw_run_duration_ms_bucket[5m])) by (le))
# Webhook 错误率（告警 > 5%）
sum(rate(openclaw_webhook_error[5m])) / sum(rate(openclaw_webhook_received[5m]))
# 队列深度（按 lane）
histogram_quantile(0.95, sum(rate(openclaw_queue_depth_bucket[5m])) by (le, openclaw_lane))
```
---
## 七、多源联动：异常发现到根因定位
典型排查路径：
```
OTEL Metrics 发现异常（延迟飙升/Token 激增/错误率突增）
  → 应用日志定位时间窗口错误详情（Webhook 超时/认证失败/网关异常）
    → Session 审计日志还原完整工具调用序列、模型交互内容与成本消耗
      → 确认根因并留存审计证据
```
---
## 八、总结
回答「Agent 真的在受控运行吗」需要同时回答四件事：
1. 谁在触发调用
2. 花了多少钱
3. 做了哪些操作（尤其是高危工具）
4. 行为是否可追溯、可审计
**三条核心数据管道**：
- **Session 审计日志**：回答「Agent 做了什么、花了多少」→ 安全审计、成本归因、行为分析
- **应用日志**：回答「系统哪里异常」→ 网关层面风险信号
- **OTEL 指标与链路**：回答「当前状态与耗时」→ 实时告警
只有三源联动，才能形成可查证的审计与运维闭环——AI Agent 从"能用"走向"可信赖"的必经路径。
---
*整理自阿里云开发者，2026年3月13日*