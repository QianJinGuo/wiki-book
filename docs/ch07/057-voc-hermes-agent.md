# 高德交易 VOC 自动排查：基于 Hermes 的多 Agent 架构实践

## Ch07.057 高德交易 VOC 自动排查：基于 Hermes 的多 Agent 架构实践

> 📊 Level ⭐⭐ | 7.1KB | `entities/gaode-voc-hermes-multi-agent-auto-triage-2026.md`

# 高德交易 VOC 自动排查：基于 Hermes 的多 Agent 架构实践

高德技术使用 Hermes Agent 构建多 Agent 架构实现交易 VOC（Voice of Customer）自动排查系统。系统由主调度 Agent（首席调度官）+ 多个领域专家 Agent 构成，实现"零后端编排代码"的纯 Agent 生产级系统，诊断准确率 **86%**，排查效率从小时/天级→分钟级。

## 架构设计：主从职责分离

**主调度 Agent（首席调度官）**：只负责路由，不推断根因。核心流程为 意图分析→领域判定→任务分发→结果汇总。定义在 SOUL.md（角色人设+工作流+路由规则）+ voc-troubleshooting Skill 中。

**领域专家 Agent**：每个专家是独立部署的 Hermes 实例，内置该领域排查工具链（MCP、日志查询、状态机等）。主 Agent 调用专家 Agent = 发起 OpenAI 格式 HTTP 请求（POST /v1/chat/completions，SSE 流式返回）。

## 领域路由精细化

主调度 Agent 将非标准化模糊描述转为准确领域定位。覆盖领域：商品、货架、供应链、交易、支付/履约、营销、直连。非技术问题直接回复，不进入排查。

**路由精细化解码示例**（以酒店问题为例）：
- "看不到/进不去/订不了" → 货架领域
- "信息不对" → 商品领域
- "下单/支付失败" → 交易领域

## 生产级多 Agent 协作机制

1. **动态寻址**：沙箱重建时实例地址漂移→实例注册表动态解析，调用方无感
2. **安全隔离**：一专家一密钥，最小权限隔离
3. **异步长任务**：后台异步执行+流式接收+完成回调
4. **优雅降级**：全部专家不可用→输出结构化"人工排查摘要"

## 自进化（越用越准）

三层自进化闭环：

1. **Skill 案例库**：references/ 下积累数十个真实案例文档（如 case-voc-ota-refund-delay.md）。模型按需加载直接命中历史结论排查路径。约束：知识库命中≠跳过专家——必须调用专家 Agent 给出本次结论
2. **路由规则随实战进化**：基于真实案例反推动态修正（如预付退款延迟、供应商类目混淆）
3. **Memory+Curator 闭环**：管理员纠正→写入Memory/更新Skill→Curator整理→下次已更新

## Hook 无侵入定制

**严禁直接修改 Hermes 源码**。所有定制优先通过 Hook 实现（~/.hermes/hooks/）。

实战 Hook 示例：
- **topic-reset**：自动开新会话
- **auto-sethome**：静默写 home channel
- **platform-ack**：源码必须改时用 gateway:startup+幂等 patch 脚本

## 零代码两级角色管控

Hermes slash 命令访问控制：管理员白名单 vs 普通用户白名单。仅拦截 slash 命令不影响普通问答。

## 运维与效果

**运维基础设施**：
- 专家健康检查 + 主动告警（check_expert_health.py，cron 每 30 分钟巡检）
- 全链路审计：所有对话完整记录于 ~/.hermes/sessions/*.jsonl，保留 90 天
- 结论闭环：排查结论自动 @ 领域负责人

**效果**：诊断准确率 86%，实效从小时级/天级→分钟级。系统由 Markdown（SOUL.md/Skill/Memory）+ 配置 + 少量脚本构成，**零后端编排代码**。

## 架构哲学

- **主 Agent 只路由不推理**：避免单个 Agent 决策过重，按领域解耦排查能力
- **零后端编排代码**：所有路由此逻辑通过 SOUL.md + Skill + Memory 表达，无传统代码层面的编排层
- **无侵入定制**：通过 Hook 机制扩展 Hermes，不动源码——这是一种可维护的 Agent 工程模式
- **每条 Agent 调用 = HTTP POST**：标准 OpenAI 格式通信，将 Agent 间调用降维为 API 调用

## 与其他实体的关系

- **Hermes 生产案例系列**：继 [高德扫街榜 HermesAgent 配图系统](../ch03/046-agent.html) 后第二个来自高德技术的 Hermes 生产案例。前者聚焦 VLM + Skill 化配图，本文聚焦多 Agent 协作 + 自进化 VOC 排查。两篇互补：前者展示混合架构（确定性 Pipeline + Agent），本文展示纯 Agent 多实例协作
- **多 Agent 通信模式**：主 Agent 通过 OpenAI 兼容 HTTP 调用专家 Agent，与 [Hermes Agent](../ch03/091-hermes-agent.html) 的 API Server 能力直接对应——每个 Hermes 实例既是对话机器人也可作为 HTTP 服务
- **自进化闭环**：Memory+Curator 机制与 [Hermes Memory 系统](../ch03/091-hermes-agent.html) 一致——管理员纠正→写入 Memory→Curator 整理→下次更新
- **Hook 扩展**：无侵入定制策略与 [Hermes SOUL.md 人设系统](../ch03/091-hermes-agent.html) 互补——SOUL 定义行为，Hook 定义自定义逻辑
- **路由精细化**：主调度 Agent 的模糊描述→精确领域映射，与 [Flow2Spec 结构化知识路由](../ch01/1099-spec.html) 的路由思想一脉相承

## 实践启示

- **多 Agent 不等于多模型叠加**：关键是职责分离——主 Agent 路由、专家 Agent 执行
- **零代码编排是可能且有价值的**：当 Agent 框架足够成熟，纯 Markdown + 配置 + 少量脚本即可构建生产级系统
- **案例库 > 通用知识**：数十个真实案例文档比泛化 Prompt 更有诊断价值——特定问题的排查路径可被精确复现
- **Hook 优于 Fork**：生产系统长期维护中，无侵入扩展比修改源码更可持续
- **降级不是可选是必须**：全部专家不可用时输出结构化人工排查摘要——生产系统必须设计失败模式

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/gaode-voc-hermes-multi-agent-auto-triage-2026.md)

---

