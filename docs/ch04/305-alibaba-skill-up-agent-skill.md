# Alibaba Skill-Up：声明式 Agent Skill 评测框架

## Ch04.305 Alibaba Skill-Up：声明式 Agent Skill 评测框架

> 📊 Level ⭐⭐ | 8.9KB | `entities/alibaba-skill-up-agent-skill-evaluation-framework-2026.md`

# Alibaba Skill-Up：声明式 Agent Skill 评测框架

> **Background**：本文档基于阿里巴巴官方博客文章，系统整理了 Skill-Up 评测框架的设计理念、核心能力与落地实践。参考了阿里技术公众号文章及相关开源仓库信息。

## 核心问题

Agent Skill 兴起后，"写一个能跑起来的 Skill"已不困难，但"它到底好不好用"缺乏标准化回答手段。Skill 是 prompt、文件与工具配置的组合，对模型版本、引擎实现、输入措辞高度敏感，却长期缺少一种"声明一次、随时回放"的方式来固化行为预期。预期没有被显式写下来时，Skill 质量只能靠肉眼检查和人工记忆维护。

三个典型痛点场景：
- **Skill 悄悄退化**：同事改了 SKILL.md 描述后，Skill 在某些输入下不再调用预期工具，退化成了纯文本回答，代码评审未察觉
- **跨引擎行为不一致**：同一 Skill 在不同 Agent 引擎上表现不同，但缺乏系统验证手段
- **评测逻辑散落**：评测语义散落在多个脚本中，本地一套、CI 一套，新增用例要同时改多处

## 设计概览

skill-up 是阿里巴巴开源的独立 CLI 评测框架。目标：用声明式配置，让 Agent Skill 的每一次迭代都可被验证、可被回归。

一份最小 `eval.yaml`：
```
schema_version: v1alpha1
environment:
  type: none
engine:
  name: claude_code
cases:
  files:
    - evals/cases/create_plan.yaml
  defaults:
    timeout_seconds: 300
    max_turns: 10
```

每条用例是一份独立的 `case YAML`，描述输入、期望检查和判定方式。

## 四大核心设计

### 1. 声明式评测配置
评测的环境、引擎、模型、用例、判定策略全部写在 YAML 里。读者打开 eval.yaml 和 case YAML 就能看清结构。新增一条用例往往只需新增一份几十行的 YAML。

### 2. expect + judge 分层判定

skill-up 把断言拆成两层：
- **expect**：本地零成本确定性检查（文件是否存在、输出是否包含关键词、退出码是否为零），作为门槛先跑
- **judge**：通过 expect 后才执行的深层判定。提供三种策略：`rule_based`（规则匹配）、`script`（脚本退出码）、`agent_judge`（评审 Agent 做语义判断）

分层避免大模型偶发抖动直接阻断 CI 流水线——大部分失败在本地阶段就被拦截，无需消耗 token。

### 3. 多引擎支持
内置对 claude_code、codex、qodercli、qwen_code 的适配，切换引擎是一个命令行参数。Skill 安装、CLI 调用、产物收集由框架统一处理。同一份评测集在多个引擎上跑完，取最大公约数即为 Skill 真正稳定的行为边界。

### 4. 结构化 CI 友好报告
输出报告在 Schema 上与 Anthropic 评测产物兼容，额外提供 JUnit XML 和 HTML 报告。全流程通过退出码反馈结果，可直接接入 CI 作为 PR 合并门禁。

## 多轮会话评测

从"一问一答"到"真实交互"：skill-up 支持在同一用例里定义多条连续用户消息，逐条发送给 Agent，并在每条回复后检查结果。

多轮评测四个关键能力：
1. **真实会话保持**：每轮在同一个 Agent 会话中，Agent 能看到所有之前对话
2. **逐轮质量门控**（`post_condition`）：每轮回复后立即检查，不达标可早停省 token
3. **跨轮值传递**：用正则从某轮回复提取 token，自动填入后续消息
4. **精确到轮的最终判定**：既能断言某轮回复必须包含某关键词，也能验证某轮是否调用某工具

post_condition（过程门卫）和 judge（最终裁判）的分工：前者只看当前轮值不值得继续，后者看完整对话记录后给出整场结论。

## 重型端到端评测

有一类 Skill 评测和"给一段 prompt、看回复像不像对的"有本质区别，以"代码工程升级"类 Skill 为例，具备四个特征：依赖真实运行环境、输入是代码仓库而非文本、判定在产物层面（逐行 diff）、单条用例耗时长（可能几十分钟）。

skill-up 用**逐层收窄的判定漏斗**承接此类场景：
1. **expect**：最便宜、最确定的信号；不达标立刻失败
2. **证据脚本**：产出确定性 diff 的 JSON 输出
3. **agent_judge**：当代码不完全相同时，结合 diff 判断差异是否合理

进一步提供 **judge-agent with skill** 能力：给评审 Agent 单独安装一个评测专用 Skill，复杂判据、领域知识、反例沉淀到 judge Skill 里。judge Skill 只安装给评审 Agent，不安装给被测 Agent，保证评测语义隔离。

## 落地案例：1200 行手搓脚本 → 一份声明

集团内部迁移实证：原本约 623 行 Shell + ~300 行配置解析 + 上百行 CI 编排（合计 ~1200 行）的重型端到端评测流水线，迁移到 skill-up 后，通用编排逻辑删除，仓库只保留业务特有的用例清单、评测声明、证据脚本。

迁移前后对比：

| 维度 | 迁移前 | 迁移后 |
|------|--------|--------|
| 通用执行编排 | 多个 Shell，数百行 | 删除，框架承接 |
| 判定方式 | 结论解析脚本 + 源码 diff 硬判 | expect + 证据脚本 + agent_judge |
| 引擎支持 | 仅锁定单一引擎 | 一个参数切换多引擎 |
| 本地/CI 一致性 | 两套独立逻辑 | 共享同一份评测声明 |
| 快速失败 | 无 | expect 失败即跳过昂贵阶段 |
| 新增用例成本 | 改 CI 配置 + 确认脚本兼容 | 新增一份约 40 行的 YAML |

**最有价值的洞见：** "过去评测产物躺在 CI 制品里，想看结果要进 CI、找构建、下载、解压、读 JSON——这个门槛对创建者本人还能接受，对团队其他成员来说太高。迁移后，HTML 报告发布成可访问链接，评审、验收、争议解决都可以直接甩链接。评测只有被看见才有价值，而被看见的前提是路径足够短。"

## 上手路径

两条路径：
- **A：Agent 自动生成** — 内置 skill-upper（一个 Agent Skill），让 Agent 读取 SKILL.md 后自动生成 evals/eval.yaml 和用例文件
- **B：纯 CLI** — 适合精细控制和 CI 场景

## 对比

与 [AgentEval](../ch03/046-agent.html)（另一 YAML 驱动的 Agent 评测框架）相比，skill-up 有明显不同的定位：
- AgentEval 是通用 Agent 评测框架（Go 语言，pass@k+pass^k 双指标）
- skill-up 专为 Agent Skill 设计，聚焦 Skill 安装、跨引擎回放、工具调用验证
- skill-up 的多轮会话评测和 judge skill 能力是独特亮点

与 [Agent Skill 评估与迭代](ch04/264-agent-skill.html)（侧重于手动测试方法论）相比，skill-up 提供了完全自动化、CI 可集成的工程化方案。

## 相关实体

- [AgentEval：YAML驱动的Agent评测框架](../ch03/046-agent.html)
- [Agent Skill 评估与迭代](ch04/264-agent-skill.html)
- [Agent 可靠性工程：Skillify 与持续改进](ch04/266-skill.html)
- [Agent 评估系统指南](../ch03/046-agent.html)
- [SWE-bench Agent 评估](ch04/664-swe-bench-agent.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/alibaba-skill-up-agent-skill-evaluation-framework-2026.md)

---

