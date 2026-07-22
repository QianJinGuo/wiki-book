---
title: "让 Agent 按工程标准交付：AI Coding 下的质量关卡实践"
source_url: "https://mp.weixin.qq.com/s/P2FvwzXCrRka4n5kNKm_sA"
source_site: "mp.weixin.qq.com"
source_author: "无糖可乐｜百度Geek说"
ingested: "2026-07-14"
sha256: "a04859d8d9118072c9ee7534e97f327947ff09c27d7ebcf78ee6fa5409348cb4"
type: "raw-article"
tags: [agent, ai-coding, quality, code-review, engineering, baidu]
status: "ingested"
---

# 让 Agent 按工程标准交付：AI Coding 下的质量关卡实践

> 把验证流程左移，通过前置的审查、运行时验证、视觉验证等系统化的能力建设，让 Agent 在开发过程中就能按项目的工程规范完成自检和修复，提高上游交付的质量减少返工。

## 背景

AI Coding 提升了开发速度，但速度快不等于交付质量高。Agent 写得快，也错得快——它不知道项目的工程约定，写完代码不会自己打开浏览器看一眼页面能不能跑。

传统的质量保障依赖提交后的人工 CR 和 QA 测试。但在 Agent 高频产出代码的场景下，所有问题都等后面环节才发现，协作成本只会更高。

所以百度做的事情是：**把质量检查嵌入 Agent 的工作过程本身**，将验证流程左移，提高上游交付质量，减少下游的返工。

整条链路：

```
Agent Operating Rules    定义操作协议，约束 Agent 在项目里怎么干活
    ↓
Code Validation     写完代码当场 CR，不等提交
    ↓
Runtime Verify      改了 UI 就连浏览器验证
    ↓
Figma To Verify     重点页面对设计稿做视觉走查
    ↓
Pipeline Code Review   提交后大规模复审
    ↓
问题结构化 → Agent 辅助修复 → 重新验证
    ↓
沉淀为 Skill / Rules，持续复用
```

## 01 Agent Operating Rules：把工程规范变成执行协议

Agent 靠通用知识写代码，不知道项目自己的规矩。Prompt 是一次性的，聊完就丢。项目规则是长期的、稳定的、每个任务都要遵守的。

在项目根目录的 rules 下维护索引文件，作为 Agent 在这个项目里的操作协议，包含：

- **渐进式加载规则**：不同类型的改动需要遵守不同的工程约定（状态管理规范、业务统一的请求类封装、构建配置同步等），作为项目的私域知识，让 Agent 可以在执行对应类型任务时加载补充上下文。
- **在关键时机触发验证 Skill**：两道门禁——
  - 所有代码改动完成后，必须启动独立 subagent 执行 `code-validation` Skill 做即时 CR，不能被跳过，不能用 lint 或 build 替代。
  - 如果任务涉及 UI（组件变更、样式修改、交互调整），必须通过 CDP 连接真实浏览器执行 `visual-verify` Skill。CDP 不可用时不能假装验证。

## 02 Code Validation：让 Agent 写完即 CR

传统 Code Review 在提交后，问题已进入协作链路。Agent 开发时很多问题可以在"刚写完"时立刻发现：没按约定引入依赖、用了废弃写法、与既有工程约束冲突、改了配置但没同步关联。

如果用独立 subagent 审查（而非主 Agent 自己检查），相当于切换视角站在 reviewer 位置，减少"自己写的看着都对"的盲区。

**项目验证规则合约**分两层：
- **通用检查**：类型安全、生命周期、组件边界、错误处理等。
- **项目专属阻塞规则**：团队自己的工程约定（用哪个 UI 库、样式规范、数据请求封装、构建配置同步），附带具体判断标准和正确写法示例。

## 03 Browser Use：让 Agent 在真实浏览器里工作

`visual-verify` 使用 Contract 模式工作：
1. Agent 用 JSON 描述期望的页面状态
2. 先跑 `contract-lint` 做静态校验
3. 再跑 `dom-assert` 在真实浏览器执行断言
4. 所有结果写入 `contract.md` 作为验收记录

关键能力：
- **标注截图（annotate-screenshot）**：在页面元素上画标注框并编号，用于空间问题的可视化诊断
- **Console 检查（console-check）**：监听 CDP console 事件捕获运行时错误
- **Memory 机制**：跨任务积累页面知识

### 案例一：快捷回复功能

Agent 写完代码后进入 visual-verify，经历三轮"发现问题→修复→再验证"：
1. **页面直接崩了**：运行时错误导致 React Error Boundary，console-check 定位到 card/index.tsx 访问 undefined 状态，快速修复。
2. **面板被 overflow:hidden 裁切**：annotate-screenshot 清楚显示面板红框被父容器截断，定位到 DOM 层级和样式后修复。
3. **功能逻辑验证**：切换分类标签、搜索过滤、短语回填、localStorage 持久化等全部通过。

三轮验证分别抓到运行时错误、布局裁切、功能回归三类问题，几分钟内闭环。

### 案例二：RSpack HMR 调试

Agent 只被告知"修改文件后页面不更新"和"HMR 增量构建 2 秒以上"，独立完成全部定位和修复：
- HMR 不生效：`ReactRefreshPlugin` 的 `library` 参数与 `output.uniqueName` 不一致，Refresh runtime 挂载到错误命名空间。
- 构建时间虚高：1000ms 是人为加的防抖延迟，去掉后真实 480ms。
- 真实耗时偏慢：SWC polyfill 分析在 dev 无意义但每次 HMR 执行；Module Federation manifest 插件每次增量做资产分析。关掉后降到合理范围。
- 附带发现端口冲突：`dts: false` 和 `dts: { generateTypes: false }` 语义不同。

### 03.4 Figma To Verify：把"感觉不像"变成量化问题

7 个 Skill 组合完成的视觉走查流程：

```
Figma 设计稿
 ↓ figma-to-html（将指定 Node 导出为高还原 HTML）
设计稿 HTML 基准页
 ↓ chrome-cdp（两个独立 Tab 打开设计页和开发页）
 ↓ element-screenshot（只截取目标元素）
双页元素截图
 ↓ vet-generator（生成 VET 并对齐颜色）
6 张分析图（2 原始 + 2 VET + 2 Diff）
 ↓ vet-investigation（识别候选问题）
N 个候选问题
 ↓ visual-issue-clarification（每个问题单独 subagent 复核、量化、标注）
最终视觉走查报告
```

**VET（Visual Expression Tree）**：将有语义的元素标记为纯色色块，文字/图片/图标等动态内容全部替换，只保留位置、大小和层级信息，消除内容差异让对比聚焦在布局和结构上。

**问题复核**：每个候选问题启动独立 Subagent 做四件事——回到 DOM 和运行时样式确认问题是否真实；用 `getComputedStyle()` 量化精确到 px；通过注入 SVG 在页面上画框标数值写说明后截图；记录排查线索为修复提供起点。

## 04 Pipeline Code Review：提交后大规模复审

开发期的 code-validation 关注增量改动，Pipeline Code Review 关注一次提交的完整变更。

核心思路：把大 diff 拆成小块，并发派发给多个 AI 子进程独立审查，最后合并结果。

5 个 Phase：
- **Phase 0** — 拆 Diff：按目录前 3 级分组，模块内按行数 bin-packing，每个 chunk ≤500 行。
- **Phase 1** — 状态检查：纯文本 task.log 管理任务状态，支持中断恢复。
- **Phase 2** — 并发派发：CLI 子进程而非 subagent，并发数 10 以上；文件系统追踪进度（File as Progress）。
- **Phase 3-4** — 合并汇总：按文件维度聚合为最终 review.json。

后续链路：可视化报告页面 → 唤起 IDE 修复 → 自动批量修复（按文件分组独立 git worktree）→ 闭环标记 → 现场集成（iCode + OpenClaw + BrowserUse）。

## 05 从工具到工程资产

各关卡持续复用和迭代：
- 项目工程规范 → Agent Operating Rules，每个任务自动生效
- 代码审查经验 → code-validation 的 rules.md，开发期和流水线共用
- 页面验证经验 → visual-verify 的 memory，跨任务积累
- 视觉走查能力 → Figma To Verify 的 Skill 组合，可复用于任意页面
- QA 发现的高频问题 → 反向写入 Rules 和 Skill，下次 Agent 直接避免

**对 RD 和 QA 协作的意义**：过去 RD 写完→QA 测→RD 修→QA 回归；现在 RD + Agent 完成实现，QA 将测试经验赋能到开发环节，RD 带着验证结果交付。

## 附录

- OpenClaw 配备 review 的 Skill：https://bjh-fe-assets.cdn.bcebos.com/assets/icode-review.tar.gz
- Browser 相关的 skill：https://github.com/hixuanxuan/browser-automation
