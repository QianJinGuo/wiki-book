# Mythos for Offensive Security: XBOW's Evaluation

## Ch01.301 Mythos for Offensive Security: XBOW's Evaluation

> 📊 Level ⭐⭐ | 12.6KB | `entities/mythos_offensive_security_xbow_evaluatio.md`

## 核心要点
- **模型定位**：Anthropic 前沿模型，专为 offensive security 任务设计，在漏洞发现方面实现重大突破 
- **核心优势**：源代码审计能力极强，漏洞候选发现效率大幅领先先代模型 
- **局限性**：缺乏"身体"——模型是的大脑但无法直接与 live site 交互，纯代码审计无法覆盖所有漏洞类型 
- **成本考量**：定价约为 Opus 模型的 5 倍，按 token 效率计算并非最优选择 
- **最佳实践**：将 Mythos 强大的源代码分析能力与 XBOW 等平台的 live-site 验证能力结合，形成完整闭环 
---

## 深度分析
### 1. 测试方法论：专业团队 + 多维度评估
XBOW 组建了来自公司不同部门的 **10 人专家团队**，从多个方向评估模型。测试沿用评估 Opus 4.7 和 GPT 5.5 的同一套内部基准系统：对已发现漏洞的开源应用冻结在漏洞版本，用 autonomous agent 运行测试 。
本次评估还扩展到其他维度：

- 威胁建模、漏洞验证、安全性方面的判断力
- 源代码阅读能力 vs 与 live system 交互能力的对比
- 标准评估之外的能力，如原生应用漏洞发现 
术语说明：文中"Mythos"指原始模型；本次评估探索了 **Mythos Preview** 两种形态——在 Claude Code 中使用以及作为 API 引擎驱动 XBOW agent。两种场景的 orchestration、tools、prompting 和 live-site access 都会实质性影响结果 。

### 2. 基准测试结果：漏洞发现能力大幅提升
Mythos Preview 在 XBOW 的 web 漏洞基准测试上显著超越所有现有模型：
| 指标 | 相比 Opus 4.6 |
|------|--------------|
| 假阴性（false negatives）减少 | **42%** |
| 提供源代码后假阴性减少 | **55%** |
这一结果反复印证了一个主题：**Mythos Preview 写代码的能力令人印象深刻，但读代码的能力更令人印象深刻** 。
从 token 效率角度看，Mythos Preview 以"前所未有"的精度锁定漏洞 。不过，按运行成本 normalize 后，Mythos Preview 并非最优——如果追求高准确度它不算差，但也不是基准测试中的绝对最佳 。

### 3. Live-site 验证的固有挑战
评估揭示了一个核心现实：**许多可利用的问题不会在应用源代码中表现为明显缺陷**。它们源于配置、依赖、部署方式，或看似安全的组件之间的组合方式 。
例如，一个依赖本身可能是安全的，源代码本身也没问题，但源代码以不安全的方式调用该依赖就会产生漏洞。正如 Gary McCraw 所言："盯着代码看"找不到大多数缺陷 。
关键发现：即使对于纯代码漏洞的基准测试，**剥夺 live site 访问权限对性能的影响 > 剥夺源代码访问权限的影响**。Live-site access 比源代码 access 更重要——这正是 XBOW 的价值主张：赋予前沿模型安全、结构化地与真实应用行为交互的能力，并验证哪些发现实际上可被利用 。
最佳检测模式：XBOW orchestration Mythos Preview 的理想流程是：
1. 分析源代码找到线索（lead）
2. 探测 live site 理解弱点在部署环境中的体现
3. 据此构造 exploit

### 4. 判断力：精确但过于字面
Mythos Preview 的判断结果喜忧参半。在命令安全、威胁建模、trace triage 等方面，它通常谨慎且精确，但同时也**过于字面和保守** 。
具体表现：

- 误报抑制能力优于大多数前辈
- 但当证据不严格满足其标准，或预期规则比书面描述更宽泛时，会丢失真阳性
命令安全基准测试结果尤其令人意外：

- Haiku 4.5：**90.1%** 准确率
- Opus 4.6：**81.2%** 准确率
- **Mythos Preview：77.8%** 准确率 
深入分析发现，Mythos 倾向于优先考虑规则的**字面含义**，而 Opus 优先考虑规则的**精神意图** 。这意味着 Mythos 需要精确的 prompt、明确的威胁模型和验证基础设施才能将强推理转化为可靠的安全成果 。

### 5. 原生代码与逆向工程：最亮眼的领域
在 web 应用之外，Mythos Preview 在原生代码漏洞发现和逆向工程方面展现了**实质性的强大能力** ：

- **Chromium 测试**：以更少的假阳性发现比先代基线更多的真实 bug
- **V8 沙箱工作**：在一个微妙的威胁模型中识别出真阳性——先前方法产生大量发现但无成功真阳性
- **固件和嵌入式系统**：在需要非常规架构和操作系统组合的场景中展现推理能力，而非简单模式匹配

### 6. 视觉敏锐度：已恢复至应有水平
XBOW 工作流经常要求模型通过浏览器界面与 live 网站交互，需要模型识别正确的 UI 元素并点击正确位置。Mythos Preview 在视觉敏锐度 QA 上表现极好，大致匹配 Sonnet 4.6，显著超越 Opus 4.6 。
值得注意的是，Opus 4.7 在该基准上也很出色。也许真正的问题不是"Mythos Preview 很好"，而是"Anthropic 最近模型在这一领域开始退化，现在已逆转了这种退化" 。

### 7. 成本效益分析
Mythos Preview 是真正的泰坦，但泰坦体型大，体型大意味着昂贵。撰写时 Mythos Preview 尚未通过公开 API 提供，但 Anthropic 透露其定价约为 Opus 模型的 **5 倍**——本身已是 token for token 最昂贵的选项之一 。
Point Estimate 对 AI Security Institute 基准测试的分析也印证了这一点：Mythos Preview 很强大，但真正的选择是——要么花钱让 agent 用 Mythos Preview 试一点时间，要么用 GPT-5.5 试更长时间。哪种更好取决于具体用例；通常，答案是后者 。
---

## 实践启示
### 给安全团队的启示
1. **Mythos Preview 是强大的漏洞候选发现工具**，尤其适用于源代码充足的审计场景。对于需要快速定位潜在漏洞但资源有限的安全测试，它可以显著提升效率。
2. **单独使用模型不足以完成完整渗透测试**。"模型是大脑没有身体"——live site 交互、配置验证、exploit 构造等仍需人类专家或专门的验证基础设施（如 XBOW）来完成最终验证。
3. **结合使用是关键**：将 Mythos Preview 的源代码分析能力与 live-site 探测工具结合，形成"分析→探测→构造"的完整闭环，比单独使用任何组件都更有效。
4. **在命令安全等判断类任务上需谨慎**：Mythos 的"字面优先"倾向可能在边界 case 上表现不佳。对于高风险决策场景（如自动执行可能影响目标系统的命令），应有人工复核机制。

### 给 AI/安全工具开发者的启示
1. **工具集成决定成败**：Mythos 的强大能力需要通过合适的 harness 和工具来释放。开发者应关注如何将模型能力与动态分析、运行时监控、exploit 验证等能力有机结合。
2. **多模型策略优于单一模型**：XBOW 维护多种模型而非局限于单一模型的原因在于——不同任务适合不同模型。构建平台时应考虑让用户能灵活选择最适合特定场景的模型。
3. **成本效益需要持续监控**：随着模型能力提升和成本变化，最佳选择也会改变。建议定期重新评估成本效益比，而非假设上一周期的最优选择仍然最优。

### 给企业安全决策者的启示
1. **AI 辅助安全已接近实用门槛**：Mythos Preview 展现的能力表明，前沿模型已能在漏洞发现这一核心任务上提供实质价值。将 AI 整合到安全测试流程中的时机可能已经成熟。
2. **投资应包括人和流程**：仅有 AI 工具不够——需要训练有素的安全专业人员进行 prompt 设计、结果验证和复杂场景处理。"AI + 专家"组合才是最优解。
3. **并非所有场景都适合用最贵的模型**：对于需要大量迭代的发现任务，用较弱但便宜的模型多次尝试可能比用 Mythos 单次尝试更有效。评估ROI时需考虑任务特性和模型成本。
4. **安全左移的新机遇**：Mythos 读代码能力强于写代码能力的特点，使其特别适合"安全左移"场景——在代码提交前、CI/CD 流水线中集成自动化代码审计。
---
> [!contradiction] 另见：`AI Threat Readiness Framework` — 从防御角度看待 AI 安全能力，与 XBOW 从攻击角度的评估形成对照
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mythos_offensive_security_xbow_evaluatio.md)

## 相关实体
- [Claude 发布官方报告，承认存在 3 处质量退化问题](ch01/380-claude.md)
- [Qoder Skills 完全指南：从零开始，让 AI 按你的标准执行](ch04/245-skill.md)
- [刚刚Opus 4.7发布，相比4.6核心变化，与Claude Code搭配最佳实践](ch03/073-claude-code.md)
- [Claude Code Agent 工程设计](ch03/073-claude-code.md)
- [AI 行业就业八大变化（腾讯研究院纵向对比）](ch04/310-ai.md)
- [Anthropic 长时运行 Agent 架构：对抗式设计 + 合同谈判 + 审美量化](ch04/503-agent.md)
- [Agent Skill 设计模式](ch04/245-skill.md)
- [CDP Bridge MCP：真实浏览器直连 MCP 工具](ch04/503-agent.md)

- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](ch04/503-agent.md)
- [Anthropic 官方生产级 Agent 最佳实践：12 个可复用的 MCP 设计模式](ch04/503-agent.md)
- [Anthropic Claude Managed Agents 平台正式发布](ch04/503-agent.md)

- [Anthropic 官方技能最佳实践：14 个可复用的 Agent Skills 设计模式](ch04/245-skill.md)
- [Anthropic 14 个 Agent Skills 设计模式](ch04/245-skill.md)
- [Anthropic Computer Use 最佳实践](ch01/685-anthropic-computer-use.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/anthropic-ecosystem.md)

---

