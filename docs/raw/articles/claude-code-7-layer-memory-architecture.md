---
title: claude-code-7-layer-memory-architecture
source_url: https://mp.weixin.qq.com/s/Y5tytANpuvJkA1UsSwcCGg
publish_date: 2026-05-07
tags: [wechat, article, claude, agent, harness, multi-agent, coding, llm]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: ff406ccd8a7595c0b4a51f214421260fd3f40dc6983765108f387ab7e1a19af4
---
## 文章概要
troyhua（卡内基梅隆大学博士）对 Claude Code 源码的深度分析，聚焦其 7 层渐进式记忆管理系统。该架构借鉴人脑记忆分层原理，从毫秒级轻量清理到"做梦机制"巩固长期记忆，层层递进，成本递增，能力递增。
## 核心问题：上下文窗口 = LLM 的"金鱼记忆"
Claude Code 默认 200K token 上下文窗口（加 `[1m]` 后缀可达 1M）。一次真实 coding：读大文件 + grep 全仓库 + 几轮编辑 = 轻松超标。
**Token 计数基础**：`tokenCountWithEstimation()` 函数：
- 优先使用 API 返回的精确 `input_tokens`
- 对新增消息粗估（普通文本 ~4 bytes/token，JSON 更省）
- 预留约 20K tokens 作为输出缓冲，避免压缩时自己都塞不下
**上下文窗口优先级**：模型后缀 `[1m]` → 模型能力查询 → Beta Header → 环境变量 → 默认 200K
## 7层记忆架构详解
### 设计原则：防御金字塔
> "预防为主" — 尽可能防止下一层（更昂贵的）触发。
每层成本递增、能力递增，层层防护。
### 第1层：工具结果存储 — "日常清洁工"
**问题**：单次 grep 可返回 100KB+，大文件 cat 可达 50KB，直接塞上下文浪费 token。
**解决方案**：
- 超过阈值时，完整结果写到磁盘：`tool-results/<sessionId>/<toolUseId>.txt`
- 上下文里只放前 ~2KB 预览，用 `<持久输出>` 标签包裹
- 模型需要时，用 Read 工具读取完整版
**关键设计**：内容替换状态"冻结"——后续所有 API 调用用同样的预览，确保 Prompt 前缀字节完全一致，最大化缓存命中率。
**远程可调**：通过 `tengu_satin_quoll` 功能标志调节阈值，Anthropic 无需代码部署即可调整。
### 第2层：微压缩 — "每轮对话前的日常保洁"
最轻量级上下文清理，几乎不花 API 成本，每轮 API 调用前执行。
**三种机制**：
**a) 基于时间**
- 距离上次助手消息超过阈值（默认 60 分钟）
- 服务器端 Prompt Cache TTL 约 1 小时，缓存已过期，可安全清理
- 替换为 `[Old tool result content cleared]`，保留最近 N 条
**b) 缓存微型压缩**（技术最有趣）
- 使用 `cache_edits` 在服务器端删除旧工具结果
- 本地消息不变，避免破坏缓存前缀
- 工具结果注册到全局 `CachedMCState`，超过阈值选最旧删除
- **关键约束**：只运行主线。分支子代理（session_memory、agent_summary）若修改全局状态，会破坏主线程缓存编辑
**c) API级上下文管理**
- 使用 `context_management` API 参数，直接让 API 处理部分清理
### 第3层：会话记忆 — "最聪明的一层"
**核心洞察**：不是等上下文满了再慌张总结，而是**实时维护结构化笔记**。
**位置**：`~/.claude/projects/<slug>/.claude/session-memory/<sessionId>.md`
**结构化模板**：会话期间自动维护结构化笔记
**触发条件**：Token 增长达到阈值 +（工具调用次数达标 或 上轮无工具调用）
**零成本压缩**：
1. 检查会话记忆是否有实际内容（而非空模板）
2. 用会话记忆标记作为压缩摘要——**无需调用 API**
3. 计算哪些最近消息要保留（从 SummarizedMessageId 向后扩展）
4. 返回压缩结果：会话记忆为摘要 + 保留的近期消息
### 第4层：全压缩 — "上下文快满时的紧急刹车"
当 `tokenCountWithEstimation()` 超过自动压缩阈值（有效窗口 - 13K）且 Session Memory 不可用时触发。
**压缩流程**：
1. **预处理**：执行用户 PreCompact hook，去除图片、技能附件等
2. **生成摘要**：向摘要代理分支请求 9 部分摘要
   - 先写 `<分析>` 草稿思考，再输出 `<摘要>` 正文
   - 草稿剥离，不占最终 Token
3. **压缩后修复**：重新注入最近读的文件、技能内容、计划附件
4. **插入 `SystemCompactBoundaryMessage`** 标记压缩点
5. **只压缩部分消息**：提示本身过长时分组丢弃最旧消息，重试 3 次
### 第5层：自动记忆提取 — 构建跨会话长期知识库
每任务结束时，提取跨会话持久知识，存到 `~/.claude/projects/.../memory/`。
**四种记忆类型**：每种有特定条件和格式
**MEMORY.md 索引文件**：
- 最多 200 行或 25KB，超出自动截断
- 每个条目 ≤ ~150 字符
### 第6层：做梦机制 — "跨会话记忆巩固"
最惊艳的部分。积累足够会话后触发，像人脑睡眠时巩固记忆一样。
**门控序列**：从最便宜检查开始，大部分情况早早退出
**互斥锁**：`.consolidate-lock` 锁文件（PID + 时间戳），支持崩溃恢复和 stale 检测
**四阶段**：
1. **标定位置**：扫描 memory 目录，读 MEMORY.md，避免重复
2. **收集**：只 grep 怀疑重要的片段，检查矛盾记忆
3. **合并**：合并新信号到现有文件，删除矛盾事实，把相对日期转绝对日期
4. **整理与索引**：更新 MEMORY.md，删除过时条目，解决文件间矛盾
**Dream Agent 工具限制**：Bash 只读，Edit/Write 只限 memory 目录
**UI 显示**：后台任务，用户可从后台任务对话框终止，锁会回滚方便下次重试
### 第7层：跨代理沟通 — Multi-Agent 协作的基础
几乎所有后台操作（Session Memory、Dreaming 等）都基于**分支代理模式**。
**分支代理设计**：
- 状态隔离（克隆 LRU 缓存、AbortController 等）
- 通过 `CacheSafeParams` 和相同前缀共享 Prompt Cache，高效协作
**Agent Tool 支持多种模式**：
- `SendMessage Tool`：Agent 间实时通信（支持广播、跨会话等）
- **Agent Summary**：每 30 秒用最便宜的 Haiku 模型生成 3-5 词进度快照，用于协调
**持久内存范围**：三个级别
## 关键设计原则
| 原则 | 说明 |
|------|------|
| **分层防御** | 每层设计为防止下一层更昂贵的触发 |
| **提示缓存保存** | 几乎每个设计决策都考虑即时缓存的影响 |
| **隔离但共享** | 分叉代理克隆可变状态防止交叉污染，但共享提示缓存前缀防止成本爆炸 |
| **到处都是阻断** | 3次失败自动阻断、锁文件 PID 检测、互斥检查 |
| **GrowthBook 远程特征开关** | 几乎所有系统都被功能标志限制，关键功能随时可回滚 |
## 与其他层的关联
| 层级 | 核心机制 | 触发成本 |
|------|----------|----------|
| 第1层 | 工具结果磁盘存储 | ~0 |
| 第2层 | 微压缩（时间/缓存/API） | ~0 |
| 第3层 | 会话记忆实时维护 | ~0 |
| 第4层 | 全压缩（9部分摘要） | 高（API调用） |
| 第5层 | 跨会话记忆提取 | 中 |
| 第6层 | 做梦机制（四阶段） | 高 |
| 第7层 | 分支代理 + SendMessage | 中 |
## 相关链接
- 参考：[[entities/claude-code-commands-guide]]
- 参考：[[entities/claude-code-subagent-context-hygiene]]
- 参考：[[entities/agent-harness-context-management-working-set]]