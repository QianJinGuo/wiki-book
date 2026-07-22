---
source_url: "https://mp.weixin.qq.com/s/4zvCuPvf8hJL0WUZd4_TXQ"
ingested: 2026-06-26
sha256: 6315e1a4008410b7
---

# 微软等提出 SkillOpt：把 Skill 当成模型一样训练

## 一句话

把 Agent 的「技能文档」当作可训练状态，用轨迹反馈、受控文本编辑和验证集门控来优化技能，在不改模型权重、不增加部署期调用的前提下，让多个模型和执行环境稳定涨分。

## 核心问题

Agent 场景里，同一类流程性失败反复出现：同一个表头识别错误今天犯一次，明天换个文件还会再犯；同一个公式写入问题换个 workbook 还会重复出现。

现有方法的局限：
- **专家总结规则**：停在经验层面，可控性差
- **一次性 prompt 生成**：很难覆盖真实任务里的失败模式
- **无约束自我改写**：可能把原本有用的规则删掉，或把偶然样例里的细节写成通用规则

## 核心思路

把技能文档视为 **frozen agent 的外部状态**，用一个单独的**优化器模型**读取执行轨迹，只允许它对同一份 skill 做**有预算的 add、delete、replace 编辑**；每次编辑之后必须在 held-out selection split 上**严格变好**，才会被接受。

## 三角色

- **目标模型**：被冻结，负责按当前 skill 执行任务
- **执行框架**：可以是单轮 direct chat，也可以是 Codex、Claude Code 这类带文件和工具的 agentic loop
- **优化器模型**：离线读取轨迹，提出 skill 编辑建议

关键设计：**隔离**——优化器模型只在训练 skill 时出现；部署时并不额外调用优化器。

## 训练循环五步

### 第一步：带着当前 skill 跑任务

目标模型在训练集上执行一批任务。记录：任务元信息、消息、工具调用、观测结果、命令输出、验证器反馈，以及特定任务上下文。

批量太小容易抓住偶然错误；批量足够大，重复失败模式会浮出来。支持 accumulation：多个 rollout batch 分别反思，再合并到一次 skill 更新。

### 第二步：把失败和成功分开反思

- **失败样本**：用于提出缺失规则、修正规则
- **成功样本**：用于保留已经有效的做法

minibatch 反思比把所有轨迹丢给模型总结更稳，能暴露复现性错误。

### 第三步：只允许受控文本编辑

引入**文本版 learning rate**：编辑预算 L_t，每一步最多应用多少条 skill 编辑由预算控制。操作类型：append、insert、replace、delete，或小范围重写建议。

受控编辑让相邻 skill 版本保持足够接近，优化历史才有意义。

### 第四步：验证集门控

每个候选 skill 在 selection split 上重新评估。只有**严格高于**当前 selection score 才接受。打平也拒绝，避免 skill 悄悄漂移。

### 第五步：拒绝也要记账

被拒绝的编辑和分数下降记录到 **rejected buffer**。后续反思时，优化器看到哪些方向已试过、为什么没通过，减少重复犯错。

## 慢更新和 Meta Skill

每个 epoch 结束时，slow/meta update：
- **slow update**：写进 skill 受保护区域，经过验证集门控
- **meta skill**：只给优化器自己看，总结哪些编辑方向有效/被拒绝/失败模式还没解决

解决训练期需要丰富历史、部署期却需要简洁的矛盾。

## 实验

**六类 benchmark**：SearchQA、SpreadsheetBench（openpyxl/pandas，30轮交互）、OfficeQA（24次tool call）、DocVQA、LiveMathematicianBench、ALFWorld（50步具身）

**七个模型**：GPT-5.5、GPT-5.4、GPT-5.4-mini、GPT-5.4-nano、GPT-5.2、Qwen3.5-4B、Qwen3.6-35B-A3B

**三种执行环境**：direct chat、Codex harness、Claude Code harness

**默认配置**：4个epoch，rollout batch size=40，reflection minibatch size=8，16个analyst worker并行，文本learning rate L_t=4（cosine decay）

**结果**：52个评测单元全部最好或并列最好。

---

> 同主题：[[raw/articles/skillopt-microsoft-train-skill-like-neural-network|SkillOpt：把 Skill 当成模型一样训练]]（AGI Hunt版）[[entities/skillopt-microsoft-research-skill-training|SkillOpt 微软研究院训练技能文档]]（论文精读）
