---
source_url: https://mp.weixin.qq.com/s/OgYIw9l8PBeRk5MGMhYTmA
tags: [article]
ingested: 2026-08-14
sha256: 7f3176b4f58da99cd404d943ff8ae27af82329fa3850a0bcbe6a82b6f66c3f51
---
作者 | 王晨（望宸）
来源 | 阿里云云原生

# 一切皆插件之后，Agent 工程的新范式

新范式这一词被用的比较多，但用来形容 Deepseek Harness 是比较贴切的。Deepseek Harness 带来 Agent 全新的构建范式，那些曾经围绕 LangChain 范式设计工程类项目和产品的工程师们，将获得前所未有的创新机会。

**LangChain 范式是为了降低 Agent 开发复杂度设计的，Deepseek Harness 是为了降低 Agent 体验和成本优化复杂度设计的。插件化颗粒度越细，Agent 的运行越透明。目标不同，架构不同，架构是应用智能的瓶颈。**

## 01 什么是插件化？

插件是软件架构中的常见术语。比如浏览器都会提供插件能力，例如翻译页面和视频字幕的插件，泛化来讲，手机应用商店的软件都算是操作系统的插件，这些都是软件的可扩展性。比较形象的比喻是乐高积木，通过一个个矩形、正方形、圆形等基础积木，构建一个家具、一个家电、一个建筑等。

因此，插件具有以下特性：
- **解耦**：插件自身就是一个完整的功能块，不需要改动软件的主体代码。
- **可插拔**：装上就能用，卸下就消失，对原来的软件没有影响。
- **可替换**：同一个插口可以换不同的插件，比如换一个更好用的翻译插件。
- **标准化**：大家遵守同样的接口规则，只要依照这个规则，不同人写的插件都能兼容。

放到 DeepSeek Harness 里的语境里，"一切皆插件"的意思就是：模型怎么接、工具怎么调用、会话如何保持、对话怎么记忆、交互怎么呈现，甚至 Agent 主循环本身，全都计划做成可以插拔的组件，把插件细颗粒度化这件事做到了极致，出发点是让 Agent 的运行足够透明，在 Trajectory 视图里，实现 Agent 的每一次运行都有迹可循，全部可回放、可分叉、可审计，从而大幅降低 Agent 体验和成本优化的复杂度。**插件化颗粒度越细，黑盒越少，运行越透明，我们看的越清，Agent 的优化空间也就越大。**

## 02 和 LangChain 范式的开发框架，有何不同？

LangChain（以及 LlamaIndex、AutoGen、CrewAI 等）的出现，是让不熟悉 LLM 的工程师快速搭出能跑的应用。抽象的方向是向上封装，提供 Chain、Agent、Tool、Memory、Retriever 等高度抽象，把 Prompt 拼装、工具调度、状态管理包进框架，把运行时细节藏起来，让开发者少操心。

高度抽象降低了 Agent 的构建门槛，但是对模型解释性较弱的情况下，让看清 Agent 行为变得更难。

**模型本身已经是黑盒**：当前大模型的决策过程（为什么选这个工具、为什么生成这段推理、为什么在这一步失败）本身就缺乏透明性。我们只能看到输入输出，很难精确知道内部权重如何作用。

**高度抽象再叠加一层框架黑盒**：LangChain 等框架为了降低开发复杂度，做了大量封装：Agent 循环、工具调用编排、Memory 管理、Prompt 组装、重试逻辑、中间件等，很多被藏在框架内部。开发者主要和 Agent、Chain、Tool 这些对象打交道，真正执行时发生了什么，例如上下文如何被拼接、工具结果如何被截断或注入、循环如何决定继续或停止，往往需要额外开启 tracing、翻源码或依赖阿里云 AgentLoop 这类外部观测工具才能看清楚。一旦出问题，例如幻觉、死循环、工具调用混乱、成本暴涨，定位经常要穿过多层抽象，才能碰到真实的数据流和事件流。结果就是我们看到的是 Agent 做了什么结果，但很难清晰回答它到底为什么这样做、中间每一步上下文到底长什么样、哪个环节浪费了 token。

**模型黑盒 + 框架黑盒 = 双层不透明。**

**原子化的插件**：DeepSeek Harness 从架构层面提出了一种解决方案，将一切皆插件、日志作为唯一真相源。在这样的架构设计下：模型看到的每一段内容、工具调用与结果、上下文注入、循环决策，都被记录在可回放的事件流里。插件边界清晰，换掉或拦截某一层（比如 Prompt 组装、工具执行流水线）时，影响范围可控且可观察。抽象更少，杜绝"框架替你做决定，却不告诉你"的情况发生。

当然，这种透明是有代价的，开发时需要理解更多的底层细节，开发门槛更高。但它换来的是：在模型解释性弱的现实下，我们至少能把框架层的行为尽量看清楚，从而更有针对性地做效果和成本优化。

## 03 和 Pi Agent 有何不同？

Pi Agent（pi-mono）是当前极具影响力的最小化终端 Coding Harness。它坚持极简核心：只有 Read、Write、Edit、Bash 四个内置工具，系统提示极短，其余能力通过 TypeScript 扩展、Skills、Packages 按需加载。树状 Session、高缓存友好、可自扩展，在 Composio 等评测中，同一模型换上 Pi 后，成功率和成本表现往往领先。Pi 的哲学是"最小核心 + 按需扩展"，适合终端工作流，强调可控、低噪音、高缓存命中。

DeepSeek Harness 则走得更彻底：不仅工具可扩展，循环、会话、沙箱、UI、调度本身都是插件。它提供 Web UI、多种运行模式（标准、极简、创造、PTC），Session 事件流更完整，面向更广泛的 Agent 基础设施构建，而不仅仅是终端 Coding Agent。

**Pi 像一把精巧的手术刀，DeepSeek Harness 像一套可自由重组的手术台与器械库。**两者都追求透明与可定制，但 DeepSeek 的插件化更彻底，且适用于泛智能体，不仅是 Coding 领域。

## 04 DeepSeek Harness 包含了哪些插件？

packages/bundle/base/cordis.patch.yml 里，将基础 bundle（dsh-base）的实际装载清单，大致分成六层。DeepSeek Harness 的插件并不是简单平铺，而是通过分层叠加的方式组成一棵完整的插件树。运行中的 dsh 就是这棵树：启动时按固定顺序把各层配置叠在一起，最终形成实际生效的插件集合。

主要分成以下几层（从下到上叠加）：

1. **Bundle（组合包）层**：这是最基础的"插件包"。一个 Bundle 是一个 npm 包，里面用 cordis.patch.yml 声明它要挂载哪些插件行（模型适配器、工具、持久化、沙箱、设置等）。官方内置示例：dsh-base（每个 Profile 的第一层，包含模型适配器、工具、持久化、沙箱与审批策略、设置、凭据、遥测等核心能力）、dsh-web-app（在 base 之上增加浏览器 Web UI）、dsh-headless（无服务器的一次性运行模式）。Bundle 是可分发、可安装的单元，后面的层可以覆盖它插入的内容。
2. **Profile（配置档案）层**：Profile 是"具名组装方案"，保存在 Harness home（默认 ~/.dsh/profiles/<name>）里。它做两件事：列出要按顺序叠加的 Bundle 列表（dsh.profile.bundles）；自己保存一份 cordis.patch.yml（用户针对这个 Profile 的个性化补丁）。官方提供 web 和 headless 两个模板 Profile。
3. **用户 Patch 层（分两级）**：Profile 自己的 cordis.patch.yml（优先级高于 Bundle）；Home 级的 $DSH_HOME/cordis.patch.yml（所有 Profile 共享的机器级偏好）。
4. **命令行 Overlay 层（--patch）**：启动时通过 dsh ... --patch xxx.yml 临时叠加的最高优先级补丁，按参数顺序生效。

**叠加顺序（从空列表开始）**：Bundle（按 Profile 列表顺序） → Profile 的 patch → Home 级 patch → --patch 覆盖层。

用命令可以查看实际启动的完整配置树：`dsh --profile web --dump-config`。打印出来的任意一行，都可以被你自己的 patch 按 id 整段替换或新增。

此外，还有**能力接缝（Capability Seam）**的概念：每个可替换能力通常由"接口定义 + Provider 实现 + Consumer 使用"三部分组成，换一个 Provider 就能影响整条相关链路。

## 05 如何使用、贡献插件？

**使用插件**：
1. 直接使用官方组合：`npx @deepseek-ai/dsh web`（web Profile）或 `dsh --profile headless ...`
2. 查看与调试当前插件树：`dsh --profile web --dump-config`
3. 安装社区或自己的 Bundle：`dsh plugin --profile web add <npm包名或本地路径>`——安装后自动加入该 Profile 的 Bundle 列表
4. 写本地临时补丁：创建 cordis.patch.yml，用 insert 或按 id 替换，然后 `dsh web --patch ./my-patch.yml`
5. 在代码里使用插件：通过 ctx 注册服务（如 ctx.tools、ctx.llm、ctx.sessions）。其他插件用 inject 声明依赖，运行时自动获得对应能力。

**贡献插件**：
1. 写一个可安装的 Bundle（推荐给社区用）：创建一个 npm 包目录，包含 package.json（声明 "dsh": { "bundle": { "patch": "./cordis.patch.yml" }}）、cordis.patch.yml（描述要插入/覆盖的插件行）、实际插件代码（TypeScript 模块，导出 apply(ctx)）。发布到 npm 后别人用 dsh plugin add 即可安装。建议在 GitHub 仓库加上 dsh-plugin 话题方便被发现。
2. 直接贡献到官方仓库或写本地插件：本地快速试验写一个导出 apply(ctx) 的模块，通过 --patch 插入。正式贡献参考仓库的 CONTRIBUTING.md、docs/cookbook/（有添加 package、tool、LLM adapter、Chat node 的指南），以及架构文档。

插件形式支持函数、对象或类（继承 Service）。写插件的基本模板：

```typescript
import type { Context } from '@deepseek-ai/cordis'
export const name = 'my-plugin'
export const inject = ['tools'] // 可选：声明依赖
export function apply(ctx: Context) {
  // 在这里注册工具、监听事件、提供服务等
  ctx.tools.register(...)
}
```

注册的一切都是可逆的：插件卸载时会自动清理。

DeepSeek Harness 用 Bundle → Profile → Patch → Overlay 进行分层，把"一切皆插件"落到可管理、可覆盖、可分发的工程实践上。开发者既可以轻松使用现成组合，也可以通过写 Bundle 或 Patch 深度定制，并方便地贡献给社区。但目前仍是开发者预览阶段，核心 API 可能还会迭代，建议以官方文档和 dsh --dump-config 为准。

## 06 对 Agent 的效果和成本调优带来哪些帮助？

正因为 DeepSeek Harness 颗粒度极细、运行极度透明，优化变得可操作：

**效果调优**：可独立替换循环策略、上下文注入逻辑、工具执行流水线、沙箱策略。极简模式可用于模型基准测试，创造模式支持在内存中试验新组合。完整轨迹回放让"为什么失败"一目了然，而不是黑盒猜测。

**成本调优**：Session 日志暴露每一次 token 消耗来源。可针对缓存友好性调整 Prompt 组装、工具 Schema 排序；可换更轻量的循环或工具集；可针对特定模型做 Provider 级优化。同一模型换不同插件组合，成功率与单位成本可出现显著差异。

**持续迭代**：插件可逆，热替换成为可能。工程师可以像调参一样调架构，换一个沙箱、改一个事件拦截点、重组一个 Bundle，立即观察效果与成本变化。

当应用架构不再是瓶颈，智能的应用边界才会真正被打开。那些熟悉 Agent 工程实践的开发者，一旦掌握这套更原子的底座，将能以前所未有的精度去打磨 Agent 的体验与经济性。

（文末为阿里云 Agent 评估和优化三城巡回沙龙推广）
