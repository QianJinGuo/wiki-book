---
title: hermes-9-module-architecture-winty
source_url: https://mp.weixin.qq.com/s/iU6VfowYq_Fi6fTXVh10Qw
publish_date: 2026-05-12
tags: [wechat, article, agent]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 1a365ef1030b44f8f3ddf8283a02c9c05c0c70ea9e3b76fc16438b59cd533abc
---
Hermes Agent 的 9 个独立又互相咬合的模块，分为 3 条主线：执行链、学习链、拼装链。
## 9 大模块
### 1. Agent Loop（执行核心）
极简 ReAct 循环：接收输入 → 拼 prompt → 调模型 → 调工具 → 结果喂回 → 直到完成。
每一轮 Loop 都与其他模块"对话"：启动时找 Prompt Assembly，调工具时找 Tool/MCP 要权限，跑一段时间被 Nudge Engine 提醒复盘，跑完触发 Session 写 trajectory。
### 2. Prompt Assembly（系统提示词组装）
system prompt 每次任务现拼，不是写死字符串。拼装内容：SOUL.md（人格）、MEMORY.md（环境事实）、USER.md（用户偏好）、当前激活 Skills、上下文文件。
连接"沉淀的知识"和"当下的执行"的桥梁。
### 3. Memory Store（记忆系统）
两个 markdown 文件：MEMORY.md（环境/项目事实）+ USER.md（用户偏好）。
三个关键设计：有界（token 上限）、声明式（事实陈述）、冻结（snapshot 不被本轮对话污染）。
### 4. Skill Manager（技能系统）
过程式操作手册：When to use + Steps + Verification + Pitfalls。
职责：创建（Review Agent 决定沉淀时）→ 激活（任务相关时拽进 prompt）→ Patch（复用发现不准确时修补）→ 回滚 → 安全扫描。
### 5. Tool / MCP 系统（能力接口）
内置 Tool（文件/命令/网络/环境）+ MCP 协议（外部工具统一接入）。
关键设计：权限分级（无害/有副作用/危险）。
### 6. Nudge Engine（学习触发器）
后台维护计数器：自上次 Memory 更新过去多少轮？自上次 Skill 创建过去多少次任务？这次跑了多少步？
阈值触发 → 给主 Agent 推提醒 → fork Review Agent。
### 7. Review Agent（后台复盘）
独立 fork 的 Agent 实例，不与主 Agent 共用 prompt/任务。输入：对话和操作快照。输出：Memory 写入 / Skill 创建或 Patch。
解耦：主 Agent 专注干活，学习交给独立角色。
### 8. Session / Trajectory Store（执行档案）
SQLite 存储：用户输入、每一步 reasoning、工具调用和返回值、最终输出、时间戳/token/错误。
用途：Review Agent 输入 + 可观测性回放 + 未来评估基础。
### 9. Personality / SOUL.md（人格层）
定义说话风格、价值观底线、拒绝/坚持做什么、性格倾向。
解决两件事：行为一致性 + 价值观护栏。
## 一次任务全链路
用户输入 → Prompt Assembly（拉 SOUL+Memory+USER+Skill 拼 system prompt）→ Agent Loop 调模型 → 模型决定调工具 → Tool/MCP 执行 → 喂回模型循环 → 写进 Session/Trajectory → Nudge 计数器跳一格 → 阈值触发 fork Review Agent → Review Agent 读 Trajectory 决定写 Memory/创建 Skill/Patch Skill → 落盘 → 下次任务 Prompt Assembly 拉到已更新内容。
三条主线交织：执行链（Loop+Tool+Session）→ 学习链（Nudge+Review+Memory+Skill）→ 拼装链（Prompt Assembly+SOUL）。
## 核心观点
自进化 Agent 比普通 Agent 至少多三件事：记住事（Memory）、沉淀做法（Skill）、有人后台复盘（Review）。
Hermes 把"自进化"拆成 6 块工程实体：触发（Nudge）→ 审视（Review）→ 记录（Memory+Skill）→ 回放（Session）→ 加载（Prompt Assembly）→ 执行（Loop+Tool）。每一块都是真实代码、真实落盘文件、真实可复盘数据。