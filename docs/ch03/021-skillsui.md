# SkillsUI

> 📊 Level ⭐⭐⭐ | 11.2KB

## Overview
SkillsUI（兔展智能）是一个企业 Agent 中间层平台，定位为"企业 Agent 最后一公里"——解决 function calling/MCP 等底层协议到企业存量系统之间的工程层缺口。官网：https://skillsui.rabbitpre.com.cn/

## Key Facts
| Fact | Detail |
|------|--------|
| 定位 | 企业 Agent 应用/中间层 |
| 问题域 | 把企业存量 API 重新组织成 AI 可稳定调用的 Skill 资产 |
| 官网 | https://skillsui.rabbitpre.com.cn/ |

## 核心问题：function calling 和 MCP 解决不了的那段路
企业 AI 落地四大共同问题：
1. **企业 API 是给人写的，不是给 AI 写的** — 参数命名混乱，文档残缺，LLM 调用成功率 <50%
2. **人必须被留下来** — 金额确认/合同签字/对外发送指令等节点不能让 Agent 自行拍板
3. **纯文本对话承载不了企业级交互** — 聊天框里描述表单字段体验极差
4. **跨端续办的状态一致性没人管** — 手机发起、PC 接续、大屏确认，但 session 状态序列化没有标准答案

## 三层架构
SkillsUI 把企业 Agent 拆成三层，每层职责单一、互相解耦：

### 1. Agent 调度层：Planning 和 Skill 编排彻底分开
只做三件事：

- **意图识别** — 把用户自然语言映射到一个或多个 Skill
- **任务规划** — 决定 Skill 执行顺序，处理依赖关系
- **多轮 slot filling** — 缺参数主动问询，不盲目猜测
业务规则、异常处理、人机协同节点全部下沉到 Skill 层。Agent 调度层不感知 Skill 实现细节，只感知输入输出 schema。和 LangGraph 的"显式状态机 + 节点化"思路同向。 See also [Agent Skills Teams Architecture Evolution Selection Guide](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-skills-teams-architecture-evolution-selection-guide.md)

### 2. Skill 层：原子能力的"可执行规范"
企业级 Skill 包含五样东西：

- 输入参数规范
- 业务规则
- 多系统调度链路
- 异常处理
- 人机协同节点
**核心理念：** LLM 只负责选用哪个 Skill 和填什么参数，剩下的全部由 Skill 自己保证。
和 MCP 的关系：MCP 解决"模型怎么连工具"，Skill 解决"工具长什么样才适合 AI 调用"。Skill 可以 MCP 协议对外暴露，但设计规范更丰富。

### 3. AIUI 层：卡片化交互（非聊天框）
企业级 AI 入口不该是聊天框。四类卡片：

- **输入采集卡** — 替代纯文本提问
- **进度卡** — 跨系统调用实时阶段提示（流式 + step 级别）
- **结果回显卡** — 表格/指标/决策矩阵可视化
- **关键节点确认卡** — 金额/合同/签字"一键确认"
跨端续办三大工程问题：Session 状态序列化（业务上下文 + 当前节点 + 已填字段跨端恢复）、节点幂等性（版本号/乐观锁防脏写）、实时同步（WebSocket/SSE 推送）。

## 接入工程
### 路径一：OpenAPI/Swagger 半自动生成
1. 解析 OpenAPI 文档，提取接口语义、入参出参、错误码
2. 用 LLM 做语义增强 — `flag1: int` → "是否需要风控审批"
3. 生成 Skill 骨架（参数校验、重试、错误处理）
4. 可视化面板人工微调
真实工程量：0.5–2 个工作日。

### 路径二：业务嗅探（老旧系统）
针对没有 OpenAPI 的政务/金融/医疗老旧系统：挂在网关层做流量观测 → 模型反推接口语义 → 半自动生成 Skill → 工程师复核。

## 四大工程决策
1. **80/20 原则** — AI 只做"准备工作"，金额/合同/对外发送等节点由人最终确认，在 Skill schema 里是一等公民
2. **权限复用** — 使用当前用户在原系统里的权限，不另建权限体系，避免 Agent 超级账号风险
3. **全链路 tracing** — 每次 Skill 调用（谁/何时/调用什么/参数/结果）全部进审计日志，类似 Langfuse 但下沉到业务节点
4. **Skill 版本控制和灰度发布** — Skill 作为有版本的 artifact，支持灰度/回滚/多版本并存

## 深度分析
### 1. 定位：企业 AI 落地的中间层赌注
SkillsUI 的核心赌注是：企业 AI 落地需要一个中间层，把存量系统能力重新组织成 AI 可稳定调用的 Skill 资产。这一层在中国市场目前还很空。
前提是四大痛点都不是模型能力问题而是工程结构问题——模型再强也不会替企业决定"金额确认必须留给人"；模型越强，"接不进存量系统"越是唯一瓶颈。

### 2. 和 MCP 的互补关系
MCP 是协议层（解决"模型怎么连工具"），SkillsUI Skill 是应用层规范（解决"工具长什么样才适合 AI 调用"）。Skill 可以 MCP 协议暴露，两者互补不竞争。
更精确的边界：MCP 管连接与发现，Skill 规范管参数语义、业务规则、异常处理和 HITL——后者才是调用成功率的决定因素。参见 [Model Context Protocol Mcp](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/model-context-protocol-mcp.md)、[Skill Engineering Principles](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/skill-engineering-principles.md)。

### 3. 卡片化 UI 的战略判断
和 Anthropic Artifacts、ChatGPT Canvas 同向，但 SkillsUI 把它直接定义为"企业入口的标准形态"。企业级交互的本质是"填表/对比/确认/签字"，这些在文字对话里都很别扭。
四类卡片对应四种交互原语：采集、反馈、呈现、承诺。确认卡最有企业味——它把 HITL 从"对话里插一句话"变成可审计的 UI 节点，与 80/20 原则互为表里。同类方向见 [Qoder Skill Ui](https://github.com/QianJinGuo/wiki-public/blob/main/entities/qoder-skill-ui.md)。

### 4. 跨端状态一致性是 企业级 Agent 的基建空白
这是做过分布式协作系统的人都熟悉的工程问题，但放到 Agent session 上下文里，社区目前没有成熟方案。SkillsUI 在这个点上做了工程化封装。
三个抓手——状态序列化、节点幂等（版本号/乐观锁防脏写）、实时同步（WebSocket/SSE）——都是分布式系统的老办法；新意在把 Agent session 当分布式状态治理。

### 5. 三层架构的职责边界：调度层薄、Skill 层厚
分层的关键不是"有三层"，而是各层的变更频率和归属。Agent 调度层只做意图识别、任务规划、多轮 slot filling，不感知 Skill 实现细节，只感知输入输出 schema；业务规则、异常处理、人机协同全部下沉到 Skill 层的五件套规范中，核心理念是"LLM 只负责选用哪个 Skill 和填什么参数，剩下的全部由 Skill 自己保证"。
"调度薄、Skill 厚"意味着换模型、换编排框架不动 Skill 资产——Skill 是唯一长期资产，即中间层存在的经济学理由。

### 6. 四大工程决策的取舍逻辑
四个决策共享同一个取舍：**牺牲 Agent 自主性上限，换取企业敢上生产的确定性**——80/20 原则把关键节点最终确认留给人，且在 schema 里是一等公民而非补丁；权限复用原系统边界，不建 Agent 超级账号；全链路 tracing 进审计日志，是 debug 出错 Agent 的唯一抓手；Skill 版本化支持灰度/回滚/多版本并存。
前两个收敛能力边界，后两个留存证据与可回退性，合起来才构成企业敢用的"可信"。

### 7. 接入工程：两条路径对应两类企业现实
有 OpenAPI 的系统走半自动生成：解析文档→LLM 语义增强→生成自带校验/重试/错误处理的 Skill 骨架→可视化人工微调，中等复杂度 Skill 0.5–2 个工作日。
政务/金融/医疗的老旧系统没有文档，走业务嗅探：网关层流量观测→模型反推接口语义→半自动生成→工程师复核。
两条路径承认同一个事实：企业不会为 AI 重写 API——0.5–2 天的工程量估计是"中间层值得建"的成本论证。

### 8. 生态位与留给同行的问题
SkillsUI 不和模型层、协议层、编排层竞争，只解决上层的应用/中间层问题。
文末交给四个自检问题：API 是否 AI 可读、流程是否有显式 HITL 节点、session 能否跨端续办、调用是否有完整 tracing，并断言"这一层早晚要有人做。不一定是 SkillsUI，但一定是一层中间层"。
这与 A Missing Layer In Agentic Systems、[Agent Ready Api Design Patterns 2026](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-ready-api-design-patterns-2026.md) 指向同一段空白。

## 实践启示
1. **企业 Agent 落地路径** — 不需要等存量 API 规范，先用"业务嗅探"方式逆向生成 Skill，再逐步规范化
2. **HITL 是一等公民** — 涉及金额/合同/签字的节点在 Skill schema 层定义，不是后期打补丁
3. **中间层迟早要建** — 企业 Agent 落地必然需要一个类似 SkillsUI 的中间层，不一定是这个产品，但一定会有

---
## 关联
→ [原文存档](https://mp.weixin.qq.com/s/EWMXRtQxr6WBFSOu9OnkNA)
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)
- 相关: Agent 架构

---

