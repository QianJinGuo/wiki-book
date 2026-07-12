# 快手 RCA Agent：复杂业务场景下排障 Agent 的探索实践

## Ch04.495 快手 RCA Agent：复杂业务场景下排障 Agent 的探索实践

> 📊 Level ⭐⭐ | 5.3KB | `entities/rca-agent-kuaishou-guo-yongliang-qcon-2026.md`

> 原文归档：[原文归档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/rca-agent-kuaishou-guo-yongliang-qcon-2026.md)

快手主站归因排障 Agent 的生产级实践，覆盖四大挑战（业务理解/告警噪声/不确定性/幻觉）和完整的 Multi-Agent 架构设计。郭勇良（QCon 2026 北京）。

## 一句话

**业务排障 Agent 四层解法：业务资产消除上下文代差 + 证据金字塔对抗噪声 + 快照式 Benchmark 衡量不确定性 + 传统算法封装对抗幻觉，Workflow 快思考 + Agent 慢思考分层架构。**

## 核心洞察

- **AI Coding 攻克了编码，排障是下一个生产力瓶颈** — DORA 报告：个人效能显著提升但组织效能有限
- **AI 代码掌控度下降→AI 排障从可选项变必选项** — OpenClaw v2.0 重构后大量插件瘫痪，代码由 AI 生成
- **Agent 对 Workflow 不是取代关系** — Workflow 确定可控但缺灵活性，Agent 灵活但不确定/延迟高/Token 大

## 四大挑战与解法

### 挑战一：让 AI 理解业务

**问题**：传统监控三板斧（Trace/Metrics/Log）在业务排障中有两个断点——(1) 请求正常时 Metrics 无法关联 (2) 未走过的逻辑路径没有 Log

**解法**：建立"业务资产"层（代码抽象）
- 错误码业务语义标注
- Metrics 业务化描述
- 指标拓扑关系
- 开关配置影响地图
- 两种模式：离线沉淀 + 排障中按需生成沉淀为 Skill

### 挑战二：对抗噪声

**问题**：告警噪声 >75%，AI 全量处理月 Token 消耗近 100 亿，年化成本几百万

**解法**：证据金字塔（借鉴循证医学）
- 原始信号 → 背景上下文 → 单点观测 → 多元融合证据 → 直接因果推断

### 挑战三：衡量不确定性

**问题**：优化一个 Case 可能引入其他 Bad Case（单点抖动召回后 Agent 错误建立因果关系）

**解法**：快照式 Benchmark 体系
- Case 全部来自线上真实异常（非混沌工程模拟）
- 监控数据转储保存故障现场
- 评估指标：线索命中率 + 量化评分

### 挑战四：对抗幻觉

**关键发现**：大模型本质是概率预测器，不擅长数值计算和趋势识别

**解法**：当确定性要求超过一定程度时，工程化封装成 Tool/Skill
- 多模态识别监控截图 → 幻觉严重
- JSON List 时序数据 → Token 消耗高+计算出错
- **孤立森林+规则** → 准确率显著提高，不消耗 Token

## Multi-Agent 架构

- **SubAgent 领域封装**：80+ 工具按领域分组，降低主 Agent 认知负担
- **代码分析异步化**：投递到信箱，主 Agent 消费
- **Agent 通信 Team**：SubAgent 间通信，避免陷入无效路径
- **自进化**：Few-shot + 自动构建案例集（小模型+高温度→命中正确答案→摘要→经验库）

## 分层架构

- 底层：告警噪声治理（传统策略+智能告警）
- 中层：Workflow"快思考"——SOP/Redis/Java 异常等套路化场景
- 上层：Agent"慢思考"——核心业务指标突变，深度推理

## 核心指标

- 整体准确率 80%+（含告警噪声）
- 推理层面主要衡量**有效线索准确率**
- MTTR 缩短 / 归因时长 / 归因准确率

## 稳定层 vs 易变层

| 层级 | 内容 | 策略 |
|------|------|------|
| 稳定层 | 问题域业务资产、Eval 体系、结构化案例集、人机协作模式 | 持续积累 |
| 易变层 | Prompt 描述、工具选型、协议规范 | 减少投入 |

## 认知

- "拿着旧地图，找不到新大陆"——现有监控系统围绕人构建，Agent 不受认知带宽限制
- 组织按人分工+信息隔离，Agent 不需要分工也不存在信息隔离
- 终态方向：辅助决策 → Agent 出决策+人审批 → Agent 自主闭环

## 相关实体

- [Harness Engineering](../ch05/066-harness-engineering.html)
- [Claw-SWE-Bench](../ch05/018-harness.html) — harness 独立评测基准
- [Skill 版本对比五大原则](ch04/266-skill.html) — 评估方法论
- [OpenClaw Agent Loop 设计模式](../ch01/1128-openclaw-agent.html)

---

