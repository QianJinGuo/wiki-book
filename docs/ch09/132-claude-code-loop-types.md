# Claude Code Loop Types — 官方四种循环模式分类法

## Ch09.132 Claude Code Loop Types — 官方四种循环模式分类法

> 📊 Level ⭐⭐ | 5.5KB | `entities/claude-code-loop-types-official-taxonomy-four-modes.md`

# Claude Code Loop Types — 官方四种循环模式分类法

> Claude Code 团队 (Delba de Oliveira & Michael Segner) 官方定义的四种 Loop 类型。与第三方教程不同，这是官方分类法。

## 四种 Loop 类型一览

| Loop 类型 | 触发方式 | 停止条件 | 适用场景 | 关键特性 |
|---|---|---|---|---|
| 轮次驱动 | 用户提示词 | 任务完成 | 短、一次性任务 | SKILL.md 验证优化 |
| 目标驱动 (/goal) | 实时提示词 | 目标达成/达最大轮数 | 有明确可验证退出条件的任务 | 评估模型检查条件 |
| 时间驱动 (/loop, /schedule) | 指定时间间隔 | 取消或工作完成 | 周期性工作, 外部系统交互 | 可按间隔重跑同条提示词 |
| 主动循环 | 事件/日程触发 | 任务退出; routine 持续运行 | 反复出现的工作流 | /schedule + /goal + skills + auto mode + dynamic workflows 组合 |

## 代码质量五原则（第 2 来源独家）

1. **保持代码库本身干净**：Claude 会遵循已有的模式和约定
2. **给 Claude 验证自身工作的方法**：通过 SKILL.md 记录团队认可的验证标准（如前端更改验证：启动开发服务器 → 交互验证 → 截图 → 控制台检查 → Chrome Devtools MCP 性能审计）
3. **让文档易于获取**：框架和库的文档包含最新最佳实践
4. **第二智能体代码审查**：全新上下文的评审者偏见更少（内置 `/code-review` 或 GitHub 审查工具）
5. **系统性改进**：单次结果未达标准时，将其编写到系统中以改善未来所有迭代

## Token 管理六策略（第 2 来源独家）

1. 为具体工作选择合适的组件和模型
2. 定义清晰的成功和停止标准
3. 大规模运行前试点评估（动态工作流可生成数百个智能体）
4. **确定性工作使用脚本**：脚本比推理更经济（如 PDF 技能运行表单填充脚本）
5. 间隔与变化频率匹配
6. 查看使用情况：`/usage`（按技能/子智能体/MCP 细分）、`/goal`（轮次和 Token）、`/workflows`（每个智能体的 Token）

## 第 3 来源 — 架构师中文实践视角（2026-07-15）

> 公众号"架构师"对 Claude Code 四类 Loop 的中文解读，补充了长任务状态下的人机交接流程。

### 长任务状态追踪六要素

当 Loop 跨多轮运行（数小时甚至跨定时唤醒），聊天记录不再可靠。作者整理了接手现场所需的六要素：

- **SPEC**：明确 scope（如"只升级依赖 X，最多 5 轮"）
- **STATE**：当前版本、候选版本、已尝试路径、失败原因
- **EVIDENCE**：测试退出码、依赖树 Diff、发布说明中的风险项
- **IMPACT**：可能受影响的服务、用户路径和运行环境
- **PERMISSION**：可写独立分支，不自动合并，不改生产配置
- **HANDOFF**：为什么停止、哪些风险未覆盖、谁做决定

### 构建有效的 Skill 的实战建议

- 从近期 PR 中提取 Reviewer 的关注模式：哪些调用点被搜索、为什么拒绝改动、最终靠什么证据合并
- 第一版 Skill 不必写很多——测试命令、退出码、必须查看的 Diff 比"仔细检查兼容性"更能约束 Agent
- 返工原因应写回系统：如果某类 PR 总因许可证或默认配置被拒绝，这些信息应进入下一版 Skill 或检查脚本

### 四类 Loop 的控制权递进关系

四种 Loop 不是成熟度阶梯，而是一个控制权递进谱系：

- 依赖升级最适合从**回合式**开始：Agent 查版本、改代码、跑测试，人决定是否继续
- 只有当检查标准稳定、停止条件可验证、权限边界清楚时，才有必要升级到目标式或定时式
- 主动式不是单独指令，而是一组能力的组合（/schedule + /goal + Skills + Dynamic Workflows + Auto mode）

## 与已有实体的关系

- [Claude Code Loop Engineering 完整攻略](ch09/149-claude-code-loop-engineering.html) — 兔兔AGI 第三方教程，侧重实战技法；本实体是官方分类法，侧重模式选择决策
- [[entities/aliyun-loop-engineering-log-scan-auto-fix-deploy|阿里云 Loop 实战」— 同为 Loop 实践，但本实体聚焦 Claude Code 的 CLI 命令级 loop 原语

## 参考

→ [raw/articles/claude-code-loop-types-official-taxonomy-four-modes|原文存档 1]
→ [raw/articles/fyjE5EhnV1jKzE8NnscZDQ|原文存档 2 (AI寒武纪)]
→ [raw/articles/anthropic-loop-four-types-practical-guide-jiagoux-2026-07-15|原文存档 3 (架构师)]

---

