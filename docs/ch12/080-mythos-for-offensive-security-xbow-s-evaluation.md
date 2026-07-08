# Mythos for Offensive Security: XBOW's Evaluation

## Ch12.080 Mythos for Offensive Security: XBOW's Evaluation

> 📊 Level ⭐⭐ | 6.0KB | `entities/mythos-for-offensive-security-xbows-evaluation.md`

## 深度分析
**Mythos Preview 的核心定位**：Anthropic 委托 XBOW 对其新模型进行独立安全评估，这是继 Opus 4.7 和 GPT 5.5 之后 XBOW 第三次系统性评估前沿模型。Mythos Preview 被定位为"重大能力飞跃"，尤其在源代码漏洞发现领域。
**评测方法论亮点**：XBOW 组建了 10 人跨领域专家团队，采用"冻结漏洞版本 + 自动化 agent 对抗"的标准基准测试框架。与以往不同，本次额外考察了威胁建模判断力、源代码 vs  live-site 交互能力差异、以及原生应用漏洞发现等新维度。值得注意的是，评测区分了"裸模型 API"和"Claude Code 内嵌"两种使用形态，因为编排层、工具链和实时访问会实质性影响结果。
**漏洞发现的核心数据**：相比 Opus 4.6，Mythos Preview 的漏报率下降 42%，提供源代码时进一步下降至 55%。token-for-token 精度上，其定位漏洞的效率达到"前所未有"的水平。这验证了一个反复出现的主题：**Mythos 擅长写代码，但更擅长读代码**。
**live-site vs 源代码的悖论**：一个反直觉的发现——即使在被设计为"仅靠代码即可发现漏洞"的基准集上，剥夺 live-site 访问对性能的损害仍大于剥夺源代码访问。这说明**实战渗透测试中，实时交互的价值高于代码审计**，即便漏洞根因在代码中。Mythos Preview 在失去 live-site 时"受伤"幅度小于其他模型，这正是其源码分析能力强的表现；但最优结果始终来自"源码分析找线索 → live-site 探测部署反映 → 构造 exploit"的组合模式。
**判断力（Judgment）的局限性**：Mythos Preview 在命令安全、威胁建模、trace 分类等判断任务中表现"mixed"。它过于字面化和保守——有时会丢失证据未严格满足其形式标准的真正漏洞（即优先保 spirit 而非 letter）。最令人意外的是：Haiku 4.5 在命令安全基准上达 90.1%、Opus 4.6 达 81.2%，而 Mythos Preview 仅 77.8%。这说明**强大漏洞发现能力并不自动等同于强大安全判断力**，Mythos 需要精确提示词、显式威胁模型和验证基础设施才能将强推理转化为可靠安全成果。
**原生代码与逆向工程的优势**：这是 Mythos 表现最 striking 的领域之一。在 Chromium 测试中找到更多真实漏洞且误报率更低；在 V8 sandbox 微妙威胁模型中识别出此前方法无法找到的真正漏洞（该场景之前的方法产生了大量发现但无一成功）；在固件和嵌入式系统逆向中展现了超越模式匹配的结构化推理能力。
**成本效益的现实评估**：Mythos Preview 定价将为 Opus 的 5 倍，且在成本归一化后的效率基准上并非同类最佳。Point Estimate 对比 AI Security Institute 数据的分析也得出了类似结论：选择取决于场景——高频漏洞发现值得为其付费，但在许多场景下让 GPT-5.5 多次尝试是更经济的方案。XBOW 的策略是**维持多模型组合**，而非押注单一模型。
**核心结论提炼**：Mythos Preview 是一个"无躯壳的大脑"——在源代码审计这类大脑活动中极为强大，但真正的渗透测试需要与之匹配的"身体"（工具链、实时访问、验证基础设施）。它代表了漏洞发现能力的重大飞跃，但必须被正确驾驭才能发挥全部潜力。

## 实践启示
**对于安全团队**：Mythos Preview 可作为高价值的漏洞发现助手，尤其在有源代码的场景下效果显著。但不应将其作为唯一依赖——需要搭配 XBOW 这类 live-site 验证平台来过滤误报、确认可利用性。在资源受限场景下，可权衡其 5x 成本与 GPT-5.5 多次尝试的成本效益比。
**对于 AI 安全产品构建者**：Mythos 的强项（源码分析）和弱项（判断保守性）为产品设计提供了明确方向——需要精确的提示工程、显式威胁模型输入和独立的验证层。其在原生代码/逆向工程上的优势提示了在二进制安全、固件分析等垂直领域的产品机会。
**对于 red team / 渗透测试**：Mythos 在漏洞发现lead generation 阶段极具价值，但最终 exploit 构造和验证仍需人工或专用工具链。其"字面化"判断倾向意味着在宽松解释规则威胁建模场景下可能遗漏真实风险——需要在提示中明确规则意图而不仅是字面描述。
**对于基准测试和红队评估**：视觉敏锐度（浏览器交互）已足以支持实际工作流，这是 Anthropic 逆转了近期模型在该维度退化趋势的积极信号。跨架构固件和嵌入式场景的推理能力打开了新的评测维度。
## 相关实体
- [Mythos_Offensive_Security_Xbow_Evaluatio](https://github.com/QianJinGuo/wiki/blob/main/entities/mythos_offensive_security_xbow_evaluatio.md)
- [Introducing Deepsec Find And Fix Vulnerabilities In Your Code Base](https://github.com/QianJinGuo/wiki/blob/main/entities/introducing-deepsec-find-and-fix-vulnerabilities-in-your-code-base.md)
- [Introducing Aimap Security Testing For Ai Agent Bishop Fox](../ch04/400-introducing-aimap-security-testing-for-ai-agent-bishop-f.html)
- [Offensive Security Blog](ch12/006-offensive-security-blog.html)
- [Akamai Acquires Israeli Ai Browser Security Startup Layerx For 205 Million In Ca](../ch05/079-ai.html)

---

