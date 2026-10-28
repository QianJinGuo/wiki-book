# AI Native 回忆录：稳定性前端 S1 实践复盘

> 📊 Level ⭐ | 7.5KB

> **来源**：阿里技术（王僖，稳定性团队前端，2026-09-29）| 原文存档：[原文存档](https://mp.weixin.qq.com/s?__biz=Mzg4NTczNzg2OA==&mid=2247511817&idx=1&sn=5284ab741c2a5ccd9520c86e9261770d)

这是一篇少见地把「AI 生成代码之后怎么办」写完整的团队复盘：当后端能写前端页面、产品经理能搭可交互原型、设计师能把界面直接做成代码，团队面对的已经不是产出速度问题，而是**交付质量与可接手性**问题。作者的判断很直接——「我们开放了代码的生产入口，却没有把生产代码所需的团队判断一起交出去」。

## 问题的真实形态：能运行 ≠ 能接手

第一次触发是一次 code review：后端同学提交的前端 PR 满屏 tailwind 类名、原生 input 配四十行 CSS、手写 SVG、直接 fetch 后端接口。功能跑得起来，但无法合入代码库。作者总结了三层损耗：

1. **风格不一致**——A 同学做的像后台模板，B 同学做的像官网落地页；项目里已有组件库没被使用，搜索框/按钮/图标大量手写。
2. **原型活不过评审**——PD 用 AI 做的原型讨论完就停在会议室，前端照着再做一遍，原型的生成成本降了但交接方式没变。
3. **局部的省时变成下一环的加班**——AI 省下的时间可见，对齐组件/接口约定、与旧代码衔接、交接评审的成本被漏算。

## 三次尝试：从「教人」到「约束产出」

**第一条路：教会所有人。** 团队开系列前端课程（环境、框架、样式、调试），结果很打脸：知识有用，但没人敢动手——真正决定能不能上线的东西在课程之外（这个接口为什么必须走那层封装、这个组件在哪个版本有兼容问题、这个老项目为什么不能按新项目装依赖）。想让大家少依赖前端，最后却把门槛变成了「先学得像个前端」。

**第二条路：把经验都写下来。** 建知识库，把规则写下来让大家查。这条路解决的是「可查」，但没解决「AI 生成时会不会照做」。

**第三条路：换一个更完整的平台 / 用 Skill 约束。** 最终跑通的是：**分库 + Skill 约束 + 版本化原型**。

## 跑通的机制：分库、Skill 双约束、VersionShell

- **分库**：设计独立维护原型库 `aiops-studio`，与正式库 `an-aiops` 物理隔离。原本想「一套代码」省掉还原差异，但一周内就崩了——Tailwind/lucide-react 与正式库的 x-ops、CSS Modules 冲突，内联 style、上千行单文件、大面积 any；更致命的是节奏冲突（设计面向未来多个迭代规划，前端一个 Sprint 只交付一部分，拆版成本高于从零还原）。
- **Skill 双约束**：`frontend-skill` 约束技术栈与组件使用，`design-skill` 把设计系统的颜色/间距/组件用法转成 AI 可理解的要求。两个库共享同一份规范，不共享发布节奏。
- **VersionShell**：各版本独立构建 IIFE 包 → 发布到 CDN → 按需加载指定版本，做到「版本隔离、互不干扰、线上随时切换查看任意模块原型状态」。这让原型具备代码资产的生命周期——评审会不再是原型的终点。

量化结果：原型库 `aiops-studio` 104+ commits（前端 34 / 设计 50 / 后端 20），正式库 `an-aiops` 399+ commits，原型库发布 4 个版本；设计交付代码链路把「还原→走查→修改」从两三天压到半天，覆盖约 80% 场景，剩余 20%（钉钉卡片、复杂图表、交互动效）仍走设计出稿→前端实现。

## 角色与全栈：PDFE 与「有条件全栈」

PDFE（Product · Design · Frontend Engineer）这个角色不是任命的，而是项目形态推出来的：Agentic Ops 智能体应急助手 POC 只有 1 前端 + 4 后端，没有 PD、没有设计师，前端被迫承担从业务意图到用户界面的全链路。典型判断如多 Agent 推理可视化——流式内容全铺开还是完成后折叠，取决于「应急时 SRE/GOC 先要结论、推理过程要可展开审查」的产品信息优先级，最后落到折叠与流式渲染策略。

七月全栈转型后，团队明确「有条件、有选择的全栈」，并列出四类真实成本：需要结对编程（服务间调用链、数据一致性仍离不开后端）、无法准确排期（环境配置/联调/发布/排障是陌生领域最难填的坑）、代码评审成本高（提交变多而 reviewer 时间没增加）、维护成本高（跨端实现者不一定长期维护，上线时没有明确维护人）。判据是需求结构：标准中后台页面收益来自减少排期等待；前后端联动需求收益来自缩短沟通链路但需投入结对与评审；核心链路与复杂问题仍由领域专家主导。

## 沉淀回路：Prompt → App → Skill

工具形态的演化路径值得单独记一笔：**ai-drawio** 最早是一套让 AI 生成 XML 的 Prompt 模板，后来做成 Web App（Andraw，需要处理算力归属、自维护 API Key），最后核心能力沉淀成 `ai-drawio` Skill，用户在 Qoder / 千问办公里说一句话即可产出。作者的经验是「工具降低了门槛，却累积了债务」，所以最终选择把能力与判断一起打包成可复用资产，形成回路：目标 → 上下文 → 工具接入 → 多轮迭代 → 验证 → 沉淀。

## 与既有框架的关系

这篇复盘把 [Harness 工程](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering.md) 的抽象原则落到了具体团队机制上：分库=隔离试错面，Skill=把团队判断编码成约束，VersionShell=让产物可回溯可比较，PDFE/有条件全栈=角色边界与 ROI 判据。它也与 [验证驱动开发](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/verifier-driven-development.md) 呼应——AI 产物必须过一层可验证的检查（组件规范、评审 owner、适用边界声明），而不是靠「我看到了结果」当「我掌握了过程」。

## 关联

- [Harness 工程](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering.md)
- [验证驱动开发](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/verifier-driven-development.md)
- [SDD 规格驱动开发](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/sdd-specification-driven-development-harness.md)
- [Skill 工程原则](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/skill-engineering-principles.md)
- → [原文存档](https://mp.weixin.qq.com/s?__biz=Mzg4NTczNzg2OA==&mid=2247511817&idx=1&sn=5284ab741c2a5ccd9520c86e9261770d)

---

