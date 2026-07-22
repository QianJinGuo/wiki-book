# Open Defense Initiative | depthfirst

## Ch01.775 Open Defense Initiative | depthfirst

> 📊 Level ⭐⭐ | 5.9KB | `entities/open-defense-initiative-depthfirst.md`

# Open Defense Initiative | depthfirst

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

### 安全 AI 的 "军备不对称"

depthfirst 揭示了一个关键不对称：攻击者只需找到一个漏洞，防御者需要找到所有漏洞。当 Frontier AI 使漏洞发现成本大幅降低时，攻击方获益更大——因为攻击方不需要覆盖所有漏洞，只需找到一个可利用的。Open Defense Initiative 的本质是**缩小微软/Google 级别组织与普通开源项目之间的安全能力鸿沟**。

### Harness 优于模型的安全范式

depthfirst 的 $1K vs $10K 对比不仅是成本差异，更是技术范式的差异。Anthropic 的 Mythos 是通用大模型，depthfirst 的优势来自：（1）针对安全场景优化的推理 harness；（2）专注可利用性的后训练模型；（3）全系统上下文验证。这证明在垂直领域，专用系统比通用大模型更具性价比——对 AI 安全创业公司是重要信号。

### 开源安全的治理激励

depthfirst 的验证机制（域名邮箱、SECURITY.md、signed commits、MAINTAINERS/CODEOWNERS）实质上要求申请项目具备基本的安全治理结构。这创造了正向激励：想要免费安全扫描？先把安全治理做规范。这是 "安全即激励" 的治理创新。

## 实践启示

1. **关键开源项目应积极申请**：$5M 额度覆盖完整安全评估成本，且 depthfirst 的成本效率意味着申请者获得远超等额资源在别处的价值
2. **评估安全工具时关注 per-vulnerability 成本**：depthfirst 的 $1K vs $10K 数据揭示 AI 安全工具成本效率差异巨大——关注实际漏洞发现成本而非平台定价
3. **系统优化 > 模型升级**：在安全等垂直领域，投资专用 harness 和上下文管理比追求更强通用模型更具性价比
4. **建立安全治理结构**：depthfirst 的验证要求实质上是开源项目安全治理的最佳实践清单——即使不申请，也应按此标准完善项目安全基础设施
5. **关注 AI 安全时间窗口**：Mythos 和 GPT-5.5 Cyber 的能力是动态的——开源模型追赶速度决定防御窗口长度

## 相关实体

- [Agent 安全架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-security-architecture.md)
- [LLM 安全红队测试](https://github.com/QianJinGuo/wiki/blob/main/concepts/llm-security-red-teaming.md)
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/open-defense-initiative-depthfirst.md)

---

