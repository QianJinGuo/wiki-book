# skill-up: 阿里开源 Agent Skill 评测框架

> 📊 Level ⭐⭐⭐⭐⭐ | 13.4KB

## skill-up：阿里开源 Agent Skill 评测框架

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

## 深度分析

### Skill 评测为什么不同于模型评测

传统模型评测（MMLU、[SWE-bench Agent 评估方法论](https://github.com/QianJinGuo/wiki-public/blob/main/entities/swe-bench-agent-evaluation.md) 一类基准）的评测对象是模型本身：输入是静态题目，输出是一次性答案，判定聚焦"答对没有"。Skill 评测的对象则是一条**行为契约**——Skill 何时该被触发、触发后如何调用工具、如何在多轮中保持约束。这带来三个本质差异：

1. **评测单元从"题目"变成"场景"**。skill-up 的用例不只是问答对，还捆绑了 fixture 文件（如待 review 的 SQL 注入代码）、运行引擎和环境参数——评测规格必须描述完整运行时，而非仅描述输入输出。
2. **输出不确定且带状态**。Agent 的回复措辞每次不同，所以浅层 `contains` 匹配天然脆弱，必须叠加 judge 层做语义判定；而端到端任务改的是真实文件系统，判定对象从"文本"扩展到"副作用"（exit_code、产物文件）。
3. **回归比单次评分更重要**。Skill 会随模型版本、引擎升级而漂移，`--retry-failed` 回归模式和 CI 门禁的存在说明：Skill 评测的定位接近软件测试，而非一次性打分。

### YAML 即规格（spec）的深层含义

~1200 行 Shell → 80 行 YAML 的迁移案例，价值不在行数本身，而在于**评测从"代码"变成了"数据"**。声明式规格带来的是一系列连锁收益：

- **可评审**：评测集变更可以在 PR 里逐行 review，而 Shell 脚本的 diff 几乎不可读；这使"修改评测标准"和"修改代码"一样进入工程流程。
- **引擎无关**：YAML 只描述"测什么"，执行交给引擎抽象层，于是一份用例可以在 Claude Code、Codex、Qwen Code 上横向复跑——与 [AgentEval](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-eval-wallezhang-yaml-driven-agent-evaluation-framework.md) 等 YAML 驱动框架殊途同归，说明"配置即评测"正在成为这一层的共识范式。
- **无副作用可缓存**：YAML 是纯数据，同一份配置的运行结果可比、可存档、可追溯到具体 commit。

但声明式也有天花板：复杂控制流（条件化 setup、动态生成用例、跨用例共享状态）很难用 YAML 表达，硬塞进去会退化为"用 YAML 写的程序"。skill-up 用 `heavy` 模式的 setup/teardown 钩子吸收了一部分过程性需求，剩余部分仍需回到脚本层——声明式规格适合覆盖 80% 的常规用例，长尾仍属命令式。

### 多轮评测与端到端评测之间的缝隙

skill-up 提供的两种重型模式各覆盖一段光谱，但中间存在明显空档：

- **多轮会话评测**按轮次检查 assistant 文本（如"危险操作必须先确认"），但轮次是预编排的——用户轮固定、期望固定，无法考察 Agent 的真实分支决策（用户说"不用确认"时 Agent 是否还坚持询问）。
- **heavy 端到端评测**验证最终 exit_code 加 judge 打分，但过程轨迹是不透明的：中间里程碑（"先跑了测试再改代码"还是"直接改"）不在判定范围内，且缺少一等公民的状态断言（某文件确实被修改、数据库某行确实更新）——目前只能靠 expect 层的 `json_path` 间接逼近。
- 两者之间的"长程任务 + 中间里程碑检查"——多步骤任务中每个阶段的状态与文本双重断言——是当前框架未原生覆盖的形态，需要用 heavy 任务的 task 描述 + judge rubric 变通模拟。

这与 [Agent 评测体系化指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-evaluation-systematic-guide-metrics-to-closed-loop.md) 中的分层思想一致：过程指标与结果指标需要不同的采集手段，而 skill-up 目前的过程采集仍偏弱。

## 实践启示

1. **把 Skill 评测挂进 CI 门禁，而非依赖手动抽查**。结构化 JSON 报告 + `--retry-failed` 回归模式意味着评测可以像单测一样常驻流水线；Skill 文件每次变更都应触发回归，捕获模型或引擎升级带来的行为漂移。
2. **用 expect/judge 分层控制评测成本**。先用廉价的规则匹配（`contains`/`regex`）做第一道筛检，只有通过者才进入 Judge LLM 的语义评分；评测量大时，这一分层能把 LLM 调用压到必要子集，是评测经济学上最直接的杠杆。
3. **迁移遗留评测脚本时，先"抽数据、再删逻辑"**。1200 行 Shell 的价值在于其中 15 个用例的知识，而非 grep/awk 的判定逻辑。迁移路径应是：把用例逐条提为 YAML 数据 → 用 expect+judge 复刻判定语义 → 最后整体删除脚本。手工测试方法论可参考 [Agent Skill 评估与迭代](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-skill-writing-evaluation.md)。
4. **利用 `--engine` 横向对比反推 Skill 设计**。同一份 eval.yaml 跑多个引擎，失败的用例往往暴露 Skill 对特定引擎措辞/工具调用的隐式依赖——好 Skill 应当引擎无关，这比单引擎高分更能说明 Skill 质量。
5. **多轮评测优先覆盖"行为契约"而非对话覆盖度**。像"危险操作必须确认"这类一旦违反即事故的约束，比覆盖日常对话路径的价值高一个量级；先为每条安全/权限契约写一个多轮用例，再谈覆盖广度。
6. **用加权 rubric 把主观判定变成可调参数**。`rubric` + `passing_score` 让"什么是好的 review"可以被团队显式定义和迭代，判定标准本身进入版本管理——评测标准的演进历史因此可追溯。

## 相关实体

- [Alibaba Skill-Up：声明式 Agent Skill 评测框架（同主题深度解读）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/alibaba-skill-up-agent-skill-evaluation-framework-2026.md) — 基于另一篇来源文章的全面分析，含对比评测框架
- [AgentEval：YAML驱动的Agent评测框架](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-eval-wallezhang-yaml-driven-agent-evaluation-framework.md) — 另一 YAML 驱动的 Agent 评测框架（Go 语言，pass@k 指标），定位互补
- [Agent Skill 评估与迭代](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-skill-writing-evaluation.md) — 侧重于手动测试方法论，与 skill-up 的自动化 CI 方案形成对照
- [Agent 评测体系化指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-evaluation-systematic-guide-metrics-to-closed-loop.md) — 评估体系全链路：指标体系、数据集、评分与闭环
- [SWE-bench Agent 评估方法论](https://github.com/QianJinGuo/wiki-public/blob/main/entities/swe-bench-agent-evaluation.md) — 软件工程 Agent 评测基准方法论
- [SkillScan：智能体技能安全扫描](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skillscan-agent-skill-security-scanning-best-practices.md) — 技能安全扫描与 skill-up 的质量验证相辅相成

→ [原文存档](https://mp.weixin.qq.com/s/Sel2LR3YJhVuVNqzNDgR9A)

---

