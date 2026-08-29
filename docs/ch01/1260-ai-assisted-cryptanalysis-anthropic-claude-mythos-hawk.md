# AI Assisted Cryptanalysis: Anthropic Claude Mythos 破解 HAWK 和 AES

> 📊 Level ⭐⭐ | 4.4KB | `entities/ai-assisted-cryptanalysis-anthropic-claude-mythos-hawk-aes.md`

# AI Assisted Cryptanalysis: Anthropic Claude Mythos 破解 HAWK 和 AES

> 2026年7月，Anthropic 的 Claude Mythos（未发布的先进模型）产出了两项密码分析成果：攻击签名方案 HAWK 和改进型 AES 降轮攻击。本文基于 Matthew Green（约翰霍普金斯大学密码学家）的深度分析。

## HAWK 签名方案攻击

Claude Mythos 对非标准后量子签名方案 HAWK 实现了密钥恢复攻击。HAWK 基于 module Lattice Isomorphism Problem (module-LIP)。关键发现：

- HAWK 尚未标准化，但与正在标准化的 Falcon 相关——攻击不转移到 Falcon
- 攻击仍为指数时间，但将安全强度**减半**（可通过加倍密钥长度修复，但牺牲了 HAWK 的效率优势）
- 已产出可运行代码，数小时内可攻破弱化挑战实例
- **最显著的是**：攻击未发明新数学，而是更彻底地应用已有工具——Claude 自评："坦率说，这对整个领域有点尴尬——没有任何成分是稀奇的"

## AES 降轮攻击

第二项成果是对降轮 AES（7 轮，完整 AES 为 10-14 轮）的改进攻击：

- 7 轮 AES 攻击并非首创——这是对 2013 年工作的常数因子改进
- 需要 2^89 次操作和 2^105 个选择明文——**完全不实用**
- 是纸上分析，无可运行代码
- 技术上仍有趣，但属小幅增量改进

## 研究过程：AI 驱动的密码分析

Anthropic 的流程出人意料："他们似乎只是让 Claude 去找结果，然后把它按在磨刀石上直到找到为止。" 没有庞大的领域专家团队，没有精细调优——模型能够：

1. 理解现有密码分析结果
2. 综合为真实的新攻击
3. 扩展已有方法
4. 无需详细的人工干预

## 验证瓶颈

Green 指出核心问题：模型善于产出**看起来真实但可能误导**的结果。人类注意力比以往更重要。

- HAWK 类"完整攻击"（可运行代码）→ 验证容易
- AES 类"速度改进"（纸上分析）→ 需要形式化证明或专家审查

## 对密码学的影响

- **对称密码学**：混乱而鲁棒。AI 的大量智能时数不太可能奇迹般地攻破
- **公钥密码学**：更脆弱。公钥系统依赖的数学对象种类有限（ECDLP、RSA、格问题、编码理论），AI 的智力密度可能在这些领域产生真正进展
- 当前正处于从传统公钥算法向后量子算法过渡的历史时期——如果 AI 要在此时展示密码分析能力，时机正好

## 对 AI 能力的判断

Green 给出了一个引人深思的类比：使用这些模型**"如同在深度突降的池塘里游泳"**——前一分钟触手可及，跨过某条线就只能靠自己了。但这条线在向外移动。

> "如果你认为这些模型是'美化的自动补全'或进展在放缓——请停止这种想法。模型非常智能且有能力，正在快速进步。如果说有天花板，我还没看到证据。"

## 相关实体

- [Apple Corecrypto Formal Verification Blueprint](../ch12/027-apple-corecrypto-formal-verification-blueprint-post-quantu.html)
- [Drinking Llms](ch01/1156-llm.html)
- [Anthropic 95Pct Data Analysis Skill Stack Architecture](ch01/783-anthropic.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/anthropic-claude-mythos-cryptanalysis-hawk-aes-matthew-green.md)

---

