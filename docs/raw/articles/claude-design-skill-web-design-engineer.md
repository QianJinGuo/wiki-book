---
title: 我把 Claude Design 做成了 Skill，人人都能成为顶级网站设计师
source_url: https://mp.weixin.qq.com/s/sffWcLKPkXob2STrhkYBYg
publish_date: 2026-04-27
tags: [wechat, article, claude, agent]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 111fc2b2b416c9ac08c6fe31b40595717f5648de3cc8279f743f4fc4cb32b56f
---

## 二、系统提示词核心理念拆解
### 2.1 角色定位：设计师 + 工匠 + 产品经理
**原文**：
> "You are an expert designer working with the user as a manager. You produce design artifacts on behalf of the user using HTML."
**解读**：AI 是设计师，用户是产品经理。微妙角色倒转带来两个效果：AI 更主动做决策 + 在关键节点征求用户意见（向经理汇报）。
**原文**：
> "HTML is your tool, but your medium and output format vary. You must embody an expert in that domain: animator, UX designer, slide designer, prototyper, etc."
**解读**：身份要随任务切换——做动画时是动效设计师，做原型时是 UX 设计师。AI 不会用"做网页"的思维去做一切。
**关键原则**：好的角色定位应该是**动态的**，根据具体任务切换专业身份。
### 2.2 工作流：先问后做，尽早出活
**六步流程**：
1. 理解需求（问清楚再动手）
2. 探索现有资源
3. 制定计划
4. 搭建文件结构
5. 完成并验证
6. 极简总结
**何时问/何时不问的判断标准**：
- "make a deck for the attached PRD" → ask questions
- "make a deck with this PRD for Eng All Hands, 10 minutes" → no questions（信息充足）
- "turn this screenshot into an interactive prototype" → ask questions only if intended behavior is unclear
**核心原则**：信息充足就干活，信息不足才提问。
**极简总结**：
> "Summarize EXTREMELY BRIEFLY — caveats and next steps only."
只说注意事项和下一步，不赘述自己做了什么。
### 2.3 去除 AI 味的秘诀
**清单**：
- 不要过度使用渐变背景
- 不要随便使用 Emoji
- 不要用带左侧彩色边框的圆角卡片
- 不要用 SVG 硬画复杂图形（用占位符，索取真实素材）
- 不要用烂大街的字体：Inter、Roboto、Arial、Fraunces、system-ui
- 不要堆砌无意义的数据和图标（"data slop"）
**字体推荐替代**：
- Plus Jakarta Sans、Space Grotesk、Sora、Newsreader
### 2.4 oklch 色彩系统
**原文**：
> "try to use colors from brand / design system, if you have one. If it's too restrictive, use oklch to define harmonious colors that match the existing palette. Avoid inventing new colors from scratch."
**配色策略三层**：
1. 优先用品牌色
2. 不够用时，用 oklch 色彩空间派生和谐的衍生色
3. 绝对不要凭空发明新的色相
**为什么是 oklch？**
- 传统 HSL：感知不均匀（黄色看起来比蓝色亮得多）
- oklch：感知均匀，相同亮度值代表相同人眼亮度感受
- 保持 L（亮度）和 C（色度）不变，改变色相角（h），自动得到和谐配色
### 2.5 内容原则："一千个 No 换一个 Yes"
**原文**：
> "Do not add filler content. Never pad a design with placeholder text, dummy sections, or informational material just to fill space. Every element should earn its place."
**三个要点**：
- 每个元素必须证明存在的理由
- 想加内容？先问用户
- 页面看起来空？用版式和留白解决，不是靠塞内容
**设计哲学**：留白也是设计。大胆的留白，比十个平庸的板块更有表现力。
### 2.6 验证闭环：不信任自己的输出
**验证机制**：
1. 调用 `done`，展示给用户并检查控制台错误
2. 有错误则修复后再次调用 `done`
3. 确认无误后，调用 `fork_verifier_agent`——启动独立子代理做全面检查
**关键洞察**：用全新的上下文做验证，能有效打破"自己审自己"的确认偏误。
### 2.7 其他亮点
**上下文管理（snip 工具）**：
- AI 标记已完成对话段落为"可删除"
- 上下文压力大时自动释放空间
- AI 主动"忘掉"不再需要的信息
**PPT 编号规范**：
- 必须 1-indexed（从 1 开始）
- "人类不会说第 0 张幻灯片"——AI 输出应适配人类思维模型
**设计系统先行**：
- 编码前必须先定义设计系统（配色/字体/间距/圆角/阴影/动效风格）
- Token 化决策前置，保持全局一致性
**Tweaks 面板**：
- 内置可调参面板，让用户实时切换配色/字体/间距
- 把"选择"权力交给用户，降低沟通成本
---
## 三、web-design-engineer Skill 设计
### 为什么做这个 Skill？
Claude Design 有三个问题：
1. 国内用户使用困难（账号被封）
2. 没有 API，无法集成到工作流
3. 封闭性，不能自定义行为逻辑
**核心洞察**：Claude Design 的核心竞争力 = Opus 4.7 模型能力（基础）+ 420 行提示词（让它稳定输出高水平设计）
### Skill 结构（约 400 行）
#### 1. 角色定义
定位：顶尖设计工程师，可以创造优雅、精致的 Web 作品。
核心理念：目标直指"惊艳"，远超"能用"的底线。每个像素都有意义，每个交互都经过深思熟虑。
继承动态角色切换思路：根据任务自动变身为 UX 设计师、动效设计师、数据可视化专家。
#### 2. 六步工作流（改良版）
| 步骤 | Claude Design | Skill |
|------|--------------|-------|
| 第一步 | 理解需求 | 理解需求（附详细提问/不提问判断表） |
| 第二步 | 探索资源 | 获取设计上下文（分四个优先级） |
| 第三步 | 制定计划 | **宣告设计系统**（用 Markdown 列出所有设计决策） |
| 第四步 | 搭建文件 | **尽早展示 v0 半成品**（带假设和占位符的最小可展示版本） |
| 第五步 | 完成 | 完整构建 |
| 第六步 | 极简总结 | 验证 |
**第三步（宣告设计系统）的意义**：如果 AI 在脑子里默默决定配色方案然后开始写代码，你第一次看到的就是完整页面——方向错了推翻成本很高。提前宣告，用户可在动手前纠偏。
**第四步（v0 半成品）的意义**：带假设和占位符的 v0，比花 3 倍时间打磨出来的"完美 v1"更有价值——后者方向错了就要全推翻。
#### 3. 反 AI 味扩展清单
在 Claude Design 基础上补充：
- 千篇一律的渐变按钮 + 大圆角卡片组合
- 凭空编造的客户 logo 墙、虚假好评数
- 无意义的 stats / 数字 / 图标堆砌
**Emoji 使用规范**：
- 默认不用 emoji
- 只有当目标设计系统/品牌本身就用 emoji 时才使用
- 没图标时用占位符——拿 emoji 当 icon 替身是敷衍
#### 4. 占位符哲学
**完整方法论**：
- 图标缺失 → 方块 + 标签（如 `[icon]`、`▢`）
- 头像缺失 → 首字母圆形色块
- 图片缺失 → 带 ratio 信息的占位卡
- Logo 缺失 → 品牌名文字 + 简单几何形
**占位符 vs 假图**：占位符传递"这里需要真材料"；假图传递"我糊弄完了"。
#### 5. 配色 × 字体配对参考表
| 风格 | 主色 | 字体组合 | 适用场景 |
|------|------|----------|----------|
| 优雅杂志风 | oklch 暖棕 | Newsreader + Outfit | 内容平台、博客 |
| 高端品牌 | oklch 近黑 | Sora + Plus Jakarta Sans | 奢侈品、咨询 |
| 活泼消费 | oklch 珊瑚 | Plus Jakarta Sans + Outfit | 电商、社交 |
| 极简专业 | oklch 青蓝 | Outfit + Space Grotesk | 数据产品、B2B |
| 手作温度 | oklch 焦糖 | Caveat + Newsreader | 餐饮、教育 |
**核心逻辑**：给 AI 一个有品位的起点，比让它自由发挥好得多。
#### 6. 技术硬规则
- **禁止 `const styles = {...}`**：多组件环境中命名冲突是真实坑
- **跨 babel 脚本不共享作用域**：必须显式挂到 `window`
- **禁止 `scrollIntoView`**：在 iframe 嵌入环境中会破坏外部滚动
#### 7. 高级模式库（references/advanced-patterns.md）
- 响应式幻灯片引擎模板
- 设备模拟框架（iPhone / 浏览器窗口）
- 动画时间线引擎
- 设计画布（多方案对比）
- oklch 色彩系统代码
- Chart.js 数据可视化模板
---
## 四、实战对比
### Demo 1：太空探索博物馆
**相同提示词**：震撼全屏 Hero + 4 个展览介绍 + 时间线 + 预约 CTA + 页脚，沉浸感强
**无 Skill 版本（85 分）**：
- 深色背景 + 青色/紫色/粉色三色渐变发光效果（AI 默认审美，太常见）
- Orbitron + Noto Serif SC（非常"直觉"的太空字体选择）
- Hero → 卡片网格 → 时间线 → CTA → 页脚（教科书式结构，缺少惊喜）
**有 Skill 版本（95 分）**：
- oklch 色彩系统：`var(--ink): oklch(0.10 0.015 250)`、`var(--ember): oklch(0.78 0.13 65)`
- 字体：Instrument Serif（大标题）+ Space Grotesk（正文）+ JetBrains Mono（辅助信息）
- 编辑感排版：标题逐行入场动画（rise keyframe）、grid 三栏布局的信息栏
- 克制感：每个元素都经过取舍
**关键差异**：从"把所有酷炫效果都用上"到"每个元素都经过取舍"
### Demo 2：独立摄影师个人网站
**提示词仅一句**：帮我做一个独立摄影师的个人作品集网站首页。
**无 Skill**：直接开干，深色霓虹调性、半透明背景、强行塞满"潜空间、创成式"等词汇，失去真实质感
**有 Skill**：先提问，确认后再实现
- 虚构北欧摄影师 Mira Høst
- 配色：暖色纸张底（`--paper: #f2efe8`）+ 深色墨色（`--ink: #161513`）
- 字体：Instrument Serif（展示标题）+ Space Grooresk（界面元素）
- 杂志编排式布局：不对称网格、编号章节标记、Ken Burns 照片动画
---
## 五、核心结论
Skill 带来的是从"好用"到"好看"、从"完整"到"精致"、从"合格"到"有风格"的提升。
每条规则效果微小，但叠加在一起，**量变产生质变**。
---
## 相关链接
- Skill 完整代码：https://github.com/ConardLi/web-design-skill
- Easy Agent 开源项目：https://github.com/ConardLi/easy-agent