# 小米 Harness 工程：从个人实践到团队标准的 Prompts→Hooks→Plugin 三次跨越

## Ch05.112 小米 Harness 工程：从个人实践到团队标准的 Prompts→Hooks→Plugin 三次跨越

> 📊 Level ⭐⭐ | 4.3KB | `entities/xiaomi-harness-engineering-prompt-to-hook-to-plugin.md`

# 小米 Harness 工程：从个人实践到团队标准

小米技术团队关于 Harness Engineering 从个人实践到团队标准的系统化工程方案。核心洞察：**提示词是建议，Harness 让规则落地。**

> → [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/xiaomi-harness-engineering-prompt-to-hook-to-plugin.md)

## 三次跨越

### 第一次：把流程写进 Prompt
用 /flow 命令标准化开发环节，结构化 Prompt 模板约束 AI。根本局限：Prompt 是"软"约束，AI 绕过规则、上下文压缩后"忘记"约束、无法核验操作。

### 第二次：把约束下沉到 Hook
在 Claude Code PreToolUse / PostToolUse 生命周期挂载检查脚本。首次具备可执行的流程强制力。但系统"单体"——配置分散在各项目，靠 rsync/git pull 分发。

### 第三次：把约束沉淀为可复用能力（插件化）
管控逻辑封装为 Claude Code 插件，通过内部 Marketplace 分发。三重故障闭锁：Bash 状态守卫 + 源码守卫 + 状态文件防篡改。门禁引擎（workflow-gate.sh，约 2600 行）统一验证器完成 5 路检查（技能事件/CLI 事件/工件/度量/项目状态）。

## 双通道证据机制

任何关键步骤同时留存两份独立证据：
- **工程工件**：AI 在文档中记录技能、完成时间等
- **工具执行记录**：Hook 自动写入事件记录，不依赖 AI 主动记录

验证时同时检查两个来源。两类证据同时满足，当前阶段才被认为真正完成。

## 质量门禁三层拦截

1. **PreToolUse 源码守卫**：方案阶段阻止修改业务代码（exit 2 = 阻断工具调用），强制"方案未定，代码不动"
2. **PreToolUse Commit 守卫**：前置步骤未完成无法提交
3. **Bash 状态守卫**：审查命令行，仅放行白名单只读操作；写入 .workflow-state.json 统一通过 mark-step 子命令

## 实测数据（2026-04-24 至 06-05）

| 指标 | 数值 |
|------|------|
| 业务项目 | 3 个 |
| 开发者 | 6 名 |
| 正式需求 Flow | 23 个（21/23 未跳过步骤，合规率 91.3%） |
| Flow 首尾耗时中位数 | 约 23.4 分钟 |
| Flow 首尾耗时均值 | 约 38 分钟 |
| 知识类 Markdown | 110 份（首次审计发现 15 项高风险错误） |
| 开发时间节省 | 约 40%-50%（团队经验口径） |
| Brainstorm 耗时 | 25min → 12min（模板约束后） |

## 案例：GP Inline Install

完整 /flow 案例（brainstorm → propose → implement → verify）：减少 3 轮评审修改，减少 2 个功能缺陷。关键决策：brainstorm 阶段"安装时机"初稿默认"应用启动时"，模板强制至少 2 个备选方案，改选"用户首次触发广告场景时"——避免后续 2 个功能缺陷。

## 诚实边界

- **Bus Factor = 1**：整个约束引擎是一人维护的 2600 行 Bash
- **平台锁定风险**：深度依赖 Claude Code Hook API
- **标准流程偏重**：低风险小改动需轻量路径
- **因果链未建立**：合规率到业务结果的归因仍在积累
- **最小可行版本**：50 行脚本→一个状态文件+一个拦截器

## 相关实体

- [小米 JDK21 升级中可控演进的 AI 工程实践](ch05/065-harness-engineering.html) — 同团队 JDK 升级实践（本专栏第 5 期）
- [Harness Engineering](ch05/065-harness-engineering.html) — 通用 Harness 工程概念

---

