---
title: Agent Skills 终于有 UI 了
source_url: https://mp.weixin.qq.com/s/_jPzZKh9kSbVwOj1khMKLg
publish_date: 2026-04-27
tags: [wechat, article, agent]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 92057bbc380b556e2054cf35323017d308508aef6a74311b5684590435a1221f
---
# Agent Skills 终于有 UI 了
> 来源：Qoder 官方博客，2026年4月16日，浙江
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