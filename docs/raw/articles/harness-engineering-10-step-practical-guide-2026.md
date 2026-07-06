---
source_url: "https://mp.weixin.qq.com/s/5GmESz1z9MCRp0KzoYUOSw"
ingested: 2026-06-18
sha256: 4d88bf34163db94df06db858d02ead500b75bcf5b9e6f679e5a2b1953c28ab52
---

第15篇：Harness Engineering 实践指南——从零到生产的完整路线图

这是 Harness Engineering 系列的第 15 篇，也是最后一篇。

前十四篇从理论到案例，覆盖了 Harness Engineering 的完整知识体系。这篇做收官的事：把所有内容提炼成可以立即使用的实践指南——10 步路线图、失败模式速查表、给不同角色的具体建议，以及对这个领域未来的判断。

一句话重新定义 Harness Engineering

在进入路线图之前，先回到最核心的那个定义。

Harness Engineering 是弥合「Demo 能跑」与「生产能用」之间鸿沟的工程学科。

这个类比在整个系列里反复出现：Harness Engineering 之于 AI Agent，正如 DevOps 之于软件部署。

DevOps 出现之前，代码在开发者的机器上跑得好好的，上了生产就崩。不是代码写错了，是缺少系统性的部署、监控、回滚、告警基础设施。

Agent 现在面临同样的问题。在笔记本上演示得很好，接进真实工作流就开始出各种奇怪的问题：上下文腐烂、工具误用、成本失控、安全漏洞、跨会话失忆。

这些问题不是模型的问题，是 Harness 的问题。

10 步从零构建 Harness

这是一个适合大多数 Agent 项目的构建顺序——不是所有步骤都必须，但这个顺序经过了实践验证。

Step 1：定义 Agent 的目标和边界

在写任何代码之前，先回答三个问题：

• Agent 要完成什么任务？越具体越好——「帮我写代码」是目标，「对 GitHub PR 做代码审查，输出 Markdown 格式的审查报告，重点关注安全漏洞和性能问题」是可构建的规格。
• Agent 不能做什么？明确禁止边界——不能访问哪些目录、不能执行哪些命令、不能接触哪些数据。
• 成功长什么样？定义可验证的成功标准——测试通过率、输出格式、响应时间、成本上限。

这一步通常 30 分钟就够，但省掉它会导致后面所有步骤的方向跑偏。

输出物：一份简短的 Agent 规格文档（可以是 AGENTS.md 的初始版本）。

Step 2：设计工具集

原子工具为主，Shell 为后备（第 5 篇的核心原则）：

# 好的工具集设计
TOOLS = [
    # 原子工具：单一职责，清晰边界
    read_file_tool,        # 读文件
    write_file_tool,       # 写文件
    search_code_tool,      # 代码搜索
    run_tests_tool,        # 运行测试
    
    # Shell 后备：处理原子工具没覆盖的场景
    bash_tool,             # 通用命令执行（沙箱化）
]

工具描述要精简——长描述增加 Token 成本，短描述（一句话）对大多数工具已经够了。

不要过早设计太多工具。先用 3-5 个核心工具跑起来，根据 Agent 实际遇到的场景再增加。

Step 3：构建上下文管理策略

上下文是 Harness 的核心（第 4 篇），三个基本原则：

渐进式披露：系统提示里只放 Agent 完成当前任务所需的信息，工具文档按需加载，不要把所有可能用到的内容一次性塞进去。

工具输出卸载：工具返回内容超过 2000 tokens，卸载到文件，只把摘要 + 文件路径放进上下文。

Prompt 缓存：系统提示和固定的上下文块，打上 cache_control 标记，命中缓存省 90% 成本。

Step 4：实现状态管理

Agent 没有持久记忆，状态管理是 Harness 的职责：

状态管理三层结构：
├── 短期：对话历史（当前 session 内）
├── 中期：Progress File（claude-progress.txt，跨 session）
└── 长期：Git（代码变更的完整历史，也是 Agent 操作的审计日志）

Progress File 的内容：当前任务状态、已完成的子任务列表、遇到的问题、下一步计划。Agent 每完成一个关键步骤就更新它，下次启动时先读它。

Step 5：配置安全护栏

第 7 篇的核心：最小权限原则。

# 命令白名单（只允许这些命令）
ALLOWED_COMMANDS = [
    "python", "pytest", "git", "grep", "find",
    "cat", "ls", "echo", "curl"
]

# 目录黑名单（绝对禁止写入）
FORBIDDEN_PATHS = [
    "/etc/", "/usr/", "~/.ssh/", ".env", "credentials/"
]

# 破坏性操作需要人工确认
REQUIRE_APPROVAL = [
    r"DROP TABLE", r"DELETE FROM", r"rm -rf",
    r"git push.*--force", r"git reset.*--hard"
]

护栏的核心不是「防止 Agent 做坏事」，是「把风险控制在可接受范围内，同时不影响正常任务」。太严格的护栏会让 Agent 什么都做不了，太宽松的护栏会出事故。

Step 6：搭建验证循环

Agent 做完了什么，怎么知道做对了？（第 8 篇的核心问题）

计算型验证（快、可靠）：测试套件、Linter、类型检查、格式检查。每次 Agent 修改代码后自动运行。

推理型验证（慢、灵活）：LLM Judge——用另一个模型来评估 Agent 的输出质量。适合无法用确定性规则描述的质量标准（「代码可读性」「文档清晰度」）。

优先用计算型。推理型只在计算型覆盖不到的地方使用。

Step 7：部署可观测性

第 12 篇的最简实现——5 分钟接入：

import os
os.environ["LANGFUSE_PUBLIC_KEY"] = "pk-..."
os.environ["LANGFUSE_SECRET_KEY"] = "sk-..."

from langfuse.decorators import observe

@observe()
def your_agent_function(task: str) -> str:
    # 你的 Agent 逻辑，不需要任何改动
    return result

先把 Trace 跑起来，再根据实际需要增加 Metrics 和 Logs。完美的可观测性可以等，基本的 Trace 一定要有。

Step 8：实现长程执行

对于需要运行超过 10 分钟的任务，需要 Ralph Loop（第 6 篇）：

def run_long_task(task: str, feature_list_path: str):
    """Ralph Loop：自动续接，直到任务完成"""
    while True:
        # 读取当前状态
        progress = read_progress_file()
        feature_list = read_feature_list(feature_list_path)
        
        # 检查是否全部完成
        if all(f["passes"] for f in feature_list):
            print("✓ 所有子任务完成")
            break
        
        # 用干净的上下文窗口运行 Agent
        result = run_agent_iteration(
            task=task,
            progress=progress,
            remaining_features=[f for f in feature_list if not f["passes"]]
        )
        
        # 更新进度文件
        update_progress_file(result)
        
        # 检查是否触发退出（错误、预算上限、人工中断）
        if should_stop(result):
            break

关键：每次迭代用干净的上下文，从文件系统读状态——不要累积上下文。

Step 9：优化成本

第 13 篇的优先级：

1. 模型路由（最高杠杆）：给每个任务步骤配合适的模型
2. Prompt 缓存：打开 cache_control，立即生效
3. 子 Agent 隔离：避免单一大上下文的成本膨胀
4. 工具输出卸载：防止大量工具输出填满上下文

成本优化不需要一次全做。先做前两个，通常就能节省 60%+。

Step 10：持续迭代

Harness 不是一次性构建完的，是持续改进的：

评估 → 改进 → 重新评估。

每周 review：任务完成率是否在提升？成本趋势是否健康？最常见的失败模式是什么？

把改进方向记录在 AGENTS.md 里，让下一个使用这个 Harness 的人（包括未来的你）能看到当前设计背后的决策原因。

常见失败模式速查表

这是一张可以贴在墙上的「Agent 出问题先查这里」速查表。

完成幻觉（Completion Hallucination）

表现：Agent 报告任务完成，但实际上没完成。测试没跑，文件没写，只是声称做了。

诊断：查 Trace，看 Agent 最后几步是否真的调用了验证工具（运行测试、读文件验证）。

缓解：在 Feature List 里要求每个子任务有可计算的 passes 标准，Agent 必须运行验证工具，不能只声明完成。

上下文腐烂（Context Rot）

表现：任务开始阶段正常，运行 20-30 分钟后开始给矛盾的答案，或者忘记最初的任务要求。

诊断：查 Trace，找到质量开始下降的那个 LLM 调用，查看当时的完整上下文——通常已经被大量中间结果淹没，原始任务描述占比极小。

缓解：增加 Compaction 频率（60% 上下文使用率就触发），每次迭代重新注入原始任务描述。

过早停止（Premature Termination）

表现：Agent 在任务完成前就停下来，通常说「任务完成」或「我不确定下一步该怎么做」。

诊断：Feature List 里看哪些子任务的 passes 仍然是 false。

缓解：Ralph Loop 拦截退出尝试，强制 Agent 继续工作直到所有 Feature 通过。在系统提示里明确说明「在所有测试通过之前不要停止」。

级联错误（Cascading Errors）

表现：第一步的小错误导致后续所有步骤都错，最终输出完全错误，但 Agent 没有意识到问题。

诊断：从 Trace 的开头开始逐步检查，找到第一个出现偏差的步骤。

缓解：在关键步骤后加入验证检查点——测试必须通过，才能进行下一步。把任务分解成更小的子任务，每个子任务有独立的成功标准。

上下文溢出（Context Overflow）

表现：Agent 报错「Context length exceeded」，或者性能突然下降（模型开始忽略早期上下文）。

诊断：查 Metrics，看 input_tokens 趋势，找到快速增长的时间点。

缓解：工具输出卸载（大输出写文件）、更早触发 Compaction、子 Agent 隔离（每个子任务独立上下文）。

工具误用（Tool Misuse）

表现：Agent 用错了工具参数（路径错误、命令语法错误），或者用了不该用的工具。

诊断：查 Trace，看工具调用的参数和返回值——通常错误在参数里就能看到。

缓解：改善工具描述（明确说明参数格式和限制），加入参数验证（工具执行前检查参数合理性），在系统提示里给出工具使用示例。

跨会话失忆（Cross-Session Amnesia）

表现：新会话开始后，Agent 不知道之前做过什么，重复已经完成的工作，或者做出与之前决策矛盾的选择。

诊断：检查 Progress File 是否在上次会话结束时正确更新，Agent 在新会话开始时是否读取了 Progress File。

缓解：强制在系统提示里包含「先读取 progress.txt 了解当前状态」的指令，Progress File 在每个关键步骤后立即更新（不等会话结束）。

范围蔓延（Scope Creep）

表现：Agent 在完成指定任务的过程中，开始做额外的「改进」——重构不相关的代码、更新不在任务范围内的文档、改变没有要求修改的配置。

诊断：对比 git diff 和原始任务描述，找出超出范围的修改。

缓解：在 AGENTS.md 和系统提示里明确说明「只修改任务直接要求的内容，不做额外改进」。Feature List 明确划定边界，Agent 不能自行添加新的 Feature。

Harness 设计检查清单

在把 Agent 推上生产前，过一遍这个 Checklist：

目标与边界
• [ ] Agent 的任务目标明确且可验证
• [ ] 禁止操作和禁止访问区域已定义
• [ ] 成功标准可以计算（不是主观判断）

工具设计
• [ ] 工具集覆盖核心任务场景
• [ ] 有 Shell 后备工具处理未预见场景
• [ ] 每个工具有简洁的描述（一句话）
• [ ] 沙箱配置限制工具的访问权限

上下文管理
• [ ] 系统提示使用渐进式披露
• [ ] 工具输出卸载机制已实现
• [ ] Prompt 缓存已为固定内容打开

状态管理
• [ ] Progress File 模式已实现
• [ ] Git 集成（每个关键步骤 commit）

安全护栏
• [ ] 命令白名单或黑名单已配置
• [ ] 破坏性操作有审批门禁
• [ ] 敏感路径访问限制已设置

验证循环
• [ ] 自动化测试在每次修改后运行
• [ ] 测试通过是继续下一步的前提条件

可观测性
• [ ] Trace 已接入（至少 Langfuse 基础配置）
• [ ] 成本追踪已启用
• [ ] 预算告警已设置

成本控制
• [ ] 模型路由已按任务复杂度配置
• [ ] Prompt 缓存已启用
• [ ] 预算硬顶已设置

工程师角色的真实转变

这个系列从第 1 篇开始就在说一件事：工程师的工作正在从「写代码」变成「设计让 Agent 能安全持续写代码的环境」。

说得更具体一点，新技能是三个：

约束工程（Constraint Engineering）：不是告诉 Agent 做什么，而是设计它不能做什么——护栏、白名单、审批门禁、边界定义。设计好的约束让 Agent 在安全边界内最大化发挥能力。

评估设计（Evaluation Design）：定义「什么叫做对了」——可计算的成功标准、测试套件、LLM Judge 的评估维度。没有好的评估，你无法持续改进 Harness。

反馈循环设计（Feedback Loop Design）：可观测性告诉你系统现在怎么运行，评估告诉你输出质量怎么样，两者合起来让你知道下一步改什么、怎么改、改了有没有用。

这三个技能和「写好代码」的能力是互补的，不是替代。Harness 设计越好，Agent 能做的事就越多；Agent 能力越强，Harness 设计者的杠杆就越大。

给不同角色的建议

给刚开始接触 Agent 的开发者

先跑起来一个最小的 Harness，不要追求完整。选一个你真正在用的任务（代码审查、文档生成、数据分析），接上工具，写好系统提示，跑起来，看结果。

前三步：定义目标（Step 1）、设计工具（Step 2）、接入可观测性（Step 7）。其他步骤根据遇到的实际问题再加。

给有 Agent 开发经验的工程师

你可能已经有一个「能跑」的 Agent，现在想让它「生产可用」。重点看两个地方：

评估（Step 6）：你有可计算的成功标准吗？任务完成率是多少？你能量化 Harness 改进的效果吗？

可观测性（Step 7）：你能看到 Agent 在某次失败时具体哪一步出了问题吗？如果不能，先接 Langfuse。

给做决策的团队管理者

一件事：投资 Harness 基础设施是最高 ROI 的决策。

不是模型。模型的成本和能力都在快速变化，今天押注某个模型，明年可能需要迁移。Harness 基础设施——可观测性平台、评估体系、安全护栏——随着 Agent 能力提升，价值只会增加，不会减少。

投资在「如何安全地使用 AI Agent」上，而不只是「买最好的 AI Agent 服务」上。

展望：Harness Engineering 的下一步

最后说三个正在发生的趋势。

模型与 Harness 的紧密耦合

第 10 篇讲到，Codex 模型对 apply_patch 工具有「肌肉记忆」——这不是偶然，是训练时有意为之。未来的趋势是：模型训练数据会包含大量特定 Harness 环境下的高质量轨迹，模型和 Harness 不再是独立的组件，而是协同设计的整体。

自适应 Harness

现在的 Harness 是工程师手工配置的——护栏规则、工具描述、系统提示。下一步是：Harness 自己观察 Agent 的运行模式，自动识别失败模式，自动调整配置。GEPA 算法（第 12 篇提到过，Hermes Agent 系列里也讲过）是这个方向的早期实践。

Harness as a Service

不是每个团队都有资源自己构建完整的 Harness 基础设施。云端 Harness 平台正在兴起——托管的安全护栏、可观测性基础设施、评估服务，按需使用。LangSmith、Galileo、Helicone 都在往这个方向走。

系列总结：三件最重要的事

这个系列走完了 15 篇，如果只记住三件事：

第一件：模型之外的一切，才是真正决定 Agent 生产质量的

模型是 CPU，Harness 是操作系统。一个 70 分的模型配上精心设计的 Harness，能稳定完成复杂生产任务；一个 95 分的模型没有 Harness，在真实工作流里依然脆弱。

第二件：评估是 Harness 改进的引擎

没有评估，Harness 改进是猜测。有了评估，你知道哪里是瓶颈，改进之后能量化效果，持续迭代有方向。所有在生产中稳定运行的 Agent 背后，都有一套认真的评估体系。

第三件：从可运行到可生产，核心是工程纪律

Harness Engineering 不是新的魔法，是把软件工程的基本原则——测试、可观测性、故障隔离、持续改进——应用到 AI Agent 这个新的执行环境上。工程纪律的基本原理没有变，变的是应用场景。

感谢一路跟下来的读者。

本文是「Agent Harness Engineering 技术连载」第 15 篇，也是系列终篇。 第 1 篇：什么是 Harness Engineering | 第 2 篇：六大核心组件 | 第 3 篇：Martin Fowler 分类法 | 第 4 篇：上下文工程 | 第 5 篇：工具设计 | 第 6 篇：长程自主执行 | 第 7 篇：安全护栏 | 第 8 篇：评估与基准测试 | 第 9 篇：解剖 Claude Code | 第 10 篇：解剖 OpenAI Codex | 第 11 篇：多 Agent 编排实战 | 第 12 篇：Agent 可观测性 | 第 13 篇：成本优化实战 | 第 14 篇：框架层坍缩
