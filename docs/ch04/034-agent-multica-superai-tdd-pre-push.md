# 阿里云端到端业务需求专家 Agent：Multica 平台 + superai-* 技能集群 + TDD/pre-push 质量门禁

## Ch04.034 阿里云端到端业务需求专家 Agent：Multica 平台 + superai-* 技能集群 + TDD/pre-push 质量门禁

> 📊 Level ⭐⭐ | 28.1KB | `entities/aliyun-end-to-end-business-requirements-agent-multica-2026.md`

# 阿里云端到端业务需求专家 Agent：Multica + superai-* 技能集群 + TDD/pre-push 质量门禁

> 阿里妹（阿里云开发者）2026-06-15 端到端业务需求 Agent 实战总结：把业务需求从进入到结项的完整过程，组织成 Agent 能自主推进、人只在关键节点确认的闭环。**核心创新**：12 个 superai-* 技能 + 长期 wiki/项目记忆 双仓库设计 + git pre-push hook 硬绑定 PMD/TDD 质量门禁 + TDD "测试定义对的，让实现去满足测试" 翻转。

## 1. 核心定位

> [!quote] 业务需求专家 Agent
> 它不是一个更聪明的代码生成器，而是把需求研发过程中的上下文、工具调用、人工确认、验收证据和反馈沉淀组织成一个闭环，尽可能把人从重复性的串联、取证和回忆里解放出来。

**三个被识别的工程化问题**:

1. **上下文能不能被组织起来** — 需求文档、用户澄清、历史业务知识、代码事实、配置平台、日志和人的经验，原本分散在不同地方
2. **工具能不能被串起来** — Aone、CR、代码仓、配置平台、SLS、HSF、监控、钉钉文档等都参与研发链路，但过去需要人手动编排
3. **反馈能不能产生复利** — Agent 在澄清里问错了什么、方案里漏看了什么、CR 里反复被指出什么，如果只停留在聊天记录里，下一个需求大概率还会再犯一次

## 2. 总体架构：四层闭环

| 层 | 名称 | 解决的问题 |
|----|------|----------|
| 第一层 | 上下文输入层 | Agent 靠什么理解业务（按阶段拉取长期业务知识、当前需求材料、代码事实、运行证据） |
| 第二层 | 业务专家编排层 | 下一步该做什么（澄清/方案/实现/验收阶段的判断；哪些地方必须停下来等人确认） |
| 第三层 | 工具执行层 | 具体动作怎么落地（Aone/Code/CR/配置平台/SLS/HSF/监控/钉钉文档按阶段调用） |
| 第四层 | 反馈学习层 | 下次能不能更好（CR 评论、issue 对话、验收记录 → 长期 wiki / codemap / skill 改进） |

**为什么选 Multica 作为落地平台**:

> 这套方案本身不绑定特定平台，核心仍然是 skill 的组合编排和提示词设计。落地时选择 Multica，是因为它在几个关键基础设施问题上降低了成本：独立 issue 工作区带来上下文隔离，Agent 与 skill 绑定减少每次手动拼装，多运行时和沙箱让需求可以持续推进，不依赖本地开发机在线。

## 3. 核心创新：双仓库上下文管理

> 这是与"单一 wiki"或"单一项目记忆"最关键的差异化设计。

**三仓库结构**:

```
代码仓库 (master)
  │
  ├─ 长期 wiki 仓库 (master, 永远在 master)
  │    └─ 业务知识、codemap、历史口径
  │
  └─ 项目记忆仓库 (feature/<需求-id> 分支)
       ├─ requirements.md     (澄清阶段产出)
       ├─ plan.md             (技术方案)
       ├─ progress.md         (实现进度)
       ├─ verification.md     (验收证据)
       └─ closeout-raw.log    (结项审计)
```

**核心原则 — "不直接升级"**:

> 项目过程中产生的事实先留在项目记忆层，只有经过结项审视和人工确认，才会选择性地进入长期知识。这样既避免了噪声污染长期 wiki，也保证了每次结项都能沉淀出真正有复用价值的业务知识。

**这与 Agent Memory Lifecycle Philosophies 的关系**: 阿里实践把"成熟 → 提升" 的边界明确划在"结项审视和人工确认"，与 Hermes 项目的 `extracted | merged | inferred | ambiguous` provenance state 思路一致，但更早地把"提升"动作显式纳入流程。

## 4. 两道质量门 + 一道硬门禁

### 4.1 需求澄清（第一质量门）

**底层 skill**: `superai-clarify`（结构化澄清方式）

**澄清产出** = requirements.md（项目记忆第一份文件）:
- 目标行为
- 非目标边界
- 验收标准
- 风险
- 待确认问题

> [!key] 协作留痕
> 对 Agent 的反馈不应该只停留在对话框里，而应该尽量落到 Aone / Code 平台本身的评论体系里，例如 requirements 的确认评论、代码评审 MR 的反馈和 resolve 记录。

**门禁规则**: 确认前 `superai-workflow` 不应该继续进入技术方案或实现；澄清是**第一质量门**（最高密度的人工反馈发生地）。

### 4.2 技术方案（第二质量门）

**澄清后不是直接写代码**，先写技术方案 — **人工确认最密集的第二处**:

- 现状是什么
- 目标行为是什么
- 不做什么
- 影响范围在哪
- 核心改动点是什么
- 风险在哪
- 怎么验证
- 出问题怎么回滚

**"怎么验收"必须在方案阶段就定清楚**（关键设计点）:

> 很多需求到了实现完才开始想怎么验证，结果发现验收条件不明确、配置状态没确认、边界场景没覆盖，又要回头补。所以在方案阶段，验收方式、测试策略和验证入口就应该写进 plan。

**配置类需求特别处理**（天机星策略 / 工作台配置 / 开关 / 白名单 / 人群分流）: 方案阶段不只是读取当前配置状态，还包括提前创建好配置的 schema、完成配置校验，并把这些信息写进技术方案文档里。

**底层 skill**: `superai-plan`（方案编写）+ `superai-tjx` + `superai-mt`（基于 `tjx-cli` 和工作台 CLI 的配置取证和 schema 校验）。

### 4.3 实现与硬门禁：TDD + git pre-push hook

**实现阶段** = `superai-execute` 负责编码和 TDD 推进。

**关键设计决策 — TDD 翻转**:

> AI 写测试最常见的失败模式不是"写不出来"，而是"为了通过覆盖率而写"——先写完代码，再补一堆只验证代码能跑通的测试，本质上只是在用测试确认自己的实现，而不是用测试约束正确行为。
>
> 真正有价值的 TDD 是反过来的：先根据 plan 里已经定好的验收标准和业务行为写测试，让测试定义"什么是对的"，再让实现去满足测试。

**三道内部硬门禁**（pre-push quality gate — Agent 自己必须过）:

| 门禁 | 触发机制 | 检查内容 |
|------|---------|---------|
| **diff-to-test 映射** | pre-push hook | 每一处生产代码的行为变化都要有具体测试锚点 |
| **PMD / lint** | pre-push hook | 规则类问题由自动化工具捕获 |
| **Agent 内部代码 review** | `superai-code-review` | PMD 通过后，对完整待 push diff 做结构化 review |

> [!warning] 关键设计取舍
> 这些门禁不能只靠提示词约束，必须变成 Agent 绕不过去的硬规则。提示词再怎么写"push 前必须跑 PMD"，Agent 在复杂任务中还是可能跳过。所以落地时，我们通过 git pre-push hook 把 PMD 校验和单元测试覆盖率检查注入到 push 流程里——Agent 执行 `git push` 时，hook 会自动触发检查，不通过就直接拒绝 push。
>
> 这样质量门禁就从"Agent 应该做"变成了"不做就推不上去"，是真正的工程化卡口，而不是靠提示词的自觉。

**这与 [Agent Skill Writing Practices](/ch04-242-agent-skill-高质量编写规范/) 决策树替代模糊判断的关系**: Skill 用决策树替代模糊判断是 **prompt 层的硬约束**；这里的 pre-push hook 是 **git hook 层的硬约束**。两者是不同层级的"硬规则"实现。

## 5. CR / Issue 协同：把人机反馈留下来

> 评论协作最密集的阶段恰恰是澄清和方案，而不是代码实现。需求理解对了、方案确认了，到了真正写代码的时候，以现在 Agent 的能力反而不需要那么多微操。

**关键设计 — 评论必须留在可追溯的地方**:

- Agent 主动读取 CR 上的 unresolved 评论
- 按评论内容修改对应文档或代码、提交新 commit、回复并 resolve
- 评论涉及需求语义或范围变更 → 回到 requirements 或 plan 阶段重新确认
- 重大节点通过 Aone milestone 评论回刷（澄清完成、方案确认、进入 TDD、代码完成、CR 反馈处理、验收通过）

**为什么强调"留痕"**:

> CR 评论和 issue 对话不只是当次需求的协作工具，更是后续结项沉淀的素材。哪些澄清反复出现、哪些代码模式被反复指出、哪些人工介入本可以自动化——这些信息只有留在平台上，结项时才能被系统性地回看和分析。如果反馈只停在聊天框里，需求结束就蒸发了。

## 6. 验收验证：让 Agent 用真实证据确认结果

> 单元测试通过不等于业务做对了。

**独立项目环境验证**（不在共享预发上跑）:
- Agent 创建或复用独立的项目环境
- 把当前 feature 分支部署上去
- 通过 HSF 泛化调用验证业务行为
- 通过 SLS 查询验证日志输出
- 通过监控或 Sunfire 验证运行时指标

**底层 skill**:
- `superai-aone` — 独立项目环境的创建和部署
- `superai-sls` — SLS 日志查询
- `superai-ops` — HSF 泛化调用和监控指标核对

**人工确认门保留**: 独立环境验收通过后，进入主预发或线上发布之前，仍然需要人工确认。Agent 不会自动执行主预发部署或线上发布。

## 7. 结项沉淀：让下一次需求更少依赖人工

**结项回答三个问题**:

| 类别 | 处理方式 |
|------|---------|
| **稳定的知识**（业务规则、系统边界、验收规范、排障经验） | 通过 CR 确认后进入长期 wiki 和 codemap |
| **可改进的流程**（Agent 在哪个环节犯了错、被人工反复纠正） | skill / 提示词的迭代候选 |
| **只需归档的材料**（一次性实现细节、临时调试记录） | 留在 closeout raw log |

**底层 skill**: `superai-finish`（结项入口编排）+ `superai-memories`（项目记忆收口和长期 wiki 候选生成）

## 8. 后续规划：从单 Agent 走向 Agent Team

### 8.1 接入成本还需要降低

集团内不少平台工具还只支持网页授权登录，没有对 Agent 的命令行沙箱环境做好适配。过渡态问题。

### 8.2 缺少 Agent 效果的度量体系

**至少需要观测的 4 个维度**:

| 维度 | 观察指标 |
|------|---------|
| 人力投入 | 人工介入次数、评论轮次、人工修正比例是不是在下降 |
| 需求质量 | 方案返工率、验收一次通过率是不是在提升 |
| 线上稳定性 | 上线后的问题数、回滚次数是不是在减少 |
| 协作效率 | Aone 和 Multica 双事实源之间的同步成本、跨平台信息丢失率是不是在可控范围 |

> 有了这样的度量基线，才能判断每一轮 skill / 提示词迭代到底是改进还是退化，Agent 的自我成长才有据可循，而不是靠感觉。

### 8.3 Agent Team 的关键设计约束：共享长期 wiki，各自维护视角

> 这个 team 模式的关键设计约束是共享长期 wiki，各自维护视角。所有 Agent 共享同一份长期业务知识，保证对业务理解的一致性；但每个 Agent 从整体需求中只拆解出跟自己职责相关的部分，各自维护自己的 requirements、plan 和过程产物。队长负责把各方产物对齐，确保前后端接口契约一致、测试覆盖完整。

**PD Agent 角色**（未来规划):

> 往上游看，需求产出本身也可以纳入：一个 PD Agent 负责生成 PRD、梳理业务规则、输出验收标准，它同样共享长期 wiki，了解过去的技术方案和业务需求历史。这样一来，前面 3.2 里人工介入最密集的需求澄清环节，就可以变成 PD Agent 与业务专家 Agent 之间的直接对齐，人只需要在关键歧义处做最终裁决，而不是全程逐条解释业务背景。

**数据方向扩展验证**:

> 一个数据专家 Agent 采用和后端 Agent 相同的方法论——上下文组织、方案确认、TDD 实现、验收取证、结项沉淀——但专注于离线数据开发、报表生成和数据分析。它验证了一件事：这套框架不是只能用在后端编码上，而是可以被不同领域的 Agent 复用的通用研发流程。

**不急于提前铺设**:

> Agent 拆分不应该按流程步骤机械切分，而应该看是否真的存在独立判断、独立产物、并行执行和责任隔离的需要。在还没有足够多的真实复杂需求验证之前，不急于提前铺设。

## 9. 隐含的协作模式转变

> 人不应该继续在每个需求里反复补位，而是把这些补位动作沉到系统里。Agent 缺上下文，就补知识和项目记忆；缺能力，就补工具接口；流程容易跑偏，就补确认门和质量门；反馈容易丢失，就补评论、验收和结项沉淀。只有这些工作条件被系统化，需求交付才不会继续卡在人身上。

> 也许真的会有一天，PD 提完需求之后，就能直接交给对应的业务 Agent 去研发、验收和上线。

## 10. 12 个 superai-* 技能清单

| 技能 | 用途 | 涉及阶段 |
|------|------|---------|
| `superai-workflow` | 流程编排（门禁控制） | 澄清门禁 |
| `superai-memories` | 上下文拉取、组织、长期 wiki 蒸馏 | 进入 / 结项 |
| `superai-aone` | Aone 工作项 + CR 评论 + milestone 回刷 + 独立项目环境 | 进入 / CR 协同 / 验收 |
| `superai-clarify` | 结构化澄清 → requirements | 澄清 |
| `superai-plan` | 技术方案编写 | 方案 |
| `superai-tjx` | 天机星 CLI 配置取证 | 方案（配置） |
| `superai-mt` | 工作台 CLI 配置校验 | 方案（配置） |
| `superai-execute` | 编码和 TDD 推进 | 实现 |
| `superai-code-review` | 结构化代码 review | 实现（PMD 后） |
| `superai-sls` | SLS 日志查询（验收 + 发布观察） | 验收 / 发布 |
| `superai-ops` | HSF 泛化调用 + 监控指标核对 | 验收 / 发布 |
| `superai-finish` | 结项入口编排 | 结项 |

## 11. 与现有实体的差异化

**与 [Multica Managed Agents Platform](/ch07-050-multica-开源-managed-agents-平台/)**: Multica entity 讲平台本身（开源、25,584⭐、Go 守护进程、独立 issue 工作区、pgvector 记忆）。新文章讲**业务需求 Agent 怎么在 Multica 之上编排 superai-* 技能跑通端到端交付闭环**。同一平台，不同视角（平台能力 vs. 业务交付实践）。

**与 [Alibaba Aone Agentic Rd Mode Xiangbangyu](/ch04-045-alibaba-aone-agentic-rd-mode-xiangbangyu/)**: Aone Agentic RD 模式（向邦煜）讲"组织层重构"——传统协作和分工在 Agent 时代成为效率阻碍，All-in-One 版本化管理。**新文章不讲组织重构，讲具体交付 pipeline 怎么运转**（澄清门 → 方案门 → 实现 → 验收 → 结项），是用具体工程实现验证 Aone 模式的可行性。

**与 [Harness Engineered Business Agent Evaluation Aliyun Boyu](/ch04-082-harness-工程搭建式业务-agent-评测方案-claude-code-作-harness-搭建者/)**: 阿里泊予的 6 Agent 评测 Harness 视角，**聚焦"评测"环节**（L1/L2/L3 指标、test_runner.py → 评测 Agent 提示词）。新文章聚焦**研发交付全过程**（澄清→方案→实现→验收→结项），是兄弟文章，覆盖不同环节。两者是同一阿里云团队不同角色（泊予 评测 vs 阿里妹 研发交付）的实践。

**与 [从提需求到部署发布全Ai全自动化后研发效能全面跃升](/ch09-065-从提需求到部署发布-全ai全自动化后-研发效能全面跃升/)**: 腾讯 CodeBuddy L1→L2→L3 演进视角，**6 个试点需求 90% 代码采纳率等数据**。新文章阿里云视角，**没有量化数据但有具体技能名（superai-*）+ 具体平台（Multica）+ 具体门禁（pre-push hook）**。两边互补：腾讯讲 L1→L3 演进框架，阿里讲具体某阶段的工程化深度。

## 12. 深度分析

### 多 CA 协作：共享长期 wiki + 各自维护视角的分工边界

阿里云的 Agent Team 模式揭示了一个关键设计约束：**共享长期 wiki，各自维护视角**。PD Agent、前端 Agent、后端 Agent、测试 Agent 共享同一份长期业务知识，保证对业务理解的一致性；但每个 Agent 从整体需求中只拆解出跟自己职责相关的部分，各自维护 requirements、plan 和过程产物。队长负责各方产物对齐，确保前后端接口契约一致、测试覆盖完整。

这一模式与 Agent Role Specialization 的多角色 Agent 协作思想同源——不是按流程步骤机械切分，而是看是否真的存在**独立判断、独立产物、并行执行和责任隔离**的需要。在没有足够多真实复杂需求验证之前，不急于提前铺设，体现了工程化节奏的克制。

### 端到端闭环的本质：上下文 → 编排 → 执行 → 反馈的四层循环

这套系统的核心不是单点能力，而是**从事实输入、阶段判断、工具落地到反馈回收的闭环**。第一层上下文输入层按阶段拉取长期业务知识、当前需求材料、代码事实和运行证据；第二层业务专家编排层判断下一步该做什么（澄清/方案/实现/验收）以及哪些地方必须停下来等人确认；第三层工具执行层按阶段调用 Aone/Code/CR/配置平台/SLS/HSF/监控/钉钉文档；第四层反馈学习层把 CR 评论、issue 对话、验收记录、自恢复日志和人工修正蒸馏回长期 wiki / codemap / skill 改进。

闭环一旦真正合上，每做一个需求，Agent 理解业务的基线就高一点，人需要解释的上下文就少一点。这是**复利效应**的来源——反馈不是当次消耗，而是下次投入。

### 质量门禁的工程化：硬规则 vs. 提示词自觉性

文章最关键的设计取舍在于：**门禁不能只靠提示词约束，必须变成 Agent 绕不过去的硬规则**。提示词再怎么写"push 前必须跑 PMD"，Agent 在复杂任务中还是可能跳过。解决方案是通过 git pre-push hook 把 PMD 校验和单元测试覆盖率检查注入到 push 流程里——Agent 执行 `git push` 时，hook 自动触发检查，不通过就直接拒绝 push。

这与 [Agent Skill Writing Practices](/ch04-242-agent-skill-高质量编写规范/) 用**决策树替代模糊判断**是不同层级的"硬规则"实现：后者是 prompt 层的硬约束，前者是 git hook 层的硬约束。两者叠加，才构成真正意义上的工程化卡口，而不是靠自觉性。

### 阿里云 Agent 平台策略：Multica 的选择逻辑

选择 Multica 而非自建平台，核心原因不是技术不可替代，而是**基础设施成本**。独立 issue 工作区带来上下文隔离，Agent 与 skill 绑定减少每次手动拼装，多运行时和沙箱让需求可以持续推进，不依赖本地开发机在线。这套方案本身不绑定特定平台，核心仍然是 skill 的组合编排和提示词设计——平台只是落地载体，[Multica Managed Agents Platform](/ch07-050-multica-开源-managed-agents-平台/) 的开源属性（25,584 ⭐、Go 守护进程、pgvector 记忆）提供了足够的定制灵活性。

### 双仓库上下文管理：知识升格的节奏控制

"不直接升级"原则是双仓库设计最关键的设计哲学：项目过程中产生的事实先留在项目记忆层（feature 分支），只有经过结项审视和人工确认，才会选择性地进入长期 wiki。这样既**避免了噪声污染长期 wiki**，也保证了每次结项都能沉淀出真正有复用价值的业务知识。

这与 Agent Memory Lifecycle Philosophies 的"提升"边界思路一致——[Agent Memory Architecture](/ch04-146-agent-memory-架构本质/) 强调的 provenance state（extracted | merged | inferred | ambiguous）在阿里云实践里被显式化为**结项审视 + 人工确认**两个可操作的动作节点，而不是依赖 LLM 自行判断何时该"升格"。

### 效果度量先于自我迭代：Agent 成长的可验证路径

文章指出现有最大短板之一是**缺少 Agent 效果的度量体系**。4 个观测维度（人力投入/需求质量/线上稳定性/协作效率）的基线必须先建立，才能判断每一轮 skill / 提示词迭代到底是改进还是退化，Agent 的自我成长才有据可循。

这与 Agent Self Improvement Loops 的"度量驱动迭代"思想一致——没有基线就没有改进，没有改进基线就永远停在原点。

## 12. 实践启示

1. **"硬门禁"比"提示词自觉"可靠** — TDD、PMD、覆盖率通过 git pre-push hook 强制绑定，Agent 推不上去就推不上去，不靠 prompt 自觉性。

2. **双仓库上下文设计是"长期 wiki 不被噪声污染"的关键** — 项目过程材料留在 feature 分支，结项审视后才选择性蒸馏回长期 wiki。比"all-in-one 一次性升级"更稳健。

3. **TDD 翻转（测试定义对的，让实现去满足）** — 反"AI 写测试为覆盖率"的最常见失败模式。 **[!contradiction] 参见 [Agent Skill Writing Practices](/ch04-242-agent-skill-高质量编写规范/) 的"决策树替代模糊判断"思路** —— 两篇文章用不同方式解决同一个问题：让"行为正确"成为可验证约束。

4. **人只在关键节点确认** — 需求澄清、方案确认、发布动作 3 个节点保留人工门禁，其余环节 Agent 自主推进。

5. **多 Agent 协作的边界 — 共享长期 wiki，各自维护视角** — 各 Agent 共享业务知识但独立维护自己的过程产物。这与 Agent Role Specialization 的多角色 Agent 思想同源。

6. **效果度量先于自我迭代** — 4 维度（人力/质量/稳定/协作）基线先建立，再判断 skill/prompt 迭代是改进还是退化。这与 Agent Self Improvement Loops 的"度量驱动迭代"思想一致。

## 相关实体

- [Multica Managed Agents Platform](/ch07-050-multica-开源-managed-agents-平台/) — 新文章选用的运行时平台
- [Alibaba Aone Agentic Rd Mode Xiangbangyu](/ch04-045-alibaba-aone-agentic-rd-mode-xiangbangyu/) — 阿里 Aone Agentic RD 模式（组织层重构视角）
- [Harness Engineered Business Agent Evaluation Aliyun Boyu](/ch04-082-harness-工程搭建式业务-agent-评测方案-claude-code-作-harness-搭建者/) — 阿里泊予 评测 Harness 视角（兄弟文章）
- [从提需求到部署发布全Ai全自动化后研发效能全面跃升](/ch09-065-从提需求到部署发布-全ai全自动化后-研发效能全面跃升/) — 腾讯 CodeBuddy L1→L2→L3 演进
- [Ai Native Rd Org Design](/ch05-018-ai-native-时代研发组织何去何从/) — AI 原生研发组织设计
- Agent Harness Context Management Working Set — Agent Harness 上下文管理
- [Agent Skill Writing Guide](/ch04-163-从-0-到-1-教你写-agent-skill-让-ai-懂你的-潜规则/) — Skill 编写基础
- [Agent Skill Writing Practices](/ch04-242-agent-skill-高质量编写规范/) — Skill 编写实战（决策树替代模糊判断）
- Agent Role Specialization — 多角色 Agent 协作
- Agent Self Improvement Loops — 度量驱动的 Agent 自我迭代
- Agent Memory Lifecycle Philosophies — 记忆生命周期与"提升"边界
- [Agent Memory Architecture](/ch04-146-agent-memory-架构本质/) — Agent 记忆架构
- Agent Orchestration Patterns — Agent 编排模式
- Agent Deployment Strategy — Agent 部署策略
- MOC

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/aliyun-end-to-end-business-requirements-agent-multica-2026.md)

---

