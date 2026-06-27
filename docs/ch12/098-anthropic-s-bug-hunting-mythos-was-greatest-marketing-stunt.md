# Anthropic's bug-hunting Mythos was greatest marketing stunt ever, says cURL creator

## Ch12.098 Anthropic's bug-hunting Mythos was greatest marketing stunt ever, says cURL creator

> 📊 Level ⭐⭐ | 4.3KB | `entities/5238111.md`

# Anthropic's bug-hunting Mythos was greatest marketing stunt ever, says cURL creator

Title: Anthropic's bug-hunting Mythos was greatest marketing stunt ever, says cURL creator
URL Source: https://www.theregister.com/security/2026/05/11/anthropics-bug-hunting-mythos-was-greatest-marketing-stunt-ever-says-curl-creator/5238111/
Published Time: 2026-05-11T16:30:53.000Z

cURL 项目创始人 Daniel Stenberg 测试了 Anthropic 的 Mythos AI 安全扫描模型后，只发现 1 个低危漏洞。他将 Mythos 的炒作定性为"主要是一场营销活动"，认为其能力被严重夸大了。

## 深度分析

1. **Mythos 实际效果远低于宣传**: Anthropic 声称 Mythos 过于强大不能公开，但实际扫描 cURL 代码库只发现 1 个确认漏洞（计划6月底发布为低危 CVE），而Mythos 最初报告的5个"确认安全漏洞"中，3个是误报，1个只是普通 Bug。

2. **AI 代码分析工具整体已有显著进步**: Stenberg 指出"AI 驱动的代码分析器在发现源代码安全漏洞方面显著优于过去的传统代码分析器"，但他强调"所有现代 AI 模型现在都很擅长这一点"——Mythos 并无特别突出之处。

3. **AI 仍然只能发现已知类型漏洞**: 自 cURL 项目运行各种静态代码分析器和模糊测试工具以来，触发了 200-300 个 Bug 修复，其中十几个已确认为漏洞并发布 CVE。Stenberg 明确表示："AI 工具只能找到我们已知的那类常规错误，找到新的实例而已。迄今为止我们还没有看到任何 AI 报告过某种全新类型的漏洞。"

4. **cURL 项目经验使其成为优秀测试用例**: cURL 团队在 AI 时代之前就已使用各种工具进行安全测试，这意味着 Mythos 不是第一个分析 cURL 的 AI 工具，因此可以有效对比其实际能力提升。

5. **营销价值而非技术突破**: Stenberg 在博客中直接称 Mythos 为"一场惊人的成功营销活动"，并表示"围绕这个模型的大部分炒作主要只是营销，我没有看到任何证据表明这个设置比之前的其他工具更高或更先进地发现问题"。

## 实践启示

1. **对 AI 安全工具保持理性预期**: 不要因为供应商的营销炒作而期待 AI 能发现"革命性"漏洞，实际验证才是判断工具价值的关键。

2. **建立 AI 报告的人工复核流程**: 即使 AI 工具报告高可信度漏洞，也需要安全团队深入验证——cURL 团队花了数小时才将 5 个报告缩减为 1 个确认漏洞。

3. **利用 AI 处理已知漏洞模式**: AI 在发现已知类型漏洞方面效率较高，可用于大规模代码库的初筛，但复杂和新类型漏洞仍需人类专家。

4. **开源项目应谨慎管理 Bug Bounty**: Stenberg 于2026年1月关闭了 cURL 的 Bug Bounty，因大量无用 AI 报告涌入——需要建立有效的过滤机制区分高质量 AI 报告和垃圾报告。

5. **人类创造力不可替代** — "未来许多安全 Bug 将由人类想出新的方式来提示 AI 而发现"——关键在于人类如何创造性地运用 AI 工具，而非将批判性思维外包给机器人。

## 相关实体
- `AI安全全景` — AI代码分析工具的安全与攻击全景
- `MCP生产模式` — Anthropic的工具调用安全实践

## 相关实体
- [Cloudflare Glasswing Mythos Security](/ch01-281-project-glasswing-what-mythos-showed-us/)
- [Anthropic Mythos Bug Hunting Marketing](/ch01-675-anthropic-s-bug-hunting-mythos-was-greatest-marketing-stunt/)
- [Www.Infoworld 4171274 Anthropic Puts Claude Agents On A Meter Across Its Subscri](/ch01-557-anthropic-puts-claude-agents-on-a-meter-across-its-subscript/)
- [Harness Engineering Three Evolutions](/ch05-030-harness-engineering-ai工程的三次进化/)
- [Introducing Claude Platform On Aws Anthropics Native Platfor](/ch01-392-introducing-claude-platform-on-aws-anthropic-s-native-platf/)
- MOC

---

