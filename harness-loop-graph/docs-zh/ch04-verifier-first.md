---
title: "第 4 章 验证器优先：循环的质量上限由它封顶"
---

# 第 4 章 验证器优先：循环的质量上限由它封顶

!!! abstract "学习目标"
    - 接受本章最重要的不等式：**循环产出的质量 ≤ 验证器的质量**；
    - 掌握 Generator-Evaluator 分离的三种实现形态与各自的适用边界；
    - 理解"测试全绿 ≠ 正确"——验证器覆盖范围之外的失败模式；
    - 会为一个任务设计验证器：先于循环，而不是补于循环。

## 4.1 翻转：瓶颈从来不在生成侧

第 3 章的循环跑起来之后，多数团队的注意力会自然落在"怎么让 Agent 写得更好"。方向错了。AI 工程师 Samuel McDonnell 在 2026 年对 Loop Engineering 叙事的批评一针见血：**一个循环 = 生成器 + 验证器，而瓶颈从来不在生成器这一侧**（`entities/loop-engineering-feedback-control-system`）。他的原话值得抄在工位上：

> "一个跑成绿色的循环，不是一个正确的循环。它只是一个满足了你给它的那个验证器的循环。产出的质量，被那个验证器的质量封顶——一分都高不上去。"

与"先搭循环再补验证"的常见顺序相反，本书的立场是：**优先设计验证器，再设计循环**。验证器是控制系统的信号源；信号本身不可靠，整个反馈回路都会失效——甚至在错误方向上自我强化。

## 4.2 为什么生成与评估必须分离

第 2 章已给出事实：模型自评存在系统性正面偏差，会为自己的输出辩护、放大成功面、淡化失败面。Anthropic 的工程结论是生成与评估必须分离——而且 **Evaluator 不是读生成器的"心理活动"打分，而是直接操作环境验证实际效果**（`concepts/harness-engineering-framework`）。

这对应软件工程的老原则：写代码的人不该测试自己的代码。单元测试由独立测试者编写，才能发现开发者因确认偏见忽略的边界；Agent 的输出由独立验证者验收，才能避免生成器的自我辩护。

**Evaluator 的三种实现形态**（`concepts/harness-engineering-framework`）：

| 形态 | 做法 | 优势 | 代价 |
|------|------|------|------|
| **环境验证型** | 实际执行：Playwright 打开页面、真实跑交互 | 最接近真实用户场景 | 实现成本最高 |
| **确定性工具型** | 编译器、类型检查、lint、测试套件 | 零主观性，可机械化 | 覆盖受限于已有工具 |
| **独立模型型** | 另一个模型实例（可同型号或更弱）专做验收 | 实现相对简单 | 额外成本 + 两模型一致性 |

**反馈环的稳定条件**有三条：验证结果必须可操作（"类型检查报错 line 42"远胜"效果不好"）；环内共享信息不能腐化（状态由 Harness 管理，不靠生成器自觉）；循环次数必须有上限（N 轮不收敛就终止上报）。

## 4.3 绿色 ≠ 正确：Bun 案例与验证器的覆盖面

2026 年，一个智能体项目完成了 75 万行代码的 Bun→Rust 移植，测试通过率 99.8%——但团队自己承认"还没上生产"（`entities/loop-engineering-feedback-control-system`）。Samuel McDonnell 认为这是整个发布里最诚实的一句话：**99.8% 说明复现了旧测试描述过的行为，而生产是那些还没人写过测试的行为。**

这就是验证器的根本局限：它只能覆盖你预见到的失败模式。测试全绿证明"满足了你给它的验证器"，不证明"正确"。由此推出验证器设计的两条纪律：

1. **验证器要有独立的 ground truth**——测试、类型检查、结构化输出规则，不能让验证器自己也变成"另一个 LLM 循环"（否则只是把偏见换了个位置）。
2. **对照原始需求验证，而不是对照生成器自己的代码**。LangChain 的四步闭环（规划与发现 → 构建 → 验证 → 修复）里特别强调：验证阶段要拿原始任务规范逐条核对，而不是重读生成器产出（`topics/agent-harness-deep-dive-qa`）。

对应的病理叫**首次合理方案偏见（First Plausible Solution Bias）**：Agent 写完后重读自己的代码，确认"看起来 OK"就停。LangChain 的对策是"退出前检查清单"中间件——在 Agent 尝试退出前拦截，强制对照任务规范验证。把它翻译到 `fix-agent`：模型宣告"测试全绿"之后，验证器不能只信它的话，要**自己再跑一次测试并核对失败计数**。

## 4.4 给 fix-agent 装上验证器

在 `fix-agent` 的循环外加一层验证门禁：

```python
def verify(goal: str, workspace: Path) -> dict:
    """独立验证器：与生成器不同会话，只信环境，不信模型的话。"""
    r = subprocess.run(["pytest", "-q", "--tb=no"],
                       capture_output=True, text=True, timeout=300)
    passed = r.returncode == 0
    return {
        "all_green": passed,
        "tail": (r.stdout + r.stderr)[-2000:],   # 可操作的失败信息
        "regressions": count_new_failures(r.stdout),  # 对照基线，防拆东墙补西墙
    }

def run_with_gate(goal: str, max_rounds: int = 5):
    baseline = count_new_failures(current_test_output())   # 进入循环前先记基线
    for round_ in range(max_rounds):                       # 上限：反馈不是无限的
        run(goal, max_steps=15)                            # 第 3 章的内循环
        verdict = verify(goal, workspace)
        if verdict["all_green"] and verdict["regressions"] == 0:
            return "VERIFIED_DONE"                         # 通过：交付
        goal = f"{goal}\n\n上一轮验证失败，输出：\n{verdict['tail']}"
    return "NOT_CONVERGED_ESCALATE"                        # 不收敛：上报人类
```

三个设计决定值得逐条说明：验证器**独立于生成器会话**（不信模型的自述）；**对照基线检查回归**（防止修好 A 测试弄坏 B 测试——绿色但更糟的典型形态）；**收敛失败时上报而不是重试到天荒地老**。

## 4.5 验证器本身可以工程化

验证不是"跑个测试"一句话，它自身有一门工程。两个来自一线的证据：

**LLM-as-a-Verifier**（Stanford / UC Berkeley / NVIDIA，`drafts/karpathy-2026-vibe-to-agentic-engineering` 转引）：把"让模型当裁判"做成可量化的工程——扩展评分粒度、重复验证（K 次取期望）、把标准分解为规范/输出/错误三因素。在 Terminal-Bench 2.0 上，把 LLM-as-a-Judge 27% 的平局率压到 0%，准确率推到 86.4%。**Judge 的平局率高时，给 Agent 加再多算力也没用——它分不清谁更好。** 这是"验证器决定上限"的定量版本。

**推理强度的三明治分配**（LangChain 实践）：规划高推理 + 实现中推理 + 验证高推理，效果 66.5%，优于全程高推理的 53.9%（`topics/agent-harness-deep-dive-qa`）。翻译成工程语言：**把钱花在头尾**——理解和验收值得最强的推理，中间的实现环节用中等档位。

## 4.6 反模式

- **自审当验证**。"Agent 说它测过了"不是验证。验证信号必须来自独立的环境或确定性工具。
- **验证器寄生在生成器的上下文里**。共享全部对话历史的验证器会继承生成器的偏见与叙事；至少要隔离会话，理想是隔离模型。
- **无限重试**。反馈环必须有轮数上限；N 轮不收敛 = 规划或任务本身有问题，继续循环只会烧钱。
- **用"效果不好"当验证反馈**。不可操作的反馈等于没有反馈——生成器只能靠猜。
- **在品味型任务上假装有验证器**。写作、设计、策略类任务的"验证器"恰恰是人类判断。Samuel 的提醒：在那些领域搭循环之前先老实回答——这件事，我有没有一个真能信的验证器？没有的话，自动化的不是产出，是更快的错。

## 4.7 本章小结

- 循环质量被验证器质量封顶；正确顺序是先设计验证器再设计循环。
- Generator-Evaluator 分离有三种形态：环境验证、确定性工具、独立模型；稳定条件是反馈可操作、信息不腐化、循环有上限。
- 绿色 ≠ 正确：验证器只覆盖预见到的失败；要对照基线防回归，对照原始需求防自欺。
- 验证器本身可工程化：LLM-as-a-Verifier 消除裁判平局；推理预算花在规划与验证两端。

## 4.8 练习

**动手**

1. 为 `run_with_gate` 实装 `count_new_failures`（解析 pytest 输出的失败计数，与基线对比）。构造一个场景：模型"修好"目标测试但弄坏另一个测试，验证你的回归检查能拦住它。
2. 给验证器做一次"歧义测试"：让两个不同的模型（或两个会话）分别当验证器，统计它们对同一批产出的判定一致率。一致率低于 90% 说明验证标准需要形式化。

**思辨**

1. 你的业务里，哪些任务的验证器是"确定性工具型"都不覆盖的（比如"这个文案是否符合品牌语气"）？按本书立场，这些任务在自动化阶梯上应该排在什么位置？
2. "验证器有独立 ground truth"在测试工程里对应"测试不能 mock 到只剩自己"。找一个你见过的"测试通过但生产故障"案例，指出它的验证器盲区属于哪一类。

## 4.9 本章参考

- 库内：`entities/loop-engineering-feedback-control-system`（Samuel McDonnell 批评、Bun 案例、"别再设计提示词，去设计验证者"、反馈偏差累积）；`concepts/harness-engineering-framework`（Generator-Evaluator 三形态、反馈环稳定条件）；`topics/agent-harness-deep-dive-qa`（四步闭环、退出前检查清单、三明治推理 66.5% vs 53.9%、LLM-as-a-Verifier 数据转引）；`drafts/karpathy-2026-vibe-to-agentic-engineering`（"更容易自动化你能验证的东西"、Verifier 数据）。
- 公开：Stanford/UC Berkeley/NVIDIA, *LLM-as-a-Verifier*（Terminal-Bench 2.0 数据，经库内笔记转引）；Anthropic 关于 Agent 自评偏差的研究（同上转引）。
