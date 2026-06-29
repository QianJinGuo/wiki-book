# Claude Code 官方插件系统 (claude-plugins-official)

## Ch09.065 Claude Code 官方插件系统 (claude-plugins-official)

> 📊 Level ⭐⭐ | 8.8KB | `entities/claude-code-official-plugins-anthropic.md`

## Claude Code 官方插件系统 (claude-plugins-official)

Anthropic 官方 Claude Code 插件体系，发布于 2026 年 5 月，GitHub 仓库已获 20K+ Stars。

## 插件系统架构

Claude Code 插件可以包含：
- **斜杠命令**：快速触发某个工作流
- **子智能体**：专做特定任务的 Agent
- **Skills 文件**：教 Claude 怎么做某类任务
- **Hooks**：保存时自动格式化等自动触发钩子
- **MCP Servers**：外部工具集成

安装命令：`/plugin install {插件名}@claude-plugins-official`

## feature-dev：7阶段结构化功能开发

核心价值：把功能开发变成严谨的结构化流程，避免盲目编码。

1. **发现需求** — 明确要解决的问题
2. **探索代码库** — 理解现有代码结构
3. **澄清问题** — 确认边界和特殊情况
4. **架构设计** — 2-3个架构师 Agent 并行，分别从最小改动、干净架构、务实平衡三角度设计
5. **编码实现** — 按方案执行
6. **质量审查** — 3个独立审查 Agent 并行：代码质量 + Bug 检测 + 规范检查
7. **总结** — 输出最终交付物

## hookify：自然语言配置 Hooks

痛点：hooks.json 配置文件繁琐。

解决方案：用自然语言描述规则，自动生成 markdown 配置。

监控类型：bash（终端命令）、file（文件编辑）、stop（停止时触发）、prompt（提交前触发）。可设置 warn（警告但允许）或 block（直接拦截）。

示例规则：
- 防止误删文件
- 阻止在 TypeScript 文件里写 console.log
- 要求提交前必须跑测试

## code-modernization：遗留代码现代化

目标：COBOL、遗留 Java/C++、单体 Web 应用迁移到现代技术栈，同时保证行为不变。

流程：
1. `/modernize-assess` — 评估遗留代码
2. `/modernize-map` — 构建依赖拓扑图
3. `/modernize-extract-rules` — 提取业务规则
4. `/modernize-brief` — 生成迁移方案
5. `/modernize-transform` — 逐模块迁移
6. `/modernize-reimagine` — 从业务规则推倒重建
7. `/modernize-harden` — 安全加固

所有改动输出到 modernized/ 目录（不修改原始代码）。

## claude-code-setup：项目一键配置分析

只读扫描项目结构、技术栈、依赖关系，推荐：
- MCP Servers（如前端项目推荐 Playwright）
- Skills（如 Plan agent、frontend-design）
- Hooks（自动格式化、lint、敏感文件保护）
- Subagents（安全审查、性能优化、无障碍检测）
- Slash Commands（/test、/pr-review）

## 深度分析

### 1. 多智能体并行架构的意义

feature-dev 在架构设计阶段（第4阶段）同时启动 2-3 个架构师 Agent，分别从「最小改动」「干净架构」「务实平衡」三角度设计方案。这种并发多视角方法论直接借鉴了 Anthropic 自身的 AI 编程研究经验——单一智能体容易陷入局部最优，多智能体并行能显著提升方案质量。

### 2. Hook 系统的安全防护边界

hookify 支持 block（直接拦截）模式，这意味着插件可以在危险操作执行前终止它。但需要注意的是：block 模式仅对 Claude Code 会话内的操作有效，对直接通过终端执行的命令（如手动 rm -rf）无法拦截。因此 hookify 更适用于新人引导和习惯培养，而非纵深防御。

### 3. 遗留代码现代化的行为不变性保证

code-modernization 的核心约束是「行为不变」，这意味着迁移过程中需要大量回归测试来验证输出等价性。对于 COBOL 等老旧语言的迁移，当前缺乏公开的自动化行为验证基准，实际落地需要搭配额外的测试框架。

### 4. 只读扫描的安全信任模型

claude-code-setup 采用只读分析模式，这是建立用户信任的关键设计决策。如果插件需要写入权限才能推荐配置，用户会担心推荐本身是否会被执行。只读模式让用户可以先看推荐结果，再决定是否手动采纳。

### 5. 插件生态的开源策略

Anthropic 采用「官方维护 30+ 内部插件 + 社区贡献 10+ 外部插件」的双层模式。内部插件保证质量和稳定性，外部插件提供生态多样性。这种策略与 VS Code 的 marketplace 模式相似，但通过 `@namespace` 语法（`plugin-name@owner`）实现明确的版本隔离和作者归属。

## 实践启示

### 1. 用 feature-dev 替代「边想边改」的开发习惯

对于中型以上功能开发，不要直接进入编码阶段。先用 `/plugin install feature-dev@claude-plugins-official` 走一遍 7 阶段流程，特别是在架构设计阶段启用多智能体并行，可以显著降低后期的重构成本。

### 2. 用 hookify 建立团队编码规范

将团队编码规范从口头约定转为可执行的自动提示。例如：「阻止在 TypeScript 文件里写 console.log」「要求提交前必须跑测试」这类规则，可以通过自然语言描述给 hookify，自动生成可审计的配置文件。

### 3. 对遗留代码项目先用 code-modernization 评估

在启动任何遗留代码迁移前，先执行 `/modernize-assess` 获取客观的代码健康度评估。如果评估显示代码质量极低（高复杂度、低测试覆盖），应优先建立测试覆盖再进行迁移，而非直接重构。

### 4. 新项目先用 claude-code-setup 诊断

在一个新克隆的代码库中，第一时间运行 `/plugin install claude-code-setup@claude-plugins-official`，让插件扫描并推荐适合该项目技术栈的 MCP Servers、Hooks 和 Skills。这比手动查阅文档更高效，且推荐基于实际代码结构而非泛化建议。

### 5. 为 AI 编程建立 Hook 安全网

在团队内部推广 AI 辅助编码时，配置 hookify 的 warn 模式作为安全网：对于高风险操作（如删除文件、发布 npm 包）设置警告，让新人意识到 AI 建议的边界在哪里，同时不阻止正常的开发流程。

## 相关资源

- GitHub：https://github.com/anthropics/claude-plugins-official

## 相关实体
- [Claude Code Agent Teams Task Decomposition Ruofei](/ch01-296-claude-code-agent-teams-实战-怎么拆任务-控权限-收证据/)
- [Claude Code Self Repair Hooks Memory Config](/ch09-089-复制这套神仙配置-让claude-code全自动修bug-告别每天重复教ai写代码/)
- [Claude Code Agent View Huashu](/ch03-065-claude-code-agent-view-huashu/)
- [Anthropic Claude Code Large Codebase Best Practices 50002A089323](/ch01-255-anthropic-博客-claude-code-大型代码库最佳实践/)
- [Claude Code 7 Layer Memory Architecture](/ch01-857-claude-code-7-layer-memory-architecture/)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-official-plugins-anthropic.md)
- [prosemirror @文档 mention：知识库 agent 输入框的工程化实现](/ch04-225-prosemirror-文档-mention-知识库-agent-输入框的工程化实现/)
- MOC

---

