---
title: 腾讯混元 CL-Bench Life：让大模型读懂你的日常生活
source_url: https://mp.weixin.qq.com/s/ysSIbSEdC9beb4wxIu8IdA
publish_date: 2026-05-01
tags: [wechat, article, gpt, gemini]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: de8bda3fe075ad7d4acd31af7b89f2b42659f232e00a7328e62b0f9883da665d
---
# 腾讯混元 CL-Bench Life：让大模型读懂你的日常生活
> 机器之心发布 | 2026-05-01 11:30 辽宁
腾讯混元团队在 AGI-Next 前沿峰会上推出 CL-Bench life，评测模型在真实日常生活场景中理解混乱、碎片化、持续变化的 context 的能力。
论文题目：CL-Bench Life: Can Language Models Learn from Real-Life Context？
项目主页：www.clbench.com
博客链接：https://hy.tencent.com/research/100039
## CL-Bench 与 CL-Bench Life 的互补定位
CL-Bench：context 来自专业领域，结构清晰，有序组织。模型需要掌握新的知识（规则/流程）并有效使用。
CL-Bench Life：context 来自日常生活，混乱，无序，信息随时间轴反复修改。模型需要整理分散线索、处理噪声、保持鲁棒。
## 三大核心类别
| 类别 | context 类型 | 典型难点 |
|------|-------------|---------|
| 沟通与社交互动 | 一对一私聊、多人群聊、社区讨论 | 人际关系、情绪感知、群体共识、角色混淆、说话人归因 |
| 碎片信息与修改轨迹 | 个人笔记、信息流、文档修改历史 | 从碎片重建完整逻辑线、理解反复修改的意图 |
| 行为记录与活动轨迹 | 游戏日志、消费流水、健身数据 | 从行为痕迹推理隐含原因、识别长期习惯和异常变化 |
## 评测数据
- 405 个真实任务
- 5348 条纯人工编写的评分标准（rubrics）
- 平均每个任务 13.2 个考核点
- rubrics 设计尽可能原子化，支持细粒度评估
## 核心结果
测试了 12 个语言模型：
- **模型平均任务解决率：14.5%**
- **最佳模型 GPT-5.5（High）：22.2%**
- 相比之下，同一批模型在 CL-Bench 中平均 >20%
### 四个关键发现
1. **部分正确 > 完整解决**：模型能理解部分 context 但不能完整解决。阈值放宽时通过率显著上升。CL-Bench Life 既能区分"部分理解"和"完美解决"，也能保持模型间相对排名稳定。
2. **不同类型 context 能力要求不同**：
   - 沟通类：难点在社交关系和多人互动（信息分散在交错话题、人物关系复杂）
   - 碎片信息类：需要整合不连续线索、推理内容随时间如何变化
   - 行为记录类：需要从行为痕迹中推理习惯和异常
3. **主要瓶颈不是长文推理，而是高噪声处理**：
   - 在 reasoning 模式下，context 长度和表现之间的相关性显著弱化
   - 与 CL-Bench 不同（CL-Bench 中 context 越长表现越差）
   - 即使 context 不长，只要包含大量噪声、反复修改、信息分散，模型就可能失败
4. **最主要的错误类型：context misuse**
   - 模型看到了 context 但仍然误解或误用
   - 常见错误模式：混淆代词指代、依赖已被后续修订推翻的信息、误把口头说辞当最终决策、把行为轨迹看成孤立事件
   - 在群聊 context 中最常见的是角色混淆和说话人归因错误（如 Gemini 把一个 Slack 频道中的角色关系推断错了）
   - 格式错误和拒答相对较少
## 意义
CL-Bench life 不是 CL-Bench 的一个更难版本，而是一个互补的评估基准。它评估模型是否能够在真实生活中那些杂乱、碎片化、持续变化的 context 上进行鲁棒推理。
## 参考资料
- 论文：CL-Bench Life: Can Language Models Learn from Real-Life Context？
- 项目主页：https://www.clbench.com
- 混元博客：https://hy.tencent.com/research/100039