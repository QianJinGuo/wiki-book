---
title: "Agent 越改越乱之后：用评测和轨迹把 Skill 拉回来（结果驱动 Skill 自进化系统）"
source_url: "https://mp.weixin.qq.com/s/h0ZsF5FdYZ_j5XrGmHBdXw"
author: 孙成心（sumsec.me，代码安全工程师）
platform: WeChat
ingested: 2026-08-13
slug: sunchengxin-skill-evolution-results-traces-2026
sha256: 3c960498d8ff2b702ab83f9ca2845c50080f328bddec6e575dbdd85dd9f0205e
---

公众号「孙成心」（代码安全工程师，sumsec.me）实践文：把"改 skill"变成可重复流程，让 agent 完成任务的能力沿评测结果自己往前走。代码安全审计场景（二元输出 true/false，适合结果驱动自进化）。

## 核心设计：五步闭环 + 工程纪律

1. 跑一批测试任务，看 agent 在哪些 case 上做错
2. 自动分析为什么做错（确定性规则，非 LLM 猜测）
3. 自动生成 patch 改 SKILL.md
4. 改完验证（确保改好这个、没搞坏那个）
5. 验证通过接受，不通过丢弃 + 记黑名单

**关键定位**：这不是"AI 自己教自己"——LLM 只负责把诊断结果写成候选修改；诊断、验证、回滚、黑名单等容易出事故的环节都交给可复查的规则。"不假设模型会突然变聪明，只是把它容易犯糊涂的地方收进工程约束里。"

**适用判据**：任务的输出能否被客观判定对错（唯一标准）——二元/收敛结论任务（垃圾邮件/漏洞/金额抽取）适合；开放式任务（写文案/总结）不适合。

## 输入数据：结果与过程缺一不可

- **results.jsonl**：每行一个 case 结果（case_id / ground_truth / judge_verdict / pass_fail / failure_kind FN|FP）
- **sessions/<case_id>.jsonl**：agent 操作日志（assistant 消息 + tool_calls + tool 结果）

来源：sec-code-bench 平台（FastAPI + SQLite 自建评测平台，OpenAPI 对接真实任务运行环境——评测在真实环境跑，模型/工具链/代码环境与日常一致，避免"实验室假象"）。

## 真实数据：进化前后

63 case 营销漏洞评测集，同 agent（claude-code-biz-vul）：
- Kimi 77.8% → 84.1%（修 10 个错、新增 6 错，净 +4）
- GLM 77.8% → 88.9%（修 9 错、新增 2 错，净 +7）
- DeepSeek 82.5% → 84.1% → 87.3%（净 +2）

"总分掩盖细节：自动迭代确实能拉回稳定失败 case，但修复和回归经常一起发生"——guardrail gate 就是拦逐 case 新错误。

## 真实 case 流程（biz-vul-037 稳定漏报）

- trace_parser 把 28 万 token session 压成几千 token 结构化摘要（tool_calls_total/breakdown/errors/steps_claimed/steps_evidenced/conclusion）
- 关键信号：声称走 STEP 3（追调用链）但 session 无证据 → 规则命中 progress_mismatch + 结果 FN → 根因：调用链没追到 ServiceImpl 层
- 同根因覆盖 5 个失败 case（38% > 30% 聚合门槛）→ 触发进化
- patch_engine 生成小 diff（STEP 3 追加"必须用 Grep 追到 ServiceImpl/Processor 层"）
- 过全部 gate 后写入 iterations/v3/

## 反直觉设计 1：诊断不用 LLM

实测：LLM 直接判断 skill 好不好，稳定性明显低于规则方法（换 prompt/温度结论漂移，部分设置接近随机）。取舍："诊断宁可少判，也不要飘着判。"

**trace_parser 三层压缩**（100:1）：层 1 工具调用骨架（工具名+参数摘要）、层 2 阶段统计（调用次数/error/重试）、层 3 进度交叉验证（声称 STEP vs 实际调用）。自动识别 JSONL / Claude Code transcript 两种格式。

**flow_diagnosis 规则集**（不含业务关键字，可迁移）：no_tool_calls（零工具调用）/ redundant_retry（同工具同参数 ≥3 次）/ repeated_file_edits（同文件编辑 ≥5 次）/ tool_error_burst（真 error ≥8 条，过滤良性 error）/ tool_error_high_rate（单工具 error 率 ≥50%）/ tool_imbalance（单工具 >60%）/ progress_mismatch（说一套做一套）/ conclusion_missing（调 ≥5 工具无结论）。

**联合归因**：结果错误 + 流程异常的交集才触发进化；同一根因覆盖 ≥30% 失败 case 才值得改（防过度优化）。

## 反直觉设计 2：质疑测试数据本身（gt_auditor）

ground_truth 也可能标错——agent 按正确逻辑得出正确结论却因标注错误被判失败，系统若据此改 SKILL.md 就是在迁就错误标注改歪自己。

GT 可疑度 0~1，五信号加权：agent 与 Judge 一致但与 GT 相反（0.40）/ 步骤覆盖完整 ≥5 STEP（0.20）/ 执行清洁 error ≤2（0.10）/ 无重试（0.10）/ 结论明确（0.10）。可疑度 ≥0.5 标记"GT 嫌疑"。

**关键设计**：GT 嫌疑 case 不排除出评测（仍参与 gate 验证，否则是选择性忽略数据），但 patch 生成时 LLM 被告知"不要为迁就它们改歪 SKILL.md"。同类 case（同 vul_type）标 true 又标 false 自动标记数据质量问题。

## Patch 引擎：只让 LLM 生成候选 diff

LLM 输入 <10KB（当前 SKILL.md ~5KB + 失败 case 联合归因 ~2KB + GT 审计 ~0.5KB + taboo 黑名单 ~0.5KB），输出严格 unified diff（可机器回滚）。

三层过滤：
1. **taboo 拦截**（LLM 调用前）：patch 签名（rule_id+诊断方向）查黑名单，试过且被拒的直接跳过
2. **结构检查**（LLM 返回后）：---/+++/@@ 三件套必须齐全；diff ≤80 行（learning rate，步子太大翻车）；禁止新增 markdown 标题行
3. **文本质量检查**（反口号）：DO/步骤行必须含工具名或文件路径（"用 Grep 搜索 campId"合格，"认真审查代码"不合格）；黑名单短语（"无论如何"/"永远不"/"跳过检查"）直接拒绝；声称"修复 X"必须编码具体动作

**为什么 ≤80 行**：定位回归原因（改 3 个 case 回归知道是哪处）、taboo 签名更精确、防灾难性遗忘（大面积重写破坏旧规则）。

## 四层 Gate 验证

1. **Target Gate**：本次想修的 case 至少 1 个从错变对（改了有用）
2. **Guardrail Gate**：之前答对的 case 一个都不能答错（没搞坏旧功能）
3. **Holdout Gate**（每 5 轮一次）：从未参与诊断的隐藏测试，整体 F1 不掉超 1pp（泛化没退步）
4. **Verify Gate**：SKILL.md 文本质量 ≥75 分且比上版不掉 >5 分（手册不自相矛盾/无废话）

**数据切分**：Selection 60%（target+guardrail 每轮判定）/ Holdout 25%（每 5 轮纯泛化监控）/ Golden 15%（人工审过，verify 校准，永不参与进化）——"写 patch 时能看到测试答案就是在背答案"。

## 黑名单机制：进化的记忆

每次 patch 被拒记录 {rule_id, diff_hash(SHA256 前 16 位), reason, recorded_at}。**跨版本、跨分支共享**（软链）；回滚不清空（否则重蹈覆辙）。

## 收敛判断

四个停止信号：F1 ≥ 0.95 / 连续 5 轮 gate 不过 / SKILL.md > 15000 字节 / 达最大迭代。

**加权停滞**：每轮停滞增量 = 0.3×target 未改善 + 1.0×guardrail 回归 + 0.7×holdout 下降——**guardrail 回归惩罚是 target 未改善的 3 倍多**（搞坏比没改好严重得多）。累加 5.0 触发停止。

**自动回滚**：加权停滞超阈值时对比当前版本与历史最佳 holdout 版本，当前更差则回滚——防"每轮 patch 单点改善、guardrail 无回归、但 holdout 慢慢下滑"的累积负迁移。

**SKILL.md 过长精简模式**：>15000 字节后新增规则易互相遮挡、模型忽略早期约束——切换精简模式只允许合并/删除冗余规则。

## 工程形态：Claude Code Plugin

- **数据源解耦**：只读两份本地 JSONL，不绑定评测平台后端
- **薄命令 + 厚 skill**：commands/evolve.md（极薄参数解析）+ skills/（skill-evolution-core 主流程 / skill-evolution-memory 版本管理 / evolution-data-prep 数据准备 / verify-companion-template 自检模板）——靠 description 自动激活，用户说意图即可
- **断点恢复**：.pending_round.json 记录阶段状态，session-start hook 提示续跑，已完成阶段不重来

## 版本管理：文件系统就是数据库

iterations/（v0...vN 每版含 SKILL.md/metrics.json/gate_verdict.json/patch.diff/provenance.json）+ current 软链 + branches/exp-*/（实验分支完整隔离，taboo.json 软链共享）+ edit_audit.log（append-only，回滚也写历史——"静默回退会导致失忆"）+ timeline.json（append-only 进化史）。原子写入（tmp + mv）。

## 旁支发现：语义陷阱（换词掉 27 个百分点）

对照实验：同一份 SKILL.md 约束/逻辑/步骤一字不改，只把核心词"漏洞"统一替换成"风险"，同一批营销漏洞评测集上正确率 89.3% → 62.1%（**-27pp**）。"找漏洞"判定空间收敛（有/没有），"找风险"放宽边界（多大算风险？潜在算不算？），模型从"按标准答案判断"滑向"自由发挥"。

17 组中文 + 10 组英文陷阱词 + 4 种结构性句式，固化到 .claude/rules/semantic-trap.md 随会话进入上下文。与"反口号"机制是同一件事的两面：语义陷阱控制词的边界，反口号正则控制句子的可执行性——一个防想太宽，一个防写太虚。

## 七条设计原则

1. 能用规则判断的，尽量不用 LLM（LLM 判断 skill 好坏稳定性不够）
2. LLM 只用在最擅长的事（诊断结论转写成 diff）
3. 防止变坏比追求变好更重要（guardrail 惩罚 3 倍 + 四层 gate 任一不过整体拒绝）
4. 小步快跑（patch ≤80 行 = learning rate）
5. 记住每一次失败（taboo 跨版本跨分支共享）
6. 怀疑数据本身（GT 审计：测试标注也会错）
7. 极致解耦（数据源 JSONL / 存储文件系统 / 命令薄 skill 厚）

一句话："这并不是 AI 自己教自己。它更像是用工程纪律，去约束 LLM 的不确定性。"

## 已知局限

- 只能改"怎么做"（SKILL.md 步骤/约束），不能改"做什么"（工具链缺能力 patch 救不了）
- 诊断规则覆盖有限：纯认知错误（流程完整但判断错）检测不到，只能归"未诊断"
- 依赖评测集质量与规模（case 少统计不稳、分布有偏带偏进化方向）
- 收敛天花板：F1 0.90+ 后剩 hard case，patch 边际递减，后续依赖基础模型/工具链/输入质量

参考资料：《别让大模型"想太多"：SKILL 开发中的语义陷阱与抗幻觉设计》https://sumsec.me/2026/skill-semantic-traps-anti-hallucination.html
