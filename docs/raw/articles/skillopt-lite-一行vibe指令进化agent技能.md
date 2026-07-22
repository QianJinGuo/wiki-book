---
type: source
source_url: https://mp.weixin.qq.com/s/XAz5KdMMKCVqGTLtw9Nv0w
sha256: e8a008f756c32cd0986b2f4bc6813d540a8bf0cc68d73515d3a255cb1150725e
ingested: 2026-07-09
source: Hyman的杂货铺（微信公众号）
source_title: 一行 Vibe 指令进化 Agent 技能：SkillOpt-Lite 比完整管线更快更强
source_published: 2026-07-09 07:30
review_value: 8
review_confidence: 7
review_stars: 4
---

# SkillOpt-Lite - 一行Vibe指令进化Agent技能

> 论文：SkillOpt-Lite: Better and Faster Agent Self-evolution via One Line of Vibe
> 来源：Hyman的杂货铺 | 微信公众号 | 2026-07-09
> 论文：https://arxiv.org/abs/2607.03451
> GitHub：https://github.com/EvolvingLMMs-Lab/SkillOpt-Lite

## 核心论点

Agent 技能优化从"堆更多反思Agent"转向"把轨迹当日志、把技能当代码"。LMMs-Lab 团队删掉 mini-batch 合并、慢更新阻尼和拒绝缓冲后，SkillOpt-Lite 在 6 个基准上更快收敛、分数更高。

## 零阶优化视角

技能优化本质是零阶优化（Zero-Order Optimization）。已有 Agent 反思范式与经典 ZO 工具箱的对应关系：

| 已有范式 | ZO 对应 |
|----------|---------|
| 单轨迹反思（Reflexion/Voyager） | 单点梯度估计 |
| 批量 rollout 共识（Trace2Skill/SkillOpt/SkillForge） | mini-batch 随机梯度 |
| 成败对比（SkillCat） | 中心差分 |
| 逐步原子修改（SkillAdapter） | 坐标下降 |
| 编辑预算衰减/拒绝缓冲（SkillOpt） | 信赖域+控制变元 |

**关键分歧**：轨迹不是黑盒标量。经典 ZO 只返回一个数，技能优化每次 rollout 吐出一整段可读轨迹（计划、工具调用、报错栈、中间文件），构成"语言介导的程序编译"——技能文档是源码，LLM 是编译器+运行时，轨迹是调试日志。

## SkillOpt-Lite 管线

四步闭环：**落盘 → 探索 → 打补丁 → 门控**

1. **轨迹落盘**：每个 rollout 一个文本文件
2. **文件系统探索**：list/read 在目录里找共性失败模式
3. **最小补丁**：紧凑 diff 修改技能
4. **验证门控**：独立验证集

### 删掉了什么

原版 SkillOpt：meta-skill、成功失败历史、mini-batch 反思池、慢更新阻尼、拒绝编辑缓冲
Lite 版：全部去掉，仅保留文件系统 + 共识挖掘 + 独立验证

### 一行命令

`/skillopt-loop rounds=10 batchsize=40 target=gpt5.4-nano [custom_requirements]`

## 关键实验结果

| 任务 | 模型 | 提升 |
|------|------|------|
| Spreadsheet | GPT-5.4-nano | +12.6（69.7 vs 57.1） |
| ALFWorld | GPT-5.4-nano | 71.8% → 81.3%（+9.5） |
| LiveMath | GPT-5.5 | 36.6 → 73.6（+37.0） |
| DocVQA | GPT-5.5 | 94.2（+5.2） |

### 推理+代码执行型任务优势最大

- Spreadsheet GPT-5.4-nano 29.9→66.2（+36.3）
- 语义检索/具身型任务差距在 +0.1~+1.5 分
- 文档视觉 DocVQA GPT-5.5 冲到 94.2（+5.2）

## HarnessOpt：技能饱和后改脚手架

当技能文本调到头，瓶颈转到 Harness（工具循环、观测格式、重试策略）。HarnessOpt 把 Harness 也当成可编辑代码。

**安全约束**：白名单（只能改框架脚本）、冒烟+验证门控、可回滚（git reset + feature toggle）

### SpreadsheetBench 联合优化结果

- 只优化 Harness：nano 0.6619→0.7651
- 联合优化（w/ skill）：nano 0.7758，超过 GPT-5.5 跑标准 Harness+完整 SkillOpt 的 0.7620
- 满血 GPT-5.4/GPT-5.5 联合优化分别到 0.8505/0.8577

## 边界与未解问题

1. 验证集太小仍抖
2. 语义任务增益有限
3. HarnessOpt 依赖 Round-0 质量
4. 计算账单：每轮 batch rollout + 验证不便宜

## 价值判断

Agent 自我进化从"堆更多反思Agent"转向"把轨迹当日志、把技能当代码"。文件系统 + 共识挖掘 + 独立验证，就是当前底座下够用的最小闭环。
