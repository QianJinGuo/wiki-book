# Agentic Loop Engineering 工程手册：17 种 Loop 工程化技术的可复现实证框架

## Ch04.470 Agentic Loop Engineering 工程手册：17 种 Loop 工程化技术的可复现实证框架

> 📊 Level ⭐⭐ | 5.9KB | `entities/agentic-loop-engineering-handbook-empirical-framework.md`

# Agentic Loop Engineering 工程手册：17 种 Loop 工程化技术的可复现实证框架

> 原文存档：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agentic-loop-engineering-工程手册.md)

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

