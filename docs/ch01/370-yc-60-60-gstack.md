# YC掌门人60天写了60万行代码：gstack开源

## Ch01.370 YC掌门人60天写了60万行代码：gstack开源

> 📊 Level ⭐⭐ | 10.0KB | `entities/gstack-garry-tan-600k-lines-60-days.md`

## 核心数据

- **60天**写了60万+行代码，其中35%测试代码
- **7天**：14.7万行新增，362次提交，净增约11.5万行
- **每日产出**：1万-2万行可用代码
- **2013年** Garry Tan YC内部贡献772次 → **2026年3月**已达1237次（还在增长）
- **并行Sprint**：常规10-15个同时运行

## gstack是什么

把Claude Code变成可管理的虚拟工程团队。15个专家角色+6个增强工具，MIT协议开源 。

### 15个角色

**流程类（按Sprint顺序）**：

| 角色 | 功能 |
|------|------|
| `/office-hours` | 产品重构，重新定义问题本身 |
| `/plan-ceo-review` | CEO视角，四种范围模式 |
| `/plan-eng-review` | 工程负责人，锁定架构、数据流、边界 |
| `/plan-design-review` | 设计师，0-10打分+满分方案 |
| `/design-consultation` | 设计合伙人，完整设计系统+原型 |
| `/review` | Staff工程师，找CI通过但会炸生产的bug |
| `/investigate` | 调试专家，根因分析，3次失败停止 |
| `/design-review` | 会写代码的设计师，修复+原子提交 |
| `/qa` | QA负责人，找bug+自动修复+回归测试 |
| `/qa-only` | QA报告员，只出报告 |
| `/ship` | 发布工程师，同步+测试+覆盖率+PR |
| `/document-release` | 技术写作，自动更新所有文档 |
| `/retro` | 周度复盘，个人数据+发布连续性+测试趋势 |
| `/browse` | QA工程师，真实Chromium浏览器+截图 |
| `/setup-browser-cookies` | 会话管理，导入各浏览器cookie |

**增强工具类**：

| 工具 | 功能 |
|------|------|
| `/codex` | OpenAI Codex CLI独立审查，双AI交叉 |
| `/careful` | 安全护栏，破坏性命令前警告 |
| `/freeze` | 编辑锁定，限制目录范围 |
| `/guard` | /careful + /freeze合并 |
| `/unfreeze` | 解除限制 |
| `/gstack-upgrade` | 自我更新 |

## 一次典型Sprint

1. `/office-hours` — 质疑表述框架，提取隐性能力，挑战前提假设
2. `/plan-ceo-review` — 10维度范围评估
3. `/plan-eng-review` — 数据流ASCII图、状态机、故障模式
4. 批准，退出规划模式
5. **8分钟，11个文件，2400行代码**
6. `/review` — 2个问题自动修复，1个手动确认
7. `/qa` — 真实浏览器测试，1个bug
8. `/ship` — 测试42→51个，PR开出

**8条命令完成完整Sprint** 。

## 并行运行10-15个Sprint

用Conductor把多个Claude Code会话并行运行在隔离工作区 。一个做/office-hours，另一个/review，第三个实现功能，第四个跑/qa...

关键：没有流程，十个代理是混乱来源。有流程后，管理方式和CEO管理团队一样——重要决策介入，其余让它们跑。

## 亮点能力

- **QA让并行翻倍**：6→12个工作流，Claude看到问题→修复→生成回归测试→验证
- **设计贯穿全系统**：/design-consultation → DESIGN.md → /design-review和/plan-eng-review都读取
- **文档自动同步**：/document-release读取每个文档，交叉对比diff，自动更新所有漂移内容
- **浏览器交接**：遇到验证码/MFA，可见Chrome窗口+cookie导入，解决后原地继续
- **双AI交叉审查**：/review(Claude) + /codex(OpenAI)同时审查同一个diff

## 深度分析

**1. 流程化是多人 Agent 协作从混乱到可管理的关键**

在没有流程的情况下，并行运行多个 Agent 只会产生混乱——每个 Agent 独立决策、资源冲突、重复工作、甚至相互否定 。gstack 的核心洞察是：一旦引入结构化流程，管理多个 Agent 的方式与 CEO 管理团队完全相同——重要决策介入，其余让它们跑。这个转变意味着 [Multi Agent Architecture Retail Practice](ch04/310-ai.md) 的瓶颈不在于 Agent 数量，而在于是否有清晰的流程定义。

**2. 分工精细化（15个角色）是专业化与效率平衡的结果**

gstack 定义了 15 个高度专业化的角色，从 `/office-hours`（问题质疑）到 `/ship`（发布工程师）形成完整生命周期 。这种分工的优势在于：每个角色只关注自己的领域，降低了单个 LLM 的认知负担；每个角色的 prompt 都针对其职责优化，提高了输出质量；角色之间通过标准化的 artifact（DESIGN.md、测试报告等）传递信息，减少了上下文丢失。

**3. QA 角色是并行效率倍增的杠杆**

将 QA 角色引入并行流程后，6 个工作流可以扩展到 12 个 。原因是 Claude 看到问题后 → 修复 → 生成回归测试 → 验证，形成了一个自我强化的循环。这意味着在 [Agent Harness Engineering Survey 2026](ch04/503-agent.md) 中，验证闭环不仅是质量保障的手段，更是吞吐量提升的杠杆——更好的验证机制允许更激进的并行。

**4. 设计文档（DESIGN.md）是多 Agent 协作的锚点**

整个 gstack 流程围绕 `/design-consultation` 生成的 DESIGN.md 运转 。这个文档被 `/design-review` 和 `/plan-eng-review` 同时读取，确保设计和工程视角的一致性。这与  中的「文档是地图」原则一致——设计文档不是装饰品，而是多个 Agent 之间共享的对齐基准。

**5. 双 AI 交叉审查用对抗性提升质量**

`/review`（Claude）和 `/codex`（OpenAI）同时审查同一个 diff ，本质上是利用两个不同模型的偏见差异来捕捉单模型可能遗漏的问题。这种方法类似于 LangSmith Trajectory Evaluations 中的多角度验证思路——不是依赖单一评估者，而是通过多个视角的交叉验证来提高可靠性。

**6. 8分钟完成 Sprint 是工程化 Agent 的里程碑**

一个典型 Sprint：8分钟、11个文件、2400行代码 。这个数字的意义不在于绝对速度，而在于证明了 AI Coding 可以从「单次辅助」扩展到「完整交付」。如果一个 Sprint 能在一杯咖啡的时间内完成，就意味着 AI Agent 可以真正承担起夜间自主执行的角色——睡前设计好 Spec，让 Agent 自主执行，第二天早上验收结果。

## 实践启示

**1. 为你的 Agent 工作流设计清晰的流程，而非简单的并行**

在增加更多 Agent 之前，先定义清晰的流程 。gstack 的经验是：10 个 Agent 没有流程 = 混乱；10 个 Agent 有流程 = 可管理的工程团队。流程设计的关键是明确每个角色的职责边界、输入输出、以及与其他角色的协作方式。这与  的第一条原则「Map, not Manual」一脉相承——流程就是地图。

**2. 用 QA 角色的自我修复循环提升并行效率**

不要把 QA 看作单独的验证步骤，而应将其设计为自我修复循环的一部分 。当 Agent 看到问题后自动修复、生成回归测试、验证修复，这个循环可以倍增你的并行工作流数量。在设计 Agent 流程时，考虑每个验证环节是否触发了「修复 → 测试 → 再验证」的自动闭环。

**3. 设计文档是团队共享的对齐基准**

强制 `/design-consultation` 生成标准化的 DESIGN.md，并让所有相关角色读取同一个文档版本 。这样可以确保即使在并行执行时，不同 Agent 对「要做什么」的理解也保持一致。这比让每个 Agent 独立理解需求然后各自行动要高效得多。

**4. 用双 AI 交叉审查替代单一审查**

引入不同模型进行对抗性审查可以捕捉单一模型的盲区 。在实践中，这不需要复杂的架构——只需要让 `/review`（Claude）和 `/codex`（OpenAI）同时审查同一个 diff，然后合并它们的反馈即可。

**5. 从 8 分钟 Sprint 开始，设计可验证的交付单元**

如果你的 Agent 流程无法在可接受的时间内完成一个完整 Sprint，它就无法承担夜间自主执行的角色 。将大任务分解为可在 10-15 分钟内完成的子任务，然后用完整的流程（规划 → 实现 → 审查 → QA → 发布）执行每个子任务。这种粒度使得人可以在一天内验收多个 Sprint 的结果。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/gstack-garry-tan-600k-lines-60-days.md)

---

