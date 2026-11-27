# Open Defense Initiative | depthfirst

> 📊 Level ⭐⭐⭐⭐ | 9.6KB

## 摘要

depthfirst 于 2026 年 5 月发布 **Open Defense Initiative**（开放防御计划），向关键开源项目提供高达 **500 万美元**的深度安全扫描额度。核心论点：Frontier AI（Mythos、GPT-5.5 Cyber）已具备自主漏洞发现和利用能力，开源模型正在快速追赶——防御者面临一个狭窄的时间窗口来加固关键软件。depthfirst 的技术差异化在于**成本效率**：仅花 $1,000 计算成本便检测到 Anthropic 用 $10,000 报告的 FFmpeg 12 个内存损坏漏洞。其核心理念是 "模型强度本身不够"——安全场景需要专用 harness、上下文理解和可利用性验证的系统级优化。

## 核心要点

### 时间窗口论

- Frontier AI 模型（Mythos、GPT-5.5 Cyber）已展示**自主漏洞发现和利用**能力
- 开源模型正在快速追赶——当这些能力无过滤地落入恶意行为者手中时，防御窗口将急剧收窄
- 现在是加固关键基础设施的最后机会期："We have a narrow window to harden critical software before that happens"

### 成本效率突破

| 指标 | depthfirst | Anthropic (Mythos) |
|------|-----------|-------------------|
| FFmpeg 内存损坏漏洞 | 12 个 | 已运行数百次扫描 |
| 计算成本 | **$1,000** | **$10,000** |
| 成本效率 | ~10x 优势 | 基准 |

- FFmpeg 漏洞是在 Anthropic 用最先进模型运行数百次扫描后仍被 depthfirst 发现的——证明系统优化 > 模型能力
- 漏洞提交已被接受，等待 FFmpeg 官方披露细节

### 技术架构理念

depthfirst 的 "模型强度不够" 论点包含三个维度：

1. **专用 Harness**：让模型高效推理代码的执行框架——通用模型的安全推理需要深度代码上下文，这超出了通用 harness 的能力
2. **可利用性后训练**：针对漏洞可利用性（exploitability）进行专门后训练的模型——不只是发现 bug，而是确认 bug 可被利用
3. **全系统上下文验证**：通过完整系统理解来提高精度——安全问题太深太 context-dependent，需要全局视角

### 计划机制

- **资格**：被广泛部署的开源项目——部署在关键基础设施、嵌入广泛产品、或上游影响足够大的软件
- **验证**：域名绑定邮箱、SECURITY.md 联系人、signed commits、MAINTAINERS/CODEOWNERS 记录；需第二位维护者确认
- **已签约项目**：FFmpeg、Envoy、Kata 等大型开源项目
- **申请入口**：depthfirst.com/open-defense

### 团队与公司定位

- 使命驱动型公司，团队涵盖工程、AI 研究和安全研究
- 定位："build the best defensive AI technology and give all defenders access to it before they are attacked"
- 平台功能：代码漏洞扫描、供应链可达性分析、密钥泄露检测、动态测试

## 深度分析

### 攻防不对称与正在关闭的时间窗口

网络安全的老论断在 AI 时代被急剧放大：攻击者只需找到一个可利用的漏洞，防御者却必须覆盖全部攻击面。Frontier 模型（Mythos、GPT-5.5 Cyber）已展示对被广泛审查代码库的自主漏洞发现与利用能力，而开源权重模型的快速追赶意味着这种能力很快将无过滤地扩散到恶意行为者手中。depthfirst 反复强调 "narrow window"——防御侧的加固必须在能力扩散完成之前落地。还有一个结构性事实值得注意：文章开篇承认 frontier 级别的安全能力此前只属于极少数大公司，因此 Open Defense Initiative 的真正野心不止是补贴扫描，而是把 frontier 级安全能力下放到每一个开源维护者手里——本质是一次防御能力的平权运动。当开源模型的廉价推理成为常态，防御平权不是慈善，而是对冲"攻击平权"的唯一手段：恶意行为者用开源模型武装自己的速度，决定了防御方必须抢跑的距离。 相关背景可参见 [25 The Unbearable Cheapness Of Open Weight Models](https://github.com/QianJinGuo/wiki-public/blob/main/entities/25-the-unbearable-cheapness-of-open-weight-models.md) 与 [Ai Safety](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/ai-safety.md)。

### "模型强度不够"：垂直安全系统的三层范式

$1,000 vs $10,000 的对比容易被读成价格战，其实是一次范式宣言。depthfirst 明确感谢 frontier lab 推进通用模型能力，但随即指出安全场景"太深、太依赖上下文"，通用模型加通用 harness 无法稳定产出可靠且可操作的漏洞报告。其解法是三层系统优化：其一，让模型高效推理代码执行的专用 harness；其二，针对漏洞可利用性（exploitability）做后训练的定制模型——目标是"确认 bug 可被利用"而非"发现 bug"；其三，以全系统上下文做验证来提高精度。FFmpeg 案例是最有力的证据：在 Anthropic 用最强模型跑了数百次扫描之后，depthfirst 仍以约十分之一的计算成本找到 12 个残留的内存损坏漏洞。这印证了 [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering.md) 的核心判断——垂直领域的竞争力来自系统级优化而非模型选型；对 AI 安全方向的创业公司而言，专有 harness 与后训练数据才是真正的护城河，而 frontier lab 的每一次通用能力跃升反而会压低其基座成本。这与 [Agent Security Architecture](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-security-architecture.md) 中"防御设计先于攻击面"的思路一致：安全能力的分层（模型层/harness 层/验证层）让系统可以随基座模型升级而整体受益，而不必每次都从零重训。

### 可利用性验证：从漏洞数量到确定性

值得单独展开的是 "exploitability" 被当作第一性目标这一选择。传统扫描器以"报出问题"为产出，海量误报反而压垮维护者的审查带宽；depthfirst 把验证链路（发现 → 确认可利用 → 生成修复）做成平台工作流的核心，其供应链可达性分析（"知道什么可达，而不只是什么存在"）与动态测试同样指向确定性而非数量。FFmpeg 提交已被官方接受、细节进入协调披露流程，说明这套系统产出的是能走完完整披露链路的真漏洞，而不是跑分数字。由此，安全工具的评估标准应当改变：关注单个漏洞的真实发现成本与确认率，而非扫描次数或底层模型跑分——误报率也是成本，只是被记在了维护者的时间账户上。对维护者社区而言，这个转折点还有一层含义：当自动化系统能够附带修复建议时，安全工作从"人工 triage 一堆可疑报告"变成"审查少量高置信度结论"，维护者本就稀缺的注意力第一次成为被保护的资源而非被消耗的资源。

### 验证机制即治理：身份、权限与激励设计

Open Defense Initiative 的申请流程值得当作开源安全治理的参考实现来读。身份验证要求申请者通过项目域名邮箱、SECURITY.md 安全联系人或与 signed commits 匹配的邮箱自证与项目的绑定，GitHub/GitLab 账号须出现在 MAINTAINERS/CODEOWNERS 或治理文档中、或有持续的合并与 review 记录，另需在项目可验证的官方渠道（pinned issue 评论、签名消息、官网声明）公开确认；权限验证则要求 merge rights 或明确委托，并需第二位维护者背书。这套身份+权限的双因素设计直接针对"冒充维护者骗取防御工具"的风险——把高强度安全 AI 交给错误的人等同于制造定向供应链事故，与 [Xz Utils Backdoor Maintainer Trust Hijack 2 Years On](https://github.com/QianJinGuo/wiki-public/blob/main/entities/xz-utils-backdoor-maintainer-trust-hijack-2-years-on.md) 暴露的维护者信任劫持问题同构。更巧妙的是激励闭环：项目想获得免费扫描额度，先得把安全治理文档补齐——"安全即激励"让补贴计划本身成为推动开源治理规范化的杠杆。而按 rolling basis 接收、以下游影响优先的滚动准入，则把 $5M 额度变成对关键基础设施的持续投资，而非一次性营销事件。

## 实践启示

1. **关键开源项目应积极申请**：$5M 额度覆盖完整安全评估成本，且 depthfirst 的成本效率意味着申请者获得远超等额资源在别处的价值
2. **评估安全工具时关注 per-vulnerability 成本**：depthfirst 的 $1K vs $10K 数据揭示 AI 安全工具成本效率差异巨大——关注实际漏洞发现成本而非平台定价
3. **系统优化 > 模型升级**：在安全等垂直领域，投资专用 harness 和上下文管理比追求更强通用模型更具性价比
4. **建立安全治理结构**：depthfirst 的验证要求实质上是开源项目安全治理的最佳实践清单——即使不申请，也应按此标准完善项目安全基础设施
5. **关注 AI 安全时间窗口**：Mythos 和 GPT-5.5 Cyber 的能力是动态的——开源模型追赶速度决定防御窗口长度

## 相关实体

- [Agent 安全架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-security-architecture.md)
- LLM 安全红队测试
→ [原文存档](https://depthfirst.com/open-defense)

---

