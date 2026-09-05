---
title: 一篇看懂 Agent Harness 的结构！ — 12组件+7决策完整框架
source_url: https://mp.weixin.qq.com/s/BEuV7aCCZgWcX7MRLVC86w
publish_date: 2026-04-20
tags: [wechat, article, claude, openai, agent, harness, llm]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: bc679406d06369085be500a3c13aebc6486c033c78e3880367f1df90b14f1395
---
# 一篇看懂 Agent Harness 的结构！ — 12组件+7决策完整框架
> 本文是对 https://mp.weixin.qq.com/s/BEuV7aCCZgWcX7MRLVC86w 的存档
> 作者：石榴爸爸 AI 实战，2026-04-20
## 核心主张
Agent = Model + Harness。模型负责智能，Harness 负责把智能变成能持续工作的系统。
LangChain 证明：只改 Harness（不改模型权重），TerminalBench 2.0 从榜外跳到第 5 名。
## 三层工程
1. Prompt engineering / 2. Context engineering / 3. Harness engineering
## 生产级 Harness 12 组件
### 1. 编排循环
TAO/ReAct：组 prompt → 调模型 → 解析输出 → 执行工具 → 结果喂回 → 继续。Anthropic 称"dumb loop"。
### 2. 工具
工具注册 / Schema校验 / 参数提取 / 沙箱执行 / 结果捕获 / 格式化 observation
### 3. 记忆
短期记忆 + 长期记忆。Claude Code 三级：轻量索引(~150char) → 详细主题文件 → 原始记录
### 4. 上下文管理
Context rot 是隐性最大失败原因。策略：Compaction / Observation masking / Just-in-time retrieval / Sub-agent delegation
### 5. Prompt Construction
system prompt + 工具定义 + 记忆 + 会话历史 + 当前消息
### 6. 输出解析
优先原生 tool calling。判断：有 tool call → 执行循环；无 → 最终回答
### 7. 状态管理
LangGraph: typed dictionary；Claude Code: git commit=checkpoint, progress file=scratchpad
### 8. 错误处理
四类：瞬时/模型可恢复/需用户处理/非预期。Stripe 重试 ≤2 次
### 9. 安全护栏
OpenAI 三层(输入/输出/工具)；Anthropic 权限与推理分离
### 10. 验证回路
规则型(测试/lint) / 视觉(截图) / LLM as judge。质量提升 2-3 倍
### 11. 子 Agent 编排
Fork(完整复制) / Teammate(文件通信) / Worktree(独立分支)
### 12. 循环流程
Prompt Assembly → LLM Inference → Output Classification → Tool Execution → Result Packaging → Context Update → Loop
## 7 个关键决策
1. 单 agent vs 多 agent（先单再考多）
2. ReAct vs Plan-and-Execute（后者快 3.6x）
3. 上下文管理策略（ACON：降 26-54% token 保 95%+ 准确率）
4. 验证回路设计（guides vs sensors）
5. 权限宽严（速度 vs 风险）
6. 工具暴露（Vercel 砍 80% 反而更好；Claude Code lazy loading 削 95%）
7. Harness 厚度（Anthropic 薄 vs 显式控制厚）
## 框架对比
- Anthropic：Gather-Act-Verify
- OpenAI Agents SDK + Codex：三层结构
- LangGraph：显式状态图
- CrewAI：Agent/Task/Crew 分层
- AutoGen：conversation-driven orchestration
## 脚手架隐喻
脚手架不盖楼，但工人够不到更高楼层。模型变强 → harness 部分复杂度可删（共进化）。Manus 6个月重写5次删复杂度。