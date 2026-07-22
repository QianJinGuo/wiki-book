---
source_url: https://juejin.cn/post/7620005798770737167
tags: [juejin]
ingested: 2026-05-14
sha256: c217790383ccf683a6f4879a0c56a5b0be895a60ac81b62c0f8884c6070b15a6
---
# 05—skill-creator 源码深度拆解：LLM Skill 触发率、防过拟合与三 Agent 评审完整指南
系列：SkillSentry · AI Skill 测评体系从零到一（五）
难度：深入（源码级）
适合读者：想理解 AI 评估工具底层原理的工程师
📌 一句话摘要：本文从 skill-creator 源码拆解触发率测评、60/40 防过拟合和三 Agent 盲测评审的完整实现，涵盖 5 个核心设计点。
## skill-creator vs SkillSentry 分工
| 工具 | 解决的问题 | 典型使用时机 |
|------|----------|------------|
| skill-creator | Skill 的 description 写得好不好？能否被正确触发？ | 写完 Skill 第一次发布前 |
| SkillSentry | Skill 触发后行为质量是否达标？ | 每次迭代发布前 |
两者串联：先用 skill-creator 确认「Skill 能被触发」，再用 SkillSentry 验证「触发后行为正确」。
## 能力一：触发率测评（run_eval.py）
**核心问题**：通过实时 SSE 流检测模型是否调用了目标 Skill——单次检测从分钟级降到秒级。
### 核心函数：run_single_query（run_eval.py:35-181）
```python
def run_single_query(query, skill_name, skill_description, timeout, project_root, model):
    # 1. 创建临时 Skill 命令文件
    command_file = project_commands_dir / f"{clean_name}.md"
    command_file.write_text(f"---\ndescription: |\n  {indented_desc}\n---\n...\"")
    # 2. 执行 claude -p，SSE 流式输出
    cmd = ["claude", "-p", query,
           "--output-format", "stream-json",
           "--verbose",
           "--include-partial-messages"]  # 关键：提前检测触发
    # 3. 实时监听流事件
    while time.time() - start_time < timeout:
        event = json.loads(line)
        if event["type"] == "stream_event":
            se_type = event["event"]["type"]
            if se_type == "content_block_start":
                tool_name = event["event"]["content_block"]["name"]
                if tool_name in ("Skill", "Read"):
                    pending_tool_name = tool_name
                else:
                    return False  # 调用了其他工具，说明没用 Skill
            elif se_type == "content_block_delta" and pending_tool_name:
                accumulated_json += delta["partial_json"]
                if clean_name in accumulated_json:
                    return True  # 确认触发！立即返回
```
### 关键设计点
- `--include-partial-messages`：不等完整输出，从 SSE 流实时检测触发
- 临时命令文件：每次测试用唯一 ID，测完立即删除
- 10 worker 并行（run_eval.py:198）：ProcessPoolExecutor(max_workers=10)
- 每个 query 跑 3 次，取触发率均值（消除随机性）
## 能力二：自动优化 description 循环（run_loop.py）
**核心问题**：description 优化如何迭代、如何防止「在已知 eval 上过拟合、换 query 就失效」。
### 防过拟合设计：60/40 train/test 分割
```python
def split_eval_set(eval_set, holdout=0.4, seed=42):
    # 按 should_trigger 分层采样，保证 train/test 比例一致
    trigger = [e for e in eval_set if e["should_trigger"]]
    no_trigger = [e for e in eval_set if not e["should_trigger"]]
    n_trigger_test = max(1, int(len(trigger) * holdout))
    test_set = trigger[:n_trigger_test] + no_trigger[:n_no_trigger_test]
    train_set = trigger[n_trigger_test:] + no_trigger[n_no_trigger_test:]
    return train_set, test_set
```
### 迭代循环核心（run_loop.py:79-241）
```python
for iteration in range(1, max_iterations + 1):
    # 1. 跑所有 query（train + test 合批）
    all_results = run_eval(eval_set=train_set + test_set, description=current_description)
    # 2. 按 query 归属分回 train/test
    train_result_list = [r for r in all_results if r["query"] in train_queries_set]
    # 3. 如果 train 全通过，停止
    if train_summary["failed"] == 0:
        break
    # 4. 关键：对改进模型「盲化」test 成绩
    blinded_history = [{k: v for k, v in h.items() if not k.startswith("test_")} ...]
    # 5. 调用 improve_description，只看 train 结果来改进
    new_description = improve_description(history=blinded_history, eval_results=train_results)
    current_description = new_description
# 最终按 test 成绩选 best（不是 train）
best = max(history, key=lambda h: h["test_passed"] or 0)
```
**最精妙的设计**：blinded_history 把 test 成绩从传给改进模型的历史中抹掉。改进模型只知道「train 上失败了哪些」，不知道 test 上的表现。最后按 test 分数选 best——经典的 ML 防过拟合思路。
## 能力三：统计聚合（aggregate_benchmark.py）
**核心问题**：AI 测评的随机性意味着单次结果不可信，需要跑多次并用样本标准差（n-1）来估计真实波动。
### 统计计算（aggregate_benchmark.py:45-64）
```python
def calculate_stats(values):
    n = len(values)
    mean = sum(values) / n
    # 使用样本标准差（n-1），不是总体标准差（n）
    variance = sum((x - mean) ** 2 for x in values) / (n - 1)
    stddev = math.sqrt(variance)
    return {"mean": round(mean, 4), "stddev": round(stddev, 4), ...}
```
### 为什么是 n-1（Bessel 修正）
我们跑 3 次测评，这 3 次是从「所有可能结果」中抽取的样本，不是全量数据。用 n（总体标准差）会系统性低估真实波动；用 n-1 修正后，对小样本更保守。n=3 时，样本标准差比总体标准差大约大 22%——稳定性判断因此更严格。
### 跨 config 对比
```python
def aggregate_results(results):
    for config in ["with_skill", "without_skill"]:
        pass_rates = [r["pass_rate"] for r in results[config]]
        run_summary[config] = {"pass_rate": calculate_stats(pass_rates), ...}
    delta_pass_rate = primary["pass_rate"]["mean"] - baseline["pass_rate"]["mean"]
    run_summary["delta"] = {"pass_rate": f"{delta_pass_rate:+.2f}", ...}
```
## 能力四：三 Agent 评审系统
通过职责分离——Grader 打分、Comparator 盲测对比、Analyzer 归因——让每个 Agent 只做自己最擅长的判断。
### Grader Agent（agents/grader.md）
8 步工作流：
1. 读 transcript → 注意工具调用、返回值、报错
2. 读 output 文件 → 注意结构、内容、质量
3. 对每条 expectation：PASS（有明确证据）/ FAIL（无证据/证据矛盾/技术满足但实质错误）
4. 提取隐含 claims 并验证（factual/process/quality 三类）
5. 读 user_notes.md（执行者留下的疑问）
6. 批评断言质量（eval_feedback）
**PASS 严格标准**：「The evidence reflects genuine task completion, not just surface-level compliance」——文件存在 ≠ 内容正确。
### Comparator Agent（agents/comparator.md）
盲测设计：收到两份输出标记为 A 和 B，但不知道哪份是「with_skill」。
评分维度（六维度，每项 1-5 分）：
- 内容维度：正确性、完整性、准确性
- 结构维度：组织性、格式规范、可用性
- 综合得分 = (内容均值 + 结构均值) / 2 × 2
### Analyzer Agent（agents/analyzer.md）
模式一（改进建议）：比较两个版本，找出为什么赢了/输了，生成具体改进建议。
模式二（Benchmark 分析）：跨多次运行发现规律和异常。
关注的 4 类模式：
- 断言总是双方都通过 → 可能无判别力
- 断言总是双方都失败 → 可能超出模型能力
- with_skill 总通过而 without 总失败 → Skill 明确有价值
- with_skill 总失败而 without 总通过 → Skill 可能帮了倒忙
## SkillSentry 借鉴对照
| skill-creator 能力 | SkillSentry | 说明 |
|------------------|------------|------|
| Grader/Comparator/Analyzer Agent | ✅ 借鉴并汉化 | 增加了 evidence 强制非空 |
| 统计聚合（样本标准差） | ✅ 借鉴实现 | 复用样本标准差计算 |
| 触发率测评（run_eval.py） | ❌ 未集成 | 最大缺口，只测行为不测触发 |
| 60/40 防过拟合优化循环 | ❌ 未集成 | 需要 claude CLI，暂未接入 |
| 实时 live report | ❌ 未有 | 执行完才生成报告 |
## 核心工程智慧总结
1. **流式检测触发**：--include-partial-messages + SSE 流，秒级完成触发判断
2. **防过拟合的 60/40 分割**：对改进模型盲化 test，按 test 选 best
3. **样本标准差（n-1）**：比总体标准差更准确估计真实波动
4. **盲测消除偏见**：Comparator 不知道哪个是「好版本」
5. **evidence 必须引用原文**：Grader 的核心约束，消除感觉判断