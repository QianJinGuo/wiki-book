# Meta U-turns on encryption push for Instagram as DMs go plaintext

## Ch12.064 Meta U-turns on encryption push for Instagram as DMs go plaintext

> 📊 Level ⭐⭐ | 7.3KB | `entities/5235705.md`

# Meta U-turns on encryption push for Instagram as DMs go plaintext

Meta has quietly pulled the plug on encrypted Instagram DMs, meaning private messages on one of the world's biggest social networks are no longer especially private. The change took effect in 2026, according to a revised Meta post first published in 2022. In a statement to The Register, Meta said the feature saw limited adoption and pointed users toward WhatsApp instead.

It's quite the reversal for a corporation that spent years telling everyone that encryption was the future of online communications, even as governments pushed back against the company's wider rollout plans. Much of that pressure centered on child protection — campaigners and agencies, including the NSPCC UK and National Crime Agency, argued wider encryption would make it harder to detect grooming, child abuse material, and other criminal activity.

Privacy advocates, however, say Meta has just blown a hole in one of the few genuinely private corners of the platform. The Center for Democracy & Technology, alongside members of the Global Encryption Coalition Steering Committee, urged Meta to reverse the decision. "Without default encryption, millions of Instagram users are left exposed to surveillance, interception, and misuse of their private communications," the group said. "These risks fall hardest on people who rely on secure messaging for their safety, including journalists, human rights defenders, and survivors of abuse."

Swiss privacy outfit Proton also questioned what exactly happens to existing chats once encryption disappears. Because properly implemented E2EE prevents platforms from reading message contents, Meta has not clarified whether previously encrypted conversations will remain inaccessible, get deleted, or become readable. "For Instagram, dropping E2EE is just an example of how little regard Meta has for the privacy and safety of its community," Proton said in a blog post.

Meta has become increasingly aggressive about monetizing and analyzing user interactions. Last year, the company confirmed that interactions with Meta AI tools, including those inside private conversations, could be used for ad targeting. The company has not publicly said whether ordinary Instagram messages could eventually feed into similar systems now that encryption is gone.

## 深度分析

**1. Meta 的"加密优先"叙事与商业利益存在根本矛盾**

Meta 多年来公开倡导端到端加密是"在线通信的未来"，却在 2026 年悄然移除 Instagram DMs 的加密选项。这种 180 度反转揭示了其隐私承诺的工具性本质：当加密与数据变现、广告定向产生冲突时，Meta 选择了后者。Proton 明确指出这一决定"表明 Meta 对用户隐私和安全几乎毫不关心"，反映出不加密的 DMs 可被平台读取、分析并用于广告变现的商业逻辑。

**2. 儿童保护诉求被Meta用作撤回加密的道德盾牌**

NSPCC 和英国国家犯罪局等机构以"检测 grooming 和儿童虐待内容"为由反对 E2EE 扩展，Meta 顺势将这一压力转化为退出加密的借口。然而 Center for Democracy & Technology 反驳指出，缺乏加密反而使记者、人权活动家和家暴幸存者等高风险群体暴露在监控之下。这揭示了隐私与安全之间复杂的张力：真正的安全需要加密保护，而非削弱加密。

**3. 用户采用率低的真正原因值得追问**

Meta 将移除加密归因于"很少有人选择开启 E2EE"，但未解释为何采用率如此之低。可能是：(1) UI 设计导致用户不知道该功能存在；(2) Meta 从未默认启用；(3) 功能本身的可用性存在问题。如果 Meta 真正重视隐私，本应默认开启加密，而非将采用率低作为撤退的理由。

**4. 现有加密消息的命运存在严重不确定性**

Proton 提出的核心问题——已有的加密对话将如何处理——至今没有答案。E2EE 的核心价值在于平台无法解密，若 Meta 现在可以读取这些消息，则说明：(1) 密钥管理存在后门；或 (2) 平台在加密前后都保留了消息副本。这直接关系到用户信任的基础。

**5. AI 监控与加密撤退构成系统性隐私侵蚀**

2025 年 Meta 已确认用户与 Meta AI 的对话（包括私人对话中的互动）可用于广告定向。现在 Instagram DMs 加密被移除，Meta 尚未说明普通消息是否也会被用于类似的 AI 分析。这构成了一个渐进的、系统性的隐私侵蚀路径：先移除加密，再将消息内容整合进 AI 广告系统。

## 实践启示

**1. 高风险用户应立即迁移至真正的 E2EE 平台**

Meta 发言人建议用户转向 WhatsApp（同样由 Meta 拥有但保留 E2EE），但对于真正需要隐私保护的用户，应考虑 Signal 等独立加密通讯工具，不依赖同一公司的生态。

**2. 将 Instagram DMs 视为明文传输，假设已被监控或存档**

隐私倡导者明确警告：失去 E2EE 意味着消息面临" surveillance, interception, and misuse"。用户应假设 Instagram DMs 内容可被 Meta 读取、第三方获取或数据泄露暴露，避免通过 Instagram DMs 传递敏感信息。

**3. 在使用任何社交平台 DMs 前，验证其加密状态**

此事件表明，即使用户以为在使用加密服务，平台随时可能撤回加密保护。使用前应查阅平台当前隐私政策，确认 E2EE 是否为默认启用，并记录关键版本以便追踪变化。

**4. 关注现有消息的删除或迁转选项**

由于 Meta 未明确说明已有加密消息的处理方式，高隐私需求用户应主动：(1) 导出或删除重要对话；(2) 在加密仍然有效时将消息迁移至更安全的平台；(3) 避免在 Instagram 保留敏感通信历史。

**5. 对"迁移至 WhatsApp"的建议保持批判距离**

Meta 将用户引向 WhatsApp，但其整体商业模式持续向 AI 监控和广告定向演进。WhatsApp 虽保留 E2EE，但与 Meta AI 的交互已被用于广告定向，且 WhatsApp 的元数据收集和其他数据实践与 Instagram 存在整合可能。

## 相关实体
- [Weve Been Here Before Ai Vulnerability Research](../ch05/082-ai.html)
- [Microsoft Zero Days Researcher Disgruntled](https://github.com/QianJinGuo/wiki/blob/main/entities/microsoft-zero-days-researcher-disgruntled.md)
- [Fragnesia Linux Kernel Local Privilege Escalation Via Esp In Tcp](../ch01/295-rag.html)
- [Us Bank Aws Ai Migration](../ch05/082-ai.html)
- [Deerflow Hermes Openclaw Comparison](../ch04/460-deerflow-hermes-openclaw.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/security-privacy-landscape.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/5235705.md)

---

