# Claude Code 为什么会忽略指令：四类失效原因 + 五层规则框架

> 📊 Level ⭐⭐⭐⭐ | 12.3KB

## 核心概述

当 `CLAUDE.md` 越写越长后，Claude Code 会开始忽略某些指令。根本原因不是模型不行，而是我们把太多不同性质的规则塞进了同一个入口文件。本文提出四类失效原因和五层规则框架，将模糊的"没听话"问题拆解为可诊断、可工程化的系统设计问题。

→ [原文存档](https://mp.weixin.qq.com/s/BdgTk8MfucPNRjlr0y_mVQ)

## 指令失效的四类原因

1. **规则没加载到上下文**：子目录 `CLAUDE.md` 或 `.claude/rules/` 只有在读到对应目录时才进上下文。任务刚开始、新建文件、压缩后继续写都可能出现"规则还没进来"的情况。诊断方法：`/memory`、`/context` 查加载状态。

2. **规则太空**："注意安全""保持简洁""写高质量代码"像会议提醒，不像 Agent 的执行规则。Agent 需要可执行的边界：什么输入必须校验、哪些调用不能放在事务里、哪类文件不能改。

3. **被当前任务上下文盖住**：长任务里 Claude Code 不断读文件、跑命令、看报错，上下文越来越厚，最近的信息更容易影响下一步动作。体感："刚开会话时很听规则，跑久了就开始飘"。

4. **不该交给模型记**：`Never modify .env`、`Never deploy without approval` 这类高风险规则漏掉后代价不是"再提醒一次"能解决的。应交给权限、Hook、CI、脚本或仓库保护——**软提醒和硬边界要分开**。

## 五层规则框架

| 层级 | 性质 | 位置 | 举例 |
|------|------|------|------|
| **入口卡** | 给模型看 | `CLAUDE.md` | 项目定位、技术栈、目录边界、完成证据、高频错误假设 |
| **执行规则** | 给模型看 | 子目录 `CLAUDE.md` / `.claude/rules/` | API 校验规则、特定目录测试命令 |
| **工作流脚本** | 给流程调用 | Skills | 发布流程、review checklist、迁移步骤 |
| **系统边界** | 给系统执行 | Hooks / permissions | 禁止修改 `.env`、危险命令拦截 |
| **CI/基建** | 给基础设施 | CI / 脚本 / 仓库保护 | 测试门禁、部署审批、格式化检查 |

**核心分流**：先看规则的性质（给谁看？），再决定机制（放哪里？）。放错层 = Claude Code 忽略指令。

## CLAUDE.md 的定位：入口卡而非总控台

`CLAUDE.md` 像一张"进仓库前的工作卡"——只放最容易误判、最常影响结果的东西。Anthropic 官方建议控制在 200 行以内。不建议写成项目知识库（知识库放 docs 里，让 Claude Code 需要时自己读）。

## 实操：变胖的 CLAUDE.md 怎么收

| 规则性质 | 去向 |
|----------|------|
| 每次会话都该知道 | 留在 `CLAUDE.md` |
| 只对某些目录/文件类型生效 | 子目录 `CLAUDE.md` 或 `.claude/rules/`（路径触发） |
| 超过 5 步的流程 | Skill |
| 产生大量中间材料的工作 | Subagent |
| `always/never/must/forbidden/production/secret/deploy` | Hooks / permissions / CI |

## Subagent 作为上下文卫生工具

Subagent 的核心价值不是"多一个助手"，而是**上下文隔离**。全仓搜索、日志分析、依赖对比等探索性工作交给 Subagent，主会话只拿摘要、证据和结论，保持决策线清晰。

## 深度分析

### 入口文件是常驻上下文预算，不是知识仓库

`CLAUDE.md` 的失效很少源于"规则写得太少"，而源于"写错了地方"：一旦把知识库、流程、局部规范一并塞进入口文件，它就从一个工作卡变成了常驻预算黑洞。入口文件的每个 token 都会随每次会话、每一步动作被重复加载，与当前任务的 token 直接竞争同一个上下文窗口——写进去的越多，单条规则的相对权重越低。所以真正的设计问题不是"我该写什么"，而是"什么必须常驻、什么可以按需加载"。Anthropic 官方给出的 200 行上限，本质是给这份预算画的一条红线，而不是字数考核指标。

### 四类失效对应四套修法，混治等于没治

四种"没听话"表面症状一致，机制却完全不同，修法也各不相同：规则没加载是**路由问题**（routing bug），规则本身有效，只是触发路径没走对，修法是用 `/memory`、`/context` 确认加载状态并调整落点与触发方式；规则太空是**谓词不可执行**（non-executable predicate），"注意安全"没有可判定的真假条件，修法是把模糊意图编译成可检查的边界；被任务盖住是**注意力衰减与近因偏置**（recency bias），规则仍在上下文里，却被后续的读文件、报错、命令输出层层稀释，修法是压缩任务上下文、隔离探索过程；不该交给模型记是**优先级失守**，模型并非没看到，而是在"完成当前任务"的局部最优下把它让位，修法是把约束移出自然语言层，交给无法被会话说服的机制。把这四类混为一谈，就会得出"CLAUDE.md 再写清楚一点就好了"的结论——而这恰恰是让入口文件继续变胖、失效继续复现的路径。

### 入口卡 = 对 Agent 指令做渐进式披露

五层框架的实质不是"重要程度分级"，而是**加载时机分级**：入口卡在会话开始即进上下文，子目录 `CLAUDE.md` 与 `.claude/rules/` 由路径触发，Skills 由流程触发，Hooks / permissions / CI 在动作发生的瞬间由系统判定。这四层正好是软件工程里渐进式披露（progressive disclosure）的同构：入口只保留"最容易猜错且每次都相关"的索引，细节留在被访问时才展开的页面上。因此局部规则（API handler 必须校验输入、migration 必须写回滚说明）不该让每个任务都加载——它的正确位置是路径触发的规则文件。**这一步正是 [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md) 里最常被忽略的设计决策：扩展点不是越多越好，而是要与加载时机对齐。**

同一逻辑也解释了为什么流程不该作为规则存在：发布流程是一套过程而非一条约束，放进入口文件的结果是不发布时也加载、步骤越补越长、没人知道哪一步还有效。正确形态是 Skill 承载过程、入口文件只留一行路由：`For release work, use the release-check skill.` 这也是同一个"按加载时机分层"原则在过程维度上的展开。

### Subagent 是上下文卫生，不是人手增量

Subagent 的收益来自**隔离**：全仓搜索、日志分析、依赖对比这类会产出大量中间材料的工作，留在主会话里会持续污染决策窗口；交给 Subagent 后只有摘要与结论回流，探索过程被丢弃在子会话里，主会话保住清晰的决策线。代价是对称的——被丢弃的中间材料里往往含有判断所需的细节与语感，隔离过度就会得到一份干净但失真的结论。所以该不该外包的判据是"结论能否脱离过程独立成立"，而不是"这件事要跑多久"。

### 用反事实测试判断规则是否真的绑定

规则的有效性不能靠"我把它写进去了"来断言。`/memory`、`/context` 给出的是加载层面的可见性——规则究竟有没有进上下文；但"进了上下文"不等于"起作用"。可用的反事实测试是：临时移除或反向修改这条规则，观察同类任务上的行为是否改变；若行为不变，这条规则就是不绑定的（non-binding），要么修谓词、要么换层、要么删除。对高风险规则，验证标准还要更硬——不是"模型是否遵守"，而是"违反时系统是否会拦住"，这正是密钥、生产配置、危险命令必须落在权限、Hook、CI 上的原因：能让系统兜住的，就不要只写成自然语言。

## 实践启示

把这份框架落到日常使用时，关键动作不是"把 CLAUDE.md 写得更全"，而是先定位失效类型、再选择对应层级的修法——四类失效对应四套改法，改错层次的工作量会白花。

1. **先诊断再动手**：指令失效时，先用 `/memory`、`/context` 判断是"没加载"还是"被稀释"；是路由问题就不要去改措辞，是谓词问题就不要去改文件位置。
2. **对每条新规则做反事实测试**：删掉它（或反向改写）再跑一次同类任务，行为不变就是不绑定规则——修谓词、换层或直接删除，而不是保留下来充当心理安慰。
3. **给入口文件设硬预算**：以 200 行为红线，超出一律强制外迁；入口卡只放项目定位、最容易猜错的技术栈与目录边界、常用命令、完成证据这几类每次都相关的内容。
4. **按触发方式分流局部规则**：只对某些目录或文件类型生效的规则改放子目录 `CLAUDE.md` 或 `.claude/rules/`，用路径触发而不是常驻加载；超过五步的流程改写成 Skill，入口只留一行路由语句；大型代码库里这套扩展点如何逐层落地，可对照 [Claude Code 大型代码库 Harness 配置](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-large-codebase-harness-configuration.md) 与 [Claude Code 七种自定义方法](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-seven-customization-methods-anthropic-official.md)。
5. **高风险词汇触发换层检查**：看到 `always`、`never`、`must`、`forbidden`、`production`、`secret`、`deploy`、`payment`、`delete` 就停下来，判断它是否关系到事故成本；若相关，一律下沉到 Hooks、permissions、CI 或仓库保护——软提醒与硬边界必须分开。
6. **探索型工作默认外包**：全仓搜索、日志分析、依赖对比优先交给 Subagent，主会话只接收摘要、证据与结论，把长任务里的上下文稀释控制在根源上。

这套动作的收敛目标只有一个：每条规则都待在"它恰好该被读到"的那一层上，入口文件保持薄，流程留在 Skill 里，而不可妥协的约束交给系统执行而不是交给提醒。

## 关联

- [CLAUDE.md 12 条规则](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-md-12-rules-mnilax-cf2019.md) — 本文解决"写什么规则"，本文解决"规则放哪里"
- [Claude Code 大型代码库 Harness 配置](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-large-codebase-harness-configuration.md) — CLAUDE.md 作为 Harness 五扩展点之一
- [Claude Code 七种自定义方法](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-seven-customization-methods-anthropic-official.md) — Anthropic 官方全景指南
- [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md) — 规则分层是 Harness 工程的核心设计决策

---

