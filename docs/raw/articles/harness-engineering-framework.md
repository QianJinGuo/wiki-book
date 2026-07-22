---
title: Harness Engineering 概念框架
source_url: https://mp.weixin.qq.com/s/gs5ndvlMqM-Y4jg1_D2aFw
publish_date: 2026-04-27
tags: [wechat, article, claude, openai, agent, harness, rag]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 3f3991675a4793a2966a98e12a7dbc6a706f249a37ccaab7b58b77066357f980
---
# Harness Engineering 概念框架
来源：code秘密花园，ConardLi，2026-04-03
## 三次演进
### 1. Prompt Engineering（怎么说）
- 核心：把话说清楚 → 塑造局部概率空间
- 天花板：Prompt 解决"表达问题"，不是"信息问题"
- 适用：单轮生成、开放问答
### 2. Context Engineering（给什么）
- 核心：模型未必知道，系统必须在调用时把正确信息送进去
- 典型实践：RAG、Skills 渐进式披露
- Skills 三层：元数据层(~50T) → 指令层(~500T) → 资源层(按需)
- 局限：主要作用在"输入侧"，无法解决连续执行中的偏差
### 3. Harness Engineering（别跑偏）
- 核心：当模型从"回答问题"走向"执行任务"，系统必须负责驾驭过程
- 三层关系：Prompt ⊂ Context ⊂ Harness
## 核心方程
- Agent = Model + Harness
- Harness = Agent - Model = 除模型外的所有东西
## 六层结构
### 1. 上下文管理
- 角色与目标定义
- 信息选择与裁剪（把相关信息挑出来，把不相关的挡在外面）
- 上下文结构化组织（分层）
### 2. 工具系统
- 给模型什么工具（围绕任务场景配置）
- 什么时候调用工具（判断是否需要外部信息）
- 工具结果如何重新喂回模型（提炼有效证据）
### 3. 执行编排
- 理解目标 → 判断信息是否足够 → 必要时获取外部信息 → 基于结果继续分析 → 生成输出 → 检查输出是否满足要求 → 不满足则修正或重试
### 4. 状态与记忆
- 当前任务进行到哪一步
- 哪些中间结果应该保留
- 哪些内容应该形成长期记忆
### 5. 评估与观测
- 输出验收
- 环境验证（真实验证，可运行/可点击/可交互）
- 自动测试
- 过程观测（日志/指标/调用链/重试记录）
- 质量归因
### 6. 约束、校验与失败恢复
- 约束：限制模型可做和不可做的事
- 校验：输出前检查（是否回答了问题/是否遗漏关键要求/是否满足格式规范）
- 恢复：分析错误原因 → 重试同一步/切换备用路径/回退到上一个稳定状态
## Anthropic 实践
### 问题1：上下文焦虑
- 现象：任务一长，模型上下文窗口越来越满，开始丢细节/丢重点/急着收尾
- Compaction vs Reset：
  - Compaction：同一Agent，历史变短，心理状态延续
  - Reset：直接换干净上下文的新Agent，交班时交接清楚
- 结论：对于某些模型（如Claude Sonnet 4.5），Reset才能真正"清空包袱、重新出发"
### 问题2：自评失真
- 现象：模型做完之后自评偏乐观（设计/体验/产品完整度等无绝对二元答案的问题）
- 解法：Generator + Evaluator 分离 = 生产与验收必须分离
- Planner：把短需求扩展成完整产品规格
- Generator：逐步实现
- Evaluator：实际操作页面/跑交互/看结果，不是读代码打分
## OpenAI 实践
### 铁律：人类不写代码，只设计环境
- 拆解意图：把产品目标拆成Agent能理解的小块任务
- 补全能力：Agent失败时问"环境里缺了什么让它失败了"，然后补上
- 建立反馈回路：让Agent能看到自己工作的结果
### 渐进式披露
- 早期错误：巨大的AGENTS.md把所有规范/架构/约定一股脑塞进去
- 最终方案：AGENTS.md只有~100行，充当"目录页"，指向仓库里的详细文档
  - AGENTS.md（入口，只有指针）
  - ARCHITECTURE.md（架构总览）
  - docs/design-docs/（设计文档，带验证状态）
  - docs/exec-plans/（执行计划，活跃/已完成/技术债务）
  - docs/QUALITY_SCORE.md（各模块质量评分）
  - CI自动校验文档新鲜度和交叉引用
  - "文档园丁"Agent定期扫描过时文档并提PR修复
### 让Agent看见整个应用
- 单次Codex运行经常连续工作6小时以上（人类睡觉时）
- Agent自己跑应用→发现bug→修复→验证→提PR
### 把架构约束写进系统
- 不是靠工程师反复提醒，而是把经验写成机器可执行的检查规则
- 例如：业务代码按固定分层组织（Types/Config/Repo/Service/Runtime/UI）
- 规则不只是报错，还告诉Agent该怎么改
- 后台Agent定期扫描代码库：检查哪些模块变乱/给不同区域打质量分/找出值得重构的部分/直接提交修复PR
## LangChain 案例
- 底层模型完全不变
- 仅仅通过改造和迭代Harness
- Terminal Bench 2.0：52.8 → 66.5（Top30 → Top5）
## 核心洞察
> 真正决定AI产品上限的，也许是模型；
> 但真正决定AI产品能否落地、能否稳定交付的，往往是Harness。
> AI落地的核心挑战，正在从"让模型显得聪明"，转向"让模型在真实世界里稳定工作"。