---
title: "Claude Code 写得越快，越要把错误控制在可回滚范围内"
source_url: "https://mp.weixin.qq.com/s/cRf21RwJcPMYZK5oOdHIyw"
source_site: "mp.weixin.qq.com"
source_author: "若飞｜架构师"
ingested: "2026-07-14"
sha256: "622661a41d18350a085106a2fec9af4d91fc066514b97f717173e473f1e63c7d"
type: "raw-article"
tags: [claude-code, safety, permissions, sandbox, engineering-practices]
status: "ingested"
---

# Claude Code 写得越快，越要把错误控制在可回滚范围内

> Claude Code 工程安全实践：任务状态机、CLAUDE.md 配置、权限系统、Sandbox 隔离、Worktree 并行开发、验证闭环。

## 核心思路

把一次改动拆成五个状态：

| 状态 | 做什么 | 结果停在哪儿 |
|------|--------|-------------|
| 调查 | 只读检查约定目录，说明复现路径和计划 | 一份待确认的 Plan |
| 修改 | 只改约定目录，push 和公开接口变更需确认 | Worktree 里的候选 Diff |
| 运行 | 命令在 Sandbox 中执行，凭据与无关路径不可访问 | 受限环境里的执行结果 |
| 验收 | 失败用例、单测、lint 和真实流程复核 | 一份证据报告 |
| 提交 | 人看重点 Diff，再决定 commit/PR/merge/发布 | 可审查、可撤回的变更 |

## CLAUDE.md 实践

- 记录代码里不容易直接读出的约定：技术栈版本、目录边界、测试命令、哪些失败需停下
- 官方建议每份控制在 200 行以内
- 大项目用 `.claude/rules/` 路径匹配按需加载
- CLAUDE.md 只是上下文，密钥和生产访问要交给权限与隔离机制

## 权限与 Hook

deny → ask → allow 顺序：先看是否禁止，再看是否需要确认，最后才看能否直接运行。

- `PreToolUse`：执行前阻断或要求确认
- `PostToolUse`：记录和检查（动作已发生，无法撤销）
- Hook 不能绕过已有 deny 来放宽权限

## Worktree + Sandbox

- **Git Worktree**：每个会话独立目录和分支，解决并行修改覆盖问题（`claude --worktree auth-refresh`）
- **Bash Sandbox**：macOS Seatbelt 或 Linux bubblewrap，限制进程读写路径和网络
- Sandbox 默认限制工作目录外写入，但读权限可能覆盖整台机器（包括 `~/.aws/credentials`），需额外保护

## 验证三层证据

1. **代码级**：失败用例由红变绿，lint 退出码为 0
2. **行为级**：本地服务完成真实登录与刷新
3. **变更级**：Diff 只落在约定目录，公开契约没变化

## Checkpoint 边界

Checkpoint 主要跟踪内置文件编辑工具产生的变化。Bash 删除文件、脚本批量改写、外部服务更新、数据库写入通常不在恢复范围内。官方定位：Checkpoint 是本地撤销，Git 才是长期历史。

## Agents Rule of Two

Meta 提出的安全框架：如果同一会话中同时出现**未可信输入**、**敏感数据**、**对外写操作**，风险会闭环。三项能力一旦连起来，模型的一次误判就可能越过代码库。

## 推荐配置示例

```json
{
  "permissions": {
    "allow": ["Bash(pnpm test *)", "Bash(pnpm lint *)"],
    "ask": ["Bash(git push *)", "Bash(gh pr merge *)"],
    "deny": ["Read(//**/.env)", "Read(~/.ssh/**)", "Read(~/.aws/**)", "Bash(rm -rf *)"]
  },
  "sandbox": {
    "enabled": true,
    "failIfUnavailable": true,
    "allowUnsandboxedCommands": false
  }
}
```

## 参考

- Claude Code Docs: Configure permissions / Sandboxing / Worktrees / Checkpointing / Best practices
- Boris Cherny: "Give Claude a way to verify its work"
- Meta AI: Agents Rule of Two
