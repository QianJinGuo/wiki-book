# Agent Skills 终于有 UI 了

## Ch04.221 Agent Skills 终于有 UI 了

> 📊 Level ⭐⭐ | 10.4KB | `entities/qoder-skill-ui-agent-human-collaboration.md`

[Qoder Skill Ui Agent Human Collaboration](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/qoder-skill-ui-agent-human-collaboration.md)

## 核心论点：软件「双形态」重构
**不是 GUI 替代 CLI，而是各归其位：**

- **给 Agent 用的 CLI** — SKILL.md 是纯文本指令，scripts/ 是可执行脚本，Agent 的母语
- **给人用的 GUI** — Skill 执行到决策节点时弹出配置面板，执行完后渲染成 Dashboard
Skill 天然是双形态单元：SKILL.md + scripts/ = Agent 的 CLI 层，一直缺 GUI 层。Qoder Quest 补上了这一半。

## 问题：低效介入
五轮对话收集参数举例（Frontend-design Skill）：
```
Agent: 这个页面是给谁用的？什么场景？
你: xxx 产品官网的首页。
Agent: 想要什么设计调性？极简、复古未来、奢华、玩味？
你: 偏高端科技感。
Agent: 配色有偏好吗？
你: 深色底，绿色强调色。
Agent: 字体有要求吗？
你: 你推荐就行。
Agent: 动效要多丰富？……
```
介入本身不是问题，**低效的介入**才是。解决思路：把线性多轮对话替换成**结构化配置面板**，一次呈现所有选项，选完即提交。

## 渲染层方案对比
| 路线 | 描述 | Qoder 选择 |
|------|------|-----------|
| A：结构化组件协议 | Agent 输出 JSON 组件树，IDE 内置组件库渲染 | ❌ |
| B：HTML 沙箱 | Agent 直接生成 HTML/CSS/JS，iframe 隔离渲染 | ✅ |
**Qoder 选择 B 的理由：**
1. **生成质量**：HTML/CSS/JS 是模型训练数据主力，生成质量远高于私有 JSON 协议
2. **表现力**：完整 Web 技术栈，可引入 Chart.js、Day.js 等任意第三方库
3. **开发者门槛**：会写网页就能写 Widget，零额外学习成本
**安全工程手段（双阶段消毒）：**

- 流式预览阶段：剥离所有 `<script>` 和内联事件，仅保留 HTML+CSS
- 沙箱执行阶段：移除 `<iframe>`、`<object>` 等真正危险标签，保留完整交互
**白名单域名：** cdnjs.cloudflare.com、cdn.jsdelivr.net、unpkg.com、esm.sh
**四个受控接口：** `sendToAgent()`、`openFile()`、`openUrl()`、`copyToClipboard()`

## 两种 Widget 模式
### 预定义模板（零 token 消耗）
- Skill 作者把设计好的 HTML 界面保存到 `assets/` 目录
- Agent 触发时通过 `window.__WIDGET_DATA__` 传入上下文数据
- 用户操作后通过 `sendToAgent(data)` 回传
- 毫秒级加载，每次体验一致
```
my-frontend-design-skill/
├── SKILL.md
├── scripts/
│   └── generate.sh
└── assets/
    └── design-direction.html    ← 预定义模板
```

### 动态生成（数据驱动）
- Agent 根据运行时上下文实时生成界面代码，IDE 即时渲染
- 适合数据驱动的场景：性能图表、Diff 预览、数据对比可视化
- 引入 Chart.js 等图表库实时渲染结果
**同一 Skill 可混合使用两种模式**，按场景选择。

## 实战案例：Frontend-design Skill 加设计方向面板
### 第一轮：生成初版（6 秒）
Agent 分析 Skill 意图，渲染出包含五个区域的面板：
1. **Aesthetic Tone**：9种调性卡片（Minimal / Retro Future / Luxury / Playful / Magazine / Brutalist / Organic / Art Deco / Cyber）
2. **Color Palette**：8套预设配色，展示真实五色调色板
3. **Font Pairing**：8组 Google Fonts 字体搭配，实时预览效果
4. **Motion Intensity**：五档动效滑块（None / Subtle / Moderate / Rich / Cinematic）
5. **Target Scenario**：场景描述文本框
用户需在调性、配色、字体三项各选一个后，"Start Generation" 按钮激活。

### 第二轮：加调性视觉预览
原文：Aesthetic Tone 当前没有卡片预览图，你帮我生成。
→ Agent 调用图像生成模型，为 9 种调性各生成 mood-board 风格预览图。

### 第三轮：加自定义品牌色
原文：配色方案加一个自定义选项，让用户输入品牌色。
→ Agent 在配色区域末尾加 Custom Brand Colors 卡片，包含 5 个色槽（Primary / Secondary / Accent / Background / Text），带拾色器和 HEX 输入框。

### 持久化结果
```
.agents/skills/frontend-design/
├── SKILL.md                          ← 新增 UI Interaction 章节
└── assets/
    ├── design-direction.html         ← ~240KB，含内嵌预览图
    └── tone-*.png                    ← 9张调性预览原图
```
**用户反馈：** "以前选设计方向要聊五六轮，现在一个面板 10 秒搞定，选完就放手让 Quest 去做了。"

## 输出端：结果 Dashboard
配置面板解决"怎么告诉 Agent 你要什么"，结果 Dashboard 解决"怎么看懂 Agent 给你的东西"。
想象一个「数据分析」Skill：

- 无 UI：Agent 列成文本 "日活 12,340，周环比 +3.2%，留存率 41.5%..."，人类在脑中建立关系
- 有 UI：Agent 生成 Dashboard，关键指标卡片 + 趋势折线图 + 留存曲线 + 响应时间分布图并排对比
这正是**动态生成**模式的用武之地：结果数据每次都不一样，Agent 实时生成可视化代码，引入 Chart.js 渲染。

## 进阶：手动配置 show_widget
`/create-skill-ui` 会自动配好一切。手动控制可在 SKILL.md 中直接配置 `show_widget` 指令（触发时机、数据结构、多面板编排）。

## 结论：一个 Skill，两种界面
当 Skill 有了 UI，它就不再只是 Agent 的指令集，而是一个**有知识、有脚本、有界面的完整微应用**。同一个小人儿，两种界面，各自服务于最擅长消费它的对象。

## 深度分析
Qoder 选择在 Skill 层引入 GUI，本质上是解决 **Agent-Human 协作中的参数注入效率问题**。传统工作流中，人类通过多轮对话向 Agent 传递结构化参数（设计调性、配色方案、字体选择），这个过程的信息带宽极低——语言是非结构化的、歧义的，且每次传递的信息量受限于 Token 窗口。
**双形态架构的合理性**在于：Skill 本身是 Agent 的执行单元，其核心接口（SKILL.md + scripts/）已经是为 Agent 优化的文本/代码格式。GUI 层不是对 CLI 的替代，而是**在人机决策节点插入的结构化接口**。这种设计避免了对 Skill 本体的大规模重构——SKILL.md 依然是纯文本，GUI 只是临时的、决策驱动的弹出层。
HTML 沙箱路线的选择（相比 JSON 组件协议）反映了一个务实的工程判断：**让模型做它擅长的事**。HTML/CSS/JS 是大模型训练数据中质量最高的格式，模型生成这类内容的置信度和稳定性远高于自定义 JSON 协议。代价是安全防护的复杂性上升，但双阶段消毒（流式预览剥离脚本、沙箱执行移除危险标签）是一个合理的安全工程折中。
Dashboard 作为输出端的意义被低估了。当前大多数 Agent 系统侧重于改善"输入端"（更好的指令、更多的上下文），但对"输出端"（结果呈现）的投入不足。Agent 生成的结果往往是半结构化的文本/数据，人类需要在脑中重新构建关系图谱。Dashboard 让 Agent 可以直接渲染结构化的可视化结果，减少人类的认知负荷，把注意力集中在决策而非解码上。

## 实践启示
1. **在 Skill 设计中识别"决策节点"**：并非所有的人机交互都需要 GUI，但当某个 Skill 需要人类在多个维度做结构性选择时（设计方向、业务规则、数据配置），配置面板比多轮对话效率高出一个数量级。识别这类节点是做 Skill 编排的关键能力。
2. **预定义模板优先于动态生成**：预定义模板零 token 消耗、体验一致、可预测，是首选方案。只有在结果数据本身是动态的场景下（数据分析、Diff 预览、性能监控），才需要动用动态生成。两者可混合使用，不需要非此即彼。
3. **HTML 沙箱安全需要分层治理**：双阶段消毒（预览阶段 vs 执行阶段）的设计思路值得借鉴——预览时可以更严格地限制交互，执行阶段在受控环境下释放完整能力。白名单域名和受控 API 接口的数量决定了攻击面的边界，需要严格控制。
4. **Dashboard 是降低认知负荷的输出优化**：结果的可读性和决策效率直接相关。当 Agent 输出复杂数据时，优先考虑渲染成结构化 Dashboard（图表、指标卡、对比视图），而非依赖人类从文本中提取关系。
5. **Skill 是 Agent 应用的基本原子**：Qoder 的设计暗示了一个趋势——未来的 Agent 应用将由大量 Skill 单元组成，每个 Skill 是一个「知识 + 脚本 + 界面」的微应用。这种设计让 Skill 可以跨 Agent 复用，也让 Agent 的能力边界通过 Skill 组合不断扩展。
## 相关实体
- [Agent Skills Teams Architecture Evolution Selection Guide](/ch04-219-agent-skills-teams-架构演进过程及技术选型之道/)
- [Anthropic 14 Skill Patterns Best Practices](/ch01-677-anthropic/)
- [精选 8 个 Ui 设计师必备的 Ai 智能体技能Agent Skills](/ch04-190-精选-8-个-ui-设计师必备的-ai-智能体技能-agent-skills/)
- [Agent Skills Comprehensive Survey](/ch04-340-agent-skills-系统性综述-表示-获取-检索-进化/)
- [Skill System Design Three Way Comparison](/ch01-215-ai-agent-架构设计-七-skills-系统设计-openclaw-claude-code-hermes-age/)
- MOC

---

