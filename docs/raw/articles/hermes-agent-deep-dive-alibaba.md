---
title: 深度解析 Hermes Agent 如何实现"自进化"及其 Prompt / Context / Harness 的设计实践
source_url: https://mp.weixin.qq.com/s/2xFei8dMx99lc-iyrZZrww
publish_date: 2026-04-30
tags: [wechat, article, claude, gpt, deepseek, agent, harness, coding, llm, openclaw, gemini]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 5b6526a51880a9fedde3a6caefed1350391d10bed29833d140a4f4a7a24b76eb
---
# 深度解析 Hermes Agent 如何实现"自进化"及其 Prompt / Context / Harness 的设计实践
## 核心定位
Hermes Agent = Nous Research 开源 Agent（2月底发布，GitHub 4万+ Stars），主打"持久运行"+"自进化"。站在 OpenClaw / Claude Code 肩膀之上，最大亮点：**Self-Evolving**。
## Self-Evolving：内外双路径驱动的自进化
### 路径一：动态 Skill 沉淀（"外挂式"进化）
**核心转变**：Skill 从"静态调用"变成"动态生成"。
OpenClaw/Claude Code 的 Skill 是静态的（用户预编写或下载安装），Hermes 则能在每次完成任务后**自动复盘**，将试错经验抽象为结构化 Skill 文件包。
**触发机制**：
- `_iters_since_skill` 计数器：连续 10 轮没创建/修改技能 → 系统提醒 Agent 整理经验
**后台审查 Agent**：主 Agent 回复后，异步 Fork 审查 Agent，从三个维度复盘：
- 记忆审查：提炼值得长期保留的关键经验
- 技能审查：判断任务解决路径是否值得固化为 Skill
- 综合审查：反思是否有优化空间或错误模式
→ "前台即时响应、后台异步进化"
### 路径二：RL 训练闭环（"内功式"进化）
Skill 沉淀只是"记笔记"，RL 训练才是"练内功"——改变模型权重，实现真正的自进化。
**完整闭环**：
1. **任务定义**：用户指定训练目标
2. **轨迹捕获 + 批量数据合成**：batch_runner.py 并行生成 ShareGPT 格式轨迹；默认用 Claude Opus 4.6 作为 Teacher 模型；工具集随机采样防止死记硬背；零推理过滤（无显式推理的样本丢弃）
3. **轨迹压缩**：精炼到 15250 Tokens（保护头部任务定义 + 尾部最后4轮 + 中间用 LLM 摘要替代）
4. **渐进式训练 + 自动评估**：小步快跑，先验证再大规模训练
5. **固化**：效果达标则固化模型版本
**GRPO 算法**（DeepSeek R1 提出）：同问题生成 8~16 个回答 → 奖励函数打分 → 学习多产出高分。无需单独训练 Reward Model。
**奖励函数设计**：
- 组合 3~5 个维度：正确性（权重2.0最高）、格式规范（0.5）、渐进格式（0~0.5）
- 可执行真实验证（编译代码、读文件、访问网络）
**为什么不用用户对话数据做 RL**：
- 隐私问题
- 质量参差不齐，直接训练会让模型变差
- 正确做法：人工导入 + Teacher Model 质量把关
## Prompt Engineering
### 工具使用强制指导（因"材"施教）
| 模型 | 问题 | 动态注入指令 |
|------|------|------------|
| Claude | 训练充分，无需额外提醒 | — |
| GPT/Codex | "只说不做" | 必须用工具执行，禁止幻觉 |
| Gemini/Gemma | 需要规范 | 绝对路径、先读后改、并行调用 |
### 生态兼容性（极低迁移成本）
- **OpenClaw 生态**：直接读取 AGENT.md、SOUL.md、USER.md 等配置文件
- **AI Coding 规范**：支持 CLAUDE.md、.cursorrules、.cursor/rules/*.mdc
- **多平台 IM**：WhatsApp、Slack 等适配提示词
## Context Engineering
### 压缩：相对比例阈值触发
| | OpenClaw | Hermes |
|--|---------|--------|
| 触发方式 | 绝对 Token 数量（如 18K） | 相对窗口比例（如 50%） |
| 逻辑 | 简单直接 | 自适应不同模型窗口大小 |
**裁剪策略**：头尾保护（系统指令+最后几轮）+ 中间 LLM 摘要
### Memory：内外双层混合架构
**内部记忆**：Markdown 文件（MEMORY.md/USER.md）记录长期静态事实；SQLite 存储所有每日对话历史（为 RL 训练提供原始轨迹素材）
**外部记忆**：原生支持 Mem0、Honcho、Hindsight、Supermemory 等第三方服务，实现跨框架记忆流转
### 上下文注入：@ 语法效率革命
```bash
@file:main.py           # 注入完整文件
@file:src/utils.py:10-20  # 注入指定行
@folder:src/            # 列出目录树
@diff                   # git diff
@git:3                  # 最近3次提交
@url:https://...        # 抓取网页
```
本质：**工具调用 → 上下文预加载**，省去"是否调用工具"的中间推理环节。
## Harness Engineering
### 全生命周期 Hook 机制
`on_agent_start` / `on_tool_call` / `on_tool_result` / `on_agent_end` / `on_turn_start` / `on_pre_compress` / `on_memory_write` / `on_delegation` / `on_session_end`
### 14 种错误分类与自愈体系
auth / auth_permanent / billing / rate_limit / overloaded / server_error / timeout / context_overflow / payload_too_large / model_not_found / format_error / thinking_signature / long_context_tier / unknown
### 子 Agent 沙箱隔离
```python
DELEGATE_BLOCKED_TOOLS = {
    "delegate_task",  # 防递归委派
    "clarify",       # 防嵌套提问
    "memory",        # 防操纵记忆
    "send_message",  # 防消息劫持
    "execute_code"   # 防权限升级
}
MAX_CONCURRENT_CHILDREN = 3
MAX_DEPTH = 2
```
### 安全护栏
- 防 Prompt 注入
- Skill 文件加载前静态安全扫描
## Agent 演进三阶段
| 阶段 | 代表 | 特点 |
|------|------|------|
| 早期被动 Agent | — | 一问一答，无法执行复杂长周期任务 |
| 自主 Agent | OpenClaw / Claude Code | 自主规划 + 工具调用 + 复杂长周期任务 |
| 自进化 Agent | **Hermes** | 自主执行 + 执行中学习 + 越用越强 |
## Related
- [[entities/hermes-agent|Hermes Agent]] — Nous Research 开源，核心亮点：自进化
- [[concepts/openclaw-architecture|OpenClaw 架构]] — Hermes 竞品，Prompt/Context/Harness 设计相似
- [[entities/claude-code-architecture|Claude Code 架构]] — Hermes 参照系，同样注重持久运行