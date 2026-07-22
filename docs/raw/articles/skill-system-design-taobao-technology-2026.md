---
title: "AI Agent 的 Skill 系统设计 — 大淘宝技术"
source_url: "https://mp.weixin.qq.com/s/idzAV3XkWWm7GnFOFyZUBw"
publish_date: 2026-07-01
tags: [wechat, taobao, alibaba, skill, agent, system-design, best-practices]
review_value: 9
review_confidence: 8
review_recommendation: neutral
sha256: a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2
---

# AI Agent 的 Skill 系统设计

来源：大淘宝技术 — 会员技术团队（苏雄）
淘天集团-会员技术团队负责 88VIP、天猫积分、省钱卡、大会员、消费券等淘宝核心业务。

## 核心观点

Skill 的价值是把期望行为转化成 Agent 能稳定执行的工作流。一个好的 Skill 要同时解决四件事：
1. 让 Agent 在正确场景发现它
2. 用最少上下文加载必要信息
3. 按任务风险设置合适的自由度
4. 并通过真实任务验证它是否改变了行为

## Skill 是能力包，不是知识库

Skill 通过 SKILL.md、脚本、引用资料和资产，把一个通用 Agent 转化为在特定任务上更可靠的专用 Agent。提供四类能力：

| 能力 | 说明 | 示例 |
|------|------|------|
| 专用工作流 | 多步骤、可复用的任务流程 | 写技术方案、处理 PR 评论、生成报告 |
| 工具集成 | 使用特定文件格式、API 或 CLI 的方法 | 处理 PDF、调用 GitHub、操作表格 |
| 领域知识 | 业务规则、数据口径、组织约定 | 公司指标口径、内部权限边界 |
| 捆绑资源 | 脚本、模板、参考资料、素材 | scripts/、references/、assets/ |

**核心原则**：写 Skill 不是"把说明写清楚"，而是"让 Agent 在复杂环境中更难走错"。

## 上下文窗口是公共资源

每一段内容都应该经受两个问题：
1. Agent 真的需要这段解释吗？
2. 这段内容值得它占用的 token 成本吗？

采用**渐进披露**，标准目录结构：
```
skill-name/
  SKILL.md          # 必需，核心流程
  agents/
    openai.yaml     # Agent 配置
  scripts/          # 确定性操作脚本
  references/       # 按需查阅的领域知识
  assets/           # 输出材料模板/素材
```

### 发现层 vs 执行层

`name` 和 `description` 是发现层。正文是执行层。**不要把触发条件放在正文里**——Agent 在决定是否触发时根本看不到正文。

`description` 应该包含 Skill 做什么和何时使用，但不能变成完整工作流摘要——避免 Agent 凭描述就开始执行。

## 自由度分级：让控制匹配任务风险

| 档次 | 控制方式 | 适用场景 |
|------|----------|----------|
| 高自由度 | 结构原则 + 语气规则 + 示例引导 | 写技术文章、设计 |
| 中自由度 | SQL 模板 + 字段说明控制口径 | 查询内部指标、数据分析 |
| 低自由度 | 脚本保证确定性 | 旋转 PDF、格式转换、固定报告 |

### HARD-GATE 门控

在条件满足前，明确禁止后续动作。语法示例：
```
<HARD-GATE>
在理解具体使用示例并规划好可复用资源之前，不要创建或编辑该 Skill。
</HARD-GATE>
```

常见门控：前置条件门、权限门、确认门、回滚门。

## 6 步创建循环

1. 理解具体使用例子
2. 规划可复用资源
3. 初始化 Skill
4. 编辑 SKILL.md 和资源
5. 验证 Skill（格式验证 + 前向测试）
6. 基于真实使用迭代

**关键**：不从抽象能力开始写。先问——用户怎么触发？哪些请求应该/不应该触发？任务输入/成功输出是什么？哪些步骤最容易出错？

### 流程图集成

复杂 Skill 可以用 GraphViz DOT 嵌入 Markdown，比纯文本更稳定：
```
digraph {
"是否有具体使用例子?" [shape=diamond];
"规划 scripts/references/assets" [shape=box];
...
}
```

## 验证：前向测试 + 合理化防御

### 基础验证
`scripts/quick_validate.py <path>` 覆盖：YAML frontmatter 合法、name/description 存在、命名合规、资源目录合理、脚本可运行。

### 前向测试（Forward Testing）
用子代理模拟真实用户任务。正确做法：
```
使用位于 /path/to/skill-x 的 @skill-x 来解决问题 y。
```
错误做法（泄露答案）：
```
审查这个 Skill。我认为它有问题 A，预期修复方案是 B。
```

验证时应使用原始证据：示例 prompt、输出文件、diff、日志、行为轨迹、失败截图、测试结果。

### 合理化（Rationalization）防御
AI Agent 在压力下会给跳过规则找到听起来合理的理由。Skill 需要提前写出这些借口并给出反驳。审查循环应围绕真实失败风险而非措辞偏好。

## 平台适配策略

不同平台的工具名、hook、插件机制不同。Skill 应写行为规则，用平台层适配具体工具。平台能力不足时应优雅降级。

```
- TodoWrite -> todowrite
- Task tool -> @mention subagent system
- Skill tool -> native skill tool
```

真正应该稳定的是行为规则，而不是某个平台的私有工具名。

## 交付前检查表

常见反模式：把人类文档的写法带到 Agent 执行系统。交付前自查：name 和 description 是否足够精准？SKILL.md 是否遵循渐进披露？脚本是否独立验证过？不合理行为是否被门控封堵？是否有具体例子驱动？
