---
title: "阿里开源 skill-up：让 Agent Skill 可评测可回归"
source_url: "https://mp.weixin.qq.com/s/Sel2LR3YJhVuVNqzNDgR9A"
source_author: "阿里技术/李斌"
source_site: "微信公众平台"
ingested: 2026-07-23
type: raw-article
tags: [skill-up, agent-evaluation, agent-skill, cli, benchmarking, regression-testing, alibaba, open-source]
sha256: "b5d2b018f7cbf519f07d6a4b2d90640c93549cedf37287b68483a285bf5fb562"
---

# 阿里开源 skill-up：让 Agent Skill 可评测可回归

## 背景

随着 AI Agent 的快速普及，Skill（技能）已成为 Agent 能力封装的标准单元。然而，如何系统性地评测 Skill 的质量、回归其行为稳定性，一直缺乏标准化工具。开发者在编写 Skill 后，往往只能靠人工抽查或零散的 shell 脚本来验证效果，评测成本高、不可重复、难以规模化。

2026 年 7 月，阿里正式开源 **skill-up** —— 一个专注于 Agent Skill 评测与回归的 CLI 框架。它用声明式 YAML 配置替代手写脚本，支持多引擎并行运行、结构化报告输出，让 Skill 评测变得可配置、可重复、可集成。

## 核心设计

### 1. 声明式配置：`eval.yaml`

skill-up 的核心抽象是 `eval.yaml` 配置文件。一个评测任务由一个 YAML 文件完整描述，包括：

- **评测目标**：要运行的 Skill / 任务定义
- **测试用例**：输入-期望输出对
- **判定规则**：如何判定 Agent 的输出是否符合预期
- **运行参数**：模型引擎、重试策略、超时控制

```yaml
# eval.yaml 示例
name: "code-review-skill-eval"
description: "评估 Code Review Skill 的缺陷发现能力"

engine:
  type: claude_code
  model: claude-sonnet-4
  max_retries: 2

cases:
  - name: "检测 SQL 注入风险"
    input:
      prompt: "review 以下代码中的安全问题"
      files:
        - path: "./fixtures/user_login.py"
          content: |
            def login(username, password):
                query = f"SELECT * FROM users WHERE name='{username}'"
                cursor.execute(query)
                return cursor.fetchone()
    expect:
      contains: ["SQL 注入", "参数化查询"]
      not_contains: ["看起来不错", "无安全问题"]
    judge:
      level: strict
      llm_verify: true
```

### 2. expect + judge 分层判定

skill-up 设计了 **两层判定体系**：

- **expect 层（浅层匹配）**：基于规则的快速筛检。支持 `contains`（包含关键词）、`not_contains`（排除关键词）、`regex`（正则匹配）、`json_path`（JSON 路径取值）。这一层执行速度快，适合作为第一道门控。
- **judge 层（深层判定）**：基于 LLM 的语义理解。当 expect 层通过后，judge 层会用独立的 Judge LLM 来评估 Agent 回答的质量——是否有幻觉、是否完整覆盖了需求、推理链路是否合理。支持 `llm_verify`、`rubric`（评分量表）、`multi_turn`（多轮对话评分）三种模式。

```yaml
judge:
  level: strict
  llm_verify: true
  rubric:
    - criterion: "正确识别了所有安全漏洞"
      weight: 0.5
    - criterion: "给出了可落地的修复建议"
      weight: 0.3
    - criterion: "没有误报"
      weight: 0.2
  passing_score: 0.7
```

### 3. 多引擎支持

skill-up 不绑定特定 AI 编程引擎，而是抽象了一层统一的执行接口。当前支持以下运行引擎：

| 引擎 | 标识符 | 特点 |
|------|--------|------|
| Claude Code | `claude_code` | Anthropic 官方 CLI |
| OpenAI Codex | `codex` | OpenAI 编程 Agent |
| Qoder CLI | `qodercli` | 阿里 Qoder 工作台 |
| Qwen Code | `qwen_code` | 通义千问编程助手 |
| Generic Shell | `shell` | 任意命令行程序 |

通过 `--engine` 参数可在运行期切换引擎，方便做横向对比：

```bash
# 在 Claude Code 上跑评测
skill-up run eval.yaml --engine claude_code

# 在 Codex 上跑同一组用例
skill-up run eval.yaml --engine codex
```

### 4. 结构化报告

运行完成后，skill-up 生成结构化的 JSON 评测报告：

```json
{
  "name": "code-review-skill-eval",
  "engine": "claude_code",
  "timestamp": "2026-07-23T10:30:00Z",
  "summary": {
    "total": 12,
    "passed": 10,
    "failed": 2,
    "pass_rate": 0.833
  },
  "cases": [
    {
      "name": "检测 SQL 注入风险",
      "status": "passed",
      "expect_check": true,
      "judge_score": 0.92,
      "details": {
        "expect_matches": ["SQL 注入"],
        "judge_feedback": "正确识别了 SQL 注入风险并给出了参数化查询建议"
      }
    }
  ]
}
```

报告支持 JSON 和 Markdown 两种格式输出，可集成到 CI 流水线中作为质量门禁。

### 5. 多轮会话评测

Agent 经常需要在多轮交互中完成复杂任务。skill-up 支持定义多轮对话的评测用例：

```yaml
- name: "多轮 Bug 修复"
  multi_turn: true
  turns:
    - role: user
      content: "帮我看看这个函数的性能问题"
    - role: assistant
      expected: { contains: ["时间复杂度", "O(n²)"] }
    - role: user
      content: "按照你的建议修改代码"
    - role: assistant
      expected: { contains: ["优化后"] }
```

### 6. 重型端到端评测

对于需要真实环境（文件系统、网络、Docker）的 Skill，skill-up 提供 `heavy` 模式：

```yaml
- name: "端到端项目构建"
  heavy: true
  setup:
    - git clone https://github.com/example/project.git /tmp/project
    - cd /tmp/project && npm install
  task: "在 /tmp/project 中修复所有 type 错误并确保构建通过"
  expect:
    exit_code: 0
  judge:
    level: normal
    llm_verify: true
  teardown:
    - rm -rf /tmp/project
```

Heavy 模式下，评测在独立沙箱中运行，支持 `setup` 和 `teardown` 生命周期钩子。

## 迁移案例：从 ~1200 行 Shell 脚本到 YAML

文章重点介绍了阿里内部一个真实的迁移案例。团队原先维护着一个约 1200 行的 Shell 脚本用于评测 Code Review Skill，脚本包含：

- 手工构造的 15 个测试用例（用 `here-doc` 嵌入代码片段）
- 基于 `grep` 和 `awk` 的字符串匹配判定
- 硬编码的 Agent 调用参数
- 分散在多个函数中的日志和报告逻辑

迁移到 skill-up 后，整个评测缩减为 **一个 `eval.yaml` 文件（约 80 行）**：

```yaml
name: "legacy-code-review-eval"
engine: { type: claude_code, model: claude-sonnet-4 }
cases:
  # 15 个测试用例以结构化方式列出
  - name: "case-01-sql-injection"
    input: { files: ["./fixtures/sql_injection.py"] }
    expect: { contains: ["SQL 注入", "参数化查询"] }
  - name: "case-02-xss"
    input: { files: ["./fixtures/xss.html"] }
    expect: { contains: ["XSS", "转义"] }
  # ...
```

迁移收益：

- **脚本量减少 93%**：1200 行 → 80 行 YAML
- **可读性大幅提升**：声明式结构一目了然
- **可重复性增强**：YAML 是纯数据，无副作用
- **横向对比**：一行命令切换引擎，不再需要维护多套脚本
- **CI 集成**：输出标准化 JSON 报告，直接对接流水线门禁

## 安装与使用

```bash
# 安装
npm install -g skill-up-cli
# 或
brew install skill-up

# 运行评测
skill-up run eval.yaml

# 指定引擎
skill-up run eval.yaml --engine codex

# 生成 Markdown 报告
skill-up run eval.yaml --report md > report.md

# 仅运行失败的用例（回归模式）
skill-up run eval.yaml --retry-failed
```

## 总结

skill-up 是阿里在 Agent Skill 工程化领域的一次重要开源贡献。它填补了 Skill 评测缺乏标准化工具的空缺，将评测从「一次性脚本」升级为「可配置、可回归、可集成的工程活动」。其声明式 YAML 配置、expect+judge 分层判定、多引擎支持等设计，为 Agent Skill 的质量保障提供了清晰的实践路径。

对于正在大规模使用 Agent Skill 的团队，skill-up 是 CI 流水线中不可或缺的一环。
