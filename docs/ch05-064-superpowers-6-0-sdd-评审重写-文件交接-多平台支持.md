# Superpowers 6.0 SDD 评审重写：文件交接 + 多平台支持

## Ch05.064 Superpowers 6.0 SDD 评审重写：文件交接 + 多平台支持

> 📊 Level ⭐⭐ | 5.5KB | `entities/superpowers-6-sdd-review-redesign-file-handoff.md`

## Superpowers 6.0 SDD 评审重写

Superpowers 6.0（2026-06-16 发布，06-18 v6.0.3 修补）的核心主线不是新增平台或补安全策略，而是**重新设计了 AI Agent 软件工程中最贵、最容易跑偏的流程：任务后的代码评审**。

与 [术哥的反作弊视角](/ch05-084-superpowers-6-0-反作弊重写-reviewer-只读怀疑论者-上下文经济学-progress-le/) 互补——术哥聚焦 reviewer 隔离堵作弊路径，本文聚焦文件交接降低上下文成本 + 多平台 harness 映射。

## SDD 评审重写

### 旧版问题

5.x 每个任务后跑两个独立评审（spec-compliance + code-quality），各读一遍 diff。同一段上下文被重复消耗，controller 还要把大量 diff 塞进主会话。上下文越长，评审越容易从"检查当前任务"滑向"顺手看完整个仓库"。

### 6.0 解法：单一 Task Reviewer + 双 Verdict

每个任务只派一个 Task Reviewer，一次阅读 diff，同时给出两个裁决：
- **Spec Compliance**：需求是否满足
- **Code Quality**：质量是否过关

最终阶段仍保留 whole-branch broad review。"任务窄审"和"最终宽审"边界更清晰。

task-reviewer-prompt.md 关键约束：
- diff file 是主视图，只有能说出具体风险时才查 diff 之外代码
- 不鼓励重跑整个测试套件，只允许 focused test
- implementer report 视为未验证声明，reviewer 必须回到 diff 本身验证

核心判断：**评审的价值来自发现具体缺陷，不来自制造"我又完整检查了一遍"的仪式感**。

## 文件交接降低上下文成本

这是 6.0 中最被低估的改动——把交接材料文件化：

| 脚本 | 输出 | 作用 |
|------|------|------|
| `scripts/task-brief` | `.superpowers/sdd/task-N-brief.md` | implementer 只读当前任务，不读计划全文 |
| `scripts/review-package` | diff 包（commit list + files changed + net diff） | reviewer 读文件，不跑 git 命令 |
| progress ledger | `.superpowers/sdd/progress.md` | 长任务恢复账本，compaction 后 controller 读文件 + git log 恢复 |

效果：
- 主会话不再被每个 task 的 diff 反复挤占
- reviewer 不需要临场"还原发生了什么"
- 评审失败时修复环围绕同一个 brief 和 diff package 继续转

v6.0.3 修补：scratch 目录从 `.git/sdd/` 移到 `.superpowers/sdd/`，避开 Claude Code 对 `.git/` 的保护。

## 多平台 Harness 映射

6.0 新增 Kimi Code、Pi、Antigravity 三个 harness。核心变化：**skill 层说方法论，harness 层负责工具映射**。

| 平台 | 集成方式 |
|------|----------|
| Kimi Code | `.kimi-plugin/plugin.json` 声明 `sessionStart.skill` |
| Pi | `.pi/extensions/superpowers.ts` 注册 resources + 注入 bootstrap |
| OpenCode | 插件做 bootstrap 缓存，避免每个 agent step 重复读文件 |
| Codex | 参考文件映射到具体工具 |

skill 文本从 Claude Code 方言（Task tool、CLAUDE.md）改写为 vendor-neutral 动作描述（dispatch a subagent、your instructions file）。

→ Coding Harness Engineering
→ Harness 作为产品表面

## Visual Brainstorming 安全补强

server.cjs 增加的安全措施：
- per-session key 认证（query key 或 HttpOnly cookie）
- WebSocket origin 检查
- HTTP 响应：no-referrer、no-store、frame deny、CSP
- 文件服务拒绝 dotfile、symlink、硬链接数异常文件
- 真实路径校验仍在 content 目录内

生命周期改进：
- 项目目录复用 `.last-port` 和 `.last-token`
- 停止时检查 server instance id，避免 stale PID 误杀
- idle timeout 调整为适合长时间头脑风暴

## 效率收益

官方数据：Claude Code 和 Codex 达到相似质量时，速度约快一倍，token 花费近少一半。

收益来源：
1. 合并 spec/quality reviewer → 省一个 subagent + 一遍 diff 读取
2. 预生成 review package → reviewer 不临场跑 git
3. 更细的模型选择建议（最终 broad review 仍用最强模型）

## 升级检查清单

1. **旧 reviewer prompt**：`spec-reviewer-prompt.md` / `code-quality-reviewer-prompt.md` → 迁到 `task-reviewer-prompt.md`，适配双 verdict
2. **worktree 路径**：旧 `~/.config/superpowers/worktrees/` 退出，新路径项目内 `.worktrees/`
3. **scratch 目录**：6.0.0-6.0.2 直接升到 6.0.3+，避开 `.git/sdd` 写入问题

## 相关链接

- → [术哥反作弊视角分析](/ch05-084-superpowers-6-0-反作弊重写-reviewer-只读怀疑论者-上下文经济学-progress-le/) — 互补视角
- → [三器合一工程化实战](/ch05-019-ai-production-development-workflow-openspec-superpowers-gsta/) — Superpowers + OpenSpec + gstack 串联
- → [Superpowers 工作流入门](/ch01-775-给-claude-code-装上-超能力-它干活比我还靠谱/)
- → [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/superpowers-6-sdd-review-redesign-file-handoff.md)

---

