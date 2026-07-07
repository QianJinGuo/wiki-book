# AI + Skills 打通中间件迁移：Android 到鸿蒙定位服务实践

## Ch07.057 AI + Skills 打通中间件迁移：Android 到鸿蒙定位服务实践

> 📊 Level ⭐⭐ | 6.3KB | `entities/ai-skills-middleware-migration-android-harmonyos-taobao-2026.md`

# AI + Skills 打通中间件迁移：Android 到鸿蒙定位服务实践

## 概述

本文是淘天集团（大淘宝技术）用户终端技术团队的开益撰写的实战案例，记录了将 154 个 Android 定位服务迁移到鸿蒙（HarmonyOS）过程中采用"AI + Skills"方法论的完整实践。核心贡献在于：通过将 API 映射、枚举细节、回调差异等隐性知识转化为结构化、AI 可读的 Skills 文档，解决了 AI 通用智能与领域知识之间的断层问题。

## 核心洞察

### AI 辅助开发的根本矛盾

AI 拥有强大的通用智能（理解自然语言、生成代码、推理逻辑），但缺乏领域知识（特定平台的 API 细节、枚举值、回调约定）。通用智能与领域知识之间存在断层，导致 AI 生成的代码"看起来专业但编译错误 13 个"。

### 知识的三个状态

1. **隐性知识**：在老员工脑子里（"这里要用 ONE_MIN，别用 ONE_MINUTE"）
2. **显性知识**：在文档里（但分散、滞后、难搜索）
3. **可执行知识**：在 Skills 里（结构化、可索引、AI 可读）

### AI + Skills 分工模型

- **AI 负责**：通用逻辑生成、代码结构、模式识别
- **Skills 提供**：精准的 API 映射、枚举值、回调约定、常见陷阱

## 三种迁移方式对比

| 方式 | 耗时/服务 | 编译错误 | 知识沉淀 | 规模化成本(154 服务) |
|------|----------|---------|---------|-------------------|
| 纯 AI 翻译 | ~5 分钟 | 13 个 | 无 | ~102 小时 |
| 查源码 + 人工修正 | ~40 分钟 | 0 个 | 在脑子里 | ~77 小时 |
| **AI + Skills** | **~30 分钟** | **0 个** | **Skills 永久沉淀** | **~52 小时** |

AI + Skills 模式在 154 个服务的规模化迁移中节省 **25 小时**（对比纯 AI 翻译）。

## 方法论

### AI + Skills 工作流（完整闭环）

1. **输入阶段**：AI 加载 Skills 获取领域知识
2. **生成阶段**：AI 使用 Skills 中的映射表生成准确代码
3. **验证阶段**：编译/测试验证准确性
4. **反馈阶段**：问题 → 提炼 → 更新 Skills
5. **沉淀阶段**：成功经验 → 记录到 Skills

### 构建 Skills 三原则

1. **AI 友好的结构化**：表格化、结构化、明确的映射关系（而非长篇文字描述）
2. **持续演进**：遇到问题 → 查看源码 → 提炼规律 → 更新 Skills → 发布版本 → 团队同步
3. **分层组织**：从概述到 API 映射到常见陷阱到最佳实践

## 未来展望

本文提出了四条演进路径：

1. **从 Skills 到知识图谱**：AI 理解模块间依赖关系，自动推荐相关 Skills
2. **从被动查询到主动建议**：IDE 插件实时分析代码，匹配 Skills 中的常见陷阱，编译前预警
3. **从静态文档到动态生成**：AI 自动生成 Skills，0 人工维护成本
4. **从个人工具到组织能力**：组织级知识平台，新人 0 学习成本，老人离职后知识不流失

## 相关实体

- [Agent Skill Writing Guide](../ch04/555-agent-skill.md) — Skill 编写方法论
- [Hermes Skill System](ch07/017-hermes-skill.md) — Hermes 技能系统
- [Harness Engineering](../ch05/062-harness-engineering.md) — Harness 工程范式
- [Thin Harness, Fat Skills](../ch05/068-thin-harness-fat-skills-ai.md) — 薄 Harness 厚 Skills 架构
- [如何将经验编码为 Skills](../ch03/069-skills.md) — 经验 → Skills 转化方法论
- [Agent Skills vs 低代码平台](../ch04/376-agent-skills.md) — Skills 与低代码对比
- [Skill Craft](ch07/049-skill-craft-claude-skill.md) — Skill 工艺学
- [Skill Engineering as Algorithm](../ch04/262-skill.md) — Skill 工程即算法
- [Anthropic 14 Skill Patterns](../ch01/373-anthropic-14-skill.md) — Anthropic 技能设计模式
- [百度网盘 KMP 迁移三层架构](../ch03/045-agent.md) — 同类跨平台迁移案例
- [SkillX 分层技能库](ch07/048-skillx.md) — 分层技能库架构
- [Skill Hub 组织资产](../ch04/262-skill.md) — 组织级技能管理中心

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/ai-skills-middleware-migration-android-harmonyos-taobao-2026.md)

---

