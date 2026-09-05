---
title: 基于 Harness + SDD + 多仓管理模式的 AI 全栈开发实践｜得物技术
source_url: https://mp.weixin.qq.com/s/ygQGSH5c7GHYDvkqWoQTXQ
publish_date: 2026-05-06
tags: [wechat, article, claude, agent, harness]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: fdc989aececd1f2b67559211107fbb38e255939ab02a504174fcd7c43d74f446
---
# 基于 Harness + SDD + 多仓管理模式的 AI 全栈开发实践｜得物技术
原创 盖伦 得物技术
2026年5月6日 18:30 上海
## 一、核心理念：Harness 思维 — 让 AI 模仿，而不是凭空创造
### 全栈 AI 开发最容易踩的坑
全栈 SDD 开发中，最常见也最致命的错误是：让 AI 从零开始写代码。AI 模型具备"通识能力"，给它一个需求描述，它确实能生成可运行的代码。但问题在于，这些代码往往是"外星代码"：
- 风格不一致（命名规范、目录结构、分层方式与项目现有代码不同）
- 复用率低（没有利用项目已有的公共组件、工具函数、请求封装）
- 采纳率低（Code Review 时后端同学看到"外来风格"的代码，会产生大量修改意见）
结果：AI 生成了代码，但 Review 成本和返工成本反而更高了。
### Harness 思维的核心：给 AI 一个"模仿对象"
Harness（约束）思维的本质是：给 AI 一个已有的实现作为参照，让它照着复刻一份，而不是凭空创造。
**四大原则：**
| 原则 | 说明 |
|------|------|
| 找相似实现 | 在代码库中找到功能最相似的已有实现，作为参照 |
| 复用优先 | 能复用的组件、接口封装、数据结构，直接复用 |
| 模仿着复制 | 哪怕是"抄一份改一改"，也比用新方式写好 |
| 约束生成范围 | 在提示词中明确指定参考文件、参考接口 |
**反面 vs 正面示例：**
反面（凭空创造）：
> 请实现一个结束语管理的 CRUD 接口
正面（Harness 约束）：
> 请参照现有"场景欢迎语"功能（后端接口 /api/v1/feature/list，前端入口 FeatureTable/index.tsx:53-58）实现"结束语"功能。数据结构、分层方式、命名风格都保持一致。新增场景 code：categoryCode = "SCENARIO_CLOSING"
两者的差距不在于 AI 是否"聪明"，而在于你给了 AI 多少约束和上下文。约束越精准，生成代码的可用性越高。
## 二、全栈工作区搭建与 Codebase Indexing
### 为什么要搭多仓工作区？
前后端代码通常分布在两个独立仓库。将前后端代码放在同一个工作区下，有三个核心价值：
1. **Codebase Indexing**：Cursor 对工作区内所有代码进行向量化嵌入，建立语义索引。AI 能跨仓库理解代码关系，生成质量大幅提升。
2. **上下文完整**：AI 同时能看到前后端代码，接口字段、命名风格自然对齐。
3. **SDD 文档集中管理**：前后端 SDD 文档在同一工作区，便于接口契约对齐。
### Cursor vs Claude Code 实测对比
| 功能维度 | Cursor | Claude Code |
|----------|--------|-------------|
| 代码库语义索引 | grep + 代码段语义相似度检索，速度快，理解能力全面 | 仅支持 grep，准确度严重依赖模型能力 |
| 代码生成速度 | 极速（平均 1-3 分钟）| 中速（平均 3-30 分钟，5 分钟以上是常态）|
| 代码采纳率 | 两者相当 | 两者相当 |
| 文件/代码段引用 | 快捷键、拖拽即可引用 | 需手动 @文件路径，无法引用代码段 |
| 多 Agent | 默认开启（多 Tab 并行）| 需要手动注册子 Agent |
| 费率模型 | 失败任务不收费 | 失败任务耗时长，容易浪费大量 Token |
| 历史会话恢复 | 仅能查看当前项目会话记录，存在会话丢失 | 可查看全局会话记录 |
| 综合评价 | 快速迭代首选，推荐 Composer2 模式 | 长链路复杂任务可用，依赖卓越的基础模型 |
## 三、SDD 驱动的全栈代码生成流程
### 全栈 SDD 的特殊之处
- 生成两份 SDD 文档（前端一份、后端一份）
- 接口契约对齐（前端 SDD 中的接口调用与后端 SDD 中的接口定义必须严格对应）
- 字段映射一致（前端 VO 中的字段名与后端返回的 JSON 字段名一一对应）
### SDD 指令使用说明
典型工作流：**openspec-propose（想）→ openspec-apply-change（做）→ openspec-archive-change（收）**
- 场景 A 初次开发：openspec-explore → openspec-propose → openspec-apply-change → openspec-verify-change → openspec-archive-change
- 场景 B 二次开发：openspec-explore（定位旧代码）→ openspec-propose "修改..." → openspec-apply-change → openspec-verify-change → openspec-archive-change
## 四、多 Agent 协作：前后端并行开发
### Claude Code Subagent 模式
主 Agent（对话的 Claude Code）
├── Subagent 1：前端代码生成专家（model: sonnet，tools: Read/Edit/Write/Bash）
├── Subagent 2：后端代码生成专家（model: sonnet，tools: Read/Edit/Write/Bash）
└── Subagent 3：Mock 数据生成（model: haiku，可选）
## 五、前后端联调：三阶段验证策略
- **阶段 1：前端 Mock 验证** — 前端代码 + Mock 数据，本地跑通页面交互，验证 UI 逻辑
- **阶段 2：后端独立验证** — mvn clean compile 编译通过，无需完整启动服务
- **阶段 3：前后端联调** — 前端连接测试后端接口，端到端验证
## 六、警惕 SDD 陷阱：测试如何介入
SDD 不等于需求文档。AI 在模仿参考代码生成新代码时，会自动复刻很多隐性功能。
**测试介入建议：**
- SDD Review 阶段：关注接口契约是否完整，字段定义是否与需求对应
- 代码 Review 阶段：对照 SDD 文档和实际代码的差异，主动寻找隐性功能
- 联调测试阶段：不要只测 happy path，覆盖边界场景和隐性行为
## 七、实践效益
- **采纳率提升**：Cursor 索引能力提高采纳率及功能实现完整性
- **耗时降低**：SDD 模式下前后端可完全并行，原本 2+4 人日需求压缩至 3 人日，**提效 50%+**
- **调试环节不依赖阻塞**：前端 Mock 自测，后端远程调试
- **AI 全栈学习成本骤降**：只需掌握入门级别前后端知识，即可介入简单全栈需求开发