---
title: "交易 VOC 自动排查：基于 Hermes 的多 Agent 架构实践"
source_url: "https://mp.weixin.qq.com/s/7zZMm-dkXhN8NXuGuUdqfQ"
author: "信息业务中心"
source: "高德技术（微信公众号）"
ingested: 2026-07-09
sha256: placeholder
review_value: 8
review_confidence: 8
review_stars: 4
---

高德技术使用 Hermes Agent 构建多 Agent 架构实现交易 VOC（Voice of Customer）自动排查系统。

一、背景

VOC 排查困境：分诊靠经验、排查靠人肉、知识靠口口相传。目标：智能体承担一线分诊+自动排查+结论输出。零后端编排代码落地。

二、技术选型：Hermes Agent

选择 Hermes 的原因：多通道接入、会话与上下文管理、Skill 体系、Memory+Curator（自进化）、Hook 扩展点、API Server（暴露为 OpenAI 兼容接口）。

关键设计：每个 Hermes 实例既是对话机器人，也可作为标准 HTTP 服务被其他 Agent 调用。主 Agent 调用专家 Agent = 发起 OpenAI 格式 HTTP 请求。

三、整体架构

主从职责分离：
- 主调度 Agent（首席调度官）：意图分析→领域判定→任务分发→结果汇总。不推断根因，只负责路由。
- 领域专家 Agent：每个专家是独立部署的 Hermes 实例，内置该领域排查工具链（MCP、日志查询、状态机等）。

通信协议：OpenAI 兼容，POST /v1/chat/completions，SSE 流式返回。

四、领域路由

主调度 Agent 核心能力：将非标准化模糊描述转为准确领域定位。定义在 SOUL.md（角色人设+工作流+路由规则）+ voc-troubleshooting Skill 中。

领域划分：商品、货架、供应链、交易、支付/履约、营销、直连。非技术问题直接回复，不进入排查。

路由精细化案例——酒店问题："看不到/进不去/订不了"→货架；"信息不对"→商品；"下单/支付失败"→交易。

五、生产级多 Agent 协作

1. 动态寻址：沙箱重建地址漂移→实例注册表动态解析，调用方无感
2. 安全隔离：一专家一密钥，最小权限隔离
3. 异步长任务：后台异步执行+流式接收+完成回调
4. 优雅降级：全部专家不可用→输出结构化"人工排查摘要"

六、零代码两级角色管控

Hermes slash命令访问控制：管理员白名单 vs 普通用户白名单。仅拦截 slash 命令不影响普通问答。

七、自进化（越用越准）

1. Skill 案例库：references/ 下积累数十个真实案例文档（如 case-voc-ota-refund-delay.md）。模型按需加载，直接命中历史结论排查路径。但知识库命中≠跳过专家——必须调用专家 Agent 给出本次结论。
2. 路由规则随实战进化：真实案例反推（如预付退款延迟、供应商类目混淆）
3. Memory+Curator：长期记住各领域负责人、token 状态、用户偏好
4. 调教闭环：管理员纠正→写入Memory/更新Skill→Curator整理→下次已更新

八、Hook 无侵入定制

严禁直接修改 Hermes 源码。所有定制优先通过 Hook 实现（~/.hermes/hooks/）。

实战 Hook 示例：topic-reset（自动开新会话）、auto-sethome（静默写 home channel）、platform-ack（源码必须改时用 gateway:startup+幂等 patch 脚本）

九、运维

专家健康检查 + 主动告警：check_expert_health.py，cron 每 30 分钟巡检。
全链路审计：所有对话完整记录于 ~/.hermes/sessions/*.jsonl，保留 90 天。
结论闭环：排查结论自动 @ 领域负责人。

十、效果

诊断准确率 86%，实效从小时级/天级→分钟级。
系统由 Markdown（SOUL.md/Skill/Memory）+ 配置 + 少量脚本构成，零后端编排代码。
