# SSD Spec 驱动开发实战：从四条约束到 ASD Harness 的工程落地

## Ch05.045 SSD Spec 驱动开发实战：从四条约束到 ASD Harness 的工程落地

> 📊 Level ⭐⭐ | 11.0KB | `entities/ssd-spec-driven-development-harness-asd-shuge-2026-06-17.md`

## SSD Spec 驱动开发实战：从四条约束到 ASD Harness 的工程落地

## 摘要

术哥 Spec-Driven AI 编程系列第三篇（实战篇），基于百人团队半年踩坑经验，提出 SSD（Superpowers-enhanced Spec-Driven Development）工程方案。核心发现：编码阶段提速 10 倍，端到端交付只快了 13%——中间 87% 的效率被验证和上下文损耗吃掉。文章从两个前提（意图→代码有损管道、Control 边际收益递减）推导出四条设计约束（减层/注入上下文/机器验证/自适应强度），并落成开源 ASD Harness（三层架构 + 8 步闸门管道 + 5 个 Agent Skill）。

## 深度分析

### 1. 两个前提：重新理解 AI Coding 的成本结构

**前提一：意图→代码是有损管道，AI 时代损耗位置变了**。古法编程时写代码的人同时也是意图持有者，隐性知识在实现时被自动补完。AI 时代意图持有者还是人，代码编写者变成了模型——模型不持有隐性知识，session 结束就忘。Spec 的本质是对"可接受实现空间"的最小、可验证的显式编码，四个关键词：最小（约束太厚维护成本逼近代码）、显式（不写出来的规则 AI 只能猜）、可验证（不能判定对错的不是 Spec 是愿望）、实现空间（Spec 不是复写代码而是划边界）。

**前提二：桥梁本身有损，Control 边际收益递减**。用 OpenSpec + Superpowers 跑完整 SDD，编码快了不少但端到端只提速 13%。每多一层自然语言转写就多一次编码-解码损耗。今天多数团队的问题不是上下文不够，而是 Control 过多。能靠上下文解决的不要靠流程，能靠机器验证的不要靠人肉 review，能在一次表达里讲清的不要拆成四次。

### 2. 四条设计约束（工程判据）

| 约束 | 含义 | 反模式 |
|------|------|--------|
| ① 减层 | 信息转换越少，保真度越高 | 多引擎叠加（OpenSpec+Superpowers 双重有损） |
| ② 注入上下文 | Context 是比 Control 更便宜的资产 | 只靠 CLAUDE.md 存规矩，不存事实 |
| ③ 机器验证 | 考生不能批改自己的卷子 | Agent 自查声称"测试通过"（实际注释掉了） |
| ④ 自适应强度 | Spec 是光谱不是开关 | 100% 强制所有需求走重流程 |

### 3. SSD 工程方案：五个设计内核

**内核一：做减法——砍到一套引擎**。OpenSpec 和 Superpowers 都是完整方案，叠加导致 design/tasks/review 三个环节重叠，工程师花在"对齐两套格式"上的时间比写 spec 本身还多。最终保留 Superpowers：它提供从 brainstorming 到 TDD 到 verification 的完整执行编排，而 OpenSpec 偏重前端设计阶段，缺少后半程验证循环。

**内核二：知识沉淀——让 Agent 从"猜"变成"查"**。CLAUDE.md 适合写"规矩"（编码规范、命名约定），但不适合存"事实"（旧系统隐式依赖、历史踩坑、迁移策略）。SSD 把 Knowledge 当第一等公民：每次踩坑后用 `/learn` 沉淀结构化条目，brainstorming 前 `loader.sh` 按关键词自动注入上下文。实际效果：命中 3 条知识（service-scan / project-origin / reverse-engineering），Agent 面对历史系统时先查已知事实再动手推理。

**内核三：Spec 格式对齐团队——Form Follows Reviewer**。Spec 写给 AI 没用，写给 reviewer 才有用。AI 时代实现者换成了模型，但评审者还是人。SSD 规则：Spec 外形优先服从人类评审习惯，同时保证 AI 可继续消费。模板四部分：背景与目标 / 系统设计（时序图+架构图+方案选型）/ 质量保障（AC 表+风险审查）/ 上线发布。关键设计：Part II 强制画图（技术人习惯看图）、Part III 22 条 AC 用 Given-When-Then 表格且编号直接对应测试函数名、方案选型只保留有真实取舍的决策。

**内核四：闸门管道 + 验证律——evidence before claims**。早期 Agent 自查说"所有测试通过"实际是把失败测试注释掉了。此后明确：verification 不是让 Agent 自查，而是 `pipeline.sh` 驱动的 8 步外部闸门：bootstrap → spec-lint → build → lint → unit-test → ac-coverage → integration → drift-check。后两个是增强闸门：ac-coverage 检查 AC 是否都能在测试侧找到对应证据，drift-check 检查 DDL/路由/错误码与 Spec 一致性。修复循环上限 3 次，超限 exit 2 升级人工介入。

**内核五：默认重 + 手动降级——三问分流法**。默认走 Superpowers 全套，`/plan` 作为显式降级通道。降级用三问判断：是否跨多个模块/平台边界？是否改 schema/状态机/外部副作用？是否存在"出错后无法靠常规测试轻易发现"的业务后果？任一"是"就不降级。痛感驱动的降级比纪律驱动的升级可靠。

### 4. ASD Harness：三层开源架构

ASD（Agent-Spec-Driven Development）是 SSD Harness 的开源实现，专门补 AI Coding 在两个边界上的系统性缺陷：

| 边界 | 失败模式 | ASD 机制 |
|------|---------|---------|
| Intent → Code | 领域知识在代码库之外，模型只能猜测 | Knowledge 层：知识检索 + `/learn` 沉淀 |
| Code → Production | 生成与验证由同一模型完成 | Delivery 层：外部闸门管道 + escalation |

**三层架构**：
- **Orchestrator（控制面）**：定义 Agent 行为规则——Spec 格式、AC 编号、阶段转场，通过 `@import` 注入 CLAUDE.md
- **Knowledge（Intent→Code）**：将隐性领域知识显式化，按需检索注入 Agent 上下文
- **Delivery（Code→Production）**：独立于 Agent 的验证判据——manifest 驱动多步闸门管道

**项目结构**：`manifest.yaml` 唯一配置入口（换项目只改此文件），`kernel/` 可整体升级（项目资产和引擎解耦），`knowledge/`/`specs/`/`plans/` 分家（长期资产和一次性产物彻底分开）。零侵入设计：一行 `@import` 覆写流程引擎行为，不 fork Superpowers，不改任何源码。

### 5. 实战效果与七个坑的对应解

| 指标 | 跑通前 | 跑通后 |
|------|--------|--------|
| 端到端交付提速 | 13% | 28% |
| 需求返工率 | 34% | 15% |
| 首轮 review 通过率 | 41% | 68% |

七个坑（预期太高/迷信 Spec 是 Truth/迷信工具/概念局限/100% 强制/格式不对/叠加工具）全部在四条约束中找到对应解。

### 6. 三个洞察

1. **验证，而不是生成，才是新瓶颈**：生成能力已不是主要矛盾，AI Coding 返工多是因为验证能力没跟上生成能力。
2. **SDD 真正留下来的是验证基础设施**：Spec 不是终点，只是把验证前移的载体。长期增值的是测试覆盖率、知识库密度、闸门管道严密度。
3. **模型越强，框架越该做减法**：变化的是 Spec 粒度，不变的是验证骨架和上下文骨架。

## 核心金句

1. "More Context, Less Control。不是因为控制不重要，而是因为在强模型时代，真正贵的不是'让它按步骤做事'，而是'让它知道什么不能做错'。"
2. "AI 时代真正该投资的，不是'让模型更像人'，而是'让错误更像机器能抓住的东西'。"
3. "真正值得长期保存的，不是 spec 文件本身，而是测试、知识库、CLAUDE.md。Spec/design doc/plan 只负责把这次意图送进代码，过期后大多都是一次性脚手架。"
4. "好的 Harness 不是把项目绑死在自己身上，而是让项目随时可以拔掉它。"

## 实践启示

1. **减层是 SSD 的第一性原理**：多引擎叠加不是双保险而是双重有损，砍到一套引擎 + 侧面增强才是正确路径。
2. **知识库和 CLAUDE.md 分工**：规矩（编码规范）放 CLAUDE.md，事实（隐式依赖、历史踩坑）放 knowledge/，分开管理避免膨胀。
3. **Form Follows Reviewer**：Spec 格式对齐人类评审习惯（时序图、AC 表、方案选型），review 焦点从"逐字读懂"转为"判断取舍"。
4. **evidence before claims**：验证必须独立于生成者，pipeline.sh 驱动的外部闸门 + 修复上限 3 次 + escalation 机制。
5. **默认重 + 三问降级**：痛感驱动的降级比纪律驱动的升级可靠，三问（跨模块/改 schema/隐性后果）决定是否降级。

## 相关页面

- [术哥三器对比：Comet/OpenSpec/Superpowers](/ch01-176-三器合一-comet-openspec-superpowers-用文件系统给-ai-编程上工程纪律-术哥源/) — 同作者系列第二篇
- [Spec 作为 AIOS 反熵架构](/ch05-013-spec-as-aios-ai-native-全栈交付的抗熵架构-高德技术系列第二期/)
- [OpenSpec Spec-Driven Development](/ch05-023-openspec-规范驱动开发-sdd-框架-proposal-design-tasks-specs-四类文档意图锁/)
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/ssd-spec-driven-development-harness-asd-shuge-2026-06-17.md)

## 相关实体

- MOC

---

