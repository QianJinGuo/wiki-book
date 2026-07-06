# claude-apprentice v1.0：32 文件设计取舍与 5 层架构工程实现

## Ch01.1116 claude-apprentice v1.0：32 文件设计取舍与 5 层架构工程实现

> 📊 Level ⭐⭐ | 2.0KB | `entities/claude-apprentice-v1.0-5-layer-arch-32-files.md`

# claude-apprentice v1.0：32 文件设计取舍与 5 层架构工程实现

基于造物手稿的 claude-apprentice v1.0 发布日志，深入讲解 32 个核心文件的设计取舍与背后踩坑。

## 与现有实体的关系

与 `Claude Code Loop Engineering Guide`（兔兔AGI Loop Engineering）和 `Claude Code Demo To Production 8 Gates Huang Jia Csdn 2026`（黄佳 8 关卡）互补：前者讲 Loop Engineering 方法论，后者讲企业 Harness 门禁；本实体聚焦开源工具 claude-apprentice 的具体工程实现——5 层架构的 32 文件映射、踩坑复盘、错题本机制。

## 核心贡献

1. **5 层架构落地为文件系统**：Prompt/L1 → CLAUDE.md + rules/ → specs/workflow/ → commands/ → memory/ 的 32 文件映射，Harness 层最厚（11 文件）
2. **错题本机制（learned-lessons.md）**：Symptom → Root Cause → Rule 格式，8 条种子错题来自 3 个月真实 Claude Code 使用（v5.2→v5.7）
3. **6 维度代码评审**：Security(18项)/Correctness(5)/Performance(4)/Design(4)/Maintainability(6)/Convention(3)，4 档严重级别（CRITICAL/HIGH/MEDIUM/LOW）
4. **Spec 驱动工作流**：PROPOSE→APPLY→SHIP→ARCHIVE 4 阶段生命周期
5. **CLAUDE.md 知识下沉**：200→53 行，子文件分层承载，加载时间降 60%
6. **Loop 安全边界**：cron 只扫报告不改代码

## 错题本价值

8 条种子覆盖 Java 后端常见问题（mock 边界/锁范围/事务/异常吞咽/DTO-PO 混用/命名一致/自指噪声），是 50 小时真实 Claude Code 协作的踩缸红利。后续可累积扩展。

---

