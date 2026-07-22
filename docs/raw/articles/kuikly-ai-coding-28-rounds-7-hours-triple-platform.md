---
title: "Kuikly AI 编程实践：28 轮对话 7.5 小时交付三端 AI 聊天 App"
source_url: "https://mp.weixin.qq.com/s/xVSkRLIYP0Y9Q9ia-Co2Xw"
ingested: 2026-06-30
sha256: a06b0cde288467a9f5fd3b6c52b8db355106cbedd208d3bd9158af689b82046c
type: raw
tags: [kuikly, cross-platform, kotlin-multiplatform, ai-coding, codebuddy, tencent, skills-and-rules, client-development]
author: 腾讯端服务联盟
---

导读：Kuikly 是腾讯开源的高性能跨端框架，基于 Kotlin Multiplatform 技术，覆盖 Android、iOS、HarmonyOS、H5、微信小程序、Mac 六大平台，支撑业务日活用户超5亿。当 Kuikly 搭配真正懂它的 AI，开发会怎样——零手写代码，仅凭自然语言，7.5 小时交付一套支持 Android、iOS、鸿蒙三端的 AI 聊天 App。看 AI 如何调研组件、扩展原生模块、自行定位 Bug，感受为什么「AI + Kuikly」是当下客户端开发效率最高的组合之一。

用 28 轮对话、740 字自然语言，生成约 3500 行代码，完成一套三端可运行的多模态 AI 聊天 App。全程零手写，不看代码，1 天交付。

放在传统开发里，同样的功能 iOS、Android、鸿蒙各写一遍，要 30 人天；就算用 Kuikly 手写，也得 7.5 人天。这次用 AI 辅助，实际只花了 7.5 小时。最终交付的 App 支持流式 Markdown、拍照识图、相册选取、SSE 长连接、本地会话管理，一套代码即可覆盖 Android、iOS、鸿蒙三端。

这不是"Vibe Coding"的玄学叙事，而是一次"AI + Kuikly 跨端框架"的实弹演习。Skills 和 Rules 让 AI 始终保持在正确的技术上下文中，组件库开箱即用、三端模板一键生成，这套基础设施支撑起了"AI + Kuikly"的协同效率。

## AI Coding 全过程

### 09:00 - 09:10｜环境准备

安装 Kuikly 插件，创建模板工程（Android、iOS、鸿蒙三端工程文件就绪）。安装 Kuikly AI 的 Skills 和 Rules：

```
npx skills add Tencent-TDS/KuiklyUI-AI/skills
```

Skills 和 Rules 能把框架知识喂给模型，让 AI 像一个熟悉 Kuikly 的开发者一样工作。

### 09:10 - 10:20｜需求分析与方案设计

使用 CodeBuddy superpowers 插件的 brainstorming 技能拆解需求。AI 调用查询第三方组件的技能，筛出匹配清单（KuiklyChatUI、KuiklyMarkdown、KuiklyAlbum、KuiklyCamera、KuiklySQLite、KuiklyWebview、KuiklyToast），并行调研用法与平台支持。

关键细节：AI 发现 KuiklyChatUI 里的 AiMessageText 已覆盖 Markdown 渲染，于是不再单独引入 KuiklyMarkdown，最终落地 6 个组件。这就是 Skills 和 Rules 的第一个收益——AI 开始知道什么时候不该写。

确定两个需用 Module 机制扩展的能力缺口：
- 现有 Network 不支持 SSE 长连接，需补一个 SSEModule
- 图片发给多模态模型前需统一压缩和 base64 编码，需补一个 ImageModule

### 10:20 - 11:10｜编码实现

AI 在不同环节调用不同的 Kuikly 技能：
- [skill:kuikly-expand-api] — 扩展原生 API / 自定义 Module，SSEModule 和 ImageModule 的跨端实现
- [skill:kuikly-ui-framework] — Kuikly DSL 页面结构和组件用法
- [skill:kuikly-reactive-observer] — 响应式状态绑定（消息列表、流式回复）

### 11:10 - 12:30｜集成自测

Android 真机一次编译成功。文字链路正常。

图片链路出问题：相册缩略图加载不出来。AI 自己加日志、用 logcat 抓日志、用 adb 注入操作复现，定位到根因——ImageAdapter 未处理 content:// URI。修复后相册缩略图正常显示，多模态理解链路跑通。

### 14:00 - 17:30｜迭代优化

1. **键盘遮挡输入框** — AI 监听 keyboardHeight，用 paddingBottom 顶起输入区。处理了 Kuikly 键盘事件挂载的细节（在页面内挂代理 Input 承接回调）
2. **鸿蒙新建会话不生效** — AI 定位到鸿蒙 RouterAdapter 未处理"先 openPage 再 closePage"的边界场景
3. **ActionSheet 改成宫格按钮** — 最折腾的一轮，面板和键盘抬升逻辑收敛到同一套底部抬升逻辑
4. **各页面 UI 统一** — AI 先读两个主页面提炼规范（紫色渐变背景、44dp 透明导航栏等），再套用到其他页面

### 17:30 - 18:00｜验收

最终 App 具备能力：文本/图片消息发送、拍照/相册选图、AI 流式回复（SSE）、Markdown 渲染、点链接打开网页、多模态图文理解、本地会话管理与历史恢复。

## 思考总结

### Kuikly 解决了什么

- 传统三端原生：30 人天（iOS + Android + 鸿蒙各一人）
- Kuikly 手写：7.5 人天
- AI + Kuikly：7.5 小时

Kuikly 最直接节省的是重复劳动的成本，更深一层节省的是重复决策。一码多端省掉了"同一件事做三遍"的乘数效应。

### AI 解决了什么

在 Kuikly AI 的 Skills 和 Rules 加持下，AI 不止是一个"会写 Kotlin 的通用模型"，更像一个熟悉 Kuikly 的资深开发：

1. 自定义 Module 写得很地道 — 用 kuikly-expand-api 技能补齐，结构和官方 Module 如出一辙
2. DSL 和响应式理解到位 — 用 observable 把数据和 UI 绑起来
3. 自定义组件、扩展原生也不在话下 — 自己加代理 Input、改 ImageAdapter
4. 知道什么时候复用、什么时候自己写 — 该用 AiMessageText 就不再造 Markdown 轮子

> "AI + Kuikly" 让一个客户端开发，真的有了"一个人顶一个三端小队"的体感。

## 关于 Kuikly

- GitHub 仓库：https://github.com/Tencent-TDS/KuiklyUI
- 属于腾讯端服务联盟（tds.qq.com）
- 已开源，覆盖 Android、iOS、HarmonyOS、H5、微信小程序、Mac 六大平台
