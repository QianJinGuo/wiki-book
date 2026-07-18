# Qoder Skill UI — Agent 与人类的协作界面层

## Ch03.065 Qoder Skill UI — Agent 与人类的协作界面层

> 📊 Level ⭐⭐ | 13.0KB | `entities/qoder-skill-ui.md`

## Overview
Qoder Quest 给 Agent Skill 补上了 GUI 层：Skill 不再只有 SKILL.md 文本指令，还包含**配置面板（输入端）**和**结果 Dashboard（输出端）**，使人机协作形成完整闭环。
核心命题：软件正在被重构为「双形态」——给 Agent 用的 CLI，给人用的 GUI，不是替代而是各归其位。

## 核心概念：Skill UI
### 问题：低效介入
传统 Agent Skill 执行时，参数收集靠多轮线性对话：
```
Agent: 这个页面是给谁用的？
Agent: 想要什么设计调性？
Agent: 配色有偏好吗？
Agent: 字体有要求吗？
Agent: 动效要多丰富？
```
介入本身不是问题，**低效的介入**才是——选项没有同时呈现，人类无法一眼对比选择。

### 解决：结构化配置面板
Skill UI 在决策节点弹出配置面板：

- **美学调性**：带视觉预览的卡片选择器
- **配色方案**：可切换的真实调色板
- **字体配对**：展示实际字体效果的选择器
- **动效强度**：滑块控制器
- **场景描述**：文本输入框
用户选完方向，点确认，结构化数据回传 Agent，Agent 按选定风格生成代码。

### 两种 Widget 模式
| 模式 | 适用场景 | 特点 |
|------|---------|------|
| **预定义模板** | 配置表单、审批流程 | 零 token 消耗，毫秒加载，体验一致 |
| **动态生成** | 数据图表、Diff 预览 | Agent 根据实际数据实时生成，引入 Chart.js |
**预定义模板架构：**
```
my-skill/
├── SKILL.md
├── scripts/
└── assets/
    └── design-direction.html    ← window.__WIDGET_DATA__ 接收上下文
```
**动态生成：** Agent 实时生成 HTML/CSS/JS，IDE 即时渲染，支持 Chart.js 等图表库。

## 技术实现
### HTML 沙箱路线
Qoder 选择直接用 HTML 而非私有组件协议，理由：
1. HTML/CSS/JS 是 LLM 训练数据主力，生成质量更高
2. 完整 Web 技术栈，表现力不受限
3. 开发者门槛为零（会写网页就会写 Widget）

### 安全架构
Widget 运行在 `sandbox="allow-scripts allow-forms"` 的 iframe 中，**不加** `allow-same-origin`，获得 opaque origin，与宿主完全隔离。
**双阶段消毒：**
1. 流式预览阶段：剥离所有 `<script>` 和内联事件，仅保留视觉 HTML+CSS
2. 沙箱执行阶段：移除 `<iframe>`、`<object>` 等危险标签，保留完整交互
**白名单：** cdnjs.cloudflare.com、cdn.jsdelivr.net、unpkg.com、esm.sh
**四个受控接口：** `sendToAgent()`、`openFile()`、`openUrl()`、`copyToClipboard()`

## 实战案例
### Frontend-design Skill × /create-skill-ui
**第一轮（生成初版）：** 描述需求 → 6秒渲染出包含5个区域的面板（调性/配色/字体/动效/场景）
**第二轮（加视觉预览）：** Agent 为9种调性各生成 mood-board 预览图，选设计方向从"读一个词"变成"看一张图"
**第三轮（加品牌色）：** 在配色区域末尾加 Custom Brand Colors 卡片，5个色槽（Primary/Secondary/Accent/Background/Text），带拾色器
**结果持久化：**
```
.agents/skills/frontend-design/
├── SKILL.md                   ← 新增 UI Interaction 章节
└── assets/
    ├── design-direction.html  ← ~240KB，含内嵌预览图
    └── tone-*.png             ← 9张调性预览原图
```
用户反馈：聊五六轮 → 10秒面板，选完放手。

### 输出端 Dashboard
Agent 执行完数据分析任务后，把结果渲染成 Dashboard：关键指标卡片 + 趋势折线图 + 留存曲线 + 响应时间分布图并排对比。

## 与 [Agent Skill Writing](../ch04/265-agent-skill.html) 的关系
Skill UI 是 Skill 编写规范的自然延伸：

- **** 定义了 Skill 的 CLI 层（SKILL.md + scripts/ + references/）
- **Skill UI** 补上了 Skill 的 GUI 层（配置面板 + 结果 Dashboard）
- 两者共同构成完整的 Skill 双形态单元

## 深度分析
### "双形态"是软件界面的本质重构
Qoder Skill UI 背后的核心判断是：软件正在被重构为双形态——给 Agent 用的 CLI 和给人用的 GUI。不是 GUI 替代 CLI，而是各归其位、各司其职。这个判断和 pi-main 的"Thin Harness, Fat Skills"以及 GBrain 的"Thin Harness, Fat Skills"在精神上一致：基础设施层保持简洁/薄，把复杂性放到能力层（Skills/UI）。Skill 作为 Agent 的能力单元，本身就应该是双形态的——CLI 层给 Agent 读，GUI 层给人用。

### 低效介入的核心问题是"选项不同时呈现"
多轮线性对话收集参数的效率问题，不是"对话"本身有问题，而是对话中选项的呈现方式有问题：Agent 一次问一个，人类一次答一个，这种线性交互在选项多的时候成本极高。解决思路是把"同时呈现所有选项"这个能力从对话中剥离出来，用结构化面板替代。面板的价值不是"更快"，而是"让人类能一眼对比所有选项再做决定"——这是人类决策质量最高的模式，对话式收集在选项多的时候会让人类忘记之前的选项。

### HTML 沙箱路线的工程优势
Qoder 选择 HTML 沙箱而不是私有组件协议有三个工程层面的原因，这些原因对其他 Agent UI 项目同样适用：
1. **LLM 生成质量**：HTML/CSS/JS 是大模型训练数据中比例最高的 Web 技术，模型生成这些内容的质量远高于生成私有 JSON 组件树
2. **表现力无限制**：完整 Web 技术栈意味着 Agent 可以引入任意第三方库（Chart.js、Day.js 等），不需要等框架作者内置支持
3. **开发者门槛为零**：任何会写网页的人都可以开发 Widget，不需要学习新的 DSL 或协议
第二条尤其值得注意：Agent 动态生成 UI 的场景下，工具的"天花板"就是框架内置的组件库。如果用私有协议，每次功能增强都需要框架升级；用 HTML，Agent 可以随时引入新的库来增强表达力。

### 安全架构的分层设计
Skill UI 的安全设计值得深入理解：它分为两个阶段，每个阶段有不同的消毒策略：

- **流式预览阶段**（Agent 生成中）：剥离所有 `<script>` 和内联事件处理器，保留纯视觉 HTML+CSS——Agent 可以在这个阶段看到 UI 长什么样但无法执行任何交互
- **沙箱执行阶段**（用户确认后）：移除 `<iframe>`、`object` 等真正危险的标签，保留完整交互能力
这种分层设计的好处是：预览阶段不需要完整功能，只需验证视觉效果；执行阶段才需要交互能力，但已经把最高风险的向量（脚本执行和跨域访问）隔离了。白名单域名（cdnjs、jsdelivr、unpkg、esm.sh）进一步限制了外部资源的加载。四个受控接口（`sendToAgent()`、`openFile()`、`openUrl()`、`copyToClipboard()`）让 Widget 的能力边界清晰可见。

### Dashboard 是结果可解释性的关键
Skill UI 的另一半是输出端的 Dashboard：Agent 执行完数据分析任务后，把结果渲染成 Dashboard。这个设计的价值在于：它把 Agent 的"文本输出"变成了"结构化可视化"。人类的视觉系统在处理数字关系时比处理文本列表高效得多——关键指标卡片 + 趋势折线图 + 并排对比，这是人类能快速建立认知的数据呈现方式。更重要的是，当结果以 Dashboard 形式呈现时，人类更容易发现异常值和局部趋势，这让人类对 Agent 输出结果的审核和纠错变得可行。

## 实践启示
### Skill 双形态的设计清单
在开发任何 Skill 时，应该同时考虑 CLI 和 GUI 两侧：
**CLI 层（SKILL.md + scripts/）：**

- 场景描述：什么情况下调用这个 Skill
- 输入规范：需要哪些参数，格式要求是什么
- 输出规范：返回什么结果，如何评估质量
- 引用资料：相关的文档、示例、背景知识
**GUI 层（assets/ 下的 HTML Widget）：**

- 决策节点识别：哪些参数是人类最适合做选择的（美学偏好、数值区间、方案对比）
- 预定义 vs 动态的选择：选项固定用预定义模板，数据驱动用动态生成
- 结果呈现：执行结果是否需要可视化，什么类型的图表

### Widget 安全的实现要点
如果要在自己的 Agent 项目中实现类似 Skill UI 的安全架构，关键要点：
1. **Opaque Origin**：iframe 不加 `allow-same-origin`，获得 opaque origin，天然与宿主隔离
2. **两阶段消毒**：预览阶段只剥离脚本和事件（保留布局），执行阶段才处理高风险标签
3. **白名单域名**：限制第三方库来源，防止恶意 CDN 注入
4. **受控接口**：Widget 对外的通信接口数量要最小化，每个接口的能力边界要清晰

### 决策节点判断
不是所有参数都需要 GUI 面板。以下情况适合用面板：

- **选项有限但需要对比选择**：配色方案、设计调性、字体搭配——人类一眼扫过比读五轮对话高效
- **需要实时预览**：调色板切换效果、字体预览、动效强度可视化
- **多维度同时决定**：设计方向需要同时确定调性+配色+字体+动效，任何一个维度的变化都可能影响其他维度的选择
以下情况适合用对话：

- **开放式描述**：场景描述、功能需求——Agent 需要通过对话理解用户的真实意图
- **参数有隐含依赖**：选项 B 只有在选择了选项 A 之后才有意义

### 渐进式增强策略
Skill UI 的案例中，设计方向面板经过了三轮增强（初版→加视觉预览→加品牌色），这是一个自然的渐进过程。不用在第一版就把所有 UI 做完美：先让基本流程跑通，再根据实际使用反馈逐步添加视觉预览、自定义选项等增强。

## 相关实体

- [qoder 团队知识引擎](../ch01/854-qoder.html)
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/qoder-skill-ui-agent-human-collaboration.md)

## 相关主题
- [Claude Design Skill](../ch01/1103-claude-design-skill.html) — 设计领域 Skill 的实战案例（420行系统提示词 → Skill）
- [Hermes Agent Skill](https://github.com/QianJinGuo/wiki/blob/main/concepts/hermes-agent-skill.md) — Hermes Agent 的 Skill 格式
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/qoder-skill-ui-agent-human-collaboration.md)

---

