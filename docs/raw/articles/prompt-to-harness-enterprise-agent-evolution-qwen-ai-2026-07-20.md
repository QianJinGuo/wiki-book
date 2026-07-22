---
title: "从 Prompt 到 Harness：企业级 Agent 工程的完整演进之路"
source_url: "https://mp.weixin.qq.com/s/xH4cyBJJJlG9cfcmSU5ztA"
source_account: "千问AI平台"
author: "储旭(槿柏)"
ingested: 2026-07-22
type: raw-article
tags: [harness-engineering, prompt-engineering, context-engineering, enterprise-agent, five-layer-architecture, information-lifecycle]
review_value: 8
review_confidence: 7
review_vxc: 56
review_decision: supplementary
supplements: entities/prompt-context-harness-three-evolutions-tencent
---

# 从 Prompt 到 Harness：企业级 Agent 工程的完整演进之路

> **来源**：千问AI平台/储旭(槿柏)，2026-07-20
> **评分**：v=8, c=7, v×c=56 → **Supplementary** → [[entities/prompt-context-harness-three-evolutions-tencent]]

## 大模型的四个结构性约束

1. **上下文物理容量 ≠ 有效容量** — 128K 窗口中 70% 可能是噪音数据（前序工具 JSON 返回值），有效容量可能不如 32K 的精心管理窗口
2. **工具数据搬运失真** — LLM 充当"数据搬运工"时可能截断 JSON、遗漏嵌套字段、混淆相似 UUID，每一步都在恶化信噪比
3. **注意力稀释 + 自恶化循环** — 上下文膨胀 → 注意力稀释 → 参数错误率上升 → 更多重试消息 → 上下文进一步膨胀
4. **LLM 天然无状态** — 单次执行崩溃丢失中间状态；跨执行无法从历史学习，知识在诞生同时开始遗忘

> 不要用更大的模型掩盖工程层面的问题。

## 三阶段演进

### 第一阶段：Prompt 工程
CLAUDE.md 式全量 System Prompt 注入（500+ 行/10 章节/15-20K token），包含设计哲学、安全规则、项目路径映射、路由表、发布规范、API 注册表。本质是"持久化 System Prompt 工程"，靠关键词触发映射到正确路径。

**天花板**：全量注入占据上下文空间，无论是否相关。

### 第二阶段：Context 工程
核心创新——**渐进式披露（Progressive Disclosure）**：
- 分层加载上下文，只注入当前步骤所需
- **parameterBindings** 声明式绑定：把数据搬运从 LLM 职责中彻底移除
- 系统管理信息生命周期（产生→压缩→索引→按需恢复）

### 第三阶段：Harness 工程（五层架构）
1. **原始证据层**：API 响应/文件变更/测试结果，原始存储随时回溯
2. **状态管理层**：Tasks/Workflows/State 管理单元，追踪执行进度
3. **技能层**：可复用能力单元（Skill），组合编排
4. **治理层**：权限/审计/配额/回滚
5. **运行时层**：编排引擎/并发控制/错误恢复

## 关键设计原则

- 让 LLM 做它擅长的事（理解、规划、推理），让系统做它擅长的事（数据搬运、格式转换、精确传递）
- Parameter binding 而非 LLM copy-paste — 减少 90%+ 的搬运错误
- 上下文管理不是"截断"，而是信息生命周期管理
