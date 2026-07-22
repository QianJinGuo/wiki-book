---
title: MiniMax M2.7：开启模型的自我进化
source_url: https://mp.weixin.qq.com/s/Xfsq8YDP7xkOLzbh1HwdjA
publish_date: 2026-04-25
tags: [wechat, article, gpt, agent, harness, coding, gemini]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 0f828dadca582dc5688c0baa7e718a6ac6a5d115032cb19e19f2e3408af7353e
---
# MiniMax M2.7：开启模型的自我进化
## 核心定位
M2.7是MiniMax第一个模型深度参与迭代自己的版本。模型能够自行构建复杂Agent Harness，并基于Agent Teams、复杂Skills、Tool Search tool等能力，完成高度复杂的生产力任务，同时驱动模型自身的强化学习训练迭代。
## 自我进化机制
### 研究型Agent框架
Agent Harness覆盖：数据流水线、训练环境、评测基础设施、跨团队协作、持久化记忆。研究员在每一层引导方向，模型在每一层负责构建。
**RL场景示例**：Agent自动完成文献调研→实验规格跟踪→数据流水线对接→启动实验→监控分析→日志读取→问题排查→指标分析→代码修复→MR提交→冒烟测试。
> M2.7能够胜任30-50%的工作流。
### 模型自主迭代Harness
M2.7全程自主运行"分析失败轨迹→规划改动→修改脚手架代码→运行评测→对比结果→决定保留或回退"超过**100轮**。
发现的有效优化：
- 系统性搜索温度、频率惩罚、存在惩罚等采样参数的最优组合
- 修复后自动搜索其他文件中的相同bug模式
- Agent Loop中添加循环检测
**效果：内部评测集提升30%**
### MLE Bench Lite（24小时迭代进化）
| 指标 | 结果 |
|------|------|
| 最好成绩 | 9金5银1铜 |
| 三次平均 | 66.6%得牌率 |
| 对比 | Opus-4.6(75.7%) / GPT-5.4(71.2%) / Gemini-3.1(66.6%) |
脚手架三模块：短时记忆 + 自反馈 + 自优化
## Benchmark数据
### 编程/软件工程
| 基准 | M2.7 | 对比 |
|------|------|------|
| SWE-Pro | 56.22% | 追平GPT-5.3-Codex |
| SWE Multilingual | 76.5 | 显著优势 |
| Multi SWE Bench | 52.7 | 显著优势 |
| VIBE-Pro | 55.6% | 接近Opus 4.6 |
| Terminal Bench 2 | 57.0% | 复杂系统理解 |
| NL2Repo | 39.8% | 复杂系统理解 |
### 专业办公
| 基准 | M2.7 | 对比 |
|------|------|------|
| GDPval-AA ELO | 1500 | 开源最高（仅次于Opus 4.6/Sonnet 4.6/GPT5.4） |
**Finance场景**：阅读年报+交叉比对研报+独立设计假设+构建营收预测模型+产出PPT/Word/Excel，从业者评价产出物可直接进入后续工作流程。
### Agent能力
| 基准 | M2.7 | 说明 |
|------|------|------|
| Toolathon | 46.3% | 全球第一梯队 |
| MM-Claw | 62.7% | 接近Sonnet 4.6 |
| 复杂Skills遵循率 | 97% | 40个>2000 Token的case |
## Agent Teams
角色边界、对抗性推理、协议遵循、行为分化必须内化为模型原生能力，无法通过提示词实现。
产品原型开发的最小Agent组织：多个角色稳定锚定身份，主动挑战队友的逻辑与伦理盲区，在复杂状态机中自主决策。
## 互动娱乐：OpenRoom
开源Agent交互系统，将AI互动置入万物皆可互动的Web GUI空间。对话即驱动，实时产生视觉反馈与场景交互。
- GitHub: https://github.com/MiniMax-AI/OpenRoom
- 体验: https://openroom.ai
## 产品链接
- MiniMax Agent: agent.minimaxi.com
- API服务: platform.minimaxi.com
- Coding Plan: platform.minimaxi.com/subscribe/coding-plan