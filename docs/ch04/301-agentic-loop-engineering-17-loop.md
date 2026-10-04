# Agentic Loop Engineering 工程手册：17 种 Loop 工程化技术的可复现实证框架

> 📊 Level ⭐⭐⭐⭐ | 10.8KB

> 原文存档：[原文存档](https://mp.weixin.qq.com/s/HZ8DD90RmVb953zlvq_4Hg)

## 一句话定位

一份完全可复现的 Agentic Loop Engineering 工程手册（18 个 py 文件 + 共享工具库），在 A100 80GB GPU 上用 Qwen2.5-Coder-32B-Instruct-AWQ 逐项测量 17 种 loop 工程化技术，核心结论：**loop 的质量完全取决于它接入了什么可验证信号**。

## 核心结论

一个 loop 的质量完全取决于它接入了什么可验证信号——接入真实测试/schema/检索事实/评估 harness 的 loop，每次都产生可测量的提升；接入模型自我意见的 loop，几乎不动。

## 四次范式跃迁

Prompt Engineering → Context Engineering → Harness Engineering → Loop Engineering

## 通用 Loop 结构

Schedule（调度）→ Triage skill（优先级判断）→ State/Memory（状态与记忆）→ Worktree（隔离工作区）→ Implementer（实现者）→ Verifier（验证者）→ Connectors（外部连接器）→ Human gate（人工门）

## 三条测量规则

1. 验证信号再接入 loop
2. 基线必须真正失败
3. 报告 null 结果和饱和

## 六大核心实证发现

### 1. Run Until Done — Feedback vs Retry
| 条件 | 基准 → 结果 | 提升 |
|------|-------------|------|
| 有真实 execution feedback | 0.767 → 0.850 | **+8.3 pts** |
| 无 feedback（只喊"再试一次"） | 0.767 → 0.783 | +1.7 pts |
| token 消耗 | 21,680 vs 20,675 | 几乎相同 |

**洞察**：增益集中在第 2 次尝试后平坦，关键在 feedback quality 不是 retry 本身。

### 2. Skill 注入与 Context Engineering
| 条件 | 可执行率 |
|------|---------|
| Cold（无 schema） | 0% |
| Skill（注入 CREATE TABLE schema） | **95%** |
| Skill + few-shot | 仍 95% |

**洞察**：找到那一个承重的知识点，只注入它；瓶颈移除后更多上下文无增益。

### 3. Maker-Checker 分离
| 方法 | 误接受率 | 精度 |
|------|---------|------|
| Trust-All | 100% | — |
| Self-Assess | 77% | — |
| LLM-Judge | 54% | — |
| Test-Running（写测试并运行） | 31% | **88.6%** |

**洞察**：Best-of-N 对这个 32B 模型无效（temperature 0.8 下近乎确定性）。

### 4. 记忆与检索
| 条件 | 成功率 |
|------|--------|
| Closed-book | 7.1%（1/14） |
| RAG（BGE top-3） | **100%（14/14）** |

**洞察**：检索永远返回 top-k，需要相似度阈值。

### 5. Worktree 并行隔离
| 方法 | 存活率 |
|------|--------|
| 共享 working tree | 16.7%（1/6，静默丢失） |
| git worktree + merge | **100%（冲突 surfaced 并 resolved）** |

**洞察**：隔离是并行安全的必要条件。

### 6. 连接器与工具
| 条件 | 准确率 |
|------|--------|
| 无工具（从权重猜答案） | 10% |
| ReAct + Python 工具 | **83.3%** |

**洞察**：工具彻底消除算术错误，只留下规格错误。

## 运营与安全

### 多 Loop 协调
共享 acting_on registry 将碰撞从 5 降至 0，浪费 tokens 从 ~1M 降至 0。

### 预算与成本
- loop+feedback：2.1x token 成本买 8.3 百分点提升
- 无 feedback loop：付了 loop 价格得接近基线质量（被支配的）
- 频率是成本主导杠杆（daily-triage 23K/天 vs ci-sweeper 184.8 万/天）

### 安全护栏
三道护栏（路径 denylist + 文件数阈值 + 置信度下限）将误自动执行从 60.5% 降至 **0%**，100% 升级召回。

## 七大生产 Pattern

| Pattern | 关键指标 |
|---------|---------|
| 日度 Triage | 关键词 recall 0.35 → embedding 0.65 |
| 重复检测 | TF-IDF recall@10 0.56 → BGE 0.65 |
| CI Sweeper | 先分类再修，省 ~2M tokens，修 10 个真回归 |
| PR Babysitter | verifier-gated 0% false-ready（vs naive 33%） |
| Dependency Sweeper | 风险路由，0% 误自动合并（vs naive 83%） |
| 技术债检测 | 关键词 F1 0.857 vs embedding 0.844（刻意保留 null 结果） |
| Changelog 起草 | zero-shot classifier macro-F1 0.43（约 4x baseline） |

## Capstone Orchestra

三阶段流水线：Run-until-done → 采样 4 候选 → Checker 写测试选最佳
- 解决率：greedy 0.80 → **orchestra 0.95**（+15 pts，40 道 MBPP+ held-out）
- SWE-bench 3/3 gold patch resolved

## 共享工具库

- `common/llm.py` — LLM 客户端
- `common/eval.py` — 评分器
- `common/agents.py` — 生成与评审
- `common/loops.py` — 迭代引擎
- `common/memory.py` — 向量记忆
- `common/tools.py` — Python 执行
- `common/sqltools.py` — SQL 评分

---

## 深度分析

1. **可验证性是唯一有效的信号类型**：17 种技术全部可以归结为一个二分法——接入 execution feedback、schema、检索事实或评分 harness 的技术产生可测量提升，而接入模型自我意见（self-assess、无信号 retry）的技术增益近乎为零。Self-Assess 77% 误接受率与 Self-Assess 的 1.7 pts 增益互为印证：实现者与验证者共享同一盲点时，闭环是空转的。

2. **验证信号存在「一份就够」的边际递减**：Skill 注入实验里，一个 CREATE TABLE schema 把可执行率从 0% 拉到 95%，再加 few-shot 仍停在 95%——承重知识点只有那一个，瓶颈移除后上下文继续堆叠无增益。这与 Best-of-N 对 32B 模型近乎无效（temperature 0.8 下候选近乎确定性）共同指向：多样性不足和上下文冗余是同一枚硬币的两面，资源应投向「找到缺失的那一块信号」而非「堆更多信号」。

3. **失败模式之间存在互换关系而非消除关系**：ReAct + Python 工具把准确率从 10% 提到 83.3%，但工具只是彻底消除算术错误、留下规格错误；CI Sweeper 先分类再修省下 ~2M tokens 的本质，是把「修错误问题」的浪费转化成「分类」这一更廉价的失败点。工程上的含义是：不要追求零错误，要主动选择在哪一层暴露错误。

4. **测量的诚实度本身就是一项技术产出**：技术债检测中 embedding 0.844 低于关键词 0.857 被刻意保留为 null 结果并公开报告，与三条测量规则中的「基线必须真正失败」「报告 null 结果和饱和」呼应。大多数工程叙事只发布正结果，这份手册把负结果当作框架可信度的组成部分——这是它区别于技巧集合、能称得上「实证框架」的原因。

5. **孤立技术的提升会饱和，组合才是最大杠杆**：单点最优是 +8.3 pts（feedback loop），而三阶段 Capstone Orchestra（run-until-done → 采样 4 候选 → checker 写测试选最佳）达到 +15 pts（0.80 → 0.95）。组合之所以有效，是因为三阶段分别提供迭代修复、候选多样性和外部验证三类不同信号，恰好覆盖了单一技术无法同时满足的信号维度。

## 实践启示

1. **先接入一个真实验证信号，再考虑任何 loop 结构**：最小可行改造是把「重试 prompt」换成「把测试失败输出/schema 错误塞回上下文」——成本几乎为零（21,680 vs 20,675 tokens），换来 +8.3 pts。在接入真实信号之前搭建复杂 loop 是被支配策略：付 loop 价格得接近基线质量。

2. **用「写测试并运行」作为 checker，而不是让模型自评**：误接受率从 Self-Assess 的 77% 降到 31%，精度达 88.6%。落地时给 Implementer 和 Verifier 分配独立上下文，Verifier 的输出必须是可执行的测试而非评语；若模型太强/太弱导致 Best-of-N 无效，改用 2-4 个候选 + 测试过滤的 orchestra 结构。

3. **并行必须用 git worktree 隔离，冲突要显式化**：共享 working tree 并行存活率仅 16.7% 且是静默丢失，worktree + merge 达到 100%。配套加上共享 acting_on registry 把碰撞从 5 降到 0——隔离解决文件冲突，registry 解决任务冲突，两者缺一不可。

4. **自动执行前叠三道护栏，把升级（escalation）当作正常路径**：路径 denylist + 文件数阈值 + 置信度下限将误自动执行从 60.5% 压到 0%，同时保持 100% 升级召回——说明护栏不是降低自动化比例，而是把不可靠的自动执行改为可靠的人工升级。同理，检索需要相似度阈值来过滤 RAG 的 top-k 兜底结果。

5. **把 token 预算当作一阶设计约束，按频率分配**：频率是成本主导杠杆（daily-triage 23K/天 vs ci-sweeper 184.8 万/天），高频任务用轻量分类器（关键词在技术债检测上 F1 0.857 反而胜过 embedding），低频重任务才上 orchestra。先测量每个 loop 的日消耗，再决定哪一环值得 2.1x 成本换 8.3 pts。

## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)
- 相关: Agent 架构

---

