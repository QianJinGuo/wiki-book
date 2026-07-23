# 开启Harness Engineering探索之旅

## Ch01.427 开启Harness Engineering探索之旅

> 📊 Level ⭐⭐ | 9.7KB | `entities/开启harness-engineering探索之旅.md`

# 开启Harness Engineering探索之旅

**来源**: 腾讯技术工程
**发布日期**: 2026-06-29
**原文链接**: https://mp.weixin.qq.com/s/uhc7_-0Vm_cw9p17b9VyJA

> 作者fanniemeng分享了腾讯电竞团队在Harness Engineering领域的系统探索——从AI Coding"出码率与提效之间的裂缝"出发，完整构建了包含协议层、管线层、纪律层、知识库的四层Harness体系，并沉淀出两条轨道（研发交付 + 线上运营）+ 一个长期记忆（知识库）的工程框架。

## 摘要

本文深度记录了腾讯电竞团队在AI Coding工程化实践中从"AI写代码占比高但研发整体节奏没快多少"的困惑出发，逐步构建Harness Engineering完整体系的历程。团队以SpecWorker为载体，设计了协议层（输入输出契约）、管线层（标准化"需求→上线"6+1阶段）、纪律层（硬编码品控门禁）、可监测性（追踪/回溯/度量三维度）以及知识库（AI长期记忆）五层架构，并沉淀了研发端到端交付与线上运营两条轨道。文章揭示了Harness Engineering的核心本质——"不是教模型怎么回答，而是设计模型怎么工作"，以及"AI Coding的工程化，本质是对不确定性的系统治理"。

## 核心要点

1. **出码率≠提效**：AI写出的代码占比持续走高，但版本节奏提效远不及预期。根因在于研发瓶颈从来不在"写代码"环节，而在理解、对齐、验证、沉淀等非编码环节——AI加速的恰恰是最不关键的环节
2. **Harness Engineering的三次迁移**：AI工程关注点经历了Prompt Engineering（2022-2024，关注单次调用）→ Context Engineering（2025，关注上下文信息组织）→ Harness Engineering（2026，关注整个任务执行环境）的连续迁移
3. **Agent = Model + Harness**：Mitchell Hashimoto给出的定义——"每当你发现Agent犯了一个错，你就花时间在它外面工程化一个方案，让它永远不再犯同样的错"——将工程关注点从"模型这一句说得对不对"挪到了"模型这一整段活干得稳不稳"
4. **SpecWorker 6+1阶段管线**：从P0 Brainstorming（可选）→ P1 Requirements → P2 Design → P3 Implementation → P4 E2E-Test → P5 Deploy → P6 Archive，每条阶段配套独立的Skill和SubAgent，前端/后端双流程并行
5. **纪律层五道防线**：针对AI的五种"偷懒模式"（跳过测试、猜修复方案、未验证即完成、偏离设计方案、自我评分偏高），设置TDD/根因分析/验证/Review/独立评估五道防线，全部硬编码到管线中

## 深度分析

### 1. "出码率与提效之间的裂缝"——Harness Engineering的起源问题

文章最深刻的洞察是AI加速与整体提效之间的结构性断裂。这一现象可以用"瓶颈转移定律"解释：局部加速（AI写代码）只会让瓶颈从"写"转移到"理解、对齐、验证、沉淀"——整条链的总时长由未被加速的部分决定。这印证了[Agent落地真相](../ch03/046-agent.html)中揭示的关键矛盾：AI能力增长与工程环境成熟度之间的剪刀差。

Brooks在《人月神话》中区分的附属复杂度（accidental，语法/工具/平台带来的翻译成本）和本质复杂度（essential，概念结构构造/外部世界顺应/需求可变性）在此得到验证——AI砍掉的恰好是附属复杂度，本质复杂度一分未少，甚至因代码产出更多而导致下游review/测试/维护任务加重。

### 2. SpecWorker六阶段管线的工程哲学

SpecWorker的管线设计体现了一个核心工程判断：**AI工作流编排应追求确定性而非自由发挥**。具体体现在：

- **状态持久化**：每个步骤的输入、输出、状态都写入共享的持久化文件（`.phase-metrics.jsonl`），而非在Agent间传递上下文——避免上下文丢失或失真
- **程序化门禁**：对关键步骤的产出物进行硬检查，不依赖AI的自我判断
- **输入质量约束**：通过标准化模板（需求模板、方案模板等）约束输入质量
- **对抗式纪律**：行为铁律 + 评估独立（防止自我高分）+ 自我合理化警报

这种"Fixed Flow + 程序化门禁"的设计哲学，与[Agent配置模型](../ch04/266-skill.html)中"渐进式披露"的思路形成对照——前者通过纪律保障可靠性，后者通过结构控制信息密度。

### 3. 可监测性的三个维度——信任AI的工程前提

文章将可监测性拆分为可追踪、可回溯、可度量三个维度，分别对应"AI是否真的做完了""出问题时根因是什么""这套体系到底值不值"三个信任问题。这一设计的关键创新在于：

- **可追踪**通过`evaluation.md` + `.phase-metrics.jsonl`双重落盘，让"AI自述完成"转化为机器可读的证据链
- **可回溯**针对不同失败类型（UI还原偏差、API测试失败、跨阶段重试浪费）设计了不同的SOP路径，而非统一用"日志搜索"兜底
- **可度量**通过双层Hook（业务级CLI + 平台级Hook Engine）汇聚数据，实现了Token/成本、耗时、重试率、代码改动量的量化追踪

这与[钉钉招聘Agent](../ch05/039-agent-harness.html)中"可审计的Agent行为日志"的需求一致——在AI执行关键业务链时，可观测性不是运维锦上添花，而是信任AI的工程前提。

### 4. 知识库作为AI长期记忆的运作机制

文章将知识库设计为"两套并存、各管一段"的架构：项目级`specs/`沉淀长期资产（业务规则、技术架构、接口契约）和变更级`knowledge-spec/`记录每次迭代资产（需求/设计/规划/测试用例）。两者通过`index.md`索引互通。

知识库运作分三个阶段：存量初始化（人工确认剔除过期信息）→ 迭代演进（P6强制三件套：changes-sync + knowledge-sync + specs-generator）→ 持续治理（待实现）。这一设计体现了上下文工程的核心原则：**"不是塞得越多越好，而是每一步只送它该看见的那一片"**。

### 5. 从AI Coding到AI Native的组织变革启示

文章结尾坦诚列出了六件"还在路上"的事。其中"评分机制和下游真实消耗的耦合"揭示了当前Harness Engineering的深层挑战：阶段评分与最终产出质量之间的反馈回路缺失——P2得90分但P3翻车的场景无法自动反哺评分系统。这表明[Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)作为一个正在结晶中的工程范式，其核心挑战已从"搭建管线"转向"建立跨阶段的因果反馈机制"。

## 实践启示

1. **瓶颈定位方法**：在引入AI Coding后，不要只看"AI产码率"这一单一指标。应系统性测量整条交付链各环节的耗时变化，找到未被加速的"瓶颈环节"——理解需求、方案对齐、代码Review、集成测试、文档沉淀，这些才是AI时代真正的提效增长点。

2. **Harness分层搭建路径**：可按照"先协议层（定契约）→ 再管线层（定阶段）→ 加纪律层（堵漏洞）→ 最后补知识库（建记忆）"的顺序渐进构建，不必一次性铺开六阶段全流程。从当前最疼的环节切入（如Review环节缺乏标准化），逐步扩展。

3. **可监测性先行**：在引入任何AI流水线之前，先部署可追踪机制（`evaluation.md`和阶段日志），让每一批AI产出留下证据。没有可监测性就允许AI自主执行，等于打开了无法追溯的黑盒。

4. **纪律层从最关键的AI偷懒模式入手**：不需要一次覆盖五种偷懒模式。从"不验证就说完成"和"跳过测试直接写代码"两个模式开始设置门禁，这两个是破坏力最大的。纪律不需要完美，但需要存在且不可绕过。

5. **token双层结算的工程判断**：SubAgent并非节省上下文的银弹——它是另一份独立计费的开销。设计SubAgent时优先使用`git diff` + 关键片段而非读全文件，这一步优化可将SubAgent的token消耗降低60-70%。

## 相关实体

- [Agent落地真相](../ch03/046-agent.html)
- [Agent配置模型](../ch04/266-skill.html)
- [钉钉招聘Agent](../ch05/039-agent-harness.html)
- [AgentCore旅行分配系统](../ch04/660-agentcore-harness.html)
- [QoderWork Skills开发实践](../ch03/070-skills.html)
- [淘宝数字人Agentic架构](../ch04/234-agentic.html)
- [Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- AI原生工程

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/开启harness-engineering探索之旅.md)

---

