# 阿里 Devix Harness 运维 Agent：7×24 自动化故障诊断-决策-处置闭环

## Ch04.395 阿里 Devix Harness 运维 Agent：7×24 自动化故障诊断-决策-处置闭环

> 📊 Level ⭐⭐ | 6.8KB | `entities/alibaba-devix-harness-ops-agent-7x24.md`

# 阿里 Devix Harness 运维 Agent：7×24 自动化运维闭环

## 核心结论

阿里控股集团消费者认知团队基于 Harness Engineering 理念，在 Devix 平台上构建了 7×24 自动化运维系统——Agent 负责语义诊断+决策推理，脚本负责数据召回+动作执行，用置信度换自动化程度，从历史经验持续进化。

> "Harness Engineering 的本质，不是让 Agent 更聪明，而是让 Agent 更可控。"

## 痛点与设计哲学

| 痛点 | 具体表现 |
|------|----------|
| 慢 | 告警到人工响应 15-30 分钟，凌晨更久 |
| 重复 | 同类故障反复出现，每次都走完整排查流程 |
| 断层 | 老手经验留在脑子里，新人门槛高 |

三条设计原则：

1. **Agent 做语义，脚本做执行** — Agent 的语义优势用于诊断和决策，所有数据获取和动作执行由确定性脚本完成
2. **置信度换自动化** — 高→全自动，中→人工确认，低→升级处理
3. **经验驱动进化** — 每次诊断沉淀为案例，案例反馈到决策，规则库持续进化

## 三层流水线架构

核心范式：**脚本召回 → 回流 Agent → Agent 决策 → 脚本执行**

| 层级 | 执行 | 职责 |
|------|------|------|
| **Layer 1: 语义诊断** | Agent | 日志解析+错误模式匹配+知识库检索 → 诊断报告(MD)+诊断结论(JSON) |
| **Layer 2: 决策规则** | 脚本→Agent→脚本 | 三级规则匹配+案例库查询+置信度调整 → Agent 综合决策 |
| **Layer 3: 动作执行** | 脚本（Agent 不参与） | 钉钉通知/自动重跑/代码修复 |

Agent 被夹在两层确定性脚本中间——既发挥语义理解优势，又被约束在可控决策边界内。

## 诊断引擎：6 步完整推理链

Agent 像运维工程师一样执行完整诊断流程：

1. **实例信息采集** — DataWorks OpenAPI 查询完整信息
2. **日志智能解析** — 自动识别 SQL/Cupid/Mixed 三种日志类型
3. **深层错误获取** — ODPS REST API 获取引擎层 Task 级精确错误（DataWorks 日志看不到）
4. **关联分析** — 代码变更+运维记录+上游依赖
5. **调度链路追溯** — 自动定位重跑目标（外层周期实例 > 根工作流 > 当前实例）
6. **知识库检索** — 分层递进：总览→业务域→分层→节点明细

**双输出设计**：Markdown 报告给人看（钉钉+GitLab 归档），JSON 结论给机器用（error_pattern + confidence + 环境上下文 + 修复提案）。

## 分级决策引擎

### 为什么不让 Agent 直接决策？

- 决策不可控：同一错误可能给出不同决策
- 策略难量化：无法表达"历史重跑成功率 > 80% 才自动重跑"
- 经验难沉淀：每次决策独立，无法从历史学习

### 五种决策动作

| 动作 | 触发条件 |
|------|----------|
| 自动重跑(rerun) | 基础设施故障+成功率高+无代码变更+置信度>0.9 |
| 按钮重跑(with_approval) | 首次出现或置信度不足 |
| 代码修复(fix_code) | Agent 诊断出代码问题+有可行方案 |
| 排查建议(investigate) | 数据量异常/上游失败 |
| 升级人工(escalate) | 权限问题/未知错误 |

### 三级规则降级匹配

| 级别 | 匹配 | 说明 |
|------|------|------|
| 1 | error_pattern 精确 | 完全一致 |
| 2 | error_category 类目 | 按故障大类 |
| 3 | _default.yaml 全局 | 最保守策略 |

**关键洞察**：系统不是被"配置"出来的，而是被"训练"出来的——首次出现→保守处理，积累经验后→逐步放开自动化。

## 规则自进化：三条并行路径

每条路径："脚本扫描 → Agent 语义分析 → 人工审核"

| 路径 | 触发条件 | 做什么 |
|------|----------|--------|
| A 新规则发现 | error_pattern=unknown 积累 | 聚类分析→设计新规则 |
| B 规则效果修订 | 重跑成功率 < 30% | 分析失败原因→调整决策树 |
| C 安全审计 | 自动重跑失败率 > 50% | 降级自动重跑权限（安全最后防线） |

## 安全防护三道防线

1. **全自动重跑约束**：置信度>0.9 + 成功率>80% + 无代码变更 + 规则标记安全
2. **代码修复三层防护**：Agent 生成建议 → 分支命中 → 钉钉三按钮人工确认
3. **未知故障兜底**：未覆盖故障一律升级人工

## 运维工具

| 工具 | 说明 |
|------|------|
| 操作人实名溯源 | 钉钉 JSAPI 免登识别，时间线记录花名 |
| 故障日报自动生成 | 汇总诊断报告+API 状态+时间线 |
| 诊断报告 GitLab 归档 | 可追溯故障知识库 |
| 手动重跑检测 | 绕过按钮的手动操作也能感知通知 |

## 与 Harness Engineering 理论的映射

这篇文章是 Harness Engineering 框架的**生产级实证**：

| Harness 理论 | Devix 实现 |
|-------------|-----------|
| Agent 做推理，脚本做执行 | Layer 1 Agent 诊断 + Layer 3 脚本执行 |
| 安全护栏 | 三道防线（置信度+代码变更+兜底） |
| 验证循环 | 置信度+历史成功率+案例库统计 |
| 可观测性 | 诊断报告 GitLab 归档+故障日报+操作人溯源 |
| 环境工程 | 分层递进知识库（总览→域→节点） |
| Loop/Ralph Loop | 告警→诊断→决策→执行→追踪→案例→规则进化 |

## 相关实体
- [Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- [Harness Engineering 10 Step Practical Guide 2026](https://github.com/QianJinGuo/wiki/blob/main/entities/harness-engineering-10-step-practical-guide-2026.md)
- [Claude Code Multi Agent Harness Source Analysis](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-multi-agent-harness-source-analysis.md)
- [Agentops Operationalize Agentic Ai Amazon Bedrock](https://github.com/QianJinGuo/wiki/blob/main/entities/agentops-operationalize-agentic-ai-amazon-bedrock.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/alibaba-devix-harness-ops-agent-7x24.md)

---

