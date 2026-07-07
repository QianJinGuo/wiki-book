# The text in Claude Code’s “Extended Thinking” output is not authentic. – blog

## Ch09.106 The text in Claude Code’s “Extended Thinking” output is not authentic. – blog

> 📊 Level ⭐⭐ | 6.1KB | `entities/claude-code-extended-thinking-not-authentic.md`

# The text in Claude Code’s “Extended Thinking” output is not authentic. – blog

Patrick McCanna investigated Claude Code's session logs and discovered that the "thinking blocks" in extended thinking output contain a 600-character signature but no actual reasoning text. This raises questions about the authenticity and transparency of LLM reasoning traces.

## Key Findings

### 1. Thinking Block Structure
- Claude Code records each session to disk as logs
- Logs include "thinking blocks" which are supposed to be the model's own reasoning
- Investigation found a signature (600 characters) but no text content

### 2. Documentation Gap
- The official docs describe thinking blocks as the model's reasoning
- The actual output contradicts this documentation
- Users expecting to inspect reasoning cannot do so

### 3. Implications for Agent Transparency
- Extended thinking is marketed as a transparency feature
- If thinking blocks are empty/signed-only, the "chain of thought" is not actually visible
- This affects trust in agent reasoning traces for debugging and auditing

## Relevance to Agent Engineering
- Agent builders relying on thinking blocks for observability should verify actual content
- Extended thinking may be a compliance artifact rather than genuine reasoning transparency
- Important for anyone building on Claude Code's API and expecting traceable reasoning

## 深度分析

### 加密推理签名 vs 透明推理：Anthropic 的设计取舍

Claude Code 的 extended thinking 输出包含一个 600 字符的 `signature` 字段，但没有实际推理文本。Anthropic 将推理内容加密到签名中，密钥由 Anthropic 持有，用户机器无法解密。API 返回的是推理的 **摘要**（summary），而非原始推理链。这意味着：(1) 用户本地日志中的 thinking block 是不可读的；(2) 获取完整推理输出需要企业级协议；(3) 文档中的描述（"extended thinking returns a summary of Claude's full thinking process"）容易被误读为"返回完整推理"。

### 摘要 ≠ 原始推理：数据损失的隐性成本

原始博客用了一个精准的类比：这就像把 BMP 保存为 JPEG，编辑后再保存为 BMP——转换过程产生了数据损失。对于 Agent 工程师，这意味着 thinking block 不能作为可靠的调试和审计依据。当你需要追溯 agent 在某个决策点的推理逻辑时，你得到的是一个经过压缩和转换的摘要，而非原始的思维链。对于需要合规审计的场景（如金融、医疗），这种数据损失可能构成合规风险。

### 文档措辞的"间接性"值得 Agent 开发者警惕

作者特别指出 Anthropic 文档中的措辞"awfully indirect"——如果你没仔细阅读，可能会错过"extended thinking returns a summary"这一关键限定。这反映了一个更广泛的问题：AI 厂商在营销"透明性"和"可解释性"时，实际提供的可能是打了折扣的版本。Agent 开发者在依赖任何 AI 厂商的推理追踪功能时，都应亲自验证输出内容是否与文档描述一致。

### 对 Agent 可观测性架构的影响

如果 thinking block 不包含实际推理文本，Agent 可观测性架构需要重新设计：(1) 不能依赖 thinking block 作为推理 trace；(2) 需要通过输入/输出日志 + 行为记录重建 agent 决策过程；(3) 对于需要完整推理链的场景，应考虑使用开源模型（推理过程完全可见）或要求厂商提供企业级 API 访问。Matt Green 的后续分析（对签名块的详细观察）提供了更多技术细节。

### 开源模型在推理透明度上的结构性优势

此事件凸显了开源模型在推理透明度方面的结构性优势：开源模型的推理过程完全可见，用户可以检查完整的思维链，无需依赖厂商的密钥或企业协议。对于对透明度有硬性要求的应用（审计、调试、安全分析），开源模型可能是更可靠的选择。作者最后呼吁"Performance improvements in Open Source models need to come faster"——这不仅是性能诉求，更是透明度诉求。

## 实践启示

1. **不要依赖 thinking block 作为 agent 调试依据**：Claude Code 的 thinking block 是加密签名 + 摘要，不是原始推理链。调试 agent 行为应基于输入/输出日志、工具调用记录和行为 trace，而非 thinking block。

2. **验证 AI 厂商的"透明性"声明**：在将任何推理追踪功能集成到生产系统之前，亲自检查输出内容是否包含实际推理文本。不要仅凭文档描述做架构决策。

3. **合规审计需要额外保障**：如果业务场景需要完整的推理审计链（金融合规、医疗决策），Claude Code 的 extended thinking 可能不满足要求。评估是否需要企业级协议或替代方案。

4. **考虑开源模型作为透明度兜底方案**：对于对推理透明度有硬性要求的场景，开源模型提供了完全可见的推理过程。可以在关键审计路径上使用开源模型，在其他路径上使用闭源模型。

5. **建立 agent 行为的独立观测层**：不依赖任何单一 AI 厂商的内置追踪功能。构建独立的 agent observability 层，记录所有输入、输出、工具调用和决策点，确保即使厂商的追踪功能不可靠，你仍有完整的审计记录。

## Related
- [Claude Code large codebase harness](../ch03/075-claude-code.html)

---

