# 百度 AI Coding 质量关卡实践

## Ch09.131 百度 AI Coding 质量关卡实践

> 📊 Level ⭐⭐ | 4.4KB | `entities/baidu-ai-coding-quality-gates.md`

# 百度 AI Coding 质量关卡实践

> 百度 Geek 说团队在 AI Coding 场景下建立的全链路质量保障体系，将验证流程左移到 Agent 开发过程中。

## 核心链路

百度的 AI Coding 质量保障体系由五道关卡组成，从开发期到提交后逐层递进：

### 1. Agent Operating Rules（操作协议）

在项目根目录 `rules/` 下维护索引文件，作为 Agent 的操作协议：

- **渐进式加载规则**：不同类型改动（状态管理、请求封装、构建配置）加载对应的 rules 文件
- **关键时机触发 Skill**：两道强制性门禁——
  - `code-validation`：所有代码改动完成后必须由独立 subagent 执行即时 CR
  - `visual-verify`：UI 变更必须通过 CDP 连接真实浏览器验证

### 2. Code Validation（开发期即时 CR）

用独立 subagent 审查代码（而非主 Agent 自检），避免"自己写的看着都对"的盲区。审查规则分两层：
- **通用检查**：类型安全、生命周期、组件边界、错误处理
- **项目专属阻塞规则**：团队工程约定（UI 库、样式规范、数据请求封装），附带判断标准和正确写法示例

### 3. Runtime Verify / Browser Use（浏览器验证）

`visual-verify` Skill 使用 Contract 模式工作：

1. Agent 用 JSON 描述期望页面状态
2. `contract-lint` 静态校验
3. `dom-assert` 在真实浏览器执行断言
4. 结果写入 `contract.md`

关键能力包括**标注截图**（画标注框定位空间问题）、**console-check**（捕获运行时错误）、**跨任务 Memory**。

### 4. Figma To Verify（视觉走查）

由 7 个 Skill 组合完成，核心是 **VET（Visual Expression Tree）**——将页面元素替换为纯色色块，只保留位置/大小/层级信息，消除内容差异让 diff 聚焦在布局。

关键步骤：
1. `figma-to-html` 导出设计稿为 HTML 基准页
2. 双 Tab 打开设计页和开发页 → `element-screenshot` 截取目标元素
3. `vet-generator` 生成 VET 并对齐颜色
4. 识别候选问题 → 每问题启动独立 Subagent 复核、用 `getComputedStyle()` 量化、注入 SVG 标注

### 5. Pipeline Code Review（提交后大规模复审）

把大 diff 拆成小块（按目录分组 + bin-packing，每个 chunk ≤500 行），并发派发给多个 CLI 子进程独立审查。支持中断恢复（纯文本 task.log）、优雅关闭、文件系统进度追踪。

后续链路：可视化报告 → IDE 唤起修复 → 按文件分组独立 git worktree 自动批量修复 → 闭环标记 → iCode 现场集成。

## 应用案例

### 快捷回复功能的三轮验证

Agent 经历"发现问题→修复→再验证"循环：运行时错误导致 React 崩溃（console-check 捕获）→ 面板被 overflow:hidden 裁切（annotate-screenshot 定位）→ 全功能验证通过。

### RSpack HMR 调试

Agent 只被告知现象（HMR 不更新 + 构建慢），独立完成完整诊断：
- `ReactRefreshPlugin` 参数不匹配导致 Refresh runtime 挂载到错误命名空间
- 构建延迟中 1000ms 是人为防抖
- SWC polyfill + Module Federation manifest 在 dev 不必要
- 附带发现 `dts: false` vs `dts: { generateTypes: false }` 端口占用差异

## 沉淀机制

各关卡的经验可持续复用：
- 工程规范 → Agent Operating Rules，每个任务自动生效
- 代码审查经验 → code-validation 的 rules.md，开发期和流水线共用
- 页面验证经验 → visual-verify 的 memory，跨任务积累
- 视觉走查能力 → Figma To Verify 的 Skill 组合
- QA 高频问题 → 反向写入 Rules 和 Skill

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/baidu-agent-engineering-quality-gates.md)

---

