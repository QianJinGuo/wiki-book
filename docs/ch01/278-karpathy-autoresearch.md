# 我把 Karpathy 的 AutoResearch 搬到了软件开发领域，效果炸了

> 📊 Level ⭐⭐⭐ | 8.0KB

## 摘要

作者（鸟窝）把 Karpathy 的 AutoResearch 自主实验循环从 ML 训练搬到通用软件工程：输入只是一个 GitHub Issue 号，由 Codex 与 Claude 轮流担任实现者与审核者，按 5 维加权评分迭代，总分 ≥ 9.0 后自动提交 PR 并合并。实测中等复杂度的 Issue #21 用 3 轮迭代、约 10 分钟零人工干预达标。

## 核心要点

- Karpathy 的 autoresearch（2026 年 3 月发布，约 600 行 Python）给 Agent 一个单 GPU、5 分钟预算的真实训练环境，让它自主改 `train.py`、跑实验，只有 val loss 改善才 commit，退化就 git revert。
- 内核只有三条：量化目标、自主循环、只保留改进，每小时约 12 次实验。
- 迁移的关键动作是把 `val loss → train.py → 5 分钟实验 → git revert` 换成 `5 维加权评分 → 业务代码 → 跑测试与 lint → 交叉审核反馈`。
- 三处改造区别于原版与 Ralph Wiggum 循环：多 Agent 交叉审核替代单 Agent 自审、5 维评分替代单一 metric、审核反馈注入下一轮提示词。
- 评分权重为正确性 35%、测试 25%、代码质量 20%、安全 10%、性能 10%，达标线 9.0；单维按无问题 10 / 建议 9 / 一般 7 / 严重 4 / 致命 1 分档。
- 权限边界写在 `program.md`：Agent 可改 `internal/`、`cmd/` 与测试，不可改 `go.mod`、CI/CD，不可删除文件、push 或关闭 Issue——远程副作用由 `run.sh` 统一收口。
- 可靠性靠编排层而非模型自觉：退避重试（上限 60 秒 / 10 次）、连续失败 ≥ 3 次熔断、全量过程日志可回溯。

## 深度分析

### AutoResearch 的内核：把「改进」压缩成一个可测的标量

Karpathy 在 2026 年 3 月放出 autoresearch，几天内 GitHub 5 万+ 星、视频 860 万播放，但项目本身只有约 600 行 Python。真正的创新是把「什么是更好」这个原本依赖研究品味的问题压缩成单一标量 val loss。判据一旦是标量，保留与回滚两个决策就能完全交给机器执行，人退到只维护章程（`program.md`）的位置上。

这套设计有隐含前提：环境真实但便宜、实验可重复、回滚无成本。三者齐备时循环的边际成本趋近于零；反过来，凡无法把进步量化成可比较数字的领域，这套循环就不成立。

### 移植路径：单标量变成 5 维评分，自审变成他审

软件质量是多维的——功能对不对、测试够不够、代码规范不规范、有没有安全洞、性能有没有坑——没有一个数字能同时承载。作者的解法是用加权总分替代 val loss：五个维度按 10/9/7/4/1 五档打分后加权求和，总分 ≥ 9.0 才放行，门槛仍可自动执行，只是从标量变成向量投影出的分数。

第二处改造是角色分工：原版与 Ralph Wiggum 循环都是单 Agent 自己改自己评，缺少外部视角；本项目让 Codex 与 Claude 轮流做实现者与审核者，奇数轮 Codex 先审后写、偶数轮反过来，同一轮的实现与审核永远由不同模型承担。第三处改造是记忆接续——Ralph Wiggum 每轮都是独立上下文、忘了上轮犯的错，本项目把审核意见喂进下一轮提示词，Agent 拿到「上轮哪里不合格」，循环因此从重试变成收敛。

### 让循环安全的底座：宪法文件、权限边界与熔断

真正的工程含量在编排层。`program.md` 充当宪法，定义实现规则、权限边界、代码规范（Effective Go + gofmt/goimports/golangci-lint）与测试规范（覆盖率 ≥ 70%、表格驱动）；`agents/codex.md`、`agents/claude.md` 写死角色指令与评分标准。

流程分四阶段：Phase 1 一次性做环境准备；Phase 2 是完全自主的迭代核心，占几乎全部时间；Phase 3 在评分达标后自动 commit、push、`gh pr create`、`gh pr merge`；Phase 4 归档进 `results.tsv` 与 `workflows/issue-N/log.md`。把不可逆的远程动作收口到编排脚本而非留给模型裁量，是最像生产系统的地方；容错同样在编排层——退避重试、熔断、测试失败转反馈而非终止，与模型有多聪明无关，保证的是循环不会失控。

### 增益来源与失效边界

收益可以拆成三块：人的参与次数从「每一轮」降到「一次」；质量判断被外化成 `log.md` 里可观测的评分曲线；审阅者与实现者是不同模型时，能捕获同一模型自审时系统性忽略的问题。时间账上，中等复杂度 Issue 约 10 分钟 3 轮达标。

但分数达标不等于代码真的达标。评分标准由同一批模型制定并执行，判据与被判对象同源，存在自我参照风险；Issue #6 出现「15/10 超满分」，说明分档在顶端已经失真，分数成了通胀信号而非质量信号。第二层风险是缺少硬回滚：原版用 git revert 提供确定性保护，本项目把回滚交给「模型自己足够聪明」，小改动无碍，但工作树膨胀后退化很难被一个总分捕捉。

由此推出适用范围：目标可被测试与评分覆盖、改动边界清晰（bugfix、增量 feature）时循环成立；任务本质是架构决策、跨模块取舍或涉及外部系统副作用时，测试与评分覆盖不到真正的成败，循环只会产出高分但方向错误的代码。三层谱系印证这一点——ML 研究 metric 客观可全自主，Skill 优化需人判断故每轮暂停确认，软件开发居中，多数自动但保留关键节点介入。

## 实践启示

1. 从可自动判定的任务切入：先用 bugfix 类 Issue 验证流程，稳定后再上 feature 与重构。
2. 把质量标准写成文件而非留在口头提示里：`program.md` 是可版本化的约束，评分不符预期就改它。
3. 实现者与审核者必须是不同模型：同一模型自审给不了外部视角，交叉审核是质量增量的主要来源。
4. 把不可逆动作收口到编排脚本：Agent 只做本地 commit，push / PR / merge 由 `run.sh` 执行。
5. 盯评分轨迹而不是最终分数：分数冲到上限却伴随改动膨胀，那是通胀而非质量提升。
6. 为覆盖不到的目标保留人审节点：真正风险在架构或产品方向时改成暂停确认。

## 相关实体

- [AutoResearch 多 Agent 软件开发](https://github.com/QianJinGuo/wiki-public/blob/main/entities/autoresearch-multi-agent-software.md)
- Karpathy AutoResearch 循环与 Harness 优化
- [同题异语种孪生页（归并候选）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/我把-karpathy-的-autoresearch-搬到了软件开发领域效果炸了.md)
- [Verifier-Driven Development](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/verifier-driven-development.md)
- [多 Agent 协作模式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/multi-agent-collaboration-patterns.md)
- [Harness 循环架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-loop-architecture.md)

→ [原文存档](https://mp.weixin.qq.com/s/BPviViv47rZRt0feiONYqg)

---

