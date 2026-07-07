# Anthropic's bug-hunting Mythos was greatest marketing stunt ever, says cURL creator

## Ch01.843 Anthropic's bug-hunting Mythos was greatest marketing stunt ever, says cURL creator

> 📊 Level ⭐⭐ | 4.5KB | `entities/anthropic-mythos-bug-hunting-marketing.md`

## 摘要
cURL 项目创始人 Daniel Stenberg 测试了 Anthropic 的 Mythos 漏洞挖掘 AI。Anthropic 此前宣称 Mythos 能力太强不适合公开，在对 cURL 的扫描中却仅发现 1 个低危漏洞。Stenberg 认为围绕 Mythos 的炒作"主要是营销"，而非真正的 AI 安全突破。

## 关键要点
- 技术领域：AI / 安全 / Newsletter
- 来源：The Register
- 评分：value=8, confidence=8, product=64
- 相关公司：Anthropic、cURL
- 核心结论：Mythos 炒作是营销噱头，非技术突破

## 深度分析
### 事件背景
Anthropic 推出的 Mythos 被描述为一个强大到"过于危险而无法公开"的 AI 漏洞挖掘模型，成为安全圈热议话题。cURL 项目通过 Linux Foundation 的 Project Glasswing 获得了测试机会，但 Stenberg 本人从未直接获得模型访问权限——由他人代为运行扫描后发送报告。

### 实际测试结果
Mythos 对 cURL master 分支代码扫描后，最初报告了 5 个"确认的安全漏洞"。经 cURL 安全团队核实：

- **1 个确认为漏洞**：低危 CVE，计划在 6 月底随 curl 8.21.0 发布，"不会让人大惊小怪"
- **3 个误报**：仅指出了 API 文档中已标注的已知限制
- **1 个普通 bug**：非安全问题
Mythos 确实发现了一些非安全类 bug，描述质量不错，但这与 Anthropic 宣称的"革命性安全突破"相去甚远。

### 与同类工具对比
cURL 项目近 8-10 个月已通过其他 AI 工具（ AISLE、Zeropath、OpenAI Codex Security 等）触发 200-300 个 bugfix 合并，其中"十几个以上"确认为漏洞并发布 CVE。Mythos 的发现数量和深度并无特别优势。

### 核心结论
Stenberg 明确表示：
> "关于这个模型到目前为止的大规模炒作，我个人的结论只能是：这主要是营销。我没有看到任何证据表明这个设置找到问题的程度比之前的其他工具更高或更先进。"
他同时指出 AI 工具的根本局限：**只能找到已知类型的错误**，无法发现，全新型别的漏洞。AI 模型受限于人类对安全问题的现有认知。

### 行业意义
- Mythos 不是安全领域的游戏规则改变者
- AI 漏洞挖掘已进入"好但不高人一等"的实用阶段
- 高调营销与实际能力之间存在显著落差
- 人类研究员的创造性和批判性思维仍不可替代

## 实践启示
### 对安全团队
1. **不要迷信单一工具**：即使是被炒作成"革命性"的 AI 工具，也需要人工复核
2. **建立多工具交叉验证流程**：cURL 团队同时运行多个 AI 扫描器，取交集验证
3. **保持怀疑态度**：对厂商的高调宣传保持批判性评估
4. **投入人工分析**：AI 辅助 + 人类专家仍然是最佳实践

### 对开发者
1. **AI 找 bug 有用但有限**：可作为日常扫描辅助，但不能替代人工代码审查
2. **自动化工作流**：将 AI 工具整合到 CI/CD，但需设置人工复核门槛
3. **关注工具的增量价值**：评估 AI 是否真正超越了传统静态分析工具

### 对 AI 厂商
1. **诚实宣传的重要性**：过度营销会损害行业信任
2. **可验证性是关键**：提供透明、可重复的测试方法让社区验证
3. **生态合作优于封闭独占**：开放 access 让真正需要的人用上，才能产生实际价值

## 相关实体
- [Anthropic's bug-hunting Mythos was greatest marketing stunt ever says curl creator](../ch12/105-anthropic-s-bug-hunting-mythos-was-greatest-marketing-stunt.html)
- [Japan's PM orders cybersecurity review to defend against Anthropic Mythos](ch01/846-anthropic.html)
- [Mythos 发现 curl 漏洞](../ch12/010-mythos-finds-a-curl-vulnerability.html) — Daniel Stenberg（curl 作者）亲述 Mythos 扫描 curl 代码库的真实经历：5个"确认"漏洞经人工审核后只有1个真正成立

## 链接

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/2026.md)

- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/5238111.md)

---

