---
source_url: "https://mp.weixin.qq.com/s/e7p6WlCZH2gXA4YKNGB_rw"
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
ingested: 2026-05-23
sha256: ""
---

# 逆天的架构：用 Harness+LangGraph+A2A 写一个 Agent Team

**来源：** 技术自由圈 | 45岁老架构师尼恩 | 2026年5月20日
**类型：** 面试辅导材料（技术包装，含大量成功案例营销）

## 核心架构

### Adversarial Agent Team 对抗性多智能体团队
核心理念：**Leader-Worker-Verifier 三角色制衡**

- **Leader**：总控智能体，接收需求、拆解任务、管理阶段依赖、触发人类介入
- **Worker**：执行智能体（调研/文档/代码/PPT/数据），独立上下文+工具+记忆
- **Verifier**：第三方质量门禁，与 Worker 形成对抗关系，校验不通过自动打回重做

### 四大核心场景
1. **Info Harness**：多路 Worker 并行调研 → Verifier 核验来源/去重/辨伪/三角验证
2. **Coding Harness**：Developer → Tester → Reviewer → Verifier，CI/CD 式对抗流水线
3. **Document Harness**：Planner → Writer → Formatter → Evaluator，流水线式文档生产
4. **Reports Harness**：多轮对抗修正措辞/条款/排版

### LangGraph 角色
- StateGraph + 自定义全局状态 + 持久化 Session
- Batch 内并行、Batch 间串行依赖
- producing → verifying → done 标准状态流转
- 最大迭代上限防死循环

### A2A 协议（Google 2025.4）
- 三层传输：JSON-RPC 2.0、gRPC、HTTP+JSON
- SSE 流式传输 + webhooks 异步推送
- Orchestrator-Worker + A2A 嵌套：顶层集中管控，域内 Agent 直连

### LangGraph 与 Harness 关系
- LangGraph = Harness 的**编排引擎 + 状态管理**组件
- 不是 "LangGraph vs Harness"，而是：Harness 是架构思想，LangGraph 是核心编排工具
- 联邦分层架构：Global Orchestrator + 域内 Leader

### 成本控制
- 简单任务走单 Agent，不启动 Team
- 用文件+白板做交接，不塞入上下文
- Token 消耗上限 + 并发数量限制

### 记忆与技能沉淀
- 每次协作经验 → Memory + Skill
- 垂直 Agent 越用越专业

## 注意
本文为面试辅导材料，含大量卖课/成功案例营销内容。技术架构部分有价值，但原文 3w+ 字超平台限制，完整代码需从作者百度网盘获取。
