---
source_url: https://juejin.cn/post/7623670780044558351
tags: [juejin]
ingested: 2026-05-14
sha256: f253ec887caa4234fc8c5d74b0a09d21f62811ae1b8ce3fac397fd0aa25a3440
---
# Harness Engineering：AI 从"聪明"到"可靠"的第三代工程范式
作者：刘棕霆
日期：2026-04-02
阅读：19分钟
💡 TL;DR: AI 模型天然具有三个工程缺陷（概率性输出/短时记忆/幻觉倾向）。Harness Engineering 是专门用来填补这三个坑的系统工程学。Model 决定 AI 有多聪明，Harness 决定 AI 有多可靠。
## 什么是 Harness Engineering？
**Harness = 环绕 AI 模型的完整控制基础设施**
核心公式：
```
Agent = Model + Harness
```
**Harness 六大核心组件（三层架构）**：
| 层级 | 组件 | 核心问题 |
|------|------|---------|
| **第一层：信息层** | ① 记忆与状态管理 | LLM 的上下文窗口不是数据库，会"忘记" |
| | ② 知识传递系统 | 区分静态知识（版本控制）与动态知识（实时注入） |
| **第二层：执行层** | ③ 工具与技能体系（Tool Sandbox） | 工具必须有 Schema + 权限控制 + 执行边界 |
| | ④ 编排与协调（Orchestration） | 设计可验证的循环（Verifiable Loop） |
| **第三层：反馈层** | ⑤ 约束与验证（Guardrails） | 输入/执行/输出三层护栏 |
| | ⑥ 追踪与可观测性（Observability） | Trace + Metrics + Logs + Evals |
## AI 工程的三代进化史
| 维度 | Prompt Engineering | Context Engineering | Harness Engineering |
|------|-------------------|---------------------|---------------------|
| 核心关注点 | 如何表达指令 | 如何管理信息 | 如何构建控制系统 |
| 管理范围 | 单轮 Prompt | 上下文窗口 | 任务全生命周期 |
| 主要技能 | 写作、表达 | 信息架构、RAG 设计 | 系统设计、反馈工程 |
| 瓶颈 | AI 理解能力不足 | 信息不全、过时 | AI 可靠性、可控性 |
| 典型工具 | ChatGPT 对话框 | LangChain、LlamaIndex | LangGraph、AutoGen、CrewAI |
| 工程师角色 | Prompt 撰写者 | 信息管道设计者 | **控制系统架构师** |
## 第一层：信息层
### ① 记忆与状态管理
LLM 的上下文窗口不是数据库，会"忘记"。工程解法是外部状态管理 + 按需加载：
```python
class AgentState:
    short_term: list       # 当前会话（in-context）
    long_term: VectorStore # 语义记忆（Pinecone/pgvector）
    episodic: dict         # 事件记录（Redis/DynamoDB）
    def load_relevant(self, query: str) -> list:
        return self.long_term.similarity_search(query, k=5)  # ✅ 按需检索
```
**关键原则**：信息渐进式披露（Progressive Disclosure）——不要一次性把所有信息塞给模型，按任务阶段按需加载。
### ② 知识传递系统
```
静态知识（版本控制）：架构文档、API 规范、代码风格指南
    ↓ 存入 Git + 向量库，随代码库版本更新
动态知识（实时更新）：数据库状态、外部 API 返回值、用户最新输入
    ↓ 通过 MCP（Model Context Protocol）实时注入
```
## 第二层：执行层
### ③ 工具与技能体系（Tool Sandbox）
生产级 Agent 的工具管理绝不是"给模型一堆函数调用"：
```python
tool_registry = {
    "read_file": {
        "schema": {"path": "str", "encoding": "str"},
        "permission": "read_only",
        "sandbox": True,
        "timeout": 5
    },
    "execute_code": {
        "schema": {"code": "str", "language": "str"},
        "permission": "sandboxed_exec",
        "sandbox": True,
        "timeout": 30,
        "memory_limit": "512MB"
    }
}
```
### ④ 编排与协调（Verifiable Loop）
```
任务输入 → 规划分解 → 执行子任务 → 机器验证
                ↑                        |
                └── 更新规则库 ← 错误分析 ┘[失败]
                          ↓[通过]
              保留交接信息 → 下一子任务
```
**核心原则**：每个子任务的完成标准必须机器可验证，而非人工判断。
## 第三层：反馈层
### ⑤ 约束与验证（Guardrails）
```
输入护栏  → 敏感词过滤 · PII 脱敏 · Prompt 注入检测
执行护栏  → 工具权限校验 · 文件系统范围限制 · API 频率控制
输出护栏  → 合规性检查（金融/医疗/法律）· 内容安全 · 格式验证
```
强制 Chain-of-Thought：要求 AI 先展示推理过程再给出结论，方便人工追溯与审计。
### ⑥ 追踪与可观测性
| 监控维度 | 监控内容 | 推荐工具 |
|---------|---------|---------|
| Trace（链路追踪） | Agent 每一步的推理与行动 | LangSmith、Arize Phoenix |
| Metrics（指标） | Token 消耗、延迟、成功率 | Helicone、Prometheus |
| Logs（日志） | 错误日志、工具调用记录 | CloudWatch、ELK |
| Evals（评估） | 输出质量的自动化评分 | RAGAS、自定义 Eval |
**熵控制**：在熵增失控之前发出预警，而不是等系统崩溃后复盘。
## 核心运营逻辑：用错误喂养规则库
```
AI 犯错
  ↓ 不要只修正这一次的输出
  ↓ 把这次错误转化为一条规则/测试/约束
  ↓ 更新规则库（Constraint Library）
  ↓ AI 永远不再犯这个错
  ↓ 系统在使用中自我进化 ♻️
```
## Harness Engineering vs Fine-tuning
| 维度 | Harness Engineering | Fine-tuning |
|------|--------------------|--------------|
| 适用场景 | 知识注入、流程控制、安全约束 | 风格迁移、特定任务能力强化 |
| 数据需求 | 无需训练数据 | 需要高质量标注数据集（通常 1k+ 样本） |
| 迭代速度 | 快（改配置/规则即生效） | 慢（训练周期 + 评估周期） |
| 成本 | 低（推理时成本） | 高（GPU 训练 + 部署维护） |
| 可解释性 | 高（规则可读、护栏可审计） | 低（权重变化不可解释） |
| 推荐优先级 | **首选** | 作为 Harness 调优后的补充手段 |
**实践原则**：一个设计良好的 Harness 可以解决大多数"AI 表现不稳定"问题。Fine-tuning 是昂贵的最后手段，而非第一选择。
## 七大反模式
| # | 反模式名称 | 错误做法 | 正确做法 |
|---|-----------|---------|---------|
| 1 | 层级混淆 | 把 Harness 逻辑写进 Prompt | 分离模型层与控制层 |
| 2 | 工具堆砌 | 给模型 50+ 个工具"让它自己选" | 每个任务场景精选 ≤10 个工具 |
| 3 | 过早自治 | 跳过验证回路直接追求完全自动化 | 先建人工检查点，再逐步放权 |
| 4 | 忽视验证 | 只看模型输出是否"像对的" | 建立机器可验证的完成标准 |
| 5 | 静态规则库 | 规则写完就不更新 | 建立错误→规则的自动化管道 |
| 6 | 无状态设计 | 每次对话重新开始 | 用外部存储持久化任务状态 |
| 7 | 忽视熵管理 | 让 Agent 无限制地产生副作用 | 设计明确的边界与回滚机制 |
## 分级决策树
| 场景 | 必须做 | 建议做 | 可暂缓 |
|------|--------|--------|--------|
| 内部知识问答 Bot | ② 知识传递、⑤ 输出护栏 | ⑥ Metrics、① 对话历史 | ③ 工具沙箱、④ 复杂编排 |
| 代码审查 Agent | ① 状态管理、③ 工具沙箱、⑤ 护栏、⑥ Trace | ④ 可验证循环、② 代码规范知识库 | 无 |
| 自动化运维 Agent | **全部六层 + 人工审核节点** | 回滚机制、变更审计日志 | 无（全部必须） |
## 最小可行 Harness（MVH）三步法
**第一步**：定义边界（harness_config.yaml）
**第二步**：建立验证回路
**第三步**：设计错误捕获管道
## Token 消耗与延迟 Trade-off
| 方案 | 平均延迟 | 可靠性 |
|------|---------|--------|
| 无 Harness（裸调用） | ~1-2s | 低，不可预期 |
| 最小 Harness（护栏 + 状态） | ~2-4s | 显著提升 |
| 完整 Harness（六层 + 验证） | ~5-15s | 高，适合生产 |
**三条成本控制策略**：
1. **按风险分级调用**：低风险（读/查询）→ 轻量 Harness；高风险（写/执行/发布）→ 完整 Harness
2. **约束库缓存**：约束库内容变化不频繁，可缓存为系统提示前缀，节省约 10-20% Token
3. **验证回路短路**：任务类型历史成功率 > 95% 时可先执行、异步验证，失败时触发回滚
## 核心评估三指标
1. **任务成功率**（目标 > 85%）
2. **错误重犯率**（应趋向 0，用滚动 7 日窗口统计）
3. **系统熵增速度**（通过 Trace 中状态大小变化趋势监测）