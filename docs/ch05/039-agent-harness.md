# Agent生产级Harness工程指南

## Ch05.039 Agent生产级Harness工程指南

> 📊 Level ⭐⭐ | 14.5KB | `entities/agent-production-harness-engineering.md`

## 核心定位
**工程赤字（Engineering Deficit）**：大多数 Agent 项目失败，不是因为模型能力不够，而是模型周围的工程（Harness）不够扎实。
> 边界要建，输入要校验，状态要隔离，循环要打点，暴露面要测试。
---

## 行业失败率
| 数据 | 来源 |
|------|------|
| 88% 的 Agent 项目没有进入生产环境 | 行业数据 |
| 企业 GenAI 试点失败率 95% | MIT 2025年8月报告 |
| 真正在生产环境跑 Agent 的开发者 | 1837名中仅95人（5%） |
**成功案例**：Klarna（LangGraph，8500万用户，问题解决时间下降80%）、Cursor、Harvey、Sierra。
---

## Demo型 vs 生产型代码库
### 判别法（10分钟读代码可辨）
| 维度 | Demo 型 | 生产型 |
|------|---------|--------|
| 工具边界 | 接受任意字符串，静默失败 | 入口校验格式，结构化错误 |
| 会话状态 | 无 schema 的 dict | 类型化 schema + 来源记录 |
| 异常处理 | `try/except: return []` | 结构化返回 + 人类可读日志 |
| 工具注册 | 系统提示词手写清单 | 从已注册工具列表生成 |
| Agent 循环 | 无 `MAX_STEPS` 上限 | 硬上限 |
| 破坏性操作 | LLM 自我判断 | 循环外人类确认 + LLM 不可伪造凭证 |
| Tracing | span 仅包 LLM 调用 | 覆盖 LLM + 工具调用 + 状态变更 |
| 多 Agent | 共享状态，无任务契约 | RPC 风格调用，清晰边界 |
**分界线**：团队有没有把模型周围的工程当成产品本身。
---

## Claude Code 退化事故复盘（2026年4月）
Anthropic 承认 Claude Code 被三个运行时改动削弱（未触及模型本体）：

- 默认 reasoning effort 降级
- 缓存改动导致会话丢失推理历史
- 系统提示词限制工具调用回复长度
**结果**：可见思考长度中位数下降 **73%**，API 重试率上升 **80x**。问题被社区研究者先发现，而非内部监控。
**教训**：运行框架决定替换模型时系统会不会 crash。
---

## 四支柱审查框架
审任何 Agent 代码库，10 分钟内可判断属于哪类——四个维度至少挂三项的是 Demo 型。

### 支柱一：构建——工具契约约束模型
**问题**：工具签名只约束代码，不约束模型传入的值。
**修复**：
1. 工具入口校验格式（如 `cus_` 前缀）
2. 错误消息告诉模型下一步怎么做（不是"出错了"而是"这是邮箱，请调用 find_customer_by_email"）
3. **不静默吞错**：`return []` 伪装所有失败为"空结果"
4. 结构化结果：`status` + `error_type` + `message`
5. 提供 `ask_user` 工具 + 回归测试确保调用
**上下文工程**：工具参数和错误消息命名影响模型下一轮判断，不是 prompt engineering 而是上下文工程。

### 支柱二：记忆——可信/隔离/可追溯
#### 隔离失效
Python 类级别可变默认值是并发串扰的常见根因：
```python
class Agent:
  history: list[dict] = []   # BUG：类级别可变默认值
```
修复：`field(default_factory=list)` + 并发回归测试。

#### 语义层状态投毒
`remember_fact(key, value)` 工具若无类型化 schema，LLM 可被 prompt injection 污染敏感字段（邮箱 → admin@evil.com）。
**三层防御**：
1. 类型化 schema 拒绝未知状态键
2. 每条事实记录来源（OAuth/系统初始化/用户输入/LLM断言）
3. 敏感字段权限边界，拒绝低信任来源修改
**OWASP LLM Top 10 #1**：prompt injection。权限不在 prompt 里，在代码里。

### 支柱三：运行框架——循环即基础设施
Demo 级循环抹掉关键信息（哪个工具失败/为什么/下一步），模型要么放弃要么无限重试。
**生产五件套**：
1. 工具错误结构化返回（给人看 + 给模型看）
2. 每次 LLM + 工具调用进 trace
3. token 用量按步骤记录 → 成本尖峰可监控
4. `MAX_STEPS` 硬上限
5. 高风险操作：循环外人类确认（LLM 无法伪造）
**结构性防御**：破坏性动作依赖模型无法伪造的凭证（用户确认/签名/延迟窗口）。

### 支柱四：编排——明确契约 + 可恢复状态机
多智能体争议：Cognition 反对（一致性关键任务）vs Anthropic 支持（广度优先研究）——**两者不矛盾，看任务类型**。

#### AgentLeak benchmark（2026）
| 配置 | 暴露面 |
|------|--------|
| 多智能体 | 68.9% |
| 单智能体 | 43.2% |
暴露来自：智能体间消息、共享记忆、工具参数（只看最终输出发现不了）。

#### 多智能体四大坑
1. 协调器/worker 共享类级状态 → 并发串扰
2. 子 Agent 拿到父完整历史 → 信息泄露
3. 长任务在单个 Python 进程 → 部署/崩溃即丢失
4. 父子 trace 无关联 → 事故只能靠时间戳拼凑
**正确做法**：RPC 风格任务契约 + 持久状态机（Temporal/DBOS/任务队列，不要自造）。
---

## 优先级建议
| 放一放 | 理由 |
|--------|------|
| "别做多智能体"公理化 | 看任务需一致性还是并行搜索 |
| AutoGen/AG2/CrewAI 优先选 | demo 友好，生产约束不足 |
| DSPy 当通用框架 | 适合 prompt optimization，不是运行框架 |
| SWE-bench/OSWorld 排行榜 | 公开 benchmark 易被刷，内部评估更重要 |
| 按 seat 定价新 Agent 产品 | 市场已转向按结果/用量付费 |
| HN 本周新框架 | 等6个月再评估，未知技术债 |
---

## 推荐阅读体系
1. **Anthropic Engineering Blog**：Context Engineering + Harnesses + Writing Effective Tools + Claude Code 事故复盘
2. **Cognition《Don't Build Multi-Agents》** + **Anthropic《How we built our multi-agent research system》**：一起读才能看清边界
3. **OWASP LLM Top 10**：prompt injection 篇
4. Simon Willison 笔记、Latent Space 生产访谈、EchoLeak、AI memory poisoning 披露
---

## 相关页面
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/harness-production-agent-engineering-deficit.md)
→ [Cursor Harness 复盘](../ch01/299-cursor-harness-model-production-floor.html)（模型 vs Harness 组合）
→ [Claude Code 提示词体系](../ch09/060-claude-code-prompt.html)
→ [Agent Harness 上下文管理](ch05/039-agent-harness.html)
→ [Agent Memory 架构](../ch04/407-perplexity-brain-self-improving-agent-memory-architecture.html)

## 相关实体
- [Harness Engineering - 让 Coding Agent 可靠完成长程任务](ch05/052-harness-engineering.html)
- [Harness Engineering：让 Coding Agent 可靠完成长程任务](ch05/052-harness-engineering.html)
- [Harness Engineering: 让 Coding Agent 可靠完成长程任务](ch05/052-harness-engineering.html)

- [快时尚电商行业智能体设计思路与应用实践（五）借助 AgentCore Runtime 与 Bedrock 模型平台，轻松实现 Claude Agent SDK 的生产级部署 | 亚马逊AWS官方博客](../ch01/1207-claude.html)
- [Agent架构关键变化：Harness正在成为新后端](ch05/018-harness.html)

## 深度分析
**工程赤字的本质是"模型可替换性假设"与"工程确定性"之间的结构性矛盾。** 当团队把 Agent 当作"只要模型够强就不用管周围工程"的产品时，边界、校验、隔离、追踪全都变成了事后补丁。这个矛盾在工具契约上表现最集中：签名约束代码但不约束模型传入值，这个设计缺陷会在每一个工具里复制。修复它需要的不是加强某个工具，而是改变整个框架的输入校验哲学。
**Demo→Production 的跃迁不是工程量问题，是工程思维问题。** Demo 型团队把 Harness 当成"让模型工作的润滑剂"；生产型团队把 Harness 当成"产品本身"。这个认知转换直接决定了代码库在四支柱上的评分。工具边界越松散、会话状态越无结构、异常处理越静默，Demo 型特征就越明显。三个维度挂掉即可判为 Demo 型。
**运行框架是模型无关的稳定性保障。** Claude Code 退化事故最关键的教训不是"不要改默认配置"，而是"运行框架的任何改动都应该在监控里可见"。73% 思考长度下降和 80x 重试率上升是两个最敏感的早期信号——问题被社区研究者通过会话数据分析先发现，而非内部监控体系，说明现有监控没有把这两项列为必需观测指标。这是任何生产级 Agent 部署都需要补的基础设施。
**多智能体的暴露面随连接数超线性增长。** AgentLeak benchmark 的 43.2%（单智能体）→ 68.9%（多智能体）跳跃不是线性叠加，而是来自智能体间消息、共享记忆、工具参数的多维攻击面。只看最终输出通常发现不了——过程日志和 trace 关联才是暴露面审计的正确姿势。
---

## 实践启示
**1. 工具契约防御纵深：**

- 格式校验作为入口防线而非末尾防线
- 错误信息给模型具体操作指引，不给笼统失败消息
- 结构化返回（`status` + `error_type` + `message`）是模型分支判断的基础设施
- 不静默吞错——让失败有明确状态，给模型和人类都有可用的信息
**2. 记忆层三层隔离：**

- 类型化 schema 拒绝未知状态键（不要用 `dict` 直接存储用户提供的键名）
- 每条事实记录来源：已验证 OAuth、系统初始化、用户输入、还是 LLM 断言
- 敏感字段权限边界：低信任来源（LLM 断言）不能修改高价值字段（邮箱、支付信息）
- OWASP LLM Top 10 #1 就是 prompt injection——权限在代码里，不在 prompt 里
**3. 运行框架即基础设施：**

- 循环覆盖 LLM 调用 + 工具调用，不只包 LLM span
- 工具错误结构化返回——给人看日志也给模型看状态
- token 用量按步骤记录，成本尖峰可监控
- MAX_STEPS 硬上限防雪崩
- 高风险操作：人类确认机制放在循环外，且凭证 LLM 无法伪造（如延迟窗口、硬件签名）
**4. 多智能体 RPC 契约模式：**

- 输入输出结构化（明确字段名、类型、校验规则）
- 父上下文按"need-to-know"传递，不是完整历史
- 长任务可恢复状态机——用 Temporal/DBOS，不要自造进程内状态机
- 父子 trace 关联，事故现场可重建
**5. 基准线与监控基线：**

- 任何生产级变更前，记录平均 token 用量、重试率、循环步数
- 把这两个指标列为必需观测项：思考长度中位数、API 重试率
- 这两个指标的突变是运行框架退化的最敏感早期信号

---

