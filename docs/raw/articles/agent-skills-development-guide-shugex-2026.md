sha256: 8cf8bd513d496de159338ea966a185c6cc74eda31e747a689a86b72e56129abd
---

name: pdf-processing
description: >
  Extracts text and tables from PDF files, fills PDF forms, and
  merges multiple PDFs. Use when working with PDF documents or
  when the user mentions PDFs, forms, or document extraction.
license: Apache-2.0
compatibility: Requires Python 3.10+ and the pdfplumber package.
metadata:
  author: someone
  version: "1.0"
allowed-tools: Read Write Bash
---

# PDF Processing

这里是指令正文……
```

### Frontmatter 字段约束表

| 字段 | 必需 | 约束 |
|------|------|------|
| name | 是 | 最长 64 字符；只能小写字母/数字/连字符；不能以连字符开头或结尾；不能连续连字符；必须与父目录名一致 |
| description | 是 | 最长 1024 字符，非空。描述 skill 做什么、何时使用 |
| license | 否 | 许可证名或指向打包的 license 文件 |
| compatibility | 否 | 最长 500 字符，环境要求说明 |
| metadata | 否 | 任意键值对，键名建议加前缀避免冲突 |
| allowed-tools | 否 | 空格分隔的预批准工具串（实验性） |

源码里的常量：MAX_SKILL_NAME_LENGTH = 64、MAX_DESCRIPTION_LENGTH = 1024、MAX_COMPATIBILITY_LENGTH = 500。

### name 校验细节

- 做 NFKC 归一化
- 不能大写
- 不能首尾连字符
- 不能出现 `--` 连续连字符
- 字符只能是 `isalnum()` 或 `-`
- 必须等于父目录名

### description 写法对比

✅ 好：Extracts text and tables from PDF files, fills PDF forms, and merges multiple PDFs. Use when working with PDF documents or when the user mentions PDFs, forms, or document extraction.

❌ 差：Helps with PDFs.

好的 description 同时覆盖做什么和何时触发，差的那种只说和 X 有关，agent 没法判断该不该激活。

## 4. 从零开发一个 skill

第一步：先真实地完成一次任务。从真实专长出发，而不是让 LLM 空想。

第二步：搭目录结构。

第三步：写 frontmatter。description 用祈使语气、列具体触发场景、覆盖用户没直接点名关键词的情况。

第四步：写正文。每段内容都问自己一遍 - 没有这条指令，agent 会搞错吗？答不会，删。

第五步：跑 validate。

```bash
skills-ref validate ./my-skill
```

## 5. 最佳实践的核心原则

### 从真实专长出发

项目特有材料而不是通用参考资料。

### 用真实执行来迭代

读 agent 执行 trace，不只看最终输出。每发现一次纠正，就把纠正加进 SKILL.md。

### 花好 context 预算

skill 一旦激活，整个 SKILL.md 进入 context window，和对话历史、system context、其他激活的 skill 抢注意力。

- 加 agent 缺的，省 agent 知道的
- 聚焦 agent 不知道的：项目约定、领域流程、不明显边界、特定工具/API

### 设计连贯单元

像设计函数：一个 skill 封装一个连贯、可组合的工作单元。

- 太窄 → 一个任务要加载多个 skill，开销 + 指令冲突
- 太宽 → 难精确激活

### 中等详细度

过度全面的 skill 反而帮倒忙 - agent 难提取相关部分，可能被不适用的指令带偏。简洁分步 + 可运行示例胜过详尽文档。

### 用渐进式披露组织大型 skill

SKILL.md < 500 行 / 5000 token，只放每次都要用的核心指令。详细资料移 references/。

关键细节：告诉 agent 何时加载哪个文件。

✅ Read references/api-errors.md if the API returns a non-200 status code
❌ see references/ for details

### 校准控制力

把指令精度匹配到任务脆弱性。

- 多种方法都行、任务容许变化 → 给 agent 自由，讲清 why 比死板规定有效
- 操作脆弱、一致性重要、必须按特定顺序 → 死板规定，写死步骤

### 给默认，别给菜单

多工具/多方法可行时，挑一个默认 + 简短提替代。别列等价选项让 agent 选。

### 偏好流程，而非声明

skill 应教 agent 如何处理一类问题，而不是为某个具体实例产出什么。

## 6. 高价值指令模式：六种好用的套路

### Gotchas 段（陷阱清单）

不少 skill 里价值最高的就是这一段。它装的是违反合理假设的环境特有事实，不是通用建议 - 是 agent 不被告诉就会犯的具体错误的纠正。

### 输出格式模板

需要特定输出格式时给模板，比散文描述可靠 - agent 对具体结构模式匹配很好。

### 多步工作流 checklist

显式 checklist 帮 agent 跟踪进度、防跳步，尤其步骤有依赖或验证门时。

### 验证循环

让 agent 在继续前验证自己的工作：do work → 跑 validator（脚本 / 参考 checklist / 自检）→ 修 → 重复直到通过。

### Plan-Validate-Execute

批量或破坏性操作专用：先让 agent 在结构化格式里出中间计划 → 对照 source of truth 验证 → 才执行。

### 打包可复用脚本

迭代时对比执行 trace，如果发现 agent 每次都独立重发明同一段逻辑 → 写一次测试过的脚本，打包进 scripts/。

## 7. Description 优化：让 skill 被正确触发

description 是触发 skill 的唯一信号，写得好不好直接决定 skill 会不会被用起来。

### 写好 description 的四条原则

1. 用祈使语气：Use this skill when... 而非 This skill does...
2. 聚焦用户意图，非实现：描述用户想达成什么，不是 skill 内部机制
3. 倾向 "pushy"：明确列出适用 context，包括用户没直接点名的情形
4. 保持简洁：几句到一小段。硬上限 1024 字符

### 触发 eval 设计

约 20 条 query 起步：8-10 条该触发 + 8-10 条不该触发。

最有价值的 should-trigger 是：skill 能帮但单看 query 不明显的。

最有价值的 should-not-trigger 是 near-miss：共享关键词/概念但实际要的不同的。

### 测试触发的工程做法

每条 query 用 agent 跑，观察是否调用 skill。模型非确定性 → 每条跑多次（3 次是合理起步），算触发率。

阈值用 0.5：
- should-trigger 触发率 > 0.5 算过
- should-not-trigger < 0.5 算过

### 防 overfitting：train / validation split

- Train 约 60%：用来识别失败、指导改进
- Validation 约 40%：撲置，只查改进是否泛化

两集都按比例混正负例。

只用 train 的失败指导修改，无论手改还是让 LLM 提议。validation 是最终裁判。

### 优化循环

1. 在 train + validation 上评估当前 description
2. 在 train 上识别失败
3. 修 description：
   - should-trigger 失败 → 太窄，拓宽范围 / 加 context
   - should-not-trigger 假触发 → 太宽，加特异性 / 划清边界
   - 别加失败 query 的具体关键词（那是 overfit），找它代表的一般类别
4. 几轮卡住 → 试结构性不同思路，而非渐进微调
5. 检查不超 1024 字符（优化中容易膨胀）
6. 重复 1-3 直到 train 全过或停止改进
7. 按 validation 通过率选最优迭代（最优未必是最后一个，早期可能更泛化）

经验值：5 轮通常够。

### 改造前后对比

```yaml
# Before
description: Process CSV files.

# After
description: >
  Analyze CSV and tabular data files — compute summary statistics,
  add derived columns, generate charts, and clean messy data. Use this
  skill when the user has a CSV, TSV, or Excel file and wants to
  explore, transform, or visualize the data, even if they don't
  explicitly mention "CSV" or "analysis."
```

## 8. 输出质量评估：用 eval 量化 skill 的价值

description 优化解决是否被激活的问题，这一节解决激活后输出好不好。

### 测试用例三要素

- prompt：真实用户消息
- expected_output：人类可读的成功描述（不是确切字符串，是描述）
- input files（可选）

存 evals/evals.json。

### with / without 对比模式

每个用例跑两次：with skill vs without skill（或旧版本），得基线。

每轮从干净 context 开始 - 有 subagent 能力的用 subagent（天然隔离），没有就用独立 session。

捕获 timing：记录 token 与时长。skill 大幅提质量但 token 翻倍，和既好又省，是完全不同的权衡，要分开判断。

### 写 assertion

先看首轮输出再写 assertion - 往往不知道好长什么样，直到看过。

好 assertion 的标准：可程序验证、具体可观察、可计数。

非一切都需要 assertion - 风格、视觉、感觉对这种难以拆解成 pass/fail，留人工 review。

### 评分（Grading）

每条 assertion 对实际输出证 PASS/FAIL + 具体证据。

PASS 必须有具体证据，不给 benefit of the doubt。

同时复查 assertion 本身：太易（总过）/ 太难（总不过）/ 不可验证 → 都要修。

### benchmark.json 汇总

```json
{
  "run_summary": {
    "with_skill":    { "pass_rate": {"mean": 0.83, "stddev": 0.06} },
    "without_skill": { "pass_rate": {"mean": 0.33, "stddev": 0.10} },
    "delta":         { "pass_rate": 0.50, "time_seconds": 13.0, "tokens": 1700 }
  }
}
```

delta 告诉你 skill 的代价（更多时间/token）和收益（更高 pass rate）。这两条放一起看才完整。

### 四种分析模式

1. 删 / 换两配置都总过的 assertion - 不反映 skill 价值
2. 查两配置都总不过的 - assertion 坏 / 用例太难 / 检查错对象
3. 重点研究 with 过 without 不过的 - skill 在哪增值、为什么
4. 结果跨 run 不一致 → 高 stddev → 可能 eval flaky 或指令歧义，加示例 / 具体指导

别忘了查时间/token 异常值，读执行 transcript 找瓶颈。

### 人工 review

人工捕捉 assertion 没覆盖的问题。每用例存 feedback.json，要具体可执行 - 缺轴标签是好反馈，看起来差是无用反馈。

### 迭代循环

三个信号源：
- 失败 assertion（具体缺口）
- 人工反馈（更广质量问题）
- 执行 transcript（why 出错）

把三者 + 当前 SKILL.md 给 LLM 提议修改，原则四条：
- 从反馈泛化（skill 用于很多 prompt，不只测试用例）
- 保持简洁（更少更好的指令常胜过详尽规则）
- 解释 why（reasoning-based > rigid directives）
- 打包重复工作（每次都重发明 → 进 scripts/）

循环：给信号 + SKILL.md → LLM 提议 → 人审应用 → 新 iteration → 评分 → 人审 → 重复。

## 9. 脚本工程实践：让脚本配得上 agent

skill 里经常会带脚本。using-scripts.mdx 把脚本使用分成了三档：一次性命令、引用 scripts、自包含脚本 - 外加一节专门讲为 agentic 使用设计的硬性要求。

### 一次性命令：能用现成的就别造

现有包直接做你需要时，在 SKILL.md 直接引用，无需 scripts/。多个生态有运行时自动解析依赖的工具：

| 工具 | 生态 | 备注 |
|------|------|------|
| uvx | Python (uv) | 缓存激进，重复跑近即时；需单独装 |
| pipx | Python | 成熟替代；OS 包管理器可用性更广 |
| npx | npm | 随 Node.js；下载运行缓存；pkg@version 锁版本 |
| bunx | Bun | npx 替代；仅 Bun 环境 |
| deno run | Deno | npm:/jsr: specifier；权限 flag 必需 |
| go run | Go | 内建于 go；@version/@latest |

一次性命令的工程提示：
- 锁版本（npx eslint@9.0.0）让行为随时间稳定
- 在 SKILL.md 声明前置条件（如 需 Node.js 18+），运行时级用 compatibility frontmatter
- 复杂命令移进 scripts/，测试过的脚本更可靠

### 引用 scripts

相对路径从 skill 根目录。在 SKILL.md 列出可用 scripts，然后在工作流里指示 agent 运行 - 别让 agent 自己猜有哪些脚本可用。

### 自包含脚本：内联依赖声明

不想强迫用户预装依赖的话，用自包含脚本，把依赖声明内联进文件本身：

| 语言 | 内联依赖机制 | 运行 |
|------|------------|------|
| Python | PEP 723（# /// 块内 TOML） | uv run script.py（推荐）/ pipx run |
| Deno | npm:/jsr: import | deno run |
| Bun | import 路径锁版本，无 node_modules 时自动装 | bun run |
| Ruby | bundler/inline 的 gemfile do | ruby script.rb |

Python 的 PEP 723 长这样：

```python
# /// script
# requires-python = ">=3.10"
# dependencies = [
#   "requests>=2.31",
#   "rich>=13",
# ]
# ///

import requests
from rich import print

# 脚本正文……
```

用 `uv run script.py` 跑，uv 会按 `# ///` 块声明临时建环境、装依赖、执行，零配置。

### 为 agentic 使用设计脚本：硬性要求

agent 读 stdout/stderr 决定下一步，脚本的设计选择直接决定它是否好被 agent 用。

**避免交互式提示（硬性要求）**

agent 在非交互 shell 运行，无法应答 TTY、密码、确认。脚本里出现交互提示会无限挂起。所有输入走 flag / env / stdin。

```python
# ❌ 坏：脚本挂起等输入
environment = input("Select environment: ")

# ✅ 好：缺失就给具体错误
# Error: --env is required. Options: development, staging, production.
# Usage: deploy.py --env ENV [--dry-run]
```

**用 --help 记录用法**

agent 了解脚本接口的主要方式就是 `--help`。它要含：简述、flags、示例。保持简洁 - 输出会进 context。

**写有用错误信息**

agent 收到错误，信息直接塑造下一次尝试。不透明的 Error: invalid input 浪费一轮。

好错误信息要说三件事：出了什么错、期望什么、该试什么。

**用结构化输出**

偏好 JSON / CSV / TSV 而非自由文本。可被 agent 和标准工具（jq/cut/awk）消费，便于管道组合。

数据与诊断分离：结构化数据 → stdout；进度 / 警告 / 诊断 → stderr。

**其他几条**

- 幂等性：agent 可能重试，create if not exists 比 create and fail on duplicate 安全
- 输入约束：用 enum / 闭集拒歧义输入
- dry-run 支持：破坏性操作给 `--dry-run`
- 有意义的退出码：不同失败类型不同码，记进 `--help`
- 安全默认：破坏性操作要显式确认 flag
- 可预测输出大小：许多 harness 会自动截断超阈值（10-30K 字符）的工具输出。大输出默认给摘要 / 合理上限，支持 `--offset` 翻页；或要求 `--output` flag 指定文件 / `-` 显式 opt-in stdout

## 10. 运行时怎么工作：开发者需要知道的部分

完整客户端实现指南在 adding-skills-support.mdx，那篇是给想给自家 agent 加 skills 支持的团队看的。作为 skill 开发者，不需要全部细节，但有几个点会影响你怎么写 skill。

运行时分 5 步骨架：发现（Discovery）→ 解析（Parsing）→ 披露（Disclosure）→ 激活（Activation）→ 管理（Management）。

### 发现：skills 放在哪里

客户端扫多个 scope（project 级、user 级，可选 org 级、内置）。每个 scope 内扫客户端专属目录 + `.agents/skills/` 跨客户端约定：

| Scope | 路径 |
|-------|--------|
| Project | `<project>/.<your-client>/skills/、<project>/.agents/skills/` |
| User | `~/.<your-client>/skills/、~/.agents/skills/` |

`.agents/skills/` 是跨客户端共享的事实约定 - spec 不规定 skill 目录在哪，只规定里面装什么。

部分实现也扫 `.claude/skills/`（项目级 + 用户级）以兼容现有 skill。

命名冲突的通用约定：项目级覆盖用户级。

信任考量：项目级 skill 来自当前仓库，可能不可信（刚 clone 的开源项目）。有些客户端会设信任门 - 只加载用户标记可信的项目级 skill。

### 解析：畸形 YAML 的容错

客户端解析 SKILL.md 时，常见的畸形是未加引号值含冒号。规范的做法是免底：包引号或转 YAML block scalar 后重试。

宽松验证策略：警告但不阻塞加载 -
- name 不匹配目录名 → warn 加载
- name 超 64 → warn 加载
- description 缺 / 空 → 跳过（披露必需）
- YAML 完全不可解析 → 跳过

### 披露：catalog 是什么样子

客户端构建 skill 目录（name + description + 可选 location），结构化格式皆可。skills-ref 的 to_prompt 输出长这样：

```xml
<available_skills>
  <skill>
    <name>pdf-processing</name>
    <description>...</description>
    <location>/home/user/.agents/skills/pdf-processing/SKILL.md</location>
  </skill>
</available_skills>
```

每 skill 约 50-100 token。

过滤行为：用户禁用 / 权限拒绝 / disable-model-invocation flag 的 skill 会从目录完全隐藏，而不是列出后在激活时阻塞。

无 skill 时：省略目录和行为指令，别显空 `<available_skills/>` - 会迷惑模型。

### 激活：两条路径

**模型驱动激活（主流）**：多数实现靠模型自身判断，不做 harness 侧关键词匹配。两种模式：

- File-read 激活：模型用标准文件读工具读 catalog 给的 SKILL.md 路径。最简，模型有文件访问即可
- 专用工具激活：注册 `activate_skill` 工具，吃 skill 名返回内容。模型不能直接读文件时必需，能读时也有用 - 可以控制返回内容（剥 / 留 frontmatter）、用结构化标签包内容、列 bundled 资源、强制权限、跟踪激活供分析

**用户显式激活**：用户应能直接激活 skill，不等模型决定。最常见形式是 slash 命令或 mention 语法（/skill-name、$skill-name），harness 拦截、查表、注入。

### 管理：context 压缩是个隐藏陷阱

这一步对开发者最重要的一点是 - 防 context 压缩伤 skill。

agent 截断 / 摘要旧消息时，应该豁免 skill 内容。skill 指令是持久行为指导，会话中途丢失会无声降级 - 模型继续操作但没了专门指令，无任何可见错误。

常见做法：把 skill 工具输出标 protected 让剪枝算法跳过；用结构化标签识别并在压缩时保留。

这就解释为什么 SKILL.md 要克制 - 越长越容易在边缘 case 被压缩算法误伤。

其他两条管理要点：
- 去重激活：跟踪当前会话已激活的 skill，重复激活时跳过重注入
- 子 agent 委托（高级，部分客户端支持）：skill 不注入主对话，而在独立子 agent 会话跑，子 agent 收指令、执行、返回摘要。适合 workflow 复杂到值得专一会话的 skill

## 11. 把开发、评估、迭代串起来

一个成熟 skill 的生命周期其实是三个嵌套的循环：

**触发循环（description）**

设计 description → 跑触发 eval（20 query × 3 次）→ 用 train 失败指导修改 → 用 validation 选最优迭代

**质量循环（SKILL.md 正文 + scripts）**

跑 with/without eval → 失败 assertion + 人工反馈 + 执行 transcript → 给 LLM 提议修改 → 人审应用 → 新 iteration → 评分

**实战循环（真实任务）**

对真实任务跑 → 读执行 trace → 纠正 → 加进 gotchas 或调整流程

三个循环不是线性的，会相互喂信号。

## 总结

最后给几条写作时反复用到的判断标准：

**关于格式** - 记住三个数字：64 / 1024 / 500（name / description / compatibility 的字符上限），以及 SKILL.md 的 500 行 / 5000 token 软上限。这些数字背后都是渐进式披露的 token 经济学。

**关于内容** - 每段都问一遍没有这条 agent 会搞错吗。从真实专长出发，不从 LLM 空想出发。Gotchas 段几乎总是高价值区。

**关于评估** - 没有 eval 的 skill 是盲盒。description 用触发率 eval，正文用 with/without 对比 eval，真实任务用执行 trace。三套信号缺一不可。

**关于生态** - Agent Skills 的 spec 还在演进，CONTRIBUTING.md 写明的原则是：加东西易、删东西难；每个新特性都给所有实现者增加复杂度；存疑时宁缺勿滥。所以读官方文档永远是第一手资料。

写 skill 这件事，本质上是把你脑子里那些没法言传的隐性经验，一条条翻译成 agent 能照着执行的显性指令。工具链现成、规范开放，剩下的就是反复打磨了。
