---
title: Thin Harness, Fat Skills：AI工程架构的本质
source_url: https://mp.weixin.qq.com/s/FgV_r2sz_LJNhy5TGeLorQ
publish_date: 2026-04-25
tags: [wechat, article, claude, harness, llm]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: 7ed47be1a02594a46ea2caa72525e4c104d1052b10b84dd062baf230c7e9dfe0
---
# Thin Harness, Fat Skills：AI工程架构的本质
**来源**：winkrun（AI工程化）
**作者**：Garry Tan（YC CEO内部倡导）
**验证来源**：ByteCrafter、Sam Ward、forgedynamicsai、ChaiBytesAI
## 核心理念：Latent vs Deterministic 空间分离
AI应用有两个完全不同的空间：
- **Latent 空间（潜在空间）** = 模型判断、阅读、综合、推理——模型擅长但不确定
- **Deterministic 空间（确定性空间）** = SQL、编译、算术、文件操作——代码保证精确
**核心错误**：把确定性任务扔给LLM，把不确定性任务交给人去做。
典型反例：用LLM安排800人座位表（确定性编排问题），结果模型反复纠结座位冲突。
## 三层架构：Fat Skills → Fat Code → Thin Harness
### 1. Fat Skills（Markdown 技能文件）
技能文件是永久升级资产，会随使用自动复合进化。
每次运行流程：
1. 运行 Skill → 得到结果
2. 判断结果质量
3. 固化好的结果到 Skill 文件
4. 下次使用时复合知识
新模型发布时，所有 Skill 自动受益（因为 Skill 是结构化知识，而非硬编码判断）。
**铁律**：同一个问题问两次即失败——第一次问模型，第二次必须固化到 Skill 文件。
### 2. Fat Code（确定性逻辑）
用代码处理确定性事务：
- SQL 查询 → 代码执行
- 文件操作 → 代码处理
- 编译/类型检查 → 代码保证
代码不"智能"，但代码稳定、可复现、可测试。
### 3. Thin Harness（~200行轻量框架）
案例对比：
- Playwright CLI（100ms响应）
- Chrome MCP（2-5秒，15秒+延迟）
- **结论：Playwright CLI 比 Chrome MCP 快 75 倍**
Harness 只负责：
- 加载 Skill
- 路由任务
- 调用确定性代码
**它不包含任何业务逻辑。**
## 关键反模式
### ❌ 40+ 工具定义
工具越多，系统越难维护。应该用 Skill 封装复杂流程，而非无限扩展工具列表。
### ❌ 2-5秒 MCP 往返
慢的外部调用会拖垮整个系统。选择响应速度快的工具（如 Playwright CLI vs BrowserMCP）。
## 真实案例
### YC 创始人活动评分改进
- 改进前：12% 参与者评价"还好"
- 改进后：4%（通过 Fat Skills 固化高质量反馈流程）
### Maria Santos 的日记化洞察
- 目标：说 AI Datadog
- 实际情况：80% 提交在计费模块
- 结论：深入使用的实际情况与预期差异巨大
## Garry Tan 铁律
> "同一个问题问两次即失败，需要固化到 Skill 文件或 cron 定时任务。"
## 与 Claude Code 架构的关系
Thin Harness 理念与 Claude Code 的设计高度一致：
- Claude Code 的 REPL = Harness（薄控制面）
- Claude Code 的 Skills = Fat Skills（结构化技能文件）
- Claude Code 的 Tool Runtime = 确定性逻辑执行
这套架构的核心洞察是：**让模型做判断，让代码做执行，让 Skill 承载知识积累。**