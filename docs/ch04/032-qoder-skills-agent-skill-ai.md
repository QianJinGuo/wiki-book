# Qoder Skills 完全指南 + Agent Skill 迭代式编写 — AI 按你的标准执行

## Ch04.032 Qoder Skills 完全指南 + Agent Skill 迭代式编写 — AI 按你的标准执行

> 📊 Level ⭐⭐ | 35.4KB | `entities/qoder-skills-完全指南从零开始让-ai-按你的标准执行-v2.md`

## 核心概念
Qoder Skills 是 AI 工作流定制的基础设施，它解决了一个根本性问题：**如何让 AI 按你的标准稳定执行，而非每次凭"直觉"自由发挥**。

### 菜单与菜谱的比喻
没有 Skill 的 AI 如同没有菜谱的餐馆——厨师按自己理解自由发挥，结果完全不可控。有了 Skill，AI 就能像拿到标准菜谱的厨师：知道标准做法、必备步骤、食材与火候，用户只需"点菜"就能稳定交付。

### Skill 与周边工具的生态定位
| 餐馆场景 | AI 工具 | 说明 |
|---|---|---|
| 菜谱/菜单 | **Skill** | 告诉 AI 怎么做、按什么标准做 |
| 厨师 | Agent/模型 | 执行者 |
| 食材+专业厨具 | **MCP** | 连接外部服务，提供"食材" |
| 今天的固定套餐 | Slash Command | 一次性快捷指令 |
| 厨房基本规则 | Rules | 全局约束，始终生效 |
| 副厨、帮厨 | Sub-agent | 专项协作角色 |
**MCP 提供专业厨房**——让 AI 能访问工具、数据和外部服务。**Skill 提供菜谱**——告诉 AI 如何将这些工具用好、按什么工作流执行。两者结合，才能让用户无需每次从头解释，AI 也能稳定交付高质量结果。

## Skill 的技术架构
### 文件结构规范
Skill 是一个**开放标准的文件夹**，核心结构如下：
```
your-skill-name/              ← 文件夹名用 kebab-case（小写+短横线）
├── SKILL.md                  ← 必须有，且必须是这个大小写
├── scripts/                  ← 可选：Python、Shell 等可执行脚本
│   ├── process_data.py
│   └── validate.sh
├── references/               ← 可选：按需加载的参考文档
│   ├── api-guide.md
│   └── examples/
└── assets/                   ← 可选：模板、字体、图标等资源
    └── report-template.md
```

### 三级渐进式披露机制（Progressive Disclosure）
这是 Skill 最核心的工作原理，决定了它既节省上下文，又能承载复杂知识：
**第一级：YAML Frontmatter**（元数据头部）→ 始终加载在 AI 的系统提示词中 → 只包含 name 和 description → 作用：让 AI 知道"我有哪些技能、分别在什么时候用" → **类比：图书馆的目录卡片**
**第二级：SKILL.md 正文** → 当 AI 判断当前任务与该 Skill 相关时，才加载完整正文 → 包含具体执行步骤、示例、注意事项 → **类比：从书架上取出那本书，深度阅读**
**第三级：scripts/ references/ assets/** → 只在 Skill 执行过程中需要时才按需读取 → **类比：书中引用的附录和参考资料**
这个机制带来三大优势：**省上下文**（大量 Skill 并存时 AI 只加载目录信息）、**省推理成本**（步骤清晰减少 token 消耗）、**结果确定**（固定步骤+可脚本化执行，输出稳定）。

### 跨平台兼容性
Skill 是开放标准，在以下环境中完全兼容：

- ✅ Qoder（Quest 模式、AIDE 模式、CLI）
- ✅ Claude.ai 网页端
- ✅ Claude Code CLI
- ✅ JetBrains 插件（即将支持）
- ✅ Claude API（通过 `container.skills` 参数）
**创建一次，所有平台通用。**

## Skill vs 其他工具的抉择框架
| 维度 | Skill | Slash Command | MCP | Rules |
|---|---|---|---|---|
| 触发方式 | AI 自主判断+可主动 `/` 调用 | 用户主动输入 `/xxx` | 工具调用时自动触发 | 始终在上下文中生效 |
| 内容复杂度 | 高：多步骤、脚本、资源、引用文件 | 低：固定短提示词 | 中：工具接口定义 | 低：全局约束规则 |
| 上下文占用 | 极低（只加载 metadata） | 中（加载固定提示词） | 高（一次性加载所有工具定义） | 低（始终存在） |
| 可分发性 | ✅ 天然适合团队共享和生态传播 | ❌ 难以共享 | ✅ 通过服务端共享 | ❌ 通常个人配置 |
| 适合场景 | 重复性工作流、跨项目规范、领域最佳实践 | 一次性快捷动作 | 调用外部系统数据 | 全局行为约束 |
**简单判断法则**：需要调用外部系统（数据库、邮件、日历、Notion）？→ MCP。只是一条全局约束（语言、格式）？→ Rules。一次性快捷操作，不需要复用？→ Slash Command。可复用的标准化工作流，需要团队共享？→ **Skill ✅**
> 💡 **实践结论**：Slash Command 能做的，Skill 都能做（Skill 也可以通过 `/` 调用）。但 Skill 还能引用脚本、内嵌资源、模块化分发。对新用户来说，直接学 Skill 即可，无需纠结 Slash Command。

## 三大最适合场景
根据 Anthropic 官方总结，Skill 最适合以下三类场景：

### 场景一：文档与资产创建（Document & Asset Creation）
**适合人群**：运营、产品、设计、所有人
**核心特征**：需要生成符合特定风格、规范或品牌标准的输出物
**典型案例**：给产品制作宣传视频（Remotion Best Practice Skill）、生成高质量前端界面（frontend-design Skill）、按公司模板生成 Word/PPT/Excel 文档、制作符合设计规范的海报或社交媒体图文
**为什么用 Skill**：你不熟悉该领域，无法指导 AI 达到专业标准。Skill 携带了该领域的最佳实践，让 AI 直接按专家标准执行。

### 场景二：工作流自动化（Workflow Automation）
**适合人群**：开发、技术管理者、任何有重复性工作的人
**核心特征**：多步骤流程，期望每次输出结果一致
**典型案例**：每次新增 API 后自动同步文档+兼容性检查+单元测试框架、代码提交前自动执行 Code Review 规范、按固定模板生成项目进展报告
**为什么用 Skill**：重复动作脚本化→不遗漏任何步骤；不依赖 AI 每次"想起来"提醒→结果确定；将步骤固化到文件→减少 token 消耗，降低成本。

### 场景三：MCP 能力增强（MCP Enhancement）
**适合人群**：已经连接了 MCP 的开发者、技术团队
**核心特征**：有了工具访问权限，但缺乏"怎么用好"的工作流知识
**典型案例**：连接了 Linear MCP 但每次都要解释 Sprint 规划流程→写一个 Skill 固化这套流程；连接了 GitHub MCP 但代码审查没有标准→写一个 Skill 定义审查步骤
**为什么用 Skill**：MCP 解决"AI 能做什么"（工具访问），Skill 解决"AI 应该怎么做"（工作流知识）。两者结合，用户无需每次从头解释，AI 自动按最佳实践执行。

## 安装与验证
**两个主要入口**：

- https://skills.sh — 当前最流行的开放 Skill 市场，含 Remotion（视频）、from-design（前端）等热门 Skill
- Qoder 官方 Skill 门户（即将上线，中英双语，按角色分类）
**三种安装方式**：
```bash

# 方式 A：命令行安装（推荐，最快）
npx skills add <skill-name>

# 执行后按交互提示选择 Agent、级别（Global/Project）、copy 模式
# 方式 B：手动放置文件
# 用户级：~/.qoder/skills/
# 项目级：<项目根目录>/.qoder/skills/
# 方式 C：Qoder Quest 模式中用内置 Skill 生成
# 直接对话："帮我创建一个 Skill，用于 [描述你的需求]"
```
**验证安装**：在 Qoder 对话框输入 `/`，如果安装的 Skill 出现在联想列表中，说明安装成功。
> ⚠️ **注意**：目前 Qoder Skills 不支持热更新，安装或修改 Skill 后，需要重启会话才能生效。

## SKILL.md 编写规范
### YAML Frontmatter（触发器）
Frontmatter 是 AI 决定"是否调用这个 Skill"的唯一依据。**必填字段**：
```yaml
---
name: api-standard-check     # 必须是 kebab-case，小写+短横线
description: |
  当开发者新增、修改或删除 API 接口时，自动执行本 Skill，
  完成 API 文档同步、向后兼容性检查和单元测试框架生成。
  触发词：接口文档、API 规范、兼容性、单元测试、接口变更。
---
```
**禁止事项**：禁止在 description 中使用 XML 尖括号；禁止 name 中含 "claude" 或 "anthropic"（保留词）；禁止 name 有空格或大写。

### 写好 Description 的三个黄金原则
1. **同时说明"做什么"和"什么时候用"**
2. **包含用户实际会说的话（触发词）**——用户一般不会说专业术语，要预测他们的自然语言
3. **控制长度，不超过 1024 字符**——Frontmatter 会被加载到系统提示词中，过长会占用上下文

### 正文写作的四个技巧
1. 用第三人称描述步骤：`"当被触发时，AI 需要先……"` 而非 `"你要……"`
2. 步骤编号化：每步只做一件事，AI 不会跳过或混淆顺序
3. 关键验证前置：把最重要的检查放在最前面，用 `## 重要` 或 `CRITICAL:` 标注
4. 引用胜过嵌入：复杂文档放在 `references/` 中，主文件只写引用路径，保持 SKILL.md 在 5000 词以内

## 五种进阶工作流模式
### 模式一：顺序工作流编排
适用：需要严格按顺序执行的多步流程。关键技巧：明确步骤依赖关系、在每步加验证、提供失败时的回滚指令。

### 模式二：跨 MCP 协调
适用：工作流跨越多个外部服务。例如设计转开发交付流程：Figma 导出（Figma MCP）→ 文件存储（Drive MCP）→ 任务创建（Linear MCP）→ 通知（Slack MCP）。

### 模式三：迭代优化循环
适用：需要多轮优化才能达到质量标准的输出。典型流程：初稿生成 → 质量检查（运行验证脚本） → 优化循环（重复直到通过质量标准） → 最终输出。

### 模式四：上下文感知的工具选择
适用：同一个目标，根据文件类型或场景选择不同工具。例如智能文件存储：大文件（>10MB）→ 云存储 MCP；协作文档 → Notion/Google Docs MCP；代码文件 → GitHub MCP。

### 模式五：领域专业知识内嵌
适用：需要将复杂的合规规则、行业知识内嵌到工作流中。例如支付处理合规流程：处理前（合规检查）→ 执行处理（IF 合规通过则执行 ELSE 标记待审）→ 审计记录。

## 测试与迭代方法论
**三类测试覆盖 Skill 生命周期**：
**触发测试（最关键）**：确保 Skill 在正确的时机加载。直接问 AI：`"你什么时候会用 [skill-name] 这个 Skill？"` AI 会复述 description，根据复述结果判断是否需要调整。
**功能测试**：运行同一个请求 3-5 次，检查输出结果是否一致、API 调用是否成功（0 错误为目标）、关键步骤是否都完成（无遗漏）。
**与无 Skill 基线对比**：
| 指标 | 无 Skill | 有 Skill | 改善 |
|---|---|---|---|
| 用户需要提供的说明 | 每次都要解释 | 无需解释 | ✅ |
| 来回对话轮次 | 15 轮 | 2 轮 | ✅ |
| API 调用失败次数 | 3 次 | 0 次 | ✅ |
| Token 消耗 | 12,000 | 6,000 | ✅ |
**根据反馈信号迭代**：Skill 没有自动调用→description 太模糊或缺少触发词；Skill 总是莫名被调用→description 太宽泛，加入负向说明；Skill 被调用了但 AI 没按步骤执行→指令太冗长或模糊，考虑用脚本替代语言描述。
**动态优化**：Skill 是活文档，每次修正都可以沉淀。`"你刚才的输出中，[具体描述问题]。请把这个改进固化到 [skill-name] 这个 Skill 文件中，下次遇到同样情况时直接按新方式处理。"`

## 团队协作与治理
**两级安装策略**：
| 级别 | 路径 | 适用场景 |
|---|---|---|
| 用户级（全局） | `~/.qoder/skills/` | 个人偏好、跨项目通用 |
| 项目级 | `<项目根>/.qoder/skills/` | 团队规范、项目特定流程（推荐提交到 Git） |
**Git 协作最佳实践**：
```bash
git add .qoder/skills/
git commit -m "feat: add api-standard skill v1.0"
git push  # 团队成员 git pull 后立即生效
```
---

## 深度分析
### Skill 作为人机协作的"契约层"
Qoder Skills 的本质价值在于它建立了一个人机协作的**契约层（Contract Layer）**。在传统 Prompt Engineering 范式中，每次对话都是一次独立的"谈判"——AI 凭上下文理解执行，结果依赖随机性。而 Skill 将协作标准外部化、持久化，变成可版本控制、可复用的资产。
这个契约层有三个关键属性：
1. **确定性**：固化步骤消除 AI 的"创意发挥"空间，保证输出一致性
2. **可传递性**：团队成员无需重复"培训"AI，直接复用同一套标准
3. **演进性**：Skill 作为文件可以版本管理，每次迭代的反馈都能沉淀

### Progressive Disclosure 的工程智慧
三级渐进式披露机制是 Skill 设计中最精妙的部分。表面上看这是为了节省上下文，实质上它反映了一个深刻的工程原则：**延迟加载（Lazy Loading）**——只加载当前需要的知识。这不仅是技术优化，更是一种认知资源管理策略。当 AI 只需要知道"有哪些 Skill 可用"时，加载完整正文反而会增加决策噪音；只有在明确任务上下文后，完整正文才能被有效利用。

### MCP 与 Skill 的互补关系
文章清晰地区分了 MCP（工具访问层）和 Skill（工作流知识层）的分工。但更深的洞察是：**MCP 解决"能力边界"问题，Skill 解决"能力使用"问题**。很多团队的错误在于——以为接入了 MCP 就完成了 AI 化，结果 AI 虽然"能"访问各种工具，却不知道什么时候用、怎么协调、产出什么标准。Skill 填补的正是这个执行层面的知识缺口。

### Skill 的"锁定效应"与灵活性平衡
Skill 在固化最佳实践的同时，也带来了"锁定"风险——团队可能过度依赖某个 Skill，丧失探索更好方案的可能性。文章提到的动态优化机制（"把改进固化到 Skill 文件"）是一种补救，但根本解法是在设计 Skill 时保持一定的**触发词模糊性**，允许 AI 在边界情况下自主判断，而非严格限定执行路径。
---

## 实践启示
### 1. 从高频重复任务切入
Skill 最大的 ROI 在于**重复性高、步骤固定、结果要求一致**的场景。对于一次性任务投入编写 Skill 的成本不划算。建议从"每次都要解释 3 遍以上的需求"入手，这类通常是标准工作流。

### 2. Description 是最重要的部分
新手常犯的错误是花大量时间写 SKILL.md 正文，却忽视 description 的质量。Description 是 AI 决定是否调用的唯一依据，决定了整个 Skill 的触发效率。建议用真实用户的语言写触发词，而非技术术语。

### 3. 脚本替代判断，步骤替代建议
在 SKILL.md 中，`scripts/check_api_docs.py --project-id PROJECT_ID` 比"检查 API 文档是否完整"这样的语言描述可靠得多。脚本是确定性的执行，语言描述存在解读偏差。对于关键验证环节，优先考虑脚本化。

### 4. 团队推广从项目级开始
个人级 Skill 容易变成"个人工具"难以推广。项目级 Skill 提交到 Git 后，团队成员 `git pull` 即可生效，是最低成本的推广方式。但要注意：项目级 Skill 需要更高的通用性设计，避免过度定制化。

### 5. 测试驱动迭代
不要等到 Skill"完美"了才使用。应该先设定**触发预期**（哪些场景应该调用、哪些不应该），用实际对话验证，根据反馈迭代。这是 Skill 的敏捷开发方式。
---

## 迭代式编写（2026-06 增量 — 淘天物流其林）

来自淘天集团物流技术团队（其林）的实战经验总结，把 Agent Skill 编写定义为**模块化领域知识资产**，类似给 AI 的"操作手册"，适用于**半自动化及专家经验导向场景**。核心设计遵循三层渐进式披露架构，强调用决策树替代模糊判断、确定性操作脚本化，并建立**内部自查与外部评估双重验证机制**。

> Skill 本质是以**文件系统结构替代复杂运行时服务**，实现**零依赖部署**。相比专用 Agent 框架，它更轻量但确定性稍弱，旨在将隐性专家经验转化为可复用、可验证的知识资产。

### 适合 vs 不适合场景（2nd source 视角）

**适合场景**：
- **半自动化重复流程**：同一业务流程频繁执行，部分依赖主观判断，无法完全自动化
- **领域知识导向**：业务流程依赖专家知识，LLM 泛化能力难以覆盖
- **上下文受限**：agent 职责多样且上下文窗口有限，处理其他任务时不希望无关知识占位

**不适合场景**：
- **简单任务**：直接用基础提示词，靠 LLM 泛化能力即可
- **流程完全确定性**：写代码自动化更合适
- **agent 职责高度单一**：把 skill 内容放进 system prompt，脚本用 mcp/tools 代替，没必要包装成 skill

### Skill 时间线

- **2025-10 中旬**：Anthropic 正式发布 Claude Skills
- **2 个月后**：Agent Skills 作为开放标准发布
- **后续**：Cursor、OpenCode、Qoder 等主流工具陆续跟进

### 配套元 skill 工具

- **skill-creator** (https://skills.sh/anthropics/skills/skill-creator) — 用于生成 skill
- **skill-judge** (https://skills.sh/softaworks/agent-toolkit/skill-judge) — 用于评估 skill

### 六大迭代式开发实践

#### 实践 1：用决策树替代模糊判断

**决策树是正向约束**，让 agent 在需要做判断时行为可控。异步消息问题排查片段示例：

```
### 结果处理规则
**补全未发出消息：**
  若有序事件的前序有日志、后序无日志，在报告表格中补充后序事件行，tag以外字段留空，备注标记为"消息未发出"。

**消费失败处理：**
  判断某 tag 是否失败，标准为 `resultFlag = N` 且该 tag 后续无 `resultFlag = Y` 的记录。
  - 若后续有 Y（重试成功）→ 取第一条失败行，调用错误详情查询
  - 若后续无 Y（持续失败）→ 取每一条失败行，调用错误详情查询
```

**skill-judge 把决策树列为高质量 skill 的明确标志**，在 D1（知识增量）和 D8（实用性）两个维度都是加分项：
- **Green flags (high knowledge delta)**: Decision trees for non-obvious choices
- **D8 Usability**: For multi-path scenarios, is there clear guidance on which path to take?

**核心原则**：skill 的核心价值是封装专家才有的判断知识。**决策树把"应该怎么判断"写清楚，而不是用模糊语言把判断压力甩给 agent**。agent 不需要推理，顺着树走就行。**写 skill 时遇到分支判断，优先用树形结构，而不是让 agent 自行决策**。

#### 实践 2：负向约束要配替代方案

告诉 agent 不能做什么（bad case / anti-pattern）时，**同步给出合法替代方案**，约束力会强很多。单元测试编写 skill 片段示例：

```
### Mocking Restrictions
**Do NOT mock:**
- `public static` fields (e.g., `@AppSwitch`-annotated configurations) - assign values directly in `@BeforeEach` and restore originals post-test
- POJO classes or OneLog objects - initialize simple POJOs programmatically; load complex POJOs from JSON files
- Stateless static methods (e.g., utility methods for conversion/assembly) - call real implementations directly
```

**核心原则**：不要只说"不能做什么"，要给"那应该怎么做"。**没有替代方案的话，agent 会自己找一个——结果往往不是你想要的**。这也是一种 few shot。

#### 实践 3：Skill 执行后自查机制

**决策树解决执行前的分支判断**（走哪条路），**自查机制解决执行后的产出物合格度**（结果对不对）。

单元测试生成 skill 的执行后自查列表示例：

```
## Post-Generation Review
After generating tests, review against this specification to ensure:
- Correct test file location and naming
- Proper mock configuration without prohibited patterns
- Complete verification of return values, state mutations, and invocations
- AssertJ assertion patterns are used consistently
- No reflection-based testing or private member verification
- Similar tests are grouped into parameterized tests where appropriate
- Parameterized tests use appropriate source types and handle null values correctly
```

**关键洞察**：agent 的自然倾向是完成任务就结束，**不会主动回头检验**。很多规范性错误恰恰在"完成"之后才能发现。**把自查写进 skill，就是强制插入一个反射节点**，把"我觉得做完了"变成"我验证过做完了"。

**自查的两个角度**：
- **规范符合性**：对照约束检查，确认没做错
- **覆盖完整性**：对照领域知识检查，确认没遗漏

**决策树是收敛的**（从多条路中选一条），**自查清单是发散的**（从一个结果出发，在多个维度验证）。有明确输出规范的 skill（代码生成、迁移、测试等），skill 成熟后建议补上自查机制。

#### 实践 4：外部验证 — eval 机制

**自查是 skill 执行时的内部静态验证**（由 agent 对照清单自检）。skill-creator 还提供**外部动态验证**：用真实输入跑 skill，对比有无 skill 的输出差距，而不是靠感觉判断好坏。

**eval 四个环节**：

| 环节 | 关键点 |
|------|--------|
| **测试用例** | 设计 2-3 个真实用户会说的提示词；同一提示词分别跑"有 skill"和"无 skill（或旧版本）"，保留两份输出用于对比；**提示词要有足够复杂度和具体背景**（skill 触发依赖 agent 对 description 的语义识别，简单 prompt 可能根本不会触发 skill） |
| **断言** | 有客观标准的 skill 设计可验证检查项（如"输出文件是否包含字段 X"），主观类 skill 基于人工反馈 |
| **迭代循环** | 评估 → 修改 → 重跑 → 再评估，每轮聚焦有明确问题的用例，直到没有明显差距；**注意：每轮只看少数用例，容易把 skill 改成只对这几个 case 有效**。改的时候要从具体反馈里抽出通用规律，而不是针对测试用例做针对性修补 |
| **description 触发率优化** | skill 内容稳定后单独优化 description，用 should-trigger / should-not-trigger 样本测试召回精度，重点关注"近似场景误触发"和"该触发却未触发"两类边界 |

**内部自查是运行时护栏，外部 eval 是开发期的标准线，定位不同，都有用**。

#### 实践 5：多人协作 skill 管理

skills.sh 提供了配套的 skill 管理工具。多人协作时，可在 code 平台上建一个仓库，根目录放 skills 目录，下面存放各个 skill。需要时运行命令交互式安装。

#### 实践 6：Skill 是简化版的专用 Agent（FaaS vs IaaS/SaaS）

熟悉 ReAct / LangGraph 等框架的话，可用映射表建立认知：

| LangGraph | Skill |
|-----------|-------|
| 条件边（由调度器执行） | 决策树（由模型阅读并模拟） |
| 代码控制流 | 自然语言编码的推理路径 |

**差异决定了二者的适用边界**。

**Skill 体系的本质**：用**文件系统结构 + 文本决策树**，替代运行时服务（向量库、图引擎、路由服务），**以零基础设施依赖换取极简部署**。确定性不如专用 agent，但对大多数专业流程场景够用。

**Web 概念类比**：
- 基于 LangChain 等框架开发 ≈ **IaaS/SaaS**（自建 workflow、管理上下文、实现 tools、接入 mcp）
- Skill ≈ **FaaS**（agent 工具作为基座已经提供 skill 发现与加载、基于 bash 的文本操作、脚本执行能力，skill 专注业务流程抽象）

**翻译路径**：需要更高准确性/SLA 时，可把 skill "翻译"为专用 agent——用 mcp/tools 替代脚本，用流程编排替代决策树，用 observation 节点替代自查。

**FaaS 不适合长连接、高频低延迟或复杂有状态事务**。**对流程确定性要求 100% 或逻辑复杂到 context 爆炸的场景，skill 也撑不住**，要回到 LangGraph 定制专用 agent。

### 总结三点核心

1. **明确定位**：Skill 本质是轻量级的领域知识封装，适用于半自动化、专家经验导向的场景，**而非替代专用 Agent 框架**
2. **遵循设计原则**：三层渐进式加载 + 决策树替代模糊判断 + 负向约束配合替代方案 + 内部自查与外部 eval 双重验证
3. **迭代式开发**：借助 skill-creator 和 skill-judge 等工具，通过"生成 → 评估 → 修订"的快速循环提升 Skill 质量

## 相关实体
- [Qoder Skills 完全指南](ch07/031-qoder-skills.md)（同主题旧版）
- [从 0 到 1 教你写 Agent Skill，让 AI 懂你的"潜规则"](ch04/255-skill.md)（同主题不同 MP — 实操指引）
- [Anthropic 14 个 Agent Skills 设计模式](ch04/255-skill.md)
- [Agent Skill 设计模式](ch04/255-skill.md)（Anthropic → Google 演进）
- [重新定义Skill开发：保姆级教程](ch04/255-skill.md)
- [你写的 Skill，及格了吗？](ch04/255-skill.md)（skill-judge 对照）
- [Harness Engineering 90 Percent Pillars](ch05/061-harness-engineering.md)（与 Skill 同源的工程化思路）
- [Qoder Skills 完全指南](ch07/031-qoder-skills.md)
- [qoder skills](ch07/031-qoder-skills.md)
- [要实现一个工作流选择-agent-skills-还是-ai-表格](ch04/255-skill.md)
- [精选 10 个开发者常用的 AI 智能体技能（Agent Skills）](ch04/255-skill.md)
- [让 AI 理解你的组件库：新一代智能 D2C 架构 — 基于 AWS Kiro MCP Skills 的智能转换实践](ch04/255-skill.md)
- [Anthropic 14 个 Agent Skills 设计模式](ch04/255-skill.md)
- [重新定义Skill开发：保姆级教程&一站式开发助手发布](ch04/255-skill.md)
- [Agent Skill 设计模式](ch04/255-skill.md)
- [AI 行业就业八大变化（腾讯研究院纵向对比）](ch04/277-ai.md)
- [CDP Bridge MCP：真实浏览器直连 MCP 工具](ch03/045-agent.md)
- [十年老技术开发的 AI Agent 探索之路](ch04/277-ai.md)
- [从 0 到 1 教你写 Agent Skill，让 AI 懂你的"潜规则"](ch04/255-skill.md)
- [从 Anthropic 到 Google：Agent Skills 进入设计模式阶段](ch04/255-skill.md)
- [Garry Tan](ch01/636-garry-tan.md)
- [Agent Workflows](ch04/323-agent-workflows.md)
- [Hermes Agent](ch03/090-hermes-agent.md)
- [Hermes Agent 新手上手指南](https://github.com/QianJinGuo/wiki/blob/main/concepts/hermes-agent-onboarding.md)
- [你写的 Skill，及格了吗？](ch04/255-skill.md)
- [Mythos for Offensive Security: XBOW's Evaluation](https://github.com/QianJinGuo/wiki/blob/main/entities/mythos_offensive_security_xbow_evaluatio.md)
- [Hermes Agent Skill](https://github.com/QianJinGuo/wiki/blob/main/concepts/hermes-agent-skill.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/05-11-the-great-memory-panic-of-2026.md)

- [AI Agent 工程师能力地图](ch04/277-ai.md)
- [Skillx Zhejiang University](ch04/255-skill.md)
- [Wiki Audit Skill](https://github.com/QianJinGuo/wiki/blob/main/concepts/wiki-audit-skill.md)
- [Gemini Deep Guide Prompt](https://github.com/QianJinGuo/wiki/blob/main/entities/gemini-deep-guide-prompt.md)
- [Promptqueue Opengorilla Project Analysis Ljguo](https://github.com/QianJinGuo/wiki/blob/main/entities/promptqueue-opengorilla-project-analysis-ljguo.md)
- [qoder 团队知识引擎](https://github.com/QianJinGuo/wiki/blob/main/entities/qoder-team-knowledge-engine.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/ai-skill-design.md)
## 2nd Source 原文存档
→ [Agent skill 迭代式编写实战 — 淘天物流其林 2026-06-12](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/agent-skill-iterative-writing-taobao-logistics.md)

---

