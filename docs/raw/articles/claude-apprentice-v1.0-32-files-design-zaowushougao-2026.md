---
source: 造物手稿
source_url: https://mp.weixin.qq.com/s/7XERsMi6f0DnPd_u7XGMRw
ingested: 2026-07-06
sha256: f580d6af2e876e11d3a3235d0e8e9f36b35bcf019d6d7fbb57d6937314160d26
tags: [claude-code, appprentice, engineering]
---

# claude-apprentice v1.0 发布日志：32 个文件背后的设计取舍

> 造物手稿主理人 | 2026-07-06 | 个人观点

## 5层架构的代码形态

claude-apprentice v1.0 文件结构（核心模板 32 个）：

```
claude-apprentice/
├── bin/apprentice.js         ← CLI 入口
├── install.sh
├── templates/
│   ├── CLAUDE.md             ← L2 Context：入口文件（53 行）
│   ├── settings.json
│   ├── memory/               ← L5 Memory
│   ├── rules/                ← L2 Context：硬性规则
│   ├── specs/                ← L3 Harness：规格驱动
│   ├── workflow/             ← L3 Harness：工作流
│   ├── commands/             ← L4 Loop + L3 Harness
│   ├── skills/               ← L3 Harness：专项技能
│   ├── usage-guides/         ← L1 Prompt
│   └── scripts/
```

按层分布：L1 Prompt 3 / L2 Context 8 / L3 Harness 11 / L4 Loop 1 / L5 Memory 1 / CLI+脚本 8

## 5个关键设计决策

1. **CLAUDE.md 压缩 200→53 行**：知识下沉到子文件，加载时间降 60%
2. **Spec 单独成层**：PROPOSE→APPLY→SHIP→ARCHIVE 4 阶段生命周期
3. **错题本 learned-lessons.md**：8 条种子错题（L-001~L-008），来自 50h 真实使用
4. **6 维度评审**（Security/Correctness/Performance/Design/Maintainability/Convention，4 档严重级别）
5. **扫描命令自指过滤**：排除 .claude/commands 和 usage-guides

## 5个反模式（删除/重写）

超长 CLAUDE.md / 5 维度评审 / 规则散落 4 文件 / scan-todos v1 / ...

## 8条种子错题

| 编号 | 主题 | 来源版本 |
|------|------|---------|
| L-001 | 测试 mock 边界 | v5.2 |
| L-002 | FOR UPDATE 锁范围 | v5.2 |
| L-003 | 事务边界 | v5.3 |
| L-004 | 异常吞咽 | v5.3 |
| L-005 | DTO/PO 混用 | v5.4 |
| L-006 | 命名不一致 | v5.5 |
| L-007 | 命名风格 | v5.5 |
| L-008 | 扫描命令自指噪声 | v5.7 |

## v1.1/v1.2 路线图

- v1.1（已发布）：GOVERNANCE.md SSOT 治理、双版本号策略、两仓模型
- v1.2 规划：cron 自动 Loop（只出报告不改代码）> 多语言模板 > Cursor 支持 > 团队协作 > Web UI 配置器

## 链接

- GitHub: https://github.com/shuoyue/claude-apprentice
- npm: https://www.npmjs.com/package/claude-apprentice
