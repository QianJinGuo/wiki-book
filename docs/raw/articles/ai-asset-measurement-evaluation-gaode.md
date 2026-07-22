---
source_url: https://mp.weixin.qq.com/s/X0ssweELGT6D0xU0p_LTwA
ingested: 2026-07-15
sha256: b2e2b5daa58bcbd43d137e651667a04a1a09adb40bcf5fa9ef33ada447e434f9
source_published: 2026-07-15
title: "如何构建一套完整的 AI 资产度量与评价体系？"
author: 信息业务中心
feed_name: 高德技术
---

高德技术团队提出的 AI 资产度量与评价体系，不以"AI 产出了多少"为度量核心，而以"人的投入减少了多少"为度量核心。

## 核心思想

价值公式：AI 资产价值 = 任务成功率提升 + 自主完成率提升 - 人工介入次数 - 人工介入时间 - 返工次数 - 手动接管率 - 错误恢复成本

三类资产各有侧重：
- Skill：少解释流程 + 少纠偏 + 稳定复用标准做法
- MCP：少手动操作 + 少工具错误 + 可靠完成外部动作
- 知识库：少查资料 + 少事实纠错 + 回答更有依据

## 三层评估模型

结果层（Outcome）——"好不好"：任务成功率、自主完成率、人工介入时间、返工率
过程层（Process）——"为什么"：Skill 遵守度、MCP 成功率、知识库命中率
证据层（Evidence）——"能不能信"：消息证据、置信度、unknown rate、人工反馈

三层逻辑严格：结果做决策，过程做改进，证据做校准。没有证据的结果指标，只是一个可能误导决策的数字。

## 度量误区

- 度量调用次数：高调用量可能是"反复重试"的信号而非价值信号
- 度量安装量：装了≠被触发≠被正确使用
- 度量采纳率：忽略"采纳后用户又花多少时间修 bug"
- 只看单次回答质量：用户可能在下一轮大量纠正

## 关键发现

安装量最高的 Skill，不一定是最有价值的。有些 Skill 的真正贡献是让 AI 少犯错——而不是让 AI 多调用。

基于 100 个 OpenCode 会话、5914 个项目的首轮分析发现：websearch MCP 调用 28 次（最多）但质量分仅 59；ast_grep 仅 5 次但质量分 82。codebase-structure Skill 显式加载 11 次但隐式影响 91 次。

## 技术架构

Phase 1：CLI 历史会话采集（最小成本建立基线）
Phase 2：插件级实时采集
Phase 3：MCP Proxy 观察
Phase 4：任务级实时评估

质量分析 Pipeline：确定性统计 + 语义判断（bounded context escalation）。计数类不用 LLM；判断类必须输出证据和理由；低置信度时扩展上下文再下结论。

人工反馈闭环：quality review cases → 人工审核 → 标注样本 → prompt/rubric candidate → 离线 replay → 人工批准 → active version

## 核心原则

最重要原则：不要把弱推断包装成强结论。系统可以输出 confidence 和 unknown，可以把证据摊开给人看，但不应该假装看见了所有过程。
最难衡量的资产可能是最有价值的——它让 AI 少犯错，而不是让 AI 多调用。
