## Ch08.015 MiniMax Agent Team: Mavis (Owner-Worker-Verifier)

> 📊 Level ⭐⭐⭐ | 10.6KB | `entities/minimax-agent-team-mavis.md`

# MiniMax Agent Team: Mavis (Owner-Worker-Verifier)
**作者**：MiniMax 稀宇科技
**产品**：Mavis — MiniMax as a Jarvis
**原始链接**：https://mp.weixin.qq.com/s/TIL7o92f71DsPPLWT4_37A
**评分**：v=8, c=9, score=72
**入库日期**：2026-05-13
---   

## 概要
MiniMax Agent Team（Mavis）架构解析：单 Agent 四大痛点（上下文焦虑/注意力漂移/IM延迟期望/角色混淆）→ Owner-Worker-Verifier 三角色 + 对抗式验证 + 状态机 + 隔离上下文；多 Agent 三类成本（交接/共享/聚合）；Cost of Consensus 论文（2.1-3.4x token 开销）；Team 是策略选项而非默认。

## 单 Agent 四大痛点
| 痛点 | 表现 | 根因 |   
|------|------|------|   
| 上下文焦虑 | 7件事做完3件就停，开始汇报 | 模型对"超长任务何时停"判断模糊 |   
| 注意力漂移 | 越跑越分心，风格/来源前后不一致 | 单 Agent 难以自我制衡，自检的仍是自己构造的内容 |   
| IM延迟期望 | 要么浅答案，要么长时间无反馈 | 用户期待秒回，但复杂任务天然需要更久 |   
| 角色混淆 | 单 Agent 通过 Skill 扮演多角色，但角色≠分工 | 真正分工需要工具/上下文/记忆/Skill/输出协议都不同 |   

## Agent Team 三角色架构
```   
Owner（项目经理）   
  理解目标 → 拆分子任务 → 分配 Worker → 合并结果 → 控制停止   
       ↓   
Worker（专业执行）←→ Verifier（对抗检查）   
  工具/上下文/Skill 各异     事实来源/代码测试/格式/覆盖清单   
  专业化输出易复用         Worker 停→Verifier 启→问题→Worker 重启   
                          相互制衡，类似企业 R&D vs QA   
```   

### 关键设计
- **对抗式验证**：Worker-Verifier 是对抗关系，非可选附加步骤
- **状态机硬约束**：验证/重试/停止都是引擎层面硬性约束，非模型自由判断
- **隔离上下文**：每个 Agent 只看到自己任务相关的摘要，按需加载细节

## Task 派发 vs Agent Team
| | Task 派发 | Agent Team |   
|---|---|---|   
| 交互模式 | 一次收发（邮件） | 持续在线（工作群） |   
| 中间态可见性 | 主 Agent 不知道中间发生了什么 | Worker 可主动上报、Verifier 可直接打回 |   
| 指令补充 | 无通道 | Owner 随时可补充 |   
| 重试上下文 | 从头开始 | 复用之前上下文 |   

## 成本分析
### Cost of Consensus 论文结论
多 Agent token 消耗可达单 Agent 自我修正的 **2.1-3.4x**，准确率可能不升反降（特定模型 + 同质 debate 设置下）。**没有结构/验证/停止条件的多 Agent 不成立。**

### 三类额外成本
| 成本类型 | 说明 | MiniMax 解法 |   
|---------|------|-------------|   
| 交接成本 | 信息从"上一个 Agent 能懂"翻译成"下一个 Agent 能用" | 结构化文件+摘要通信，不塞进 prompt |   
| 共享成本 | 每多共享一段，每 Agent 每轮都付 token | 按需加载，只看相关摘要 |   
| 聚合成本 | 十份并行结果合成一份一致交付物，无捷径 | Owner 花真实精力，无法靠更多 Agent 解决 |   

### Verifier 三笔成本
1. 验证本身消耗（认真验证要花时间和 token）
2. 重试循环（需退出机制，否则越跑越贵）
3. 人类决策成本（高风险动作需人类签字；保留完整过程记录）

## 何时用 Agent Team
**Team 是策略选项，不是默认选项**

- **值得上**：任务复杂、链路长、风险高、经验可复用
- **不需要**：任务短、低风险、确定性高 → 单 Agent 或脚本

## 深度分析
### 架构设计的核心洞察
Mavis 的 Owner-Worker-Verifier 三角色架构本质上是将**认知分工**与**质量保障**解耦：

- **Owner** 承担元认知职责：目标分解、进度判断、停止决策。这是纯规划能力，不应与执行能力混淆。
- **Worker** 追求专业化深度：工具、上下文、Skill 各异，输出标准化以便被检查和复用。
- **Verifier** 扮演对抗性角色：不是"帮助"Worker，而是"找问题"。这种对抗关系是架构级的，不是可选的提示技巧。

### 为什么对抗式验证是架构核心而非附件
传统观念里，验证是"做完之后检查一下"。Mavis 的设计反其道而行：
1. **Worker 停止的条件 = Verifier 启动的原因**：两者是状态机中的互斥状态，不是并行合作。
2. **Verifier 发现的问题 → Worker 重新启动**：不是通知主 Agent 协调，而是直接的循环。
3. **企业类比**：R&D vs QA 的对抗关系确保产品质量，而不是 R&D 内部自检。

### 上下文隔离的设计原则
共享上下文是最大的成本陷阱。每一个"大家都看一眼"的设计都在积累 token 成本。正确的做法：

- 每个 Agent 持有**任务相关摘要**，而非完整对话
- 细节按需加载，用完即释放
- 交接通过**结构化文件+摘要**，不塞进 prompt

### Cost of Consensus 的实践意义
论文结论（2.1-3.4x token 开销）不能简单理解为"多 Agent 浪费"。关键前提：

- **同质 debate 设置**：即所有 Agent 用相同方式讨论问题
- **无结构/验证/停止条件**：这是论文批评的对象，不是多 Agent 本身
Mavis 通过 Verifier 提供了结构化验证，通过状态机提供了停止条件，因此不在论文批评的范围内。

### Team 是策略选项的深层含义
"不是默认选项"强调的是**进入门槛**：

- 任务足够复杂才值得付出多 Agent 的协调成本
- 链路长、风险高、经验可复用的场景才值得构建 Team
- 短任务、低风险场景用单 Agent 或脚本更高效
这与"微服务比单体更先进"的误区类似——架构选择取决于问题规模。

## 实践启示
### 何时真的需要 Agent Team
| 条件 | 单 Agent 足够 | Agent Team 值得 |   
|------|--------------|----------------|   
| 任务复杂度 | 简单问答、单一操作 | 多步骤、长链路、需多技能 |   
| 风险程度 | 低风险、可回滚 | 高风险、不可逆决策 |   
| 反馈时效 | 可以等待 | 需要实时响应+后台执行 |   
| 经验复用 | 一次性任务 | 同一模式重复执行 |   

### Verifier 设计的三原则
1. **独立上下文**：Verifier 不应与 Worker 共享"刚查过所以没错"的惯性，必须独立验证。
2. **具体可执行**：Verifier 的输出应该是"第 3 步的数值与来源不符"而非"看起来有问题"。
3. **硬性退出条件**：重试必须有最大次数限制，防止成本无限膨胀。

### IM 场景的快回复 + 后台执行模式
核心思路是**分层响应**：

- 第一层：立即响应，确认收到+概要计划（秒级）
- 第二层：后台 Worker 执行具体任务
- 第三层：关键节点汇报，用户无需盯着
这对用户期望管理至关重要——"已读不回"比"稍等我在做"体验更差。

### 文档生成的流水线设计
不要试图用单 Agent 生成完整长文档。正确的流水线：
```   
Planner（定义目标和结构）   
    ↓   
Writer（负责正文生成）   
    ↓   
Formatter（负责版式和格式）   
    ↓   
Tool Agent（调用文档工具）   
    ↓   
Evaluator（独立检查）   
```   
每一步的输出是下一步的输入，职责单一，容易检查和替换。

### 交接成本的优化策略
Agent 间交接时常见错误：把完整上下文塞给下一个 Agent。
正确做法：

- 输出结构化摘要（包含：已完成什么、关键结论、待确认点）
- 用文件作为交接媒介，而非 prompt
- 下一个 Agent 按需读取细节，不被动接收全部

## 关联阅读
- [Owner Worker Verifier Architecture](ch01-889-how-llms-actually-work-0xkato-transformer-walkthrough.html)
-

- [Cost Of Consensus](ch11-177-chroma-vs-qdrant.html)
- [Context Isolation](ch01-892-上下文隔离.html)
- Adversarial Verification

## 相关实体
- OpenClaw 多智能体团队搭建实战经验
- [Sub-Agent vs Agent Team 选型与编排原语](ch04-495-逆天的架构-用-harness-langgraph-a2a-写一个-agent-team.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/minimax-agent-team-mavis-owner-worker-verifier.md)

- [龙虾装上了可以用来干啥 - OpenCLAW 多智能体团队搭建经验](ch04-038-openclaw-multi-agent-team-practice-v2.html)

---
