---
title: Claude Code 的 Agent 工程
source_url: https://mp.weixin.qq.com/s/vP4bfT93egfH3NTwkpwcDw
publish_date: 2026-04-25
tags: [wechat, article, claude, openai, agent, multi-agent]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: 523023775240153240f98fa9e0745fd0a8eef992a36111cf2bbb3ee1e96c6cdb
---
# Claude Code 的 Agent 工程
> 来源：微信公众号「SooKool」  
> URL：https://mp.weixin.qq.com/s/vP4bfT93egfH3NTwkpwcDw  
> 作者：Zhi.Yuan  
> 发布时间：2026年4月1日 12:42  
> SHA-256：`417c5764404afba03c0584973d3606b637c048f1c5628330d40ecae966b64035`
## 核心概述
Claude Code 源码泄露之后，Zhi.Yuan（SooKool）与 AI 一起分析，拆解 5 个核心工程设计。
## 五大工程设计
### 一、StreamingToolExecutor — 边说边干
**痛点**：传统 Agent 框架串行执行：模型输出完 → 解析工具 → 一个个执行 → 等结果 → 下一轮。四步之间全在等。
**Claude Code 方案**：模型流式输出时，只要吐出 `tool_use` JSON block，执行器立刻启动该工具。不等模型说完。只读操作（读文件/搜代码）最多 10 个并行，写操作排队串行。
**孤儿工具处理**：`yieldMissingToolResultBlocks` 函数 — API 中断时给每个"孤儿工具调用"生成错误占位，中断消息标记为 `TombstoneMessage`（墓碑消息），保证消息流不断裂。
**核心理念**：把"失败一定会发生"当成设计前提，而不是异常。
### 二、while(true) 单线程主循环
Claude Code 的 Agent 主循环是一个 `async function*`（异步生成器），核心在 `query.ts`。
```
while (true) {
    // state.transition 记录上一轮为什么继续
    // (工具调用 / 错误恢复 / 压缩重试)
    // yield 每条消息、token、工具进度 → 上层 UI
    // 消费端慢了？循环自然暂停，背压天然
    // 取消？generator.return() + finally 级联清理
}
```
Anthropic 原文：
> "A simple, single-threaded master loop combined with disciplined tools delivers controllable autonomy."
**设计哲学**：单线程主循环 + 有纪律的工具 = 可控的自主性。多 Agent 协作（Agent Teams）是锦上添花，单线程循环才是基本盘。
### 三、四级上下文压缩接力
| 级别 | 名称 | 机制 | 特点 |
|------|------|------|------|
| L1 | Snip Compact | 裁掉较早的历史消息，保留尾部 | 最轻量，几乎无信息损失 |
| L2 | Microcompact | 用 cache_edits 机制清旧工具结果 | 不动正文，只清冗余工具信息 |
| L3 | Context Collapse | 消息折叠成摘要，原始数据保留 | **可逆** — commit log 记录，`projectView()` 重放 |
| L4 | Autocompact | fork 子 Agent 完整总结 | 重武器，只前三级兜不住时动用 |
**L3 的关键创新**：折叠操作可逆、可审计。Agent 跑偏了可回溯到哪一步出问题。大多数框架的压缩是破坏性的，Claude Code 选了更复杂实现来保住调试能力。
**优先级**：可调试性 > 实现简洁性
### 四、记忆不靠向量，靠小模型
Claude Code 的持久化记忆：**Markdown + YAML frontmatter**，不是数据库，不是向量索引。
**四种记忆类型**：
| 类型 | 用途 | 示例 |
|------|------|------|
| User | 用户画像 | "资深后端工程师，第一次碰 React" |
| Feedback | 纠正 + 确认 | "别 mock 数据库，上次出过事" / "这个选择不错" |
| Project | 项目动态 | "下周四代码冻结，移动端要切分支" |
| Reference | 外部资源指针 | "Pipeline bug 跟踪在 Linear INGEST 项目" |
**加载流程**：每次对话开始只加载 `MEMORY.md` 索引 → 用 Claude Sonnet 做轻量推理 → 挑出最相关的 5 个记忆文件注入上下文。
**为什么不用向量**：
- 向量匹配词汇相似度，算不出"上次说不要 mock 数据库"和"现在要写数据库测试"之间的关联
- 小模型（5 个文件头推理）成本极低，准确度完全不在一个量级
**Feedback 的设计细节**：同时记录"纠正"和"确认"。只从错误学习会让 Agent 越来越保守；同时记录做对的事，防止退化。
### 五、用 AI 审查 AI — Hook 系统
Claude Code 的 Hook 有四种类型：
| 类型 | 实现 |
|------|------|
| Command | Shell 命令 |
| HTTP | POST 外部服务 |
| **Prompt Hook** | 调用 Claude Sonnet 判断该不该执行 |
| **Agent Hook** | 部署 Claude Haiku Agent 跑多步验证 |
**典型场景**：
- Prompt Hook：Agent 要写文件时，让 Sonnet 判断"这次修改有没有明显风险"
- Agent Hook：Haiku 跑完整检查流程再放行
**退出码语义**：`exit 0` 正常通过；`exit 2` 直接否决（阻塞性错误）；其他码警告但不阻断。Hook 可以"一票否决"危险操作。
**为什么比规则引擎强**："这次改动合不合理"需要语义理解，无法写成 if-else。小模型成本低、覆盖广，比正则规则库灵活得多。
## 工程哲学总结
Dario Amodei 提出的三个研究方向：
1. **Long-horizon learning** — 长时间线规划执行
2. **Multi-agent coordination** — 多 Agent 协调
3. **Evaluation of dynamic systems** — 动态系统评估
Claude Code 的 **Coordinator 模式**已在实践：Coordinator 只调度，Worker 只执行，各自持有完全不同的工具集。
**核心洞察**：
- 模型能力只是一个变量
- 循环设计、工具编排、上下文管理、记忆系统、人机接口 — 每一个都是独立的工程挑战
- Agent 领域正在分层：底层是模型能力（Anthropic/OpenAI/Google 推），上层是 Agent 工程
> Anthropic 的理念："A simple, single-threaded master loop combined with disciplined tools delivers controllable autonomy."