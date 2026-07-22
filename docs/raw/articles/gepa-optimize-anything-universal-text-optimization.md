---
tags: [wechat, article, claude, openai]
title: "gepa optimize anything universal text optimization"
type: raw
url: https://gepa-ai.github.io/gepa/blog/2026/02/18/introducing-optimize-anything/
ingested: 2026-05-08
sha256: 9f960c14545369cea3a9a27790f56bf56188b513782d049b8af3c4ffaa03775c
review_value: 8
review_confidence: 8
review_stars: 4
review_product: 64
review_recommendation: STRONG
source: GEPA官方博客
published: 2026-02-18
created: 2026-05-10
updated: 2026-05-10
---
# optimize_anything: A Universal API for Optimizing any Text Parameter
**来源：** GEPA 官方博客
**发布时间：** 2026-02-18
**作者：** GEPA Team
**链接：** https://gepa-ai.github.io/gepa/blog/2026/02/18/introducing-optimize-anything/
## 核心内容
**GEPA**（Genetic-Pareto）团队发布 `optimize_anything`，一个声明式 API，通过 ASI（诊断反馈）+ Pareto 前沿搜索对任何文本制品进行优化。扩展自 GEPA 的 prompt 优化器，支持三大优化模式。
### 核心 API
```python
import gepa.optimize_anything as oa
def evaluate(candidate: str) -> float:
    score, diagnostic = run_my_system(candidate)
    oa.log(f"Error: {diagnostic}")  # captured as ASI
    return score
result = oa.optimize_anything(
    seed_candidate="<your initial artifact>",
    evaluator=evaluate,
)
```
核心组件：
- **Artifact**：任何可序列化为文本的内容（代码/prompt/Agent架构/配置/向量图形）
- **Evaluator**：接受候选文本，返回分数 + ASI（诊断反馈）
- **ASI（Actionable Side Information）**：诊断反馈的一等公民概念，类似数值优化中的梯度，告诉 LLM 候选为何失败及如何修复
### 三种优化模式
| 模式 | 说明 | 先前框架支持 |
|------|------|-------------|
| Single-Task Search | 解决一个难题，无需 dataset | ✅ AlphaEvolve, OpenEvolve |
| Multi-Task Search | 跨任务交叉迁移优化 | ❌ **独有** |
| Generalization | 构建可迁移到未见问题的技能 | ❌ **独有**（原 GEPA prompt 优化） |
### 关键机制
**ASI（Actionable Side Information）**：
- 诊断反馈成为 evaluator 契约的一等公民
- 支持文本/结构化数据/图像（via `gepa.Image`）
- VLM 可以"看到"自己输出的渲染结果进行改进
- ASI ≈ 文本优化的梯度
**Pareto 前沿搜索**：
- 追踪每个任务/指标单独的分数，维持 Pareto 前沿
- 每个 reflection 步只展示 2-3 个示例，避免平均化隐藏弱点
- 专注、靶向改进，保留互补优势
### 实验结果
| 领域 | 模式 | 结果 |
|------|------|------|
| Claude Code Agent Skills | Generalization | 通过率 79.3% → 100%，速度 +47% |
| CloudCast 云调度 | Generalization | 成本降低 **40.2%**，超专家启发式 |
| Can't Be Late 调度 | Generalization | 成本降低 7.8% |
| ARC-AGI Agent 架构发现 | Generalization | 32.5% → **89.5%**（+57pp） |
| CUDA Kernel 生成 | Multi-Task | 跨任务迁移优于专用单任务优化 |
| Prompt 优化 | Generalization | GPT 数学推理提升 |
| Circle Packing | Single-Task | 超越 AlphaEvolve |
| 黑箱数学优化 | Single-Task | 匹敌 Optuna |
| 3D Unicorn 建模 | Single-Task | 从零生成 3D SVG |
### 关键洞察
1. **声明式 API**：与 DSPy 的"编程而非提示"原则一致，用户声明 what（artifact + evaluator），系统负责 how（搜索策略）
2. **ASI > 单一分数**：ASI 类似于梯度，区别于传统优化将诊断上下文压缩为单一标量
3. **Pareto 搜索保留互补优势**：跨多维度的优秀候选不被平均分数埋没
4. **全栈优化**：不只优化 prompt，可以优化整个 Agent 系统（代码+架构+控制流+prompt），10行种子 → 300+行系统
5. **多任务迁移**：Multi-Task 模式让不同任务的优化模式互相迁移，这是先前框架无法表达的
---
*评审：Value 8 × Confidence 8 = 64 | ★★★★ | 推荐入库*