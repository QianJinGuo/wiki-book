# skill-up: 阿里开源 Agent Skill 评测框架

## Ch07.049 skill-up: 阿里开源 Agent Skill 评测框架

> 📊 Level ⭐⭐ | 8.0KB | `entities/alibaba-skill-up-agent-skill-evaluation.md`

# skill-up：阿里开源 Agent Skill 评测框架

> 声明式 CLI 评测框架，让 Agent Skill 可评测可回归。2026 年 7 月由阿里巴巴开源，填补了 Agent Skill 缺乏标准化评测工具的空缺。

## 定位与核心问题

随着 AI Agent 快速普及，Skill（技能）已成为 Agent 能力封装的标准单元。但开发者编写 Skill 后，往往只能靠人工抽查或零散的 shell 脚本来验证效果——评测成本高、不可重复、难以规模化。skill-up 正是为此而生：一个专注于 Agent Skill 评测与回归的 CLI 框架，用声明式 YAML 配置替代手写脚本，支持多引擎并行运行、结构化报告输出。

## 四大核心设计

### 1. 声明式配置：`eval.yaml`

核心抽象是 `eval.yaml` 配置文件，一个评测任务由一份 YAML 完整描述，包含评测目标、测试用例（输入-期望输出对）、判定规则和运行参数（模型引擎、重试策略、超时控制）。

```yaml
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

两层判定体系组成：

- **expect 层（浅层匹配）**：基于规则的快速筛检。支持 `contains`（包含关键词）、`not_contains`（排除关键词）、`regex`（正则匹配）、`json_path`（JSON 路径取值）。执行速度快，适合作为第一道门控。
- **judge 层（深层判定）**：基于 LLM 的语义理解。expect 层通过后，用独立的 Judge LLM 评估 Agent 回答质量——是否有幻觉、是否完整覆盖需求、推理链路是否合理。支持 `llm_verify`、`rubric`（评分量表）、`multi_turn`（多轮对话评分）三种模式。

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

不绑定特定 AI 编程引擎，抽象一层统一执行接口。当前支持：

| 引擎 | 标识符 | 特点 |
|------|--------|------|
| Claude Code | `claude_code` | Anthropic 官方 CLI |
| OpenAI Codex | `codex` | OpenAI 编程 Agent |
| Qoder CLI | `qodercli` | 阿里 Qoder 工作台 |
| Qwen Code | `qwen_code` | 通义千问编程助手 |
| Generic Shell | `shell` | 任意命令行程序 |

通过 `--engine` 参数可在运行期切换引擎做横向对比：

```bash
skill-up run eval.yaml --engine claude_code
skill-up run eval.yaml --engine codex
```

### 4. 结构化报告

运行完成后生成结构化的 JSON 评测报告，包含引擎、时间戳、汇总统计（总数/通过/失败/通过率）以及每条用例的详细判定结果。支持 JSON 和 Markdown 两种格式输出，可集成到 CI 流水线中作为质量门禁。

## 多轮会话评测

Agent 经常需要在多轮交互中完成复杂任务。skill-up 支持定义多轮对话的评测用例，以下为"危险操作确认"的典型场景——Agent 收到删除指令后必须先请求用户确认，不得直接执行：

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

## 重型端到端评测

对于需要真实环境（文件系统、网络、Docker）的 Skill，提供 `heavy` 模式，支持 `setup` 和 `teardown` 生命周期钩子，评测在独立沙箱中运行：

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

## 迁移案例：~1200 行 Shell 脚本 → 80 行 YAML

阿里内部真实迁移案例：原先约 1200 行的 Shell 评测脚本（包含手工构造的 15 个用例、基于 grep/awk 的字符串匹配、硬编码 Agent 参数、分散的日志和报告逻辑）迁移为一个 `eval.yaml` 文件（约 80 行）。迁移收益包括：

- **脚本量减少 93%**：1200 行 → 80 行 YAML
- **可读性大幅提升**：声明式结构一目了然
- **可重复性增强**：YAML 是纯数据，无副作用
- **横向对比**：一行命令切换引擎，无需维护多套脚本
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

此外，skill-up 还内置 **skill-upper**（一个 Agent Skill），可自动读取 SKILL.md 生成评测集。

## 开源地址

- GitHub: [github.com/alibaba/skill-up](https://github.com/alibaba/skill-up)
- 中文用户手册: alibaba.github.io/skill-up/zh

## 相关实体

- [Alibaba Skill-Up：声明式 Agent Skill 评测框架（同主题深度解读）](../ch04/305-alibaba-skill-up-agent-skill.html) — 基于另一篇来源文章的全面分析，含对比评测框架
- [AgentEval：YAML驱动的Agent评测框架](../ch03/046-agent.html) — 另一 YAML 驱动的 Agent 评测框架（Go 语言，pass@k 指标），定位互补
- [Agent Skill 评估与迭代](../ch04/264-agent-skill.html) — 侧重于手动测试方法论，与 skill-up 的自动化 CI 方案形成对照
- [Agent 评测体系化指南](../ch03/046-agent.html) — 评估体系全链路：指标体系、数据集、评分与闭环
- [SWE-bench Agent 评估方法论](../ch04/664-swe-bench-agent.html) — 软件工程 Agent 评测基准方法论
- [SkillScan：智能体技能安全扫描](../ch04/264-agent-skill.html) — 技能安全扫描与 skill-up 的质量验证相辅相成

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/alibaba-skill-up-agent-skill-evaluation-cli-2026.md)

---

