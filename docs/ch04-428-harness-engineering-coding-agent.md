# Harness Engineering: 让 Coding Agent 可靠完成长程任务

## Ch04.428 Harness Engineering: 让 Coding Agent 可靠完成长程任务

> 📊 Level ⭐⭐ | 5.2KB | `entities/harness-engineering-让-coding-agent-可靠完成长程任务.md`

## 核心要点
微信文章：Harness Engineering: 让 Coding Agent 可靠完成长程任务
## 相关实体
- [Harness Engineering耗时一周我是如何将应用的Ai Coding率提升至90的](/ch03-049-harness-engineering-详解-如何将-ai-coding-率提升至-90/)
- [Anthropic 官方 Agent Harness 平台Claude Managed Agents 完整指南](/ch01-280-anthropic-官方-agent-harness-平台-claude-managed-agents-完整指南/)
- [Agent架构关键变化Harness正在成为新后端](/ch04-289-agent架构关键变化-harness正在成为新后端/)
- [Harness Engineering Reliable Long Term Agent](/ch09-076-harness-engineering-让-coding-agent-可靠完成长程任务/)
- [Huggingface Ai Agent Glossary Model Scaffolding Harness Tool Skill Subagent](/ch04-277-ai-tool-poisoning-exposes-a-major-flaw-in-enterprise-agent-s/)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/harness-engineering-让-coding-agent-可靠完成长程任务.md)

- [一次构建，随处复用：python 中的泛型仓库模式](/ch01-538-一次构建-随处复用-python-中的泛型仓库模式/)

## 深度分析
1. **Harness Engineering 是模型能力与工程可靠性之间的边界管理**。随着模型能力提升，曾经需要脚本控制的环节可能逐渐被自主处理，但"确定哪些环节该交给模型、哪些该留在框架里"这个判断本身不会消失。每次新模型出现都需要重新审视这个边界
2. **CLI 化的子任务设计是避免上下文污染的核心机制**。将子任务作为独立 CLI 进程执行，每个子任务是一次独立的 Agent 会话，上下文里只有当前任务需要的信息。这消除了主 Agent 长会话中的上下文累积问题，同时避免了主 Agent"自由发挥"导致的子任务理解偏差
3. **分层重试策略将失败处理精确化**。内层恢复会话处理网络异常导致的中断（通过 conversationId 续传），中层带反馈重试处理任务本身失败（将错误信息喂给新会话针对性修复），外层主 Agent 决策是否重新 dispatch。判断依据始终是产出文件状态而非 Agent 文本输出
4. **状态机的核心设计原则是自描述性**。仅凭当前状态就能决定下一步做什么，不需要回放历史。精细化的状态设计（如 ANALYZING → ANALYZED → EXECUTING → EXECUTED → VERIFYING → DONE）搭配对应的持久化产物，每个中间状态都需要对应一个落盘的文件，使得恢复精确到具体步骤而非从头重来
5. **"随到随补"的并发调度策略最大化资源利用率**。不是等当前批次所有任务完成才启动下一批，而是哪个坑位空了就立刻补上新任务。子任务执行时间不均匀（一个小目录可能 20 秒，一个复杂目录可能 3 分钟），批次等待策略会造成大量空等时间

## 实践启示
1. **任务粒度设计应综合三个因素**：模型上下文窗口大小（Claude Sonnet 有效窗口约 200K Token）、单个文件平均规模（代码文件约 10-20 Token/行）、任务推理复杂度（理解代码意图比简单改写消耗更高）。跑样本检验子任务 Token 消耗是否逼近上下文窗口 80%，逼近则偏粗，低于 30% 则可放大
2. **Evaluator Agent 必须与执行 Agent 隔离会话**。同一会话内 Agent 的历史推理过程会形成"自我说服"效应，倾向于认为自己之前的产出正确。跨模型评估（如 Sonnet 做 Code Review，GPT 做置信度判断 Grader）能引入不同视角进一步降低偏见
3. **区分"确实失败"与"不完美的通过"两种情形**。编译通过且业务逻辑未被破坏但未达到 100% 理想状态（如 TS strict 迁移留下少量 `// @ts-ignore`），应标记为 DONE_WITH_WARNINGS 照常合入，而非 revert 整个文件标记 FAILED。后者会导致大量"99% 搞定"的文件被反复重跑浪费 Token
4. **利用 meta-skill 自动生成 Long Term Task Skill 骨架**。当任务类型是"对大量同类目标执行相同操作并逐个验证结果"时，用 `long-term-task-orchestration` meta-skill 自动生成 Phase 设计、scripts 目录、状态管理和恢复逻辑，工程师只需用自然语言描述任务目标
5. **并发数应设计为可动态调整的参数**。通过 `--concurrency` 参数控制，资源充裕时开 10 路并发，资源紧张或遇到 API 限流时降到 3 路。而非在对话内让 Agent 自己决定并发数（模型往往过于谨慎）

---

