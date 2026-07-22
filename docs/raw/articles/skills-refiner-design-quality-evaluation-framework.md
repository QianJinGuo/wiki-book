---
title: "Skills赏析：使用skills-refiner提升skill质量"
url: https://mp.weixin.qq.com/s/681PyfKZjBVNtSjHMGwsfg
author: TecDeTec
source: AI咖啡馆
date: 2026-04-02
created: 2026-05-19
type: raw
tags: [skills, skill-design, evaluation, agent, skill-refiner, context-engineering, skill-creator]
review_value: 7.5
review_confidence: 8
sha256: a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f
---
# Skills赏析：使用skills-refiner提升skill质量
> 来源：AI咖啡馆，TecDeTec，2026-04-02
> GitHub：https://github.com/yknothing/skills-refiner
## 断言测试的结构性盲区
skill-creator 提供了创建-测试-断言迭代的完整循环，但断言测试有结构性盲区——一个 skill 可以通过所有测试用例，同时存在以下问题：
- **定位偏差**：description 决定何时激活，过宽导致误触发，过窄导致忽略
- **上下文工程浪费**：instructions 层包含 Claude 已内化的通用知识
- **低可移植性**：依赖特定工作流或工具调用链，换环境就失效
- **边界模糊**：与其他 skill 存在重叠，或对某些输入默默降级
断言测试通过，证明 skill 在已知场景下按预期执行。它证明不了 skill 设计是否正确。
## skills-refiner 两阶段框架
### 第一阶段：诊断与精炼（Diagnose & Refine）
诊断对象：Skill 仓库、单个 skill、工作流框架、eval 集。
诊断不是打分，而是定位真实状态：真正解决什么问题、边界在哪、哪些设计选择有实质作用、哪些只是表面修饰、哪些是隐患。
精炼是诊断的直接下游：哪些应当保留，哪些应当改进，哪些应当简化或重新划定范围，哪些应当去掉。
### 第二阶段：提取与整合（Extract & Integrate）
当给出目标 Skill 仓库（target_repo）时启动。
关注这个 Skill/Skills 仓库对目标仓库有什么价值——哪些可以直接采纳，哪些需要重新设计，哪些应当放弃，整合后哪些部分面临最大风险。
## 六维评估框架
- **定位**：skill 真正解决什么问题，边界在哪
- **机制**：哪些设计选择真正驱动了它的行为
- **价值**：什么是真正强的和可复用的，什么只是表面修饰
- **风险**：什么是脆弱的或难以维护的
- **改进**：具体的提升方向
- **集成**：哪些可以直接用，哪些需要重新设计，哪些应当放弃
## 证据纪律原则
分析必须区分三类判断：
- **直接证据**：文件中直接可读的内容
- **合理推断**：基于可见证据的有理由但非确定的判断
- **未解决的不确定性**：证据不足以支撑的问题，应明确标注
不能用宏观判断掩盖证据的局限。
## 目的决定标准
工程和工作流类 skill → 结构严谨性、上下文工程质量、可维护性、跨仓可移植性
研究分析类 skill → 推理质量和证据纪律
写作或教学类 skill → 清晰度和输出质感
用工程标准去诊断创意写作 skill，结论通常是错的。
## 与 skill-creator 的分工
| 工具 | 职责 |
|------|------|
| skill-creator | 创建、A/B 测试、断言迭代、description 优化、打包分发 |
| skills-refiner | 设计判断：定位是否准确、上下文工程有无浪费、可移植性、边界清晰度 |
典型路径：skill-creator 创建并迭代 → 测试通过后 skills-refiner 做设计诊断 → 把改进点带回 skill-creator 做下一轮迭代。
## 安装
```bash
npx skills add yknothing/skills-refiner
```