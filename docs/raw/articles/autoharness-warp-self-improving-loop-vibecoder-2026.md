---
title: "AutoHarness：Warp 的 Agent 自我改进循环"
source_url: "https://mp.weixin.qq.com/s/7fiBKA6EUuSrusehmPazWQ"
source_account: "Vibe编码（VibeCoder）"
source_type: "wechat"
ingested: "2026-08-27"
sha256: "d58a4b97c15db93d7de8b1ea6f9f58f3afffd02319336a0305395fa138f04b30"
tags: [autoharness, warp, self-improving-agent, skill, versioning, evaluation, anthropic, agent-loop, self-improvement]
type: raw
---

# AutoHarness：Warp 的 Agent 自我改进循环

> 来源：Vibe编码（VibeCoder）| 2026-08-27 入库 | v=7 c=5 v×c=35 Raw only

"Self-improving Agent"让人联想到模型在线训练、自动改权重，但 Anthropic 的 Warp 案例讲的不是这些。把官方文章、Warp 公开 demo、PR #21 和当前开源实现放在一起看，结论很清楚：**持续变化的是版本库里的 Skill 与相关配置**。Claude 负责执行任务、归纳反馈和生成候选修改；Git、评测、权限与人审决定修改能否进入生产。

## 这套系统想解决什么
Warp 的代码审查、Issue triage 等 Agent 反复处理相似任务。第一版 prompt 即使覆盖大部分情况，尾部错误仍制造噪声；继续手工补 prompt 或 AGENTS.md 会让规则越来越难追溯。解法：把团队知识放进文件化 Skill，再让另一个 Agent 定期观察历史反馈提出小范围修改。一次纠正经审核与合并后，才会影响未来任务。

## 两个时钟，两个 Agent Loop
- **任务内环**：新 Issue 出现时运行。Agent 加载当前 base Skill，读 Issue 与仓库，输出分类、标签、评论。公开 demo 加入隐藏版本 marker，让后续纠正归因到具体版本。
- **改进外环**：按计划批量运行。比较 Agent 当时判断与维护者后来的改标签、重新打开、明确纠正，寻找跨案例重复差异。证据足够时生成最小 Skill diff；证据不足不改。候选修改进 PR，人工合并后下一次任务才加载新版。

作者称之为**异步的配置优化与发布系统**：任务 Agent 负责当前工作，improver 总结可复用原则，维护者掌握 merge 权。两个时钟分开，单次噪声不会立刻污染生产规则。

## Skill 为什么是合适的改进载体
Skill 是含说明、元数据、脚本和参考资料的目录。Anthropic 采用渐进披露：启动时只暴露名称和描述，匹配任务后读 SKILL.md，需要时再加载资源。修改结果是普通 diff，可绑定版本、代码评审和回滚；稳定契约、仓库经验与确定性脚本分层保存。

## PR #21 证明了什么
公开 PR #21 是这篇案例最硬的机制证据：检查 Issue #16 到 #20，发现 5 次判断中 4 次被人类纠正，把差异压缩为 3 条可泛化规则，diff 仅 8 行新增、6 行删除，提出把 Skill 从 v1 升到 v2。improver 没有逐条记住五个 Issue，而是提炼团队以后能复用的判断原则。
**研究时 PR #21 仍是 OPEN**，仓库 main 仍加载 v1，无 v2 在 holdout 或线上流量上的结果。它证明 Agent 能生成**可审计的候选修改**，没证明修改已部署，更没证明质量已提高。

## 当前公开实现增加的护栏
博客配套 demo 是简化版。Warp 当前公开的 `warp` 与 `oz-for-oss` 代码显示控制面更严格：workflow 默认每周运行、回看最近 7 天；确定性 Python 脚本采集 triaged Issue 的标签变化、reopen 和组织维护者评论，排除 PR；closed-as-duplicate 交给单独 dedupe 回路避免学习目标污染；核心 triage-issue Skill 保持只读，仓库经验写入 triage-issue-local companion；多个 Issue 支持同一模式或一条非常明确的维护者陈述才触发修改；runner 在 push 前检查 diff 路径，越界就终止。
作者认为靠谱之处正在这些确定性边界：提示词里"不要越权"只是软约束，路径白名单、最小 GitHub 权限、人工审批、可回滚版本才是硬控制。

## 自我改进的准确边界
公开材料没有训练作业、梯度、微调、adapter、checkpoint 或参数发布链路。新知识通过下一次推理加载的 Skill 进入上下文，**基础模型权重未被改写**。也不同于当前会话 reflection（任务内重试发生在一次 run 中，Warp 变化要等 PR 合并后生效）。能变化也不代表单调变好：反馈可能偏置/冲突/过时，少量样本易过拟合，新规则可能修好一个失败簇又让相邻任务退化。

## 真正缺失的是效果闭环
原文给了架构路径、最佳实践和厂商规模数字，却**没有改进前后的准确率、人工纠正率、成本、延迟、样本量或显著性**。最大缺口是候选 Skill PR 缺少公开的固定回归结果。一条可上线的链路应经过静态检查、历史失败 replay、未参与改写的 golden holdout、多次 trial、成本预算、人审、canary 和回滚。评测既要看人工改标率和误报漏报，也要看 time to merge、token 与 reviewer 成本。

## 最小实验建议
固定模型/harness/权限/任务分布，从历史运行选 3-5 个高频失败簇；用于写规则的样本和 holdout 分开；对比 vN 与 vN+1 的人工纠正率、失败率、成本；每个候选 diff 跑语义相关最小回归 + 全局 canary；holdout 无收益就停止叠规则。反馈源从明确纠正、maintainer relabel、测试失败等高置信信号开始，尽早核算减少的返工是否高于 observer 与人工 review 成本。

## 与 Claude Code、Cursor 和 OpenClaw 的关系
Claude Platform 提供模型能力；Warp Agent/Claude Code/Cursor Agent/OpenCode 是任务执行 harness；Skills/Rules/AGENTS.md 是可持久工件；Oz 与 Warp Factories 负责调度、轨迹、权限、评分和发布。广义 Factories 把 model/harness、context、Skill、MCP 可用性都视作可评测旋钮；这篇 triage 案例只能直接证明 Skill 更新。OpenClaw 官方文档也有 self-learning（即时修补/后台复盘/proposal/扫描/回滚），差异在治理与场景：Warp 面向团队 Git 工作流（批量慢外环+PR 人审），OpenClaw 偏个人/工作区长期 Agent。

## 总结
Warp 最值得借鉴的设计：**把人类纠正编译成可治理的软件工件**——先让任务结果可归因，再聚合高置信反馈；先生成候选 Skill diff，再用评测和人审决定是否发布；合并后才影响下一次运行。这里的 self-improving 修饰的是 Agent 系统配置，不是 Claude 模型权重。
