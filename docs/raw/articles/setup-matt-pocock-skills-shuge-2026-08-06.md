---
source_url: https://mp.weixin.qq.com/s/Xyf370f3UX2AOaZkogYMSA
ingested: 2026-08-06
sha256: c51498f2e5e68c329a7610025b42e8a5a0ab97131cb176fc048848cc26e63828
title: "把 Matt Pocock 工程 skill 装进仓库：setup-matt-pocock-skills 完整拆解"
author: 术哥无界 (ShugeX)
source: 术哥无界
type: raw
tags: [agent-skills, matt-pocock, skill-setup, engineering-flow, config]
---

# 把 Matt Pocock 工程 skill 装进仓库：setup-matt-pocock-skills 完整拆解

> 术哥无界系列实战文档第 188 篇，AI 编程最佳实战「2026」系列第 67 篇。
> 原始来源：https://mp.weixin.qq.com/s/Xyf370f3UX2AOaZkogYMSA

## 核心定位

setup-matt-pocock-skills，官方定位一句话：**Run once per repo before using the other engineering skills**（每个仓库跑一次，之后再用其它 engineering skill）。它不教你怎么写 issue、怎么 triage，只做一件事：把三个配置决策一次性落地（工单在哪、标签叫什么、文档放哪），让后面的 skill 都有确定的读写位置。

**它写配置，不硬编码行为**（It writes config, it does not hard-code behaviour）：脚手架是确定性的（输入参数吐模板）；setup 是 prompt-driven 的对话——先 explore 真实仓库状态，把发现摆给你看，每个问题都带推荐答案，你确认后它才写入。能推断出来的它直接跳过。

对话起点不在模板里，在仓库本身的真实状态：`git remote -v`、`.git/config`、AGENTS.md 和 CLAUDE.md 是否存在、CONTEXT.md、.scratch/ 目录、monorepo 信号。这些探测结果决定它接下来问什么、怎么推荐。

**只能由用户主动触发**：输入 `/setup-matt-pocock-skills`，agent 才会跑。它不会在调用别的 skill 时偷偷自动执行——Matt Pocock 整套设计里「user-invoked 而非 model-invoked」哲学的一部分。社区评价：这种设计让 skill 存在本身几乎不占上下文。

## 完整流程（以 team/backend 仓库为例）

### 第一步：先 explore，再开口

输入 `/setup-matt-pocock-skills` 后 agent 先做侦察：

```bash
# 看 remote 指向哪，判断 issue tracker 候选
git remote -v
cat .git/config
# 看有没有既有的 agent 约定文件
ls AGENTS.md CLAUDE.md
# 看有没有域文档 / scratch 目录 / monorepo 信号
ls CONTEXT.md .scratch/ pnpm-workspace.yaml
ls packages/
```

案例结果：origin 指向 GitHub（候选成立）；无 AGENTS.md/CLAUDE.md；有 .scratch/（本地 markdown issue tracker 约定在用）；无 monorepo 信号。**先 explore 再提问，是 setup 和「套模板」的分水岭。**

### 第二步：Section A，issue tracker 四选一

默认姿态：git remote 指向 GitHub 时 agent 直接提议 GitHub（gh CLI）。三个分支：
- **GitLab**：remote 指向 GitLab，用 glab CLI
- **本地 markdown**：写到 .scratch/<feature>/，适合 solo 开发或没有 remote 的仓库
- **其它**：Jira、Linear 自由描述，agent 记录成文本

产物落盘 `docs/agents/issue-tracker.md`：包含 Issue tracker 类型 + Conventions（create/read/list/comment/labels/close 的 gh 命令模板 + "Infer the repo from git remote -v"）。这份文件就是给 to-tickets 这类 skill 读的——它不需要自己猜工单在哪。

### 第三步：Section B，triage labels 只在 triage 已装时出现

**只有 triage skill 已经安装，setup 才会问这一段**；没装直接跳过，也不生成 `docs/agents/triage-labels.md`。默认方案：五个 canonical 角色标签。

> needs-triage、needs-info、ready-for-agent、ready-for-human、wontfix

这 5 个标签串起来是一条 issue 流转路径：新 issue 挂 needs-triage → 缺信息转 needs-info → 信息齐了变 ready-for-agent → agent 做完交给人的是 ready-for-human → 决定不做的进 wontfix。triage skill 读这份配置按标签决定行为，不凭空建标签。用户否掉默认时 agent 收集 override（如 bug:triage 带前缀命名）。**关键是语义对齐：标签名在配置里是什么，triage 就按什么执行，不重复建、不乱猜。**

### 第四步：Section C，domain docs 默认 single-context

默认值很强：**single-context，直接写基本不询问**——根目录一份 CONTEXT.md + docs/adr/ 放架构决策记录，几乎适配所有仓库。只有探测到 monorepo 信号（pnpm workspace 等）才 offer multi-context：根 CONTEXT-MAP.md + 每个 context 一份 CONTEXT.md。

产物 `docs/agents/domain.md`：Before exploring, read these（CONTEXT.md / CONTEXT-MAP.md / docs/adr/）+ "If any of these files don't exist, **proceed silently**——/domain-modeling skill 会在术语或决策真正落定时惰性创建" + File structure 示意。

为什么 setup 管这件事：grill-with-docs、domain-modeling 都要读 CONTEXT.md 才知道去哪找共享语言。README 例子：某课程系统里"一节课程内的 lesson 变成真实文件"反复描述要好几句话，起名 materialization cascade 后每个会话提一次就够——**精确术语省下的 token 每次会话都在复利**。

### 第五步：写入 Agent skills 块，装完

三件套产物里 issue-tracker 和 domain 必写，triage-labels 只在 triage 装过时写。最后把配置的"索引"写进仓库 agent 约定文件。

文件选择规则：**CLAUDE.md 存在就编辑它，否则用 AGENTS.md，两者都没有就问用户，绝不两个都建，绝不在已有 CLAUDE.md 时新建 AGENTS.md**。案例选了 AGENTS.md（团队在 Anthropic 和别家工具间摇摆，用中立 AGENTS.md 更通用），追加 `## Agent skills` 块（Issue tracker / Triage labels / Domain docs 三节，各指向 docs/agents/*.md）。

到这一步配置才真正"接通"：to-tickets 读 issue-tracker.md 知道工单放哪；triage 读 triage-labels.md 知道标签语义；grill-with-docs 读 domain.md 知道去哪找材料。**setup 的角色就是这座桥。**

## 三 section 对照表

| Section | 默认 | 分支 | 产物 |
|---------|------|------|------|
| A. Issue tracker | GitHub（gh CLI，remote 指向 GitHub 时直接提议） | GitLab（glab）/ 本地 markdown（.scratch/<feature>/）/ 其它（Jira、Linear 自由文本） | docs/agents/issue-tracker.md |
| B. Triage labels | 仅 triage 已装时运行；默认 5 标签 | 用户否掉时收集 override，避免 triage 重复建标签 | docs/agents/triage-labels.md |
| C. Domain docs | single-context（根 CONTEXT.md + docs/adr/），直接写不询问 | 仅 monorepo 信号时 offer multi-context | docs/agents/domain.md |

跨 section 落点：CLAUDE.md（优先）或 AGENTS.md（其次）里的 `## Agent skills` 块——配置的目录页，让 agent 第一次进仓库就知道去哪些文件找答案。

## 装没装好？四步检查（30 秒）

1. **三件 docs 都在**：docs/agents/issue-tracker.md、docs/agents/domain.md 存在；triage 装了的仓库还要有 docs/agents/triage-labels.md
2. **Agent skills 块在**：CLAUDE.md 或 AGENTS.md 里有 `## Agent skills`，且指向上面三个文件
3. **标签语义一致**：仓库实际标签和 triage-labels.md 写的一致，triage 不需要临时新建
4. **域文档布局确定**：CONTEXT.md 和 docs/adr/ 的位置命名已约定，不会每次问"放哪"

反向信号：to-tickets 开始猜 issue 位置、triage 在套不存在的标签 → setup 没跑过，或配置被删了。官方文档把这类现象当作 setup 缺失的失败信号。

## 四个反例

- **反例一：不 explore，直接套 GitHub 模板**。仓库其实用 .scratch/ markdown 记工单，结果 to-tickets 拿着配置调 gh 一个 issue 也建不出来。setup 先看 git remote 和 .scratch/ 再问，避免"配置与仓库事实脱节"。
- **反例二：triage 没装，硬写 labels 配置**。配置没人读，标签建了是摆设；等真装 triage 又可能和手写配置打架。
- **反例三：单仓库硬上 multi-context**。维护成本翻倍，agent 反而不知道该读哪份。没有 monorepo 信号就默认 single-context，少即是多。
- **反例四：AGENTS.md 已存在，又新建 CLAUDE.md**。两个文件并存 agent 约定分裂。先看哪个已存在优先编辑它，绝不同时新建两个。

## 与系列其它篇的关系

**setup 是所有 engineering flow 的 precondition**。to-tickets、triage、grill-with-docs 全部依赖 docs/agents/*.md 里的配置——这些 skill 是"读配置执行"的，不是"自带配置"的。没有 setup 它们就像没插电源的电器。

setup 跑一次就够了，不需要每次开会话都跑。重跑只在两种场景：团队换了 issue tracker（如 GitHub 迁到 Linear）；配置乱到想推倒重来。日常微调直接编辑 docs/agents/*.md。

边界：setup 只把"工单在哪、标签叫什么、文档放哪"三个事实写对。代码质量、需求是否清晰、团队是否真的按标签流转，它管不了。

社区批评：知乎有人指出这套配置**没有全局继承机制**——一堆仓库都用 GitHub Issues，每个仓库都得重新跑一遍 setup 确认这个事实，多仓库场景下有重复劳动。

## 数据来源

基于 Matt Pocock Skills 源码（github.com/mattpocock/skills）中 setup-matt-pocock-skills、triage、ask-matt、grill-with-docs、to-tickets 等 skill 的 SKILL.md 与种子模板整理，并结合社区公开讨论。

（End）
