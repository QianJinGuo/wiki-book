# Lilian Weng Harness Engineering for Self-Improvement — RSI 从 Harness 开始

## Ch05.078 Lilian Weng Harness Engineering for Self-Improvement — RSI 从 Harness 开始

> 📊 Level ⭐⭐ | 5.0KB | `entities/lilian-weng-harness-engineering-self-improvement.md`

# Lilian Weng Harness Engineering for Self-Improvement — RSI 从 Harness 开始

前 OpenAI 安全副总裁、Thinking Machines Lab 联创翁荔（Lilian Weng）提出 RSI（Recursive Self-Improvement）的工程化路径：**从 Harness 层开始自进化**。

> DeepSeek 研究员崔添翼附议：Harness 方向的自进化与模型方向同样重要，**Skill 是 Harness 自进化的初级形式**。

## 递进链条

Context Engineering → Workflow Design → Self-Improving Harness → Evolutionary Search

### 第一层：Context Engineering

**ACE（Agentic Context Engineering）**：上下文作为持续更新的"操作手册"，Generator→Reflector→Curator 三角色协同。

**MCE（Meta Context Engineering）**：双层架构——外层进化"管理上下文的技能"，内层用该技能优化具体任务的上下文。比 ACE 更接近"自我管理的记忆"。

### 第二层：Workflow Design

模型参与设计自身工作流程。代表作：AI Scientist（科研全流水线）、**ADAS**（元智能体搜索工作流设计）、**AFlow**（MCTS 搜索工作流图结构）。

### 第三层：Self-Improving Harness

**Self-Harness 三步循环**：

| 步骤 | 内容 | 原则 |
|------|------|------|
| **Weakness Mining** | 收集轨迹→挖出失败模式 | 关注可复现问题 |
| **Harness Proposal** | 基于失败模式提出小范围修改 | 小范围、可验证、差异化 |
| **Proposal Validation** | 测试验证后才合入 | 安全层保持独立 |

已在 MiniMax M2.5、Qwen3.5、GLM-5 上验证，学出针对不同模型薄弱点的个性化 Harness 配置。

### 第四层：Evolutionary Search

Harness 本身成为可搜索对象。**DGM（Darwin Gödel Machine）**：coding agent 修改自己的 Harness 代码仓库，Claude 3.5 Sonnet 从简单初始配置出发：

| 基准 | 初始 | 进化后 |
|------|------|--------|
| SWE-bench Verified | 20% | **50%** |
| Polyglot | 14.2% | **30.7%** |

## 与现有实体的关系

Harness Engineering 的递进链条（Context→Workflow→Self-Harness→Evolution）与 [Loop Engineering](ch05/007-loop-engineering.html) 的反馈控制理念一脉相承。Self-Harness 的 Weakness Mining→Proposal→Validation 循环是对 ACE/MCE 的进一步抽象——从优化上下文升级为优化 Harness 本身。

DGM 的进化搜索路径与 Spec-Kit 的开源框架路线在"Harness 可搜索、可编程"上形成互补：前者在 Harness 代码空间进化，后者在 Spec/PRD 空间约束。

## 边界与瓶颈

翁荔明确指出七项瓶颈：评估器太弱、上下文生命周期、负面结果忽视、多样性坍缩、Reward hacking、长期健康 vs 短期成功、人类角色重新定义。

Harness 的改进最终可能被"内化"进模型行为，但"说清楚目标、约束、上下文、评估标准"这件事本身从未消失。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/lilian-weng-harness-engineering-self-improvement.md)

## 2026-07-08 补充（AI寒武纪版）

### Harness 三大设计模式
1. **工作流自动化**：规划→执行→观察→改进循环，不依赖静态提示词
2. **文件系统持久化记忆**：长周期任务中通过 Bash 读写文件管理超上下文状态
3. **子智能体与后台任务**：并发执行，进程管理器监控，中断可恢复

### 其他补充工作
- **STOP**（Self-learning Optimizer）：早期递归 Harness 改进，自主发现遗传算法/多臂老虎机/模拟退火策略
- **Meta-Harness**：直接优化信息存储/检索/呈现代码，候选方案以代码库+分数+轨迹保存在文件系统
- **AlphaEvolve**：编码智能体进化搜索，通过修改代码块发现更好算法
- **SIA**：联合优化 Harness 与模型权重，元智能体+任务智能体+反馈智能体架构

### 六类常见失效模式
1. 倾向陈旧默认配置 2. 压力下退化复杂设计 3. 长周期丢失细节 4. 过度乐观虚假成功 5. 缺乏默会知识 6. 缺乏科学品味

### 关联实践

- [阿里 Harness 工程实战：Agent 自主迭代 17 小时](ch05/018-harness.html) — 真实落地案例，实践了翁荔提出的 Harness 三模式 + Champion-Challenger 防 Reward Hacking

---

